import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { dummyActivities, dummyUsers } from "../data/dummyData";
import { formatTime, formatPace, formatDate } from "../utils/formatters";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { useGetActivities, useGetProfilePicture } from "../api/track";

export const ActivitiesPage = () => {
  const { data: activities = [], isPending: activitiesLoading, isError: isActivitiesError } = useGetActivities();
  const { data: profilePictureData, isPending: getProfilePictureLoading, refetch } = useGetProfilePicture();

  const [search, setSearch] = useState("");

  const getUser = (userId) => dummyUsers.find((u) => u.id === userId);

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Activities</h1>
          <p className="text-slate-400 mt-1">View all your runs</p>
        </div>

        {/* Search */}
        <div className="mb-6 animate-slide-up-delay-1">
          <input
            type="text"
            placeholder="Search activities..."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:border-[#FF6B00]/60 focus:ring-2 focus:ring-[#FF6B00]/20 outline-none transition-all duration-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Activity List */}
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
          ) : (
            activities?.data?.map((activity) => {
              const user = getUser(activity.userId);
              return (
                <Link
                  key={activity.id}
                  to={`/activities/${activity.id}`}
                  className="block glass-card glass-card-hover overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={profilePictureData?.data?.url}
                            alt=""
                            className="w-10 h-10 rounded-full ring-2 ring-white/10"
                          />
                          <div>
                            <div className="font-semibold text-white">{user?.name}</div>
                            <div className="text-xs text-slate-500">{formatDate(activity.date)}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-lg font-bold text-[#FF6B00]">{typeof activity.distance === 'number' ? activity.distance.toFixed(2) : activity.distance}</div>
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
                        <div className="w-32 h-24 rounded-xl overflow-hidden ring-1 ring-white/10">
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
                  </div>
                </Link>
              );
            })
          )}
          {activities?.data?.length === 0 && 'No activity'}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
