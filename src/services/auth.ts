/**
 * ავტორიზაცია — მომხმარებლები ინახება Firestore-ის `users` კოლექციაში.
 * პაროლი არასდროს ინახება ღიად — მხოლოდ SHA-256 ჰეშის სახით.
 * სესია: ბრაუზერში ვინახავთ მხოლოდ აქტიური მომხმარებლის ID-ს (და არა მონაცემებს).
 */
import {
  getCollectionOnce,
  getItem,
  addItem,
  updateItem,
  deleteItem,
} from './firestore';
import { sha256Hex } from './sha256';
import { User, UserRole } from '../types';

const SESSION_KEY = 'carwashdoc.session.uid';
const SALT = 'carwashdoc::v1';

/** SHA-256 ჰეში (hex) — crypto.subtle ან pure-JS fallback (HTTP-ზეც მუშაობს). */
export async function hashPassword(password: string): Promise<string> {
  return sha256Hex(`${SALT}:${password}`);
}

/** პირველი გაშვებისას ვრწმუნდებით, რომ არსებობს ერთი ადმინი — გიორგი იმედაშვილი. */
export async function ensureBootstrapAdmin(): Promise<void> {
  const users = await getCollectionOnce<User>('users');
  if (users.length > 0) return;
  const passwordHash = await hashPassword('imed458');
  await addItem('users', {
    name: 'გიორგი იმედაშვილი',
    username: 'imedo',
    passwordHash,
    role: 'admin' as UserRole,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

/** შესვლა username + password-ით. აბრუნებს მომხმარებელს ან აგდებს შეცდომას. */
export async function login(username: string, password: string): Promise<User> {
  let users: User[];
  try {
    users = await getCollectionOnce<User>('users');
  } catch (e) {
    if ((e as { code?: string })?.code === 'permission-denied') {
      throw new Error('Firestore-ის წესები არ არის გამოქვეყნებული (Console → Rules → Publish)');
    }
    throw new Error('Firebase-თან კავშირი ვერ დამყარდა');
  }
  const uname = username.trim().toLowerCase();
  const user = users.find((u) => (u.username || '').toLowerCase() === uname);
  if (!user) throw new Error('მომხმარებელი ვერ მოიძებნა');
  if (!user.isActive) throw new Error('მომხმარებელი დეაქტივირებულია');
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) throw new Error('პაროლი არასწორია');
  localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

/** გამოსვლა. */
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** გვერდის განახლების შემდეგ სესიის აღდგენა Firestore-იდან. */
export async function restoreSession(): Promise<User | null> {
  const uid = localStorage.getItem(SESSION_KEY);
  if (!uid) return null;
  const user = await getItem<User>('users', uid);
  if (!user || !user.isActive) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return user;
}

/** ახალი მომხმარებლის შექმნა (მხოლოდ ადმინი). */
export async function createUser(input: {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}): Promise<void> {
  const users = await getCollectionOnce<User>('users');
  const uname = input.username.trim().toLowerCase();
  if (users.some((u) => (u.username || '').toLowerCase() === uname)) {
    throw new Error('ასეთი მომხმარებელი უკვე არსებობს');
  }
  const passwordHash = await hashPassword(input.password);
  await addItem('users', {
    name: input.name.trim(),
    username: input.username.trim(),
    passwordHash,
    role: input.role,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
}

/** მომხმარებლის აქტიურობის გადართვა. */
export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  await updateItem('users', id, { isActive });
}

/** პაროლის შეცვლა. */
export async function changePassword(id: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await updateItem('users', id, { passwordHash });
}

/** მომხმარებლის წაშლა. */
export async function removeUser(id: string): Promise<void> {
  await deleteItem('users', id);
}
