import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RecordingEngine } from "../src/engine/RecordingEngine";

const resolve = (value, prev) =>
  typeof value === "function" ? value(prev) : value;

const engineSnapshotToStore = (snap) => ({
  isRunning: !!snap.isRunning,
  isPaused: !!snap.isPaused,
  status: snap.status || "IDLE",
  sessionId: snap.sessionId || null,
  startedAt: snap.startedAt || null,
  pausedAt: snap.pausedAt || null,
  accumulatedPauseMs: snap.accumulatedPauseMs || 0,
  time: Number(snap.elapsedSeconds || 0),
  distance: Number(snap.distanceKm || 0),
  calories: Number(snap.calories || 0),
  position: snap.lastPosition || null,
  path: Array.isArray(snap.path) ? snap.path : [],
  lastLocationTimestamp: snap.lastLocationTimestamp || null,
  gpsError: snap.gpsError || null,
  lastFilterReason: snap.lastFilterReason || null,
});

const useRecordStore = create(
  persist(
    (set, get) => ({
      isRunning: false,
      isPaused: false,
      status: "IDLE",
      sessionId: null,
      startedAt: null,
      pausedAt: null,
      accumulatedPauseMs: 0,
      time: 0,
      distance: 0,
      calories: 0,
      position: null,
      path: [],
      lastLocationTimestamp: null,
      gpsError: null,
      lastFilterReason: null,

      _engineUnsubscribe: null,
      _subscribed: false,

      ensureSubscribedToEngine() {
        const current = get();
        if (current._subscribed) return;
        try {
          const unsub = RecordingEngine.subscribe((snap) => {
            set(engineSnapshotToStore(snap));
          });
          set({ _subscribed: true, _engineUnsubscribe: unsub });
        } catch (_) {
          /* ignore */
        }
      },

      setIsRunning: (isRunning) => {
        const next = Boolean(resolve(isRunning, get().isRunning));
        if (next) {
          RecordingEngine.start().catch(() => {});
        } else {
          if (get().status === "RUNNING") {
            RecordingEngine.pause().catch(() => {});
          }
        }
      },
      setIsPaused: (isPaused) => {
        const next = Boolean(resolve(isPaused, get().isPaused));
        if (next) {
          RecordingEngine.pause().catch(() => {});
        } else {
          if (get().status === "PAUSED") {
            RecordingEngine.resume().catch(() => {});
          }
        }
      },
      setTime: (time) => {
        set((s) => ({ time: Number(resolve(time, s.time)) }));
      },
      setDistance: (distance) => {
        set((s) => ({ distance: Number(resolve(distance, s.distance)) }));
      },
      setCalories: (calories) => {
        set((s) => ({ calories: Number(resolve(calories, s.calories)) }));
      },
      setPosition: (position) => {
        set((s) => ({ position: resolve(position, s.position) }));
      },
      setPath: (path) => {
        set((s) => ({ path: resolve(path, s.path) }));
      },
      setStatus: (status) => set({ status }),
      setGpsError: (err) => set({ gpsError: err }),
    }),
    {
      name: "record-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        status: state.status,
        sessionId: state.sessionId,
        startedAt: state.startedAt,
        pausedAt: state.pausedAt,
        accumulatedPauseMs: state.accumulatedPauseMs,
        time: state.time,
        distance: state.distance,
        calories: state.calories,
        position: state.position,
        path: state.path,
        lastLocationTimestamp: state.lastLocationTimestamp,
      }),
    }
  )
);

export default useRecordStore;
