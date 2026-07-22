import { Navbar } from "../components/layout/Navbar";
import { BottomNav } from "../components/layout/BottomNav";
import { FaUser, FaBell, FaLock, FaPalette, FaMobileAlt, FaLanguage, FaChevronRight } from "react-icons/fa";

export const SettingsPage = () => {
  const sections = [
    { icon: <FaUser />, title: "Profile", desc: "Edit your profile information" },
    { icon: <FaBell />, title: "Notifications", desc: "Manage notification preferences" },
    { icon: <FaLock />, title: "Privacy", desc: "Control your privacy settings" },
    { icon: <FaPalette />, title: "Appearance", desc: "Customize the app look" },
    { icon: <FaMobileAlt />, title: "Connected Devices", desc: "Manage connected devices" },
    { icon: <FaLanguage />, title: "Language", desc: "Choose your language" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-20 md:pb-0">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and preferences</p>
        </div>

        <div className="glass-card overflow-hidden animate-slide-up-delay-1">
          <div className="divide-y divide-white/[0.04]">
            {sections.map((section, i) => (
              <button
                key={i}
                className="w-full p-5 flex items-center gap-4 hover:bg-white/[0.04] transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00]/15 to-[#E040FB]/10 flex items-center justify-center text-[#FF6B00] group-hover:from-[#FF6B00]/25 group-hover:to-[#E040FB]/15 transition-all duration-300 shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{section.title}</div>
                  <div className="text-sm text-slate-500">{section.desc}</div>
                </div>
                <FaChevronRight className="text-slate-600 text-xs group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
