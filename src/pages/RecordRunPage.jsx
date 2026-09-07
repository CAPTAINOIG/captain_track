import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../components/layout/BottomNav";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaPlay, FaPause, FaStop, FaInfoCircle } from "react-icons/fa";
import { toast } from "sonner";
import useRecordStore from "../../store/recordStore";
import { RecordingEngine } from "../engine/RecordingEngine";
import { SyncManager } from "../engine/syncManager";

const LiveMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16, { animate: false });
    }
  }, [position, map]);
  return null;
};

export const RecordRunPage = () => {
  const navigate = useNavigate();

  const time = useRecordStore((state) => state.time);
  const distance = useRecordStore((state) => state.distance);
  const calories = useRecordStore((state) => state.calories);
  const position = useRecordStore((state) => state.position);
  const path = useRecordStore((state) => state.path);
  const status = useRecordStore((state) => state.status);
  const isRunning = useRecordStore((state) => state.isRunning);
  const isPaused = useRecordStore((state) => state.isPaused);
  const gpsError = useRecordStore((state) => state.gpsError);
  const ensureSubscribed = useRecordStore((s) => s.ensureSubscribedToEngine);

  const [uiTick, setUiTick] = useState(0);
  const [initialMapCenter, setInitialMapCenter] = useState(null);
  const [bgWarningVisible, setBgWarningVisible] = useState(false);
  const wakeLockRef = useRef(null);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    ensureSubscribed();
  }, [ensureSubscribed]);

  useEffect(() => {
    if (navigator.geolocation && !initialMapCenter) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setInitialMapCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
      );
    }
  }, [initialMapCenter]);

  useEffect(() => {
    refreshTimerRef.current = setInterval(() => {
      setUiTick((t) => t + 1);
    }, 500);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, []);

  const requestWakeLock = async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {});
    } catch (_) {
      /* ignore */
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (_) {
        /* ignore */
      }
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [isRunning]);

  useEffect(() => {
    if (!("wakeLock" in navigator) || typeof document === "undefined") return;
    const onVisible = async () => {
      if (document.visibilityState === "visible" && isRunning) {
        await requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const pace = time > 0 && distance > 0 ? time / distance : 0;
  const formatPace = (p) => {
    if (p === 0) return "0'00\"";
    const m = Math.floor(p / 60);
    const s = Math.floor(p % 60);
    return `${m}'${s.toString().padStart(2, "0")}"`;
  };

  const handleStart = async () => {
    try {
      await RecordingEngine.start();
    } catch (err) {
      const msg = (err && err.message) || "Could not start recording";
      toast.error(msg);
    }
  };

  const handlePause = async () => {
    try {
      await RecordingEngine.pause();
    } catch (_) {
      /* ignore */
    }
  };

  const handleResume = async () => {
    try {
      await RecordingEngine.resume();
    } catch (_) {
      /* ignore */
    }
  };

  const handleStop = async () => {
    try {
      const result = await RecordingEngine.stop();
      if (result && result.saved) {
        if (SyncManager.isOnline()) {
          toast.success("Activity saved — syncing to server", {
            description: "If offline, it will upload automatically when online.",
          });
        } else {
          toast.success("Activity saved locally", {
            description: "It will upload automatically when internet returns.",
          });
        }
      } else if (result && !result.saved) {
        toast.info("No distance recorded — nothing to save");
      }
    } catch (err) {
      toast.error((err && err.message) || "Failed to stop recording");
    }
    navigate("/activities");
  };

  const mapCenter = position || initialMapCenter || [0, 0];
  const showStatusBadge = status === "PAUSED" || status === "RUNNING";

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      {gpsError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500/90 backdrop-blur-md text-white p-3 text-center z-[60] text-sm font-medium">
          Location Error: {gpsError} — Please enable location services!
        </div>
      )}

      <div className="h-screen flex flex-col">
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              errorTileUrl=""
            />
            {position && <LiveMap isRunning={isRunning} position={position} />}
            {position && <Marker position={position} />}
            {Array.isArray(path) &&
              path.length > 1 &&
              path.every(
                (p) =>
                  Array.isArray(p) &&
                  p.length >= 2 &&
                  typeof p[0] === "number" &&
                  typeof p[1] === "number"
              ) && <Polyline positions={path} color="#FF6B00" weight={4} />}
          </MapContainer>

          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[400] gap-3">
            <button
              onClick={() => window.history.back()}
              className="bg-[#0A0E1A]/80 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 shadow-lg hover:bg-[#0A0E1A] transition-all duration-300"
            >
              ← Back
            </button>
            <div className="flex flex-col items-end gap-2">
              {showStatusBadge && (
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-lg ${
                    status === "RUNNING"
                      ? "bg-green-500/20 text-green-300 border-green-500/40"
                      : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                  }`}
                >
                  {status === "RUNNING" ? "● RECORDING" : "❚❚ PAUSED"}
                </div>
              )}
              <button
                type="button"
                onClick={() => setBgWarningVisible(true)}
                className="bg-[#0A0E1A]/80 backdrop-blur-md text-slate-300 p-3 rounded-xl border border-white/10 shadow-lg hover:bg-[#0A0E1A] hover:text-white transition-all duration-300"
                title="Background recording info"
              >
                <FaInfoCircle />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0A0E1A] border-t border-white/[0.06] p-6">
          <div className="text-center mb-6">
            <div
              className="text-5xl md:text-6xl font-mono font-extrabold text-white mb-6 tracking-wider"
              data-ui-tick={uiTick}
            >
              {formatTime(time)}
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold gradient-text">
                  {distance.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">KM</div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {formatPace(pace)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">PACE</div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {distance > 0 && time > 0
                    ? (distance / (time / 3600)).toFixed(1)
                    : "0.0"}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">KM/H</div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {Math.floor(calories)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">CAL</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6">
              {!isRunning && !isPaused ? (
                <button
                  onClick={handleStart}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E040FB] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 animate-pulse-glow cursor-pointer"
                >
                  <FaPlay className="text-xl ml-1" />
                </button>
              ) : (
                <>
                  {isRunning ? (
                    <button
                      className="w-16 h-16 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/[0.15] transition-all duration-300 cursor-pointer"
                      onClick={handlePause}
                    >
                      <FaPause className="text-lg" />
                    </button>
                  ) : (
                    <button
                      className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-md border-2 border-green-500/40 flex items-center justify-center text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300 cursor-pointer"
                      onClick={handleResume}
                    >
                      <FaPlay className="text-lg ml-1" />
                    </button>
                  )}
                  <button
                    className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer"
                    onClick={handleStop}
                  >
                    <FaStop className="text-xl" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {bgWarningVisible && (
        <div className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
                  <FaInfoCircle />
                </div>
                <h3 className="text-lg font-bold text-white">Background Recording</h3>
              </div>
              <button
                type="button"
                onClick={() => setBgWarningVisible(false)}
                className="text-slate-400 hover:text-white text-xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="text-sm text-slate-300 space-y-3">
              <p>
                <strong className="text-white">GPS works offline.</strong> Your phone's GPS
                chip does not need mobile data. Captain Track collects positions locally,
                even with the internet off.
              </p>
              <p>
                <strong className="text-yellow-300">Mobile browsers limit background
                execution.</strong> For best reliability, keep Captain Track in the
                foreground and keep your screen on (we enable "Wake Lock" automatically
                when supported).
              </p>
              <p>
                <strong className="text-green-300">Workouts are never lost.</strong> Even
                if you close the tab, lose signal, or the browser suspends, your session
                is saved on-device. On reopen it will be restored.
              </p>
              <p>
                For uninterrupted screen-off recording (like Strava), a native mobile
                app with a foreground location service is required.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBgWarningVisible(false)}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
