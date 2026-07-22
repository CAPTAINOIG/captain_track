import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FaRunning, FaChartLine, FaTrophy, FaUsers, FaHeart } from "react-icons/fa";
import { BottomNav } from "../components/layout/BottomNav";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0A0E1A] overflow-hidden">
      {/* Ambient background orbs */}
      <div className="ambient-orb w-[500px] h-[500px] bg-[#FF6B00] top-[-200px] right-[-100px] fixed" />
      <div className="ambient-orb w-[400px] h-[400px] bg-[#E040FB] bottom-[-150px] left-[-100px] fixed" />
      <div className="ambient-orb w-[300px] h-[300px] bg-[#FF6B00] top-[50%] left-[50%] fixed" style={{ opacity: 0.15 }} />

      {/* Navbar */}
      <nav className="relative z-10 bg-transparent border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B00] to-[#E040FB] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
                CT
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Captain Track</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-slate-400 hover:text-white font-medium transition-colors duration-300">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white px-5 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.03] transition-all duration-300"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-24 px-4 animate-slide-up">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 text-sm text-slate-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              50K+ runners are already tracking
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Track Your Runs,
              <br />
              <span className="gradient-text">Achieve Your Goals</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of runners who are pushing their limits and achieving more every day with GPS tracking, analytics, and a thriving community.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg">Start Running</Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 py-12 px-4 animate-slide-up-delay-1">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "50K+", label: "Active Runners" },
                { value: "2M+", label: "Runs Tracked" },
                { value: "100K+", label: "km Covered" },
                { value: "4.9", label: "User Rating" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 animate-slide-up-delay-2">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-4 tracking-tight">
            Why Choose Captain Track?
          </h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Everything you need to take your running to the next level.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FaRunning className="text-2xl" />,
                title: "Accurate Tracking",
                desc: "Precise GPS tracking for every run, with detailed split times and route mapping.",
              },
              {
                icon: <FaChartLine className="text-2xl" />,
                title: "Progress Analytics",
                desc: "Visualize your improvement with beautiful charts, weekly/monthly insights.",
              },
              {
                icon: <FaTrophy className="text-2xl" />,
                title: "Challenges & Badges",
                desc: "Stay motivated with challenges and earn badges for your achievements.",
              },
              {
                icon: <FaUsers className="text-2xl" />,
                title: "Community",
                desc: "Connect with fellow runners, share progress, and stay accountable.",
              },
              {
                icon: <FaHeart className="text-2xl" />,
                title: "Health Focus",
                desc: "Monitor your health metrics and train smarter, not harder.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card glass-card-hover p-8 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-[#E040FB]/10 flex items-center justify-center text-[#FF6B00] mb-5 group-hover:from-[#FF6B00]/30 group-hover:to-[#E040FB]/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B00] to-[#E040FB] rounded-lg flex items-center justify-center text-white font-bold text-sm">
              CT
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Captain Track</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Captain Track. All rights reserved.</p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
};
