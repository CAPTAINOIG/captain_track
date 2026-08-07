import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const resolve = (value, prev) => typeof value === "function" ? value(prev) : value;

const useRecordStore = create(
  persist(
    (set, get) => ({
      isRunning: false,
      isPaused: false,
      time: 0,
      distance: 0,
      calories: 0,
      position: null,
      path: [],
      setIsRunning: (isRunning) =>
        set((state) => ({ isRunning: resolve(isRunning, state.isRunning) })),
      setIsPaused: (isPaused) =>
        set((state) => ({ isPaused: resolve(isPaused, state.isPaused) })),
      setTime: (time) =>
        set((state) => ({ time: Number(resolve(time, state.time)) })),
      setDistance: (distance) =>
        set((state) => ({ distance: Number(resolve(distance, state.distance)) })),
      setCalories: (calories) =>
        set((state) => ({ calories: Number(resolve(calories, state.calories)) })),
      setPosition: (position) =>
        set((state) => ({ position: resolve(position, state.position) })),
      setPath: (path) =>
        set((state) => ({ path: resolve(path, state.path) })),
    }),
    {
      name: "record-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        time: state.time,
        distance: state.distance,
        calories: state.calories,
        position: state.position,
        path: state.path,
      }),
    }
  )
);

export default useRecordStore;
