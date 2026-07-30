export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-sm hover:shadow-md hover:shadow-emerald-500/20',
    secondary: 'bg-gray-100 text-foreground hover:bg-gray-200 border border-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm',
    ghost: 'text-foreground hover:bg-gray-100',
    outline: 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-3 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button disabled={disabled || loading} className={`rounded-xl font-bold transition-all duration-200 inline-flex items-center justify-center gap-2 ${sizes[size]} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`} {...props}>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
