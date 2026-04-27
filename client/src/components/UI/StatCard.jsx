export default function StatCard({ title, value, subtitle, icon: Icon, color = 'default', trend, trendValue }) {
  const colorMap = {
    default: { bg: 'bg-white',        icon: 'bg-gray-100 text-gray-700',   border: 'border-gray-200' },
    primary: { bg: 'bg-white',        icon: 'bg-gray-900 text-white',       border: 'border-gray-200' },
    green:   { bg: 'bg-white',        icon: 'bg-emerald-50 text-emerald-600',border: 'border-gray-200' },
    orange:  { bg: 'bg-white',        icon: 'bg-amber-50 text-amber-600',   border: 'border-gray-200' },
    red:     { bg: 'bg-white',        icon: 'bg-red-50 text-red-600',       border: 'border-gray-200' },
    blue:    { bg: 'bg-white',        icon: 'bg-blue-50 text-blue-600',     border: 'border-gray-200' },
    purple:  { bg: 'bg-white',        icon: 'bg-purple-50 text-purple-600', border: 'border-gray-200' },
  }
  const c = colorMap[color] || colorMap.default

  return (
    <div className={`${c.bg} rounded-xl border ${c.border} p-5 shadow-card hover:shadow-card-hover transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
          {trendValue !== undefined && (
            <p className={`text-xs font-medium mt-1.5 ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}
