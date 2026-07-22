export const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 focus:border-[#FF6B00]/60 focus:ring-2 focus:ring-[#FF6B00]/20 focus:bg-white/[0.07] outline-none transition-all duration-300 ${className}`}
      {...props}
    />
  );
};
