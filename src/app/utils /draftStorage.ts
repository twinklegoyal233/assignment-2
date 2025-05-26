
import { openDB } from 'idb';
import type { ProductFormData } from '../store/addProductStore'; 

const DB_NAME = 'productDraftDB';
const STORE_NAME = 'drafts';
const KEY = 'draft';

const getDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

export const saveDraft = async (data: Partial<ProductFormData> | null): Promise<void> => {
  const db = await getDB();
  if (data === null) {
    await db.delete(STORE_NAME, KEY);
  } else {
    await db.put(STORE_NAME, data, KEY);
  }
};

export const getDraft = async (): Promise<Partial<ProductFormData> | null> => {
  const db = await getDB();
  const result = await db.get(STORE_NAME, KEY);
  return result ?? null;
};
