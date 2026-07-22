import { useParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { dummyActivities, dummyUsers } from "../data/dummyData";
import { formatTime, formatPace, formatDate } from "../utils/formatters";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import { useGetActivitiesDetails } from "../api/track";

export const ActivityDetailsPage = () => {
  const { id } = useParams();

  const { data: activityData, isPending: activitiesDetailsLoading, isError: isActivitiesDetailsError } = useGetActivitiesDetails(id)

  // Load from localStorage and merge with dummy data
  const savedActivities = JSON.parse(localStorage.getItem('captainTrackActivities') || '[]');
  const allActivities = [...savedActivities, ...dummyActivities];

  const fallbackActivity = allActivities.find((a) => a.id === parseInt(id));
  const activity = activityData?.data || fallbackActivity;
  const user = dummyUsers.find((u) => u.id === activity?.userId);

  if (activitiesDetailsLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Map Skeleton */}
          <div className="glass-card overflow-hidden mb-6 animate-slide-up">
            <div className="h-80 bg-white/5 animate-pulse"></div>
          </div>

          {/* Activity Info Skeleton */}
          <div className="glass-card p-6 mb-6 animate-slide-up-delay-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-white/10 animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-32 h-5 bg-white/10 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-6 border-y border-white/[0.06] mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="w-16 h-7 bg-white/10 rounded animate-pulse mx-auto"></div>
                  <div className="w-8 h-3 bg-white/10 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Splits Skeleton */}
            <div className="space-y-4">
              <div className="w-16 h-5 bg-white/10 rounded animate-pulse"></div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg">
                    <div className="w-16 h-4 bg-white/10 rounded animate-pulse"></div>
                    <div className="w-12 h-4 bg-white/10 rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-white/10 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comments Skeleton */}
          <div className="glass-card p-6 animate-slide-up-delay-2">
            <div className="w-20 h-5 bg-white/10 rounded animate-pulse mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-3 bg-white/10 rounded animate-pulse"></div>
                      <div className="w-16 h-3 bg-white/10 rounded animate-pulse"></div>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (isActivitiesDetailsError || !activity) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏃</div>
          <div className="text-white font-bold text-lg">Activity not found</div>
          <div className="text-slate-400 text-sm mt-1">This run may have been removed</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Map */}
        <div className="glass-card overflow-hidden mb-6 animate-slide-up">
          <div className="h-80">
            <MapContainer
              center={activity.coords?.[0] || [40.7128, -74.006]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {activity.coords?.length > 0 && (
                <Polyline positions={activity.coords} color="#FF6B00" weight={3} />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Activity Info */}
        <div className="glass-card p-6 mb-6 animate-slide-up-delay-1">
          <div className="flex items-center gap-4 mb-6">
            <img src={user?.avatar} alt={user?.name} className="w-14 h-14 rounded-full ring-2 ring-white/10" />
            <div>
              <div className="font-bold text-white">{user?.name}</div>
              <div className="text-sm text-slate-400">{formatDate(activity.date)}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 py-6 border-y border-white/[0.06] mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-[#FF6B00]">{typeof activity.distance === 'number' ? activity.distance.toFixed(2) : activity.distance}</div>
              <div className="text-xs text-slate-500">km</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatTime(activity.duration)}
              </div>
              <div className="text-xs text-slate-500">time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {formatPace(activity.pace)}
              </div>
              <div className="text-xs text-slate-500">avg pace</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activity.calories}</div>
              <div className="text-xs text-slate-500">cal</div>
            </div>
          </div>

          {/* Splits */}
          <div className="space-y-4">
            <h3 className="font-bold text-white">Splits</h3>
            {activity.splits?.length > 0 ? (
              <div className="space-y-1">
                {activity.splits.map((split, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors duration-200"
                  >
                    <div className="text-slate-400 text-sm">Km {split.km}</div>
                    <div className="font-medium text-white text-sm">{formatTime(split.time)}</div>
                    <div className="text-slate-400 text-sm">{formatPace(split.pace)}/km</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No splits available</p>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="glass-card p-6 animate-slide-up-delay-2">
          <h3 className="font-bold text-white mb-4">Comments</h3>
          {activity.comments?.length > 0 ? (
            <div className="space-y-4">
              {activity.comments.map((comment, i) => {
                const commentUser = dummyUsers.find((u) => u.id === comment.userId);
                return (
                  <div key={i} className="flex items-start gap-3">
                    <img
                      src={commentUser?.avatar}
                      alt={commentUser?.name}
                      className="w-8 h-8 rounded-full ring-1 ring-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">
                          {commentUser?.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(comment.time)}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No comments yet</p>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
