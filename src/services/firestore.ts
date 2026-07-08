/**
 * Firestore-ის მონაცემთა წვდომის ფენა.
 * ყველა კოლექცია realtime-ად ისმენება onSnapshot-ით, ჩაწერა კი
 * პირდაპირ Firestore-ში მიდის — ლოკალურ მდგომარეობას არ ვინახავთ.
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs,
  query,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';

export type WithId = { id: string };

/** კოლექციაზე realtime გამოწერა. აბრუნებს unsubscribe ფუნქციას. */
export function subscribeCollection<T extends WithId>(
  name: string,
  cb: (items: T[]) => void,
  ...constraints: QueryConstraint[]
): () => void {
  const ref = constraints.length
    ? query(collection(db, name), ...constraints)
    : collection(db, name);
  return onSnapshot(
    ref,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
      cb(items);
    },
    (err) => {
      console.error(`Firestore subscribe error [${name}]:`, err);
      cb([]);
    },
  );
}

/** ახალი დოკუმენტის დამატება ავტო-ID-ით. აბრუნებს ახალ ID-ს. */
export async function addItem<T extends object>(name: string, data: T): Promise<string> {
  const ref = await addDoc(collection(db, name), data as object);
  return ref.id;
}

/** დოკუმენტის შექმნა/გადაწერა კონკრეტული ID-ით. */
export async function setItem<T extends object>(name: string, id: string, data: T): Promise<void> {
  await setDoc(doc(db, name, id), data as object, { merge: true });
}

/** არსებული დოკუმენტის ველების განახლება. */
export async function updateItem(name: string, id: string, data: object): Promise<void> {
  await updateDoc(doc(db, name, id), data);
}

/** დოკუმენტის წაშლა. */
export async function deleteItem(name: string, id: string): Promise<void> {
  await deleteDoc(doc(db, name, id));
}

/** ერთი დოკუმენტის წაკითხვა. */
export async function getItem<T extends WithId>(name: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, name, id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as object) } as T) : null;
}

/** კოლექციის ერთჯერადი წაკითხვა. */
export async function getCollectionOnce<T extends WithId>(
  name: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const ref = constraints.length
    ? query(collection(db, name), ...constraints)
    : collection(db, name);
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) })) as T[];
}

export { orderBy };
