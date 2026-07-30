export default function Select({ label, error, helperText, id, children, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div>
      {label && <label htmlFor={inputId} className="block text-sm font-semibold text-foreground/80 mb-1.5">{label}</label>}
      <select id={inputId} {...props} className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-400 mt-1.5">{helperText}</p>}
    </div>
  );
}
