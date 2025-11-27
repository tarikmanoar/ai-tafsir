import { AyahDisplayData, Surah } from '../types';

const DB_NAME = 'ai-tafsir-db';
const DB_VERSION = 1;
const STORE_SURAHS = 'surahs';
const STORE_AYAHS = 'ayahs';

export const DBService = {
  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_SURAHS)) {
          db.createObjectStore(STORE_SURAHS, { keyPath: 'number' });
        }
        if (!db.objectStoreNames.contains(STORE_AYAHS)) {
          db.createObjectStore(STORE_AYAHS, { keyPath: 'id' }); // id: "surah:ayah"
        }
      };
    });
  },

  async saveSurahs(surahs: Surah[]): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(STORE_SURAHS, 'readwrite');
    const store = tx.objectStore(STORE_SURAHS);
    
    return new Promise((resolve, reject) => {
      surahs.forEach(surah => store.put(surah));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSurahs(): Promise<Surah[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SURAHS, 'readonly');
      const store = tx.objectStore(STORE_SURAHS);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveAyah(id: string, data: AyahDisplayData): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AYAHS, 'readwrite');
      const store = tx.objectStore(STORE_AYAHS);
      const request = store.put({ id, ...data });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAyah(id: string): Promise<AyahDisplayData | undefined> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AYAHS, 'readonly');
      const store = tx.objectStore(STORE_AYAHS);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
            // Remove the 'id' key we added for storage if it exists in the object
            // strictly speaking AyahDisplayData doesn't have 'id', but we stored it with one.
            // It's fine to return it as is, or clean it up.
            resolve(result as AyahDisplayData);
        } else {
            resolve(undefined);
        }
      };
      request.onerror = () => reject(request.error);
    });
  },

  async hasAyah(id: string): Promise<boolean> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AYAHS, 'readonly');
      const store = tx.objectStore(STORE_AYAHS);
      const request = store.count(id);
      
      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(request.error);
    });
  }
};
