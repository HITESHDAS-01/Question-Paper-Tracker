'use client'

import { useState } from 'react'
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

export default function TabsBar({ currentView, onViewChange, onAddClass, onAddSubject, onAddDate, onMarkAllReceived, onClearAllStatus }: TabsBarProps) {
  const [actionsOpen, setActionsOpen] = useState(false)

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 rounded-lg p-1 w-max">
            {views.map(v => (
              <button
                key={v.key}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                  currentView === v.key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                onClick={() => onViewChange(v.key)}
              >{v.label}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setActionsOpen(!actionsOpen)}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
              <span className="hidden sm:inline">Actions</span>
              <svg className={`w-3 h-3 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {actionsOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActionsOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-40 w-52 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xl py-1 overflow-hidden">
                  <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50" onClick={() => { onAddClass(); setActionsOpen(false) }}>+ Class</button>
                  <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50" onClick={() => { onAddSubject(); setActionsOpen(false) }}>+ Subject</button>
                  <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50" onClick={() => { onAddDate(); setActionsOpen(false) }}>+ Date</button>
                  <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                  <button className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50" onClick={() => { onMarkAllReceived(); setActionsOpen(false) }}>Mark all received</button>
                  <button className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { onClearAllStatus(); setActionsOpen(false) }}>Clear all status</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
