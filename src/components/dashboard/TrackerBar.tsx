'use client'

import type { Tracker } from '@/lib/types'

interface TrackerBarProps {
  trackers: Tracker[]
  activeTrackerId: string | null
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onNew: () => void
  onLogout: () => void
}

export default function TrackerBar({ trackers, activeTrackerId, onSelect, onRename, onDelete, onNew, onLogout }: TrackerBarProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap mb-3 pb-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
      {trackers.map(p => (
        <div
          key={p.id}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border cursor-pointer whitespace-nowrap transition-all duration-150 ${
            p.id === activeTrackerId
              ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-md'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-400'
          }`}
          onClick={() => { if (p.id !== activeTrackerId) onSelect(p.id) }}
        >
          {p.name}
          {p.id === activeTrackerId && (
            <span className="flex items-center gap-0.5 ml-1">
              <button
                className="w-4 h-4 rounded hover:bg-white/20 flex items-center justify-center text-[10px]"
                onClick={e => { e.stopPropagation(); const val = prompt('Rename tracker:', p.name); if (val?.trim()) onRename(p.id, val.trim()) }}
                title="Rename"
              >✎</button>
              {trackers.length > 1 && (
                <button
                  className="w-4 h-4 rounded hover:bg-white/20 flex items-center justify-center text-[10px]"
                  onClick={e => { e.stopPropagation(); onDelete(p.id) }}
                  title="Delete"
                >×</button>
              )}
            </span>
          )}
        </div>
      ))}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 cursor-pointer whitespace-nowrap hover:border-blue-400 hover:text-blue-500 transition-all"
        onClick={onNew}
      >+ New Tracker</div>
      <button
        className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        onClick={onLogout}
      >Logout</button>
    </div>
  )
}
