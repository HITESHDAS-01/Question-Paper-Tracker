'use client'

import type { Tracker } from '@/lib/types'

interface TrackerBarProps {
  trackers: Tracker[]
  activeTrackerId: string | null
  onSelect: (trackerId: string) => void
  onRename: (trackerId: string, name: string) => void
  onNew: () => void
  onLogout: () => void
}

export default function TrackerBar({ trackers, activeTrackerId, onSelect, onRename, onNew, onLogout }: TrackerBarProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap mb-3 pb-3 border-b border-slate-300 dark:border-slate-700 overflow-x-auto scrollbar-hide">
      {trackers.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          onDoubleClick={() => { const n = prompt('Rename tracker:', t.name); if (n?.trim()) onRename(t.id, n.trim()) }}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150 whitespace-nowrap ${
            activeTrackerId === t.id
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          title="Double-click to rename"
        >
          {t.name}
        </button>
      ))}
      <button
        onClick={onNew}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
      >+ New Tracker</button>
      <div className="flex-1" />
      <button onClick={onLogout} className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">Logout</button>
    </div>
  )
}
