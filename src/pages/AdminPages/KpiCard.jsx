import React from 'react'

const KpiCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur transition-all duration-300 hover:bg-white/[0.04] hover:scale-[1.01]">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-2">{label}</p>
        <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        <Icon size={18} />
      </div>
    </div>
    <div
      className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full opacity-[0.07]"
      style={{ backgroundColor: accent }}
    />
  </div>
);
export default KpiCard