import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { dummyUsers, dummyActivities } from "../data/dummyData";
import { formatDate } from "../utils/formatters";

export const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore</h1>
          <p className="text-slate-400 mt-1">Discover runners and routes near you</p>
        </div>

        {/* Popular Runners - Horizontal Scroll */}
        <div className="mb-10 animate-slide-up-delay-1">
          <h3 className="text-base font-bold text-white mb-4">Popular Runners</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
            {dummyUsers.map((user) => (
              <div
                key={user.id}
                className="flex-shrink-0 glass-card glass-card-hover p-4 text-center min-w-[130px] group"
              >
                <div className="relative inline-block mb-3">
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[#FF6B00] to-[#E040FB] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover ring-2 ring-[#0A0E1A]" />
                  </div>
                </div>
                <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{user.followers.toLocaleString()} followers</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Activities */}
        <div className="animate-slide-up-delay-2">
          <h3 className="text-base font-bold text-white mb-4">Trending Activities</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {dummyActivities.slice(0, 6).map((activity) => {
              const user = dummyUsers.find((u) => u.id === activity.userId);
              return (
                <div key={activity.id} className="glass-card glass-card-hover p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full ring-1 ring-white/10" />
                    <div>
                      <div className="font-semibold text-white text-sm">{user?.name}</div>
                      <div className="text-xs text-slate-500">{formatDate(activity.date)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-[#FF6B00]">{activity.distance} km</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{activity.type}</span>
                    {activity.likes?.length > 0 && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-500">❤️ {activity.likes.length}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
