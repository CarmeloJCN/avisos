import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit as limitQuery,
  where,
  onSnapshot,
  type DocumentData,
  Timestamp,
  type WithFieldValue
} from 'firebase/firestore';
import { db } from '../services/firebase';

function parseTimestamps<T>(data: DocumentData): T {
  const parsed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      parsed[key] = value.toDate();
    } else {
      parsed[key] = value;
    }
  }
  return parsed as T;
}

export function useCollectionSnapshot<T>(path: string, orderField?: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = orderField
      ? query(collection(db, path), orderBy(orderField))
      : query(collection(db, path));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        ...parseTimestamps<T>(doc.data()),
        id: doc.id
      })) as T[];
      setData(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [path, orderField]);

  return { data, loading };
}

export async function addDocument(path: string, data: WithFieldValue<DocumentData>) {
  return addDoc(collection(db, path), data);
}

export async function updateDocument(path: string, id: string, data: Partial<DocumentData>) {
  return updateDoc(doc(db, path, id), data);
}

export async function deleteDocument(path: string, id: string) {
  return deleteDoc(doc(db, path, id));
}

export async function getDocument<T>(path: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, path, id));
  if (!snap.exists()) return null;
  return { ...parseTimestamps<T>(snap.data()), id: snap.id } as T;
}

export async function getLastNumAviso(): Promise<string> {
  const q = query(collection(db, 'avisos'), orderBy('numAviso', 'desc'), limitQuery(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const data = snap.docs[0].data();
    if (data.numAviso) {
      return data.numAviso;
    }
  }
  return '';
}

export async function getTecnicoId(uid: string): Promise<string | null> {
  const q = query(collection(db, 'usuarios'), where('uid', '==', uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}
