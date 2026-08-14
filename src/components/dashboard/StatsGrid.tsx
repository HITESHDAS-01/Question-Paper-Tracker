'use client'

interface StatsGridProps {
  stats: { total: number; received: number; pending: number; urgent: number; percentage: number }
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    { label: 'Total Papers', value: stats.total, color: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-50 dark:bg-slate-800' },
    { label: 'Received', value: stats.received, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Complete', value: `${stats.percentage}%`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {cards.map(c => (
        <div key={c.label} className={`${c.bg} rounded-xl p-4 text-center`}>
          <h3 className={`text-2xl font-bold ${c.color}`}>{c.value}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  )
}
