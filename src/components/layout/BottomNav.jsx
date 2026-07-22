import { Link, useLocation } from "react-router-dom";
import { FaHome, FaRunning, FaTrophy, FaUser } from "react-icons/fa";

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Home", icon: <FaHome /> },
    { path: "/activities", label: "Activities", icon: <FaRunning /> },
    { path: "/record", label: "Record", icon: null, isCenter: true },
    { path: "/challenges", label: "Challenges", icon: <FaTrophy /> },
    { path: "/profile", label: "Profile", icon: <FaUser /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0E1A]/90 backdrop-blur-xl border-t border-white/[0.06] z-50">
      <div className="flex items-end justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;

          if (item.isCenter) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative -top-4 w-14 h-14 bg-gradient-to-br from-[#FF6B00] to-[#E040FB] rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-110 transition-all duration-300 animate-pulse-glow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-all duration-300 ${
                active ? "text-[#FF6B00]" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <span className="absolute bottom-1 w-4 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#E040FB] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
