export default function Card({ children, title, subtitle, className = '' }) {
  return (
    <div className={`bg-surface rounded-2xl border border-border p-6 transition-all duration-200 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="font-heading font-bold text-foreground text-lg">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
