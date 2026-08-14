'use client'

interface StatsGridProps {
  stats: { total: number; received: number; pending: number; percentage: number }
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    { label: 'Total Papers', value: stats.total, accent: 'border-slate-200 dark:border-slate-700', valueColor: 'text-slate-800 dark:text-slate-100', bg: 'bg-white dark:bg-slate-800' },
    { label: 'Received', value: stats.received, accent: 'border-emerald-200 dark:border-emerald-800', valueColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-900/20' },
    { label: 'Pending', value: stats.pending, accent: 'border-amber-200 dark:border-amber-800', valueColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-900/20' },
    { label: 'Complete', value: `${stats.percentage}%`, accent: 'border-blue-200 dark:border-blue-800', valueColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/80 dark:bg-blue-900/20' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
      {cards.map(c => (
        <div key={c.label} className={`${c.bg} ${c.accent} border rounded-xl p-3 sm:p-4 text-center shadow-sm`}>
          <h3 className={`text-xl sm:text-2xl font-bold ${c.valueColor}`}>{c.value}</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{c.label}</p>
        </div>
      ))}
    </div>
  )
}
