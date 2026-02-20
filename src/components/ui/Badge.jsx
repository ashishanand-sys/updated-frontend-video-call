// Reusable Badge component
export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-slate-700/50 text-slate-300 border-slate-600/50",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    danger: "bg-red-500/10 text-red-400 border-red-500/30",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    live: "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
