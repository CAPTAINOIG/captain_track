export const StatCard = ({ title, value, icon, subtitle }) => {
  return (
    <div className="glass-card glass-card-hover p-5 group">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-[#E040FB]/10 text-[#FF6B00] group-hover:from-[#FF6B00]/30 group-hover:to-[#E040FB]/20 transition-all duration-300">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1 tracking-tight">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
      {subtitle && (
        <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
          <span className="inline-block w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-emerald-400" />
          {subtitle}
        </div>
      )}
    </div>
  );
};
