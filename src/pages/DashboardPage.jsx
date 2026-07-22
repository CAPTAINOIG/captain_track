import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { StatCard } from "../components/common/StatCard";
import { dummyStatistics, dummyActivities, dummyChallenges, dummyBadges } from "../data/dummyData";
import { formatTime, formatPace, formatDate } from "../utils/formatters";
import { FaRunning, FaClock, FaFire, FaRoute, FaMedal } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Greeting */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Hey, Alex! 👋</h1>
          <p className="text-slate-400 mt-1">Here's your running overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up-delay-1">
          <StatCard
            title="Total Distance"
            value={`${dummyStatistics.totalDistance} km`}
            icon={<FaRoute />}
            subtitle="+12% this week"
          />
          <StatCard
            title="Total Runs"
            value={dummyStatistics.totalRuns}
            icon={<FaRunning />}
            subtitle="+3 this week"
          />
          <StatCard
            title="Total Time"
            value={formatTime(dummyStatistics.totalTime)}
            icon={<FaClock />}
            subtitle="+8% this week"
          />
          <StatCard
            title="Avg Pace"
            value={formatPace(dummyStatistics.avgPace)}
            icon={<FaMedal />}
            subtitle="-5s better"
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 animate-slide-up-delay-2">
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4">Weekly Distance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dummyStatistics.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(12px)",
                      color: "#F1F5F9",
                    }}
                    labelStyle={{ color: "#94A3B8" }}
                  />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#FF6B00" />
                      <stop offset="100%" stopColor="#E040FB" />
                    </linearGradient>
                  </defs>
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="url(#lineGrad)"
                    strokeWidth={3}
                    dot={{ fill: "#FF6B00", strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: "#E040FB", strokeWidth: 0, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4">Monthly Distance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyStatistics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17, 24, 39, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      backdropFilter: "blur(12px)",
                      color: "#F1F5F9",
                    }}
                    labelStyle={{ color: "#94A3B8" }}
                  />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B00" />
                      <stop offset="100%" stopColor="#E040FB" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="distance" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activities & Challenges */}
        <div className="grid md:grid-cols-3 gap-6 animate-slide-up-delay-3">
          {/* Recent Activities */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Recent Activities</h3>
              <Link to="/activities" className="text-[#FF6B00] text-sm font-medium hover:text-[#E040FB] transition-colors duration-300">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {dummyActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="glass-card glass-card-hover p-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-white">{activity.type}</span>
                        <span className="text-xs text-slate-500">{formatDate(activity.date)}</span>
                      </div>
                      <div className="flex items-center gap-5 text-sm">
                        <span className="font-medium text-[#FF6B00]">{activity.distance} km</span>
                        <span className="text-slate-400">{formatTime(activity.duration)}</span>
                        <span className="text-slate-400">{formatPace(activity.pace)}/km</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">{activity.calories}</div>
                      <div className="text-xs text-slate-500">cal</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Challenges</h3>
              <Link to="/challenges" className="text-[#FF6B00] text-sm font-medium hover:text-[#E040FB] transition-colors duration-300">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {dummyChallenges.slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{challenge.badge}</div>
                    <div>
                      <div className="font-semibold text-white text-sm">{challenge.name}</div>
                      <div className="text-xs text-slate-500">{challenge.daysRemaining} days left</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>{challenge.current} km</span>
                      <span>{challenge.target} km</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                      <div
                        className="progress-gradient h-1.5 rounded-full transition-all"
                        style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-white mb-4">Badges</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {dummyBadges.map((badge) => (
              <div
                key={badge.id}
                className={`glass-card p-3 text-center group transition-all duration-300 ${
                  !badge.earned ? "opacity-30" : "hover:bg-white/[0.07] hover:shadow-lg hover:shadow-orange-500/10"
                }`}
              >
                <div className={`text-2xl mb-1.5 ${badge.earned ? "animate-float" : ""}`} style={{ animationDelay: `${badge.id * 0.3}s` }}>
                  {badge.icon}
                </div>
                <div className="text-[10px] font-medium text-slate-400">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
