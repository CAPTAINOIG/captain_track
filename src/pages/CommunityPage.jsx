import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { dummyActivities, dummyUsers } from "../data/dummyData";
import { formatTime, formatPace, formatDate } from "../utils/formatters";
import { FaHeart, FaComment, FaShare } from "react-icons/fa";

export const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Community</h1>
          <p className="text-slate-400 mt-1">See what other runners are up to</p>
        </div>

        <div className="space-y-4 animate-slide-up-delay-1">
          {dummyActivities.slice(0, 10).map((activity) => {
            const user = dummyUsers.find((u) => u.id === activity.userId);
            return (
              <div key={activity.id} className="glass-card overflow-hidden">
                <div className="p-5">
                  {/* User header */}
                  <div className="flex items-center gap-3 mb-4">
                    <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full ring-2 ring-white/10" />
                    <div>
                      <div className="font-semibold text-white text-sm">{user?.name}</div>
                      <div className="text-xs text-slate-500">{formatDate(activity.date)}</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#FF6B00]">{activity.distance}</div>
                      <div className="text-[10px] text-slate-500 font-medium">KM</div>
                    </div>
                    <div className="text-center border-x border-white/[0.06]">
                      <div className="text-lg font-bold text-white">
                        {formatTime(activity.duration)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">TIME</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {formatPace(activity.pace)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">PACE</div>
                    </div>
                  </div>

                  {/* Social actions */}
                  <div className="flex items-center gap-6 text-slate-500">
                    <button className="flex items-center gap-2 hover:text-[#FF6B00] transition-colors duration-300 group">
                      <FaHeart className="group-hover:scale-110 transition-transform duration-200" /> 
                      <span className="text-sm">{activity.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-[#E040FB] transition-colors duration-300 group">
                      <FaComment className="group-hover:scale-110 transition-transform duration-200" /> 
                      <span className="text-sm">{activity.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-white transition-colors duration-300 group">
                      <FaShare className="group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
