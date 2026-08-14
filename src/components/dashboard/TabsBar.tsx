'use client'

import type { ViewMode } from '@/lib/types'
import ThemeToggle from './ThemeToggle'

interface TabsBarProps {
  currentView: ViewMode
  onViewChange: (view: ViewMode) => void
  onAddClass: () => void
  onAddSubject: () => void
  onAddDate: () => void
  onMarkAllReceived: () => void
  onClearAllStatus: () => void
}

const views: { key: ViewMode; label: string }[] = [
  { key: 'datewise', label: 'Date-wise' },
  { key: 'gradewise', label: 'Grade-wise' },
  { key: 'subjectwise', label: 'Subject-wise' },
  { key: 'pending', label: 'Pending Only' },
]

const actions = [
  { label: '+ Class', handler: 'onAddClass' as const },
  { label: '+ Subject', handler: 'onAddSubject' as const },
  { label: '+ Date', handler: 'onAddDate' as const },
  { label: 'Mark all received', handler: 'onMarkAllReceived' as const },
  { label: 'Clear all status', handler: 'onClearAllStatus' as const },
]

export default function TabsBar({ currentView, onViewChange, onAddClass, onAddSubject, onAddDate, onMarkAllReceived, onClearAllStatus }: TabsBarProps) {
  const handlers = { onAddClass, onAddSubject, onAddDate, onMarkAllReceived, onClearAllStatus }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {views.map(v => (
          <button
            key={v.key}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
              currentView === v.key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            onClick={() => onViewChange(v.key)}
          >{v.label}</button>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        {actions.map(a => (
          <button
            key={a.label}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              a.label === 'Clear all status'
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => handlers[a.handler]()}
          >{a.label}</button>
        ))}
        <ThemeToggle />
      </div>
    </div>
  )
}
