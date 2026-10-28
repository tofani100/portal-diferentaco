/**
 * Native IndexedDB Storage Layer
 * Provides unlimited client-side storage quota (hundreds of MBs to GBs),
 * completely bypassing localStorage's 5MB hard limit.
 */

const DB_NAME = 'portal_diferentaco_db';
const STORE_NAME = 'entities';
const DB_VERSION = 1;

let dbPromise = null;

function getDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.warn('[IndexedDB] Error opening database, falling back to localStorage:', event.target.error);
      resolve(null);
    };
  });

  return dbPromise;
}

export async function idbGet(key) {
  try {
    const db = await getDb();
    if (!db) return null;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result !== undefined ? request.result : null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export async function idbSet(key, value) {
  try {
    const db = await getDb();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => {
        console.error('[IndexedDB] Set error:', e);
        resolve(false);
      };
    });
  } catch (e) {
    console.error('[IndexedDB] Set exception:', e);
    return false;
  }
}

export async function idbRemove(key) {
  try {
    const db = await getDb();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}
