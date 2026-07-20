'use client';

export default function FloatingInput({
  id, label, icon, type = 'text', value, onChange,
  required, minLength, maxLength, placeholder,
  error, valid, disabled,
}) {
  const hasError = error && value?.length > 0;
  const isValid = valid && value?.length > 0 && !error;

  const borderColor = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]'
    : isValid
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500/30 focus:shadow-[0_0_0_4px_rgba(5,150,105,0.08)]'
    : 'border-border focus:ring-ring/30 focus:border-primary focus:shadow-[0_0_0_4px_rgba(37,99,235,0.06)]';

  return (
    <div className="relative">
      {icon && (
        <svg
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none z-10 transition-all duration-300 ${
            hasError ? 'text-red-400' : isValid ? 'text-green-400' : 'text-gray-300 peer-focus-within:text-primary'
          }`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          style={{ transform: `translateY(-50%) ${value ? 'scale(0.95)' : ''}` }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      )}
      <input
        id={id} type={type} value={value} onChange={onChange}
        required={required} minLength={minLength} maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder || ' '}
        className={`peer w-full rounded-xl border bg-white text-sm outline-none transition-all duration-200 ${borderColor} ${
          icon ? 'pt-5 pb-2 pl-10 pr-9' : 'pt-5 pb-2 px-4'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      <label htmlFor={id}
        className={`absolute left-4 top-4 text-sm transition-all duration-200 pointer-events-none z-10
          peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-sm
          peer-focus:top-[6px] peer-focus:text-xs
          peer-[:not(:placeholder-shown)]:top-[6px] peer-[:not(:placeholder-shown)]:text-xs
          ${hasError
            ? 'text-red-500 peer-placeholder-shown:text-gray-400 peer-focus:text-red-500 peer-[:not(:placeholder-shown)]:text-red-500'
            : isValid
            ? 'text-green-500 peer-placeholder-shown:text-gray-400 peer-focus:text-green-500 peer-[:not(:placeholder-shown)]:text-green-500'
            : 'text-gray-400 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-gray-500'
          } ${icon ? 'left-10' : 'left-4'}`}
      >
        {label}
      </label>

      {isValid && (
        <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
      {hasError && (
        <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}

      {error && value?.length > 0 && (
        <p className="text-red-500 text-[11px] mt-1 px-1">{error}</p>
      )}
    </div>
  );
}
