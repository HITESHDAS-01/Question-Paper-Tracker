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

const views: { key: ViewMode; label: string; icon: string }[] = [
  { key: 'datewise', label: 'Date-wise', icon: '📅' },
  { key: 'gradewise', label: 'Grade-wise', icon: '🎓' },
  { key: 'subjectwise', label: 'Subject-wise', icon: '📚' },
  { key: 'pending', label: 'Pending Only', icon: '⏳' },
]

export default function TabsBar({ currentView, onViewChange, onAddClass, onAddSubject, onAddDate, onMarkAllReceived, onClearAllStatus }: TabsBarProps) {
  const [actionsOpen, setActionsOpen] = useState(false)

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-1 w-max shadow-inner">
            {views.map(v => (
              <button
                key={v.key}
                className={`px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  currentView === v.key
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-md shadow-blue-500/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
                onClick={() => onViewChange(v.key)}
              >
                <span className="mr-1">{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <ThemeToggle />
          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              onClick={() => setActionsOpen(!actionsOpen)}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
              <span className="hidden sm:inline">Actions</span>
              <svg className={`w-3 h-3 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {actionsOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setActionsOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-40 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 overflow-hidden">
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2" onClick={() => { onAddClass(); setActionsOpen(false) }}>
                    <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">+</span>
                    Class
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2" onClick={() => { onAddSubject(); setActionsOpen(false) }}>
                    <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px]">+</span>
                    Subject
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2" onClick={() => { onAddDate(); setActionsOpen(false) }}>
                    <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px]">+</span>
                    Date
                  </button>
                  <div className="my-1.5 border-t border-slate-200 dark:border-slate-700" />
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-2" onClick={() => { onMarkAllReceived(); setActionsOpen(false) }}>
                    <span className="w-5 h-5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-[10px]">✓</span>
                    Mark all received
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2" onClick={() => { onClearAllStatus(); setActionsOpen(false) }}>
                    <span className="w-5 h-5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-[10px]">✕</span>
                    Clear all status
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
