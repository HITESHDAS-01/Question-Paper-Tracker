'use client'

import type { ExamDate, Subject } from '@/lib/types'

interface SidebarProps {
  examDates: ExamDate[]
  subjects: Subject[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onDeleteDate: (date: string) => void
  onEditDate: (oldDate: string, newDate: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ examDates, subjects, selectedDate, onSelectDate, onDeleteDate, onEditDate, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-300 dark:border-slate-700"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/30 z-30" onClick={onToggle} />}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex-shrink-0 overflow-y-auto
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Exam Dates</h3>
            <button className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onClick={onToggle}>×</button>
          </div>
          <div className="space-y-2">
            {examDates.map(dateInfo => {
              const count = subjects.filter(s => s.exam_date === dateInfo.date).length
              return (
                <div
                  key={dateInfo.date}
                  className={`group rounded-lg p-3 cursor-pointer border transition-all duration-150 ${
                    selectedDate === dateInfo.date
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600 hover:bg-blue-50/50 dark:hover:bg-slate-700/50'
                  }`}
                  onClick={() => onSelectDate(dateInfo.date)}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="date"
                      className="text-sm font-medium text-slate-800 dark:text-white bg-transparent border-none outline-none cursor-pointer w-full"
                      defaultValue={dateInfo.date}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); onEditDate(dateInfo.date, e.target.value) }}
                      title="Change this date"
                    />
                    <button
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-sm ml-2 transition-opacity"
                      onClick={e => { e.stopPropagation(); onDeleteDate(dateInfo.date) }}
                      title="Delete date"
                    >×</button>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{dateInfo.day}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{count} paper{count === 1 ? '' : 's'}</div>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
