'use client'

import type { ExamDate, Subject } from '@/lib/types'

interface Props {
  dates: ExamDate[]
  selectedDate: string | null
  onSelect: (date: string) => void
  onDelete: (date: string) => void
  subjects: Subject[]
  formatDate: (date: string) => string
}

export default function DateList({ dates, selectedDate, onSelect, onDelete, subjects, formatDate }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {dates.map(dateInfo => {
        const count = subjects.filter(s => s.exam_date === dateInfo.date).length
        const isActive = selectedDate === dateInfo.date

        return (
          <div
            key={dateInfo.date}
            onClick={() => onSelect(dateInfo.date)}
            className="px-3 py-2 cursor-pointer transition-all"
            style={{
              backgroundColor: isActive ? 'var(--royal-soft)' : 'var(--panel-2)',
              border: '1px solid var(--rule)',
              borderLeft: `4px solid ${isActive ? 'var(--royal)' : 'var(--rule-strong)'}`,
            }}
          >
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-xs" style={{ color: 'var(--ink)' }}>
                {formatDate(dateInfo.date)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(dateInfo.date)
                }}
                className="w-4 h-4 rounded-full text-[0.7em] leading-none flex items-center justify-center"
                style={{ border: '1px solid var(--red)', color: 'var(--red)', background: 'none' }}
                title="Delete date"
              >
                ×
              </button>
            </div>
            <div className="text-xs italic" style={{ color: 'var(--ink-soft)' }}>{dateInfo.day}</div>
            <div className="text-[0.68em]" style={{ color: 'var(--green)' }}>
              {count} paper{count === 1 ? '' : 's'}
            </div>
          </div>
        )
      })}
      {dates.length === 0 && (
        <p className="text-xs italic" style={{ color: 'var(--ink-faint)' }}>No dates added yet</p>
      )}
    </div>
  )
}
