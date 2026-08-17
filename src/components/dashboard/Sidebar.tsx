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

const dateColors = [
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-red-500',
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-purple-500',
  'from-lime-500 to-green-500',
]

export default function Sidebar({ examDates, subjects, selectedDate, onSelectDate, onDeleteDate, onEditDate, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-30 backdrop-blur-sm" onClick={onToggle} />}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex-shrink-0 overflow-y-auto
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              Exam Dates
            </h3>
            <button className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors" onClick={onToggle}>×</button>
          </div>
          <div className="space-y-2">
            {examDates.map((dateInfo, idx) => {
              const count = subjects.filter(s => s.exam_date === dateInfo.date).length
              const colorGradient = dateColors[idx % dateColors.length]
              const isSelected = selectedDate === dateInfo.date
              return (
                <div
                  key={dateInfo.date}
                  className={`group rounded-xl p-3 cursor-pointer border transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r ' + colorGradient + ' text-white border-transparent shadow-lg scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                  }`}
                  onClick={() => onSelectDate(dateInfo.date)}
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="date"
                      className={`text-sm font-bold bg-transparent border-none outline-none cursor-pointer w-full ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}
                      defaultValue={dateInfo.date}
                      onClick={e => e.stopPropagation()}
                      onChange={e => { e.stopPropagation(); onEditDate(dateInfo.date, e.target.value) }}
                      title="Change this date"
                    />
                    <button
                      className={`opacity-0 group-hover:opacity-100 text-sm ml-2 transition-opacity ${isSelected ? 'text-white/70 hover:text-white' : 'text-red-400 hover:text-red-600'}`}
                      onClick={e => { e.stopPropagation(); onDeleteDate(dateInfo.date) }}
                      title="Delete date"
                    >×</button>
                  </div>
                  <div className={`text-xs mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{dateInfo.day}</div>
                  <div className={`text-xs mt-0.5 font-semibold ${isSelected ? 'text-white/90' : 'text-blue-600 dark:text-blue-400'}`}>{count} paper{count === 1 ? '' : 's'}</div>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
