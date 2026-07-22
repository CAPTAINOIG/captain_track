import { Link, useLocation } from "react-router-dom";
import { FaRunning, FaChartLine, FaCompass, FaTrophy, FaUsers, FaUser, FaCog } from "react-icons/fa";

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaChartLine /> },
    { path: "/activities", label: "Activities", icon: <FaRunning /> },
    { path: "/explore", label: "Explore", icon: <FaCompass /> },
    { path: "/challenges", label: "Challenges", icon: <FaTrophy /> },
    { path: "/community", label: "Community", icon: <FaUsers /> },
    { path: "/profile", label: "Profile", icon: <FaUser /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#0A0E1A]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B00] to-[#E040FB] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow duration-300">
              CT
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Captain Track
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? "text-[#FF6B00] bg-[#FF6B00]/10"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {item.icon}
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#E040FB] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.05] transition-all duration-300"
            >
              <FaCog />
            </Link>
            <Link
              to="/record"
              className="bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.03] transition-all duration-300"
            >
              + Record
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
