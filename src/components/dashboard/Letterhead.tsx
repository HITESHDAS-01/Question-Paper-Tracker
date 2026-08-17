'use client'

import type { Tracker, School } from '@/lib/types'

interface LetterheadProps {
  school: School | null
  tracker: Tracker | null
  examDates: { date: string; day: string }[]
  onRenameTracker: (trackerId: string, name: string) => void
  onUpdateSubtitle: (subtitle: string) => void
}

export default function Letterhead({ school, tracker, examDates, onRenameTracker, onUpdateSubtitle }: LetterheadProps) {
  const schoolName = school?.name || 'School'
  const dates = examDates.map(d => d.date).filter(Boolean).sort()
  const dateRange = dates.length
    ? (dates.length === 1
      ? new Date(dates[0] + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : `${new Date(dates[0] + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(dates[dates.length - 1] + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`)
    : 'No exam dates added yet'

  return (
    <header className="text-center py-6 sm:py-8 px-3 sm:px-6 mb-4 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>
      <div className="relative z-10">
        <h1
          className="text-lg sm:text-2xl font-extrabold tracking-tight text-white cursor-pointer hover:text-blue-200 transition-colors border-b border-dashed border-transparent hover:border-blue-300"
          onClick={() => {
            const val = prompt('Tracker title:', tracker?.name || '')
            if (val?.trim() && tracker) onRenameTracker(tracker.id, val.trim())
          }}
          title="Click to rename this tracker"
        >
          QUESTION PAPER TRACKER — {(tracker?.name || 'SESSION 2026-27').toUpperCase()}
        </h1>
        <p
          className="text-xs sm:text-sm text-blue-200 mt-1 cursor-pointer hover:text-white transition-colors border-b border-dashed border-transparent hover:border-blue-300"
          onClick={() => {
            const val = prompt('Subtitle:', tracker?.subtitle || '')
            if (val !== null) onUpdateSubtitle(val.trim())
          }}
          title="Click to edit"
        >
          {tracker?.subtitle || `Half Yearly Examination · Grade III to XII · ${schoolName}`}
        </p>
        <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-3" />
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-blue-200">
          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">{dateRange}</span>
          <span className="hidden sm:inline px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">Verified against official datesheet</span>
          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">Click any field to edit</span>
        </div>
      </div>
    </header>
  )
}
