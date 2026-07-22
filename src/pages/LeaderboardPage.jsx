import { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { dummyLeaderboard, dummyUsers } from "../data/dummyData";
import { formatPace } from "../utils/formatters";

export const LeaderboardPage = () => {
  const [filter, setFilter] = useState("week");

  const filters = ["today", "week", "month", "year"];

  const getUser = (userId) => dummyUsers.find((u) => u.id === userId);

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Leaderboard</h1>
          <p className="text-slate-400 mt-1">See how you rank against other runners</p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-slide-up-delay-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium capitalize text-sm transition-all duration-300 whitespace-nowrap ${
                filter === f
                  ? "bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white shadow-lg shadow-orange-500/20"
                  : "bg-white/[0.05] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="glass-card overflow-hidden animate-slide-up-delay-2">
          <div className="divide-y divide-white/[0.04]">
            {dummyLeaderboard.map((entry) => {
              const user = getUser(entry.userId);
              const isTopThree = entry.rank <= 3;
              return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-4 transition-all duration-200 hover:bg-white/[0.03] ${
                    isTopThree ? "bg-gradient-to-r from-[#FF6B00]/[0.06] to-transparent" : ""
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      entry.rank === 1
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-900 shadow-lg shadow-yellow-500/20"
                        : entry.rank === 2
                        ? "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700"
                        : entry.rank === 3
                        ? "bg-gradient-to-br from-orange-300 to-orange-400 text-orange-900"
                        : "bg-white/[0.06] text-slate-500"
                    }`}
                  >
                    {entry.rank}
                  </div>

                  {/* Avatar */}
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className={`w-10 h-10 rounded-full shrink-0 ${
                      isTopThree ? "ring-2 ring-[#FF6B00]/30" : "ring-1 ring-white/10"
                    }`}
                  />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${isTopThree ? "text-white" : "text-slate-300"}`}>
                      {user?.name}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className={`font-bold ${isTopThree ? "text-[#FF6B00]" : "text-white"}`}>
                      {entry.distance.toFixed(1)} km
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatPace(entry.avgPace)} · {entry.runs} runs
                    </div>
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
