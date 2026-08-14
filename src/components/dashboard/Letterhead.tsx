'use client'

import type { Tracker } from '@/lib/types'

interface LetterheadProps {
  tracker: Tracker | null
  examDates: { date: string; day: string }[]
  onRenameTracker: (trackerId: string, name: string) => void
  onUpdateSubtitle: (subtitle: string) => void
}

export default function Letterhead({ tracker, examDates, onRenameTracker, onUpdateSubtitle }: LetterheadProps) {
  const dates = examDates.map(d => d.date).filter(Boolean).sort()
  const dateRange = dates.length
    ? (dates.length === 1
      ? new Date(dates[0] + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : `${new Date(dates[0] + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(dates[dates.length - 1] + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`)
    : 'No exam dates added yet'

  return (
    <header className="text-center py-4 sm:py-6 px-3 sm:px-4 mb-3 sm:mb-4">
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3 sm:mb-4 flex-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-10 sm:h-14 w-auto" src="/rgs-logo.jpg" alt="Royal Global School" />
        <div className="w-px h-7 sm:h-10 bg-slate-300 dark:bg-slate-600" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-7 sm:h-9 w-auto" src="/cambridge-logo.png" alt="Cambridge" />
      </div>
      <h1
        className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-dashed border-transparent hover:border-blue-400"
        onClick={() => {
          const val = prompt('Tracker title:', tracker?.name || '')
          if (val?.trim() && tracker) onRenameTracker(tracker.id, val.trim())
        }}
        title="Click to rename this tracker"
      >
        QUESTION PAPER TRACKER — {(tracker?.name || 'SESSION 2026-27').toUpperCase()}
      </h1>
      <p
        className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-b border-dashed border-transparent hover:border-blue-400"
        onClick={() => {
          const val = prompt('Subtitle:', tracker?.subtitle || '')
          if (val !== null) onUpdateSubtitle(val.trim())
        }}
        title="Click to edit"
      >
        {tracker?.subtitle || 'Half Yearly Examination · Grade III to XII · Royal Global School, Guwahati'}
      </p>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent my-2 sm:my-3" />
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
        <span>{dateRange}</span>
        <span className="hidden sm:inline">Verified against official datesheet</span>
        <span>Click any field to edit</span>
      </div>
    </header>
  )
}
