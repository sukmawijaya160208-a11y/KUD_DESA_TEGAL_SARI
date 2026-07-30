export default function Card({ children, title, subtitle, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 md:p-6 transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/5 hover:border-emerald-100/50 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="font-heading font-bold text-foreground text-base md:text-lg">{title}</h3>
          {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
