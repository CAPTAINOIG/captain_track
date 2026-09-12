import {
  savePendingActivity,
  getPendingByStatus,
  updatePendingActivity,
  deletePendingActivity,
} from "../utils/idb";
import { useCreateActivity } from "../api/track";

const SYNC_STATUSES = Object.freeze({
  PENDING: "PENDING_SYNC",
  SYNCING: "SYNCING",
  SYNCED: "SYNCED",
  FAILED: "FAILED",
});

class SyncManagerImpl {
  constructor() {
    this.listeners = new Set();
    this.inFlight = new Set();
    this.retryTimer = null;
    this.started = false;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    this.listeners.forEach((l) => {
      try {
        l(this.getSummary());
      } catch (_) {
        /* ignore */
      }
    });
  }

  getSummary() {
    return {
      inFlightCount: this.inFlight.size,
    };
  }

  isOnline() {
    if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
      return navigator.onLine;
    }
    return true;
  }

  async enqueueActivity(activity) {
    const record = {
      ...activity,
      id: activity.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      syncStatus: SYNC_STATUSES.PENDING,
      syncAttempts: 0,
      createdAt: activity.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    await savePendingActivity(record);
    this.emit();
    this.triggerSync();
    return record;
  }

  async triggerSync() {
    if (!this.isOnline()) return;
    const pending = await getPendingByStatus(SYNC_STATUSES.PENDING);
    const pending2 = await getPendingByStatus(SYNC_STATUSES.FAILED);
    const queue = [...pending, ...pending2].sort(
      (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
    );
    for (const item of queue) {
      if (this.inFlight.has(item.id)) continue;
      await this.syncOne(item);
    }
  }

  async syncOne(item) {
    if (!item || !item.id) return;
    if (this.inFlight.has(item.id)) return;
    this.inFlight.add(item.id);
    this.emit();
    try {
      await updatePendingActivity({
        ...item,
        syncStatus: SYNC_STATUSES.SYNCING,
        syncAttempts: (item.syncAttempts || 0) + 1,
        updatedAt: Date.now(),
      });
      const payload = { ...item };
      delete payload.syncStatus;
      delete payload.syncAttempts;
      delete payload.createdAt;
      delete payload.updatedAt;
      await useCreateActivity(payload);
      await deletePendingActivity(item.id);
    } catch (err) {
      const isAuthError = err && err.response && err.response.status === 401;
      const nextStatus = isAuthError ? SYNC_STATUSES.FAILED : SYNC_STATUSES.PENDING;
      try {
        await updatePendingActivity({
          ...item,
          syncStatus: nextStatus,
          lastError: (err && err.message) || String(err),
          updatedAt: Date.now(),
        });
      } catch (_) {
        /* ignore */
      }
      this.scheduleRetry();
    } finally {
      this.inFlight.delete(item.id);
      this.emit();
    }
  }

  scheduleRetry() {
    if (this.retryTimer) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.triggerSync();
    }, 15000);
  }

  start() {
    if (this.started) return;
    this.started = true;
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
    }
    setTimeout(() => this.triggerSync(), 2000);
  }

  stop() {
    this.started = false;
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  handleOnline = () => {
    this.triggerSync();
  };
}

export const SyncManager = new SyncManagerImpl();
export { SYNC_STATUSES };
