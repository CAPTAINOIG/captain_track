import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { Button } from "../components/ui/Button";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { useCreateActivity } from "../api/track";
import { toast } from "sonner";

// Calculate distance between two lat/lng points in km using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const LiveMap = ({ isRunning, position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16, { animate: false });
    }
  }, [position, map]);
  return null;
};

export const RecordRunPage = () => {
  const {
    mutateAsync: createActivities,
    isPending: isCreateActivityLoading,
    isError: isCreateActivityError,
  } = useCreateActivity();

  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [position, setPosition] = useState([40.7128, -74.006]); // Default to NYC
  const [path, setPath] = useState([]); // Array of [lat, lng] points
  const watchId = useRef(null);
  const lastPosition = useRef(null);
  const [locationError, setLocationError] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const testIntervalRef = useRef(null);

  // Get initial position on page load (try high accuracy first, then low)
  useEffect(() => {
    if (navigator.geolocation) {
      // Try high accuracy first
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLocationError(null);
        },
        (error) => {
          console.warn("High accuracy failed, trying low accuracy:", error);
          // Fallback to low accuracy
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setPosition([pos.coords.latitude, pos.coords.longitude]);
              setLocationError(null);
            },
            (err) => {
              setLocationError(err.message);
              console.error("Geolocation error:", err);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    }
  }, []);

  // Timer for time tracking
  useEffect(() => {
    let timer;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused]);

  // Test mode simulation — simulates jogging at ~10 km/h in a consistent direction
  useEffect(() => {
    if (testMode && isRunning && !isPaused) {
      const direction = Math.random() * 2 * Math.PI; // Pick a random heading once
      const speedKmH = 10; // ~10 km/h jogging pace
      const intervalMs = 2000; // Update every 2 seconds
      const distPerTick = (speedKmH / 3600) * (intervalMs / 1000); // km per tick
      const dLat = (distPerTick / 6371) * (180 / Math.PI) * Math.cos(direction);
      const dLon = (distPerTick / 6371) * (180 / Math.PI) * Math.sin(direction);

      testIntervalRef.current = setInterval(() => {
        setPosition((prevPos) => {
          // Add slight natural variation (±10%)
          const jitter = 0.9 + Math.random() * 0.2;
          const newPos = [
            prevPos[0] + dLat * jitter,
            prevPos[1] + dLon * jitter,
          ];
          if (lastPosition.current) {
            const dist = calculateDistance(
              lastPosition.current[0],
              lastPosition.current[1],
              newPos[0],
              newPos[1],
            );
            setDistance((d) => d + dist);
            setCalories((c) => c + dist * 60);
            setPath((p) => [...p, newPos]);
          } else {
            setPath([newPos]);
          }
          lastPosition.current = newPos;
          return newPos;
        });
      }, intervalMs);
    } else {
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
      }
    }
    return () => {
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
      }
    };
  }, [testMode, isRunning, isPaused]);

  // Geolocation tracking
  useEffect(() => {
    if (!isRunning || isPaused || testMode) {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        const accuracy = pos.coords.accuracy; // in meters
        setPosition(newPos);
        setLocationError(null);

        // Ignore inaccurate GPS readings (accuracy > 20 meters)
        if (accuracy > 20) return;

        if (lastPosition.current) {
          const dist = calculateDistance(
            lastPosition.current[0],
            lastPosition.current[1],
            newPos[0],
            newPos[1],
          );
          if (dist > 0.01) {
            // Only update if moved more than 10 meters (filters GPS drift)
            setDistance((d) => d + dist);
            setCalories((c) => c + dist * 60); // Rough estimate: ~60 cal/km
            setPath((p) => [...p, newPos]);
            lastPosition.current = newPos; // Only update reference when real movement detected
          }
        } else {
          setPath([newPos]);
          lastPosition.current = newPos; // Set initial reference position
        }
      },
      (error) => {
        console.error("Geolocation watch error:", error);
        setLocationError(error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isRunning, isPaused]);

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

  const handleStop = async () => {
    // Only save activity if there's actual distance recorded
    if (distance > 0) {
      const newActivity = {
        id: Date.now(),
        userId: 1,
        date: new Date().toISOString(),
        type: "Run",
        distance: distance,
        duration: time,
        pace: pace,
        avgSpeed: distance > 0 && time > 0 ? distance / (time / 3600) : 0,
        calories: Math.floor(calories),
        elevation: 0,
        coords: path,
        splits: [],
        comments: [],
        likes: [],
      };
      try {
        const res = await createActivities(newActivity);
        toast.success("Activity saved successfully!");
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || error.message || "An error occurred";
        toast.error(errorMsg);
        toast.error("Failed to save activity. Please try again.");
      }
    }

    // Always reset state and navigate, even if no distance was recorded
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    setDistance(0);
    setCalories(0);
    setPath([]);
    lastPosition.current = null;
    navigate("/activities");
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      {locationError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500/90 backdrop-blur-md text-white p-3 text-center z-[60] text-sm font-medium">
          Location Error: {locationError} — Please enable location services!
        </div>
      )}
      <div className="h-screen flex flex-col">
        {/* Map Area */}
        <div className="flex-1 relative">
          <MapContainer
            center={position}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LiveMap isRunning={isRunning} position={position} />
            <Marker position={position} />
            {path.length > 1 && (
              <Polyline positions={path} color="#FF6B00" weight={4} />
            )}
          </MapContainer>

          {/* Back Button */}
          <div className="absolute top-4 left-4 right-4 flex justify-between z-[400]">
            <button
              onClick={() => window.history.back()}
              className="bg-[#0A0E1A]/80 backdrop-blur-md text-white p-3 rounded-xl border border-white/10 shadow-lg hover:bg-[#0A0E1A] transition-all duration-300"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Stats & Controls Panel */}
        <div className="bg-[#0A0E1A] border-t border-white/[0.06] p-6">
          <div className="text-center mb-6">
            {/* Timer */}
            <div className="text-5xl md:text-6xl font-mono font-extrabold text-white mb-6 tracking-wider">
              {formatTime(time)}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold gradient-text">
                  {distance.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  KM
                </div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {formatPace(pace)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  PACE
                </div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {distance > 0 && time > 0
                    ? (distance / (time / 3600)).toFixed(1)
                    : "0.0"}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  KM/H
                </div>
              </div>
              <div className="glass-card p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-white">
                  {Math.floor(calories)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  CAL
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-6">
              {!isRunning ? (
                <button
                  onClick={() => setIsRunning(true)}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E040FB] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 animate-pulse-glow cursor-pointer"
                >
                  <FaPlay className="text-xl ml-1" />
                </button>
              ) : (
                <>
                  <button
                    className="w-16 h-16 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/[0.15] transition-all duration-300 cursor-pointer"
                    onClick={handlePause}
                  >
                    <FaPause className="text-lg" />
                  </button>
                  <button
                    className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer"
                    onClick={handleStop}
                  >
                    <FaStop className="text-xl" />
                  </button>
                </>
              )}
            </div>

            {/* Test Mode Toggle */}
            <button
              onClick={() => setTestMode(!testMode)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                testMode
                  ? "bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white shadow-lg shadow-orange-500/20"
                  : "bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.1]"
              }`}
            >
              {testMode
                ? "Test Mode: ON"
                : "Test Mode: OFF (Simulate Movement)"}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};
