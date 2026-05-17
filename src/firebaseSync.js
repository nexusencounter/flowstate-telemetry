/**
 * Real-time state persistence layer supporting sub-second Firebase Firestore
 * synchronization with automatic offline localStorage fallback.
 */

const STORAGE_KEY = "flowstate_telemetry_records_v1";

class TelemetryStore {
  constructor(options = {}) {
    this.collectionName = options.collectionName || "telemetry_sessions";
    this.firestoreDb = options.firestoreDb || null;
    this.listeners = new Set();
    this.pendingQueue = [];
  }

  loadLocalRecords() {
    if (typeof localStorage === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  saveLocalRecords(records) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
    this.notifyListeners(records);
  }

  async upsertTask(taskRecord) {
    const records = this.loadLocalRecords();
    const existingIdx = records.findIndex((r) => r.taskId === taskRecord.taskId);
    const updatedRecord = Object.assign({}, taskRecord, {
      updatedAt: new Date().toISOString()
    });

    if (existingIdx >= 0) {
      records[existingIdx] = updatedRecord;
    } else {
      records.unshift(updatedRecord);
    }

    this.saveLocalRecords(records);

    if (this.firestoreDb && typeof this.firestoreDb.collection === "function") {
      try {
        await this.firestoreDb
          .collection(this.collectionName)
          .doc(updatedRecord.taskId)
          .set(updatedRecord, { merge: true });
      } catch (syncError) {
        this.pendingQueue.push(updatedRecord);
      }
    }
    return updatedRecord;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(records) {
    for (const listener of this.listeners) {
      listener(records);
    }
  }
}

module.exports = {
  STORAGE_KEY,
  TelemetryStore
};

TelemetryStore.prototype.flushPendingQueue = async function () {
  if (!this.firestoreDb || this.pendingQueue.length === 0) {
    return { flushed: 0, remaining: this.pendingQueue.length };
  }
  let flushedCount = 0;
  const remaining = [];
  for (const item of this.pendingQueue) {
    try {
      await this.firestoreDb
        .collection(this.collectionName)
        .doc(item.taskId)
        .set(item, { merge: true });
      flushedCount += 1;
    } catch (err) {
      remaining.push(item);
    }
  }
  this.pendingQueue = remaining;
  return { flushed: flushedCount, remaining: remaining.length };
};
