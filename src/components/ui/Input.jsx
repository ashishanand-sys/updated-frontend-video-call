// Reusable Input component with label and error support
export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
          transition-all duration-200 backdrop-blur-sm
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50" : ""}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
