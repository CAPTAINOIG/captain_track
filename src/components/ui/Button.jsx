export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#FF6B00] to-[#E040FB] text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.98]",
    secondary:
      "bg-white/[0.06] backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]",
    outline:
      "border border-[#FF6B00]/50 text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:border-[#FF6B00] hover:scale-[1.02] active:scale-[0.98]",
    ghost:
      "text-slate-300 hover:text-white hover:bg-white/[0.06] active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      className={`rounded-xl font-semibold transition-all duration-300 ease-out ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
