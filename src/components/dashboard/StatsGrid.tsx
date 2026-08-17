'use client'

interface StatsGridProps {
  stats: { total: number; received: number; pending: number; percentage: number }
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    {
      label: 'Total Papers',
      value: stats.total,
      gradient: 'from-slate-500 to-slate-700',
      bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900',
      border: 'border-slate-200 dark:border-slate-700',
      valueColor: 'text-slate-800 dark:text-slate-100',
      icon: (
        <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      ),
    },
    {
      label: 'Received',
      value: stats.received,
      gradient: 'from-emerald-400 to-green-600',
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
    },
    {
      label: 'Pending',
      value: stats.pending,
      gradient: 'from-amber-400 to-orange-600',
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      valueColor: 'text-amber-600 dark:text-amber-400',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
    },
    {
      label: 'Complete',
      value: `${stats.percentage}%`,
      gradient: 'from-blue-400 to-indigo-600',
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      valueColor: 'text-blue-600 dark:text-blue-400',
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
      {cards.map(c => (
        <div key={c.label} className={`${c.bg} ${c.border} border rounded-xl p-3 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-200 relative overflow-hidden group`}>
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
          <div className="flex justify-center mb-1">{c.icon}</div>
          <h3 className={`text-xl sm:text-2xl font-extrabold ${c.valueColor}`}>{c.value}</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">{c.label}</p>
        </div>
      ))}
    </div>
  )
}
