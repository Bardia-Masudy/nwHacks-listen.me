import { openDB, DBSchema } from 'idb';
import { WordLog } from '../types';

interface AnomiaDB extends DBSchema {
    logs: {
        key: string;
        value: WordLog;
        indexes: { 'by-timestamp': number };
    };
}

const DB_NAME = 'anomia-db';
const STORE_NAME = 'logs';

const dbPromise = openDB<AnomiaDB>(DB_NAME, 1, {
    upgrade(db) {
        // Create an objectStore for logs with 'id' as keyPath
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Create an index to query by timestamp
        store.createIndex('by-timestamp', 'timestamp');
    },
});

export const addLogToDB = async (log: WordLog) => {
    const db = await dbPromise;
    await db.put(STORE_NAME, log);
};

export const getAllLogsFromDB = async () => {
    const db = await dbPromise;
    // Get all logs sorted by timestamp
    return db.getAllFromIndex(STORE_NAME, 'by-timestamp');
};
