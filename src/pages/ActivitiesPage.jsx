import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { formatTime, formatPace, formatDate } from "../utils/formatters";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { useDeleteActivity, useGetActivities, useGetProfilePicture } from "../api/track";
import { useDebounce } from "use-debounce";
import { Toaster, toast } from "sonner";
import { FaTrash, FaEdit, FaTimes, FaShare } from "react-icons/fa";
import { Button } from "../components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";
import EditActivityDrawer from "./EditActivityDrawer";

export const ActivitiesPage = () => {
  const queryClient = useQueryClient();
  const { data: activities = [], isPending: activitiesLoading, isError: isActivitiesError } = useGetActivities();
  const { data: profilePictureData } = useGetProfilePicture();
  const { mutateAsync: deleteActivity, isPending: isDeleteActivityLoading } = useDeleteActivity();

  const [search, setSearch] = useState("");
  const [query] = useDebounce(search, 500);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const invalidateActivities = () => queryClient.invalidateQueries({ queryKey: ["activities"] });

  const hasSearch = typeof query === "string" && query.trim().length > 0;
  const filteredActivities = (() => {
    const all = Array.isArray(activities?.data) ? activities.data : [];
    if (!hasSearch) return all;
    const needle = query.trim().toLowerCase();
    return all.filter((a) => (a?.title || "").toLowerCase().includes(needle),
    );
  })();

  const handleDelete = async (id) => {
    try {
      await deleteActivity(id);
      toast.success("Activity deleted successfully");
      setConfirmDeleteId(null);
      await invalidateActivities();
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Failed to delete activity";
      toast.error(msg);
    }
  };

  const openEdit = (activity) => {
    setEditingActivity(activity);
    setDrawerOpen(true);
  };

  const closeEdit = () => {
    setDrawerOpen(false);
  };

  const buildShareUrl = (activityId) => {
    const { origin, pathname } = window.location;
    const basePath = pathname.replace(/\/activities.*$/, "");
    return `${origin}${basePath}/activities/${activityId}`;
  };

  const handleShare = async (e, activity) => {
    e.preventDefault();
    e.stopPropagation();
    const activityId = activity._id || activity.id;
    const url = buildShareUrl(activityId);
    const title = activity?.name || "Check out my run on Captain Track";
    const km =
      typeof activity?.distance === "number"
        ? `${activity.distance.toFixed(2)} km`
        : activity?.distance
          ? `${activity.distance} km`
          : "";
    const dur =
      typeof activity?.duration === "number"
        ? formatTime(activity.duration)
        : "";
    const pieces = [km, dur].filter(Boolean);
    const text =
      title + (pieces.length ? ` · ${pieces.join(" in ")}` : "");

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        toast.success("Shared successfully");
        return;
      }
    } catch (err) {
      if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
        return;
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
        return;
      }
    } catch {
      /* ignore and fall through */
    }

    if (typeof window !== "undefined" && document) {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Unable to share. Please copy the URL manually.");
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Toaster position="top-right" />
      <Navbar />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Activities</h1>
          <p className="text-slate-400 mt-1">View all your runs</p>
        </div>
        <div className="mb-6 animate-slide-up-delay-1">
          <input
            type="text"
            placeholder="Search activities..."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:border-[#FF6B00]/60 focus:ring-2 focus:ring-[#FF6B00]/20 outline-none transition-all duration-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-3 animate-slide-up-delay-2">
          {activitiesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-16 h-3 bg-white/10 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <div className="w-12 h-5 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-8 h-3 bg-white/10 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-14 h-5 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-10 h-3 bg-white/10 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-12 h-5 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-10 h-3 bg-white/10 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-12 h-5 bg-white/10 rounded animate-pulse"></div>
                          <div className="w-8 h-3 bg-white/10 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-32 h-24 rounded-xl bg-white/10 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : isActivitiesError ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-white font-bold text-lg">Failed to load activities</div>
              <div className="text-slate-400 text-sm mt-1">Please try again later</div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="text-4xl mb-4">🏃</div>
              <div className="text-white font-bold text-lg">No activity</div>
              <div className="text-slate-400 text-sm mt-1">
                {hasSearch
                  ? "Try a different search term"
                  : "Record your first run to get started"}
              </div>
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const activityId = activity._id || activity.id;
              const isConfirmingDelete = confirmDeleteId === activityId;
              return (
                <div
                  key={activityId}
                  className="glass-card glass-card-hover overflow-hidden relative"
                >
                  {isConfirmingDelete && (
                    <div className="absolute inset-0 z-[900] bg-[#0A0E1A]/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">Delete activity?</h3>
                            <p className="text-slate-400 text-sm mt-1">
                              This action cannot be undone.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <FaTimes />
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleDelete(activityId)}
                            disabled={isDeleteActivityLoading}
                            className="flex-1 cursor-pointer bg-red-500 hover:bg-red-600 focus:ring-red-500/40"
                          >
                            {isDeleteActivityLoading ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/activities/${activityId}`}
                    className="block p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={profilePictureData?.data?.url}
                              alt=""
                              className="w-10 h-10 rounded-full ring-2 ring-white/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate">{activity?.title || "Morning Run"}</div>
                              <div className="text-xs text-slate-500">{formatDate(activity.date)}</div>
                            </div>
                          </div>

                          <div
                            role="group"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="flex items-center shrink-0 rounded-xl bg-white/[0.04] border border-white/10 p-1 backdrop-blur-md shadow-lg shadow-black/20"
                          >
                            <button
                              type="button"
                              onClick={(e) => handleShare(e, activity)}
                              className="w-8 h-8 rounded-lg text-slate-300 hover:bg-[#5865F2]/15 hover:text-[#5865F2] transition-all duration-200 flex items-center justify-center cursor-pointer"
                              title="Share activity"
                            >
                              <FaShare className="text-[13px]" />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-0.5" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openEdit(activity);
                              }}
                              className="w-8 h-8 rounded-lg text-slate-300 hover:bg-[#FF6B00]/15 hover:text-[#FF6B00] transition-all duration-200 flex items-center justify-center cursor-pointer"
                              title="Edit activity"
                            >
                              <FaEdit className="text-[13px]" />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-0.5" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmDeleteId(isConfirmingDelete ? null : activityId);
                              }}
                              className={`w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
                                isConfirmingDelete
                                  ? "bg-red-500/15 text-red-400"
                                  : "text-slate-300 hover:bg-red-500/15 hover:text-red-400"
                              }`}
                              title="Delete activity"
                            >
                              <FaTrash className="text-[13px]" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-lg font-bold text-[#FF6B00]">
                              {typeof activity.distance === "number"
                                ? activity.distance.toFixed(2)
                                : activity.distance}
                            </div>
                            <div className="text-xs text-slate-500">km</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">
                              {formatTime(activity.duration)}
                            </div>
                            <div className="text-xs text-slate-500">time</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">
                              {formatPace(activity.pace)}
                            </div>
                            <div className="text-xs text-slate-500">pace</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-white">{activity.calories}</div>
                            <div className="text-xs text-slate-500">cal</div>
                          </div>
                        </div>
                      </div>
                      {activity.coords && activity.coords.length > 0 && (
                        <div className="w-32 h-24 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
                          <MapContainer
                            center={activity.coords[0]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                            dragging={false}
                            zoomControl={false}
                            touchZoom={false}
                            scrollWheelZoom={false}
                            doubleClickZoom={false}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Polyline positions={activity.coords} color="#FF6B00" weight={3} />
                          </MapContainer>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </main>
      <BottomNav />
      <EditActivityDrawer open={drawerOpen} activity={editingActivity} onClose={closeEdit} />
    </div>
  );
};
