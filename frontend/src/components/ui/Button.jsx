export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, className = '', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
    secondary: 'bg-muted text-foreground hover:bg-gray-200',
    danger: 'bg-destructive text-white hover:bg-destructive-hover shadow-sm',
    ghost: 'text-foreground hover:bg-muted',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    success: 'bg-accent text-white hover:bg-accent-hover shadow-sm',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-3 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button disabled={disabled || loading} className={`rounded-xl font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 ${sizes[size]} ${variants[variant]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`} {...props}>
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
