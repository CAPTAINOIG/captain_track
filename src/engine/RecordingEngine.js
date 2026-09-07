import { haversineDistanceKm, validatePoint } from "../utils/gps";
import {
  saveSession,
  getActiveSession,
  deleteSession,
} from "../utils/idb";
import { SyncManager } from "./syncManager";
import useAuthStore from "../../store/auth";

export const RECORDING_STATUS = Object.freeze({
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
});

const DEFAULT_STATE = () => ({
  sessionId: null,
  status: RECORDING_STATUS.IDLE,
  startedAt: null,
  pausedAt: null,
  accumulatedPauseMs: 0,
  elapsedSeconds: 0,
  distanceKm: 0,
  calories: 0,
  path: [],
  lastValidPoint: null,
  lastPosition: null,
  lastLocationTimestamp: null,
  createdAt: null,
  updatedAt: null,
  userId: null,
  gpsError: null,
  lastFilterReason: null,
});

class RecordingEngineImpl {
  constructor() {
    this.state = DEFAULT_STATE();
    this.listeners = new Set();
    this.watchId = null;
    this.persistenceTimer = null;
    this.userIdCache = null;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    try {
      fn(this.getPublicState());
    } catch (_) {
      /* ignore */
    }
    return () => this.listeners.delete(fn);
  }

  emit() {
    const snapshot = this.getPublicState();
    this.listeners.forEach((l) => {
      try {
        l(snapshot);
      } catch (_) {
        /* ignore */
      }
    });
  }

  getPublicState() {
    return {
      sessionId: this.state.sessionId,
      status: this.state.status,
      startedAt: this.state.startedAt,
      pausedAt: this.state.pausedAt,
      accumulatedPauseMs: this.state.accumulatedPauseMs,
      elapsedSeconds: this.getElapsedSeconds(),
      distanceKm: this.state.distanceKm,
      calories: this.state.calories,
      path: this.state.path.slice(),
      lastPosition: this.state.lastPosition ? [...this.state.lastPosition] : null,
      lastLocationTimestamp: this.state.lastLocationTimestamp,
      createdAt: this.state.createdAt,
      updatedAt: this.state.updatedAt,
      userId: this.state.userId,
      gpsError: this.state.gpsError,
      lastFilterReason: this.state.lastFilterReason,
      isRunning: this.state.status === RECORDING_STATUS.RUNNING,
      isPaused: this.state.status === RECORDING_STATUS.PAUSED,
    };
  }

  getElapsedMs() {
    const { status, startedAt, pausedAt, accumulatedPauseMs } = this.state;
    if (!startedAt) return 0;
    let end = pausedAt && status === RECORDING_STATUS.PAUSED ? pausedAt : Date.now();
    let raw = end - startedAt;
    if (status === RECORDING_STATUS.PAUSED && pausedAt) {
    } else if (status === RECORDING_STATUS.RUNNING) {
      raw = Date.now() - startedAt;
    }
    return Math.max(0, raw - (accumulatedPauseMs || 0));
  }

  getElapsedSeconds() {
    return Math.floor(this.getElapsedMs() / 1000);
  }

  resolveUserId() {
    if (this.userIdCache) return this.userIdCache;
    try {
      const store = useAuthStore.getState();
      const uid = store.getUserId && store.getUserId();
      if (uid) {
        this.userIdCache = uid;
        return uid;
      }
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  newSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  async start() {
    if (this.state.status === RECORDING_STATUS.RUNNING) return;
    if (this.state.status === RECORDING_STATUS.PAUSED) {
      return this.resume();
    }
    const userId = this.resolveUserId();
    const now = Date.now();
    this.state = {
      ...DEFAULT_STATE(),
      sessionId: this.newSessionId(),
      status: RECORDING_STATUS.RUNNING,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
      userId,
    };
    await this.persist();
    this.startGpsWatch();
    this.startPersistenceTimer();
    this.emit();
  }

  async pause() {
    if (this.state.status !== RECORDING_STATUS.RUNNING) return;
    const now = Date.now();
    this.state.status = RECORDING_STATUS.PAUSED;
    this.state.pausedAt = now;
    this.state.updatedAt = now;
    this.stopGpsWatch();
    this.stopPersistenceTimer();
    await this.persist();
    this.emit();
  }

  async resume() {
    if (this.state.status !== RECORDING_STATUS.PAUSED) return;
    const now = Date.now();
    const pauseDuration = this.state.pausedAt ? now - this.state.pausedAt : 0;
    this.state.accumulatedPauseMs = (this.state.accumulatedPauseMs || 0) + pauseDuration;
    this.state.pausedAt = null;
    this.state.status = RECORDING_STATUS.RUNNING;
    this.state.updatedAt = now;
    await this.persist();
    this.startGpsWatch();
    this.startPersistenceTimer();
    this.emit();
  }

  async stop() {
    const { distanceKm, status } = this.state;
    if (status === RECORDING_STATUS.IDLE || status === RECORDING_STATUS.COMPLETED) {
      this.reset();
      return { saved: false, id: null };
    }
    this.stopGpsWatch();
    this.stopPersistenceTimer();
    const now = Date.now();
    if (status === RECORDING_STATUS.PAUSED && this.state.pausedAt) {
      const pauseDuration = now - this.state.pausedAt;
      this.state.accumulatedPauseMs = (this.state.accumulatedPauseMs || 0) + pauseDuration;
      this.state.pausedAt = null;
    }
    this.state.status = RECORDING_STATUS.COMPLETED;
    this.state.updatedAt = now;
    const elapsed = this.getElapsedSeconds();
    const activity = {
      id: Date.now(),
      userId: this.state.userId || 1,
      date: new Date(this.state.startedAt || now).toISOString(),
      type: "Run",
      distance: Number(distanceKm) || 0,
      duration: elapsed,
      pace: elapsed > 0 && distanceKm > 0 ? elapsed / distanceKm : 0,
      avgSpeed: distanceKm > 0 && elapsed > 0 ? distanceKm / (elapsed / 3600) : 0,
      calories: Math.floor(this.state.calories || 0),
      elevation: 0,
      coords: this.state.path.slice(),
      splits: [],
      comments: [],
      likes: [],
    };
    await this.persist();
    let queuedId = null;
    if (distanceKm > 0) {
      const queued = await SyncManager.enqueueActivity(activity);
      queuedId = queued.id;
    }
    try {
      if (this.state.sessionId) {
        await deleteSession(this.state.sessionId);
      }
    } catch (_) {
      /* ignore */
    }
    const finalId = queuedId || activity.id;
    this.reset();
    return { saved: distanceKm > 0, id: finalId };
  }

  reset() {
    this.stopGpsWatch();
    this.stopPersistenceTimer();
    this.state = DEFAULT_STATE();
    this.emit();
  }

  startGpsWatch() {
    this.stopGpsWatch();
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      this.state.gpsError = "Geolocation not supported";
      this.emit();
      return;
    }
    const onSuccess = (pos) => {
      this.handleLocation(pos);
    };
    const onError = (err) => {
      this.state.gpsError = err && err.message ? err.message : "Geolocation error";
      this.emit();
    };
    this.watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    });
  }

  stopGpsWatch() {
    if (this.watchId != null && typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        navigator.geolocation.clearWatch(this.watchId);
      } catch (_) {
        /* ignore */
      }
    }
    this.watchId = null;
  }

  handleLocation(pos) {
    if (this.state.status !== RECORDING_STATUS.RUNNING) return;
    const coords = pos && pos.coords ? pos.coords : null;
    if (!coords) return;
    const lat = coords.latitude;
    const lng = coords.longitude;
    const accuracy = coords.accuracy;
    const timestamp = pos.timestamp || Date.now();
    this.state.lastPosition = [lat, lng];
    this.state.lastLocationTimestamp = timestamp;
    this.state.gpsError = null;
    const candidate = { lat, lng, accuracy, timestamp };
    const check = validatePoint(candidate, this.state.lastValidPoint);
    if (!check.ok) {
      this.state.lastFilterReason = check.reason;
      this.emit();
      return;
    }
    this.state.lastFilterReason = null;
    if (this.state.lastValidPoint) {
      const deltaKm = haversineDistanceKm(
        this.state.lastValidPoint.lat,
        this.state.lastValidPoint.lng,
        lat,
        lng
      );
      if (deltaKm > 0) {
        this.state.distanceKm = Number((this.state.distanceKm + deltaKm).toFixed(6));
        this.state.calories = this.state.calories + deltaKm * 60;
      }
    }
    this.state.path.push([lat, lng]);
    this.state.lastValidPoint = candidate;
    this.emit();
  }

  startPersistenceTimer() {
    this.stopPersistenceTimer();
    this.persistenceTimer = setInterval(() => {
      this.persist().catch(() => {});
    }, 5000);
  }

  stopPersistenceTimer() {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
      this.persistenceTimer = null;
    }
  }

  async persist() {
    if (!this.state.sessionId) return;
    if (this.state.status === RECORDING_STATUS.IDLE) return;
    if (this.state.status === RECORDING_STATUS.COMPLETED) return;
    const record = {
      sessionId: this.state.sessionId,
      status: this.state.status,
      startedAt: this.state.startedAt,
      pausedAt: this.state.pausedAt,
      accumulatedPauseMs: this.state.accumulatedPauseMs,
      elapsedSeconds: this.getElapsedSeconds(),
      distance: this.state.distanceKm,
      calories: this.state.calories,
      path: this.state.path,
      lastPosition: this.state.lastPosition,
      lastValidPoint: this.state.lastValidPoint,
      lastLocationTimestamp: this.state.lastLocationTimestamp,
      createdAt: this.state.createdAt || Date.now(),
      updatedAt: Date.now(),
      userId: this.state.userId || this.resolveUserId(),
      gpsError: this.state.gpsError,
    };
    await saveSession(record);
  }

  async recoverOrBoot() {
    try {
      const active = await getActiveSession();
      if (!active) return null;
      this.state = {
        sessionId: active.sessionId,
        status: active.status === RECORDING_STATUS.PAUSED ? RECORDING_STATUS.PAUSED : RECORDING_STATUS.PAUSED,
        startedAt: active.startedAt,
        pausedAt: active.pausedAt || Date.now(),
        accumulatedPauseMs: active.accumulatedPauseMs || 0,
        elapsedSeconds: 0,
        distanceKm: Number(active.distance || 0),
        calories: Number(active.calories || 0),
        path: Array.isArray(active.path) ? active.path : [],
        lastValidPoint: active.lastValidPoint || null,
        lastPosition: active.lastPosition || null,
        lastLocationTimestamp: active.lastLocationTimestamp || null,
        createdAt: active.createdAt || Date.now(),
        updatedAt: active.updatedAt || Date.now(),
        userId: active.userId || null,
        gpsError: active.gpsError || null,
        lastFilterReason: null,
      };
      if (this.state.status !== RECORDING_STATUS.PAUSED) {
        this.state.status = RECORDING_STATUS.PAUSED;
        this.state.pausedAt = this.state.pausedAt || Date.now();
      }
      await this.persist();
      this.emit();
      return this.getPublicState();
    } catch (err) {
      this.state = DEFAULT_STATE();
      return null;
    }
  }
}

export const RecordingEngine = new RecordingEngineImpl();
