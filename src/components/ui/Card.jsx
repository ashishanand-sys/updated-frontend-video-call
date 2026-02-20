// Reusable Card component with glassmorphism support
export default function Card({
  children,
  className = "",
  glass = false,
  padding = "p-8",
}) {
  const base = glass
    ? "bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/20"
    : "bg-slate-800 border border-slate-700/50 shadow-xl";

  return (
    <div
      className={`rounded-2xl ${base} ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
