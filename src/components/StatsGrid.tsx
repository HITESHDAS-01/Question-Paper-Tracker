'use client'

interface Stats {
  total: number
  received: number
  pending: number
  urgent: number
  percentage: number
}

interface Props {
  stats: Stats
}

export default function StatsGrid({ stats }: Props) {
  const items = [
    { label: 'Total Papers', value: stats.total, color: 'var(--royal)' },
    { label: 'Received', value: stats.received, color: 'var(--green)' },
    { label: 'Pending', value: stats.pending, color: 'var(--red)' },
    { label: 'Urgent / Overdue', value: stats.urgent, color: 'var(--red)' },
    { label: 'Complete', value: `${stats.percentage}%`, color: 'var(--gold)' },
  ]

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 mb-4" style={{ border: '1px solid var(--rule-strong)', backgroundColor: 'var(--panel)', boxShadow: '0 2px 10px rgba(32,42,60,.05)' }}>
      {items.map((item, i) => (
        <div
          key={item.label}
          className="text-center py-3 px-2"
          style={{
            borderRight: i < items.length - 1 ? '1px solid var(--rule)' : 'none',
          }}
        >
          <h3 className="font-mono text-xl md:text-2xl font-bold m-0" style={{ color: item.color }}>
            {item.value}
          </h3>
          <p className="m-0 uppercase tracking-widest text-[0.6em]" style={{ color: 'var(--ink-soft)' }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  )
}
