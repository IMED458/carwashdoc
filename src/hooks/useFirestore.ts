/**
 * React hooks Firestore-თან სამუშაოდ. მონაცემები realtime-ად ახლდება.
 */
import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { subscribeCollection, WithId } from '../services/firestore';

/** კოლექციის realtime გამოწერა. */
export function useCollection<T extends WithId>(name: string): T[] {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => subscribeCollection<T>(name, setItems), [name]);
  return items;
}

/**
 * ერთი დოკუმენტის realtime გამოწერა default-მნიშვნელობით.
 * აბრუნებს [value, save] — save წერს პირდაპირ Firestore-ში.
 */
export function useDocState<T extends object>(
  collectionName: string,
  docId: string,
  fallback: T,
): [T, (next: T) => Promise<void>] {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    const ref = doc(db, collectionName, docId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setValue({ ...fallback, ...(snap.data() as object) } as T);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, docId]);

  const save = async (next: T) => {
    setValue(next);
    await setDoc(doc(db, collectionName, docId), next as object, { merge: true });
  };

  return [value, save];
}
