const DB_NAME = "captain-track-db";
const DB_VERSION = 1;

const SESSIONS_STORE = "sessions";
const PENDING_STORE = "pending_activities";

let dbPromise = null;

const openDB = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const sessions = db.createObjectStore(SESSIONS_STORE, {
          keyPath: "sessionId",
        });
        sessions.createIndex("status", "status", { unique: false });
        sessions.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        const pending = db.createObjectStore(PENDING_STORE, {
          keyPath: "id",
        });
        pending.createIndex("syncStatus", "syncStatus", { unique: false });
        pending.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () =>
      reject(new Error("IndexedDB blocked by another open connection"));
  });
  return dbPromise;
};

const runTx = (storeName, mode, fn) =>
  openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        let result;
        try {
          result = fn(store);
        } catch (err) {
          reject(err);
          return;
        }
        tx.oncomplete = () => resolve(result && result.result ? result.result : undefined);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
      })
  );

export const saveSession = (session) => {
  const toSave = { ...session, updatedAt: Date.now() };
  return runTx(SESSIONS_STORE, "readwrite", (store) => store.put(toSave));
};

export const getSession = (sessionId) =>
  runTx(SESSIONS_STORE, "readonly", (store) => store.get(sessionId));

export const getActiveSession = () =>
  runTx(SESSIONS_STORE, "readonly", (store) => {
    return new Promise((resolve, reject) => {
      const results = [];
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const v = cursor.value;
          if (v.status === "RUNNING" || v.status === "PAUSED") {
            results.push(v);
          }
          cursor.continue();
        } else {
          results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(results[0] || null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  });

export const deleteSession = (sessionId) =>
  runTx(SESSIONS_STORE, "readwrite", (store) => store.delete(sessionId));

export const savePendingActivity = (activity) =>
  runTx(PENDING_STORE, "readwrite", (store) => store.put(activity));

export const getPendingActivities = () =>
  runTx(PENDING_STORE, "readonly", (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const all = Array.isArray(req.result) ? req.result : [];
        all.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        resolve(all);
      };
      req.onerror = () => reject(req.error);
    });
  });

export const updatePendingActivity = (activity) =>
  runTx(PENDING_STORE, "readwrite", (store) => store.put(activity));

export const deletePendingActivity = (id) =>
  runTx(PENDING_STORE, "readwrite", (store) => store.delete(id));

export const getPendingByStatus = (status) =>
  runTx(PENDING_STORE, "readonly", (store) => {
    return new Promise((resolve, reject) => {
      const results = [];
      const idx = store.index("syncStatus");
      const req = idx.openCursor(IDBKeyRange.only(status));
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  });
