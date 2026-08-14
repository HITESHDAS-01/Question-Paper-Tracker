'use client'

import type { ClassRow, Subject, ExamDate, PaperStatusMap } from '@/lib/types'
import SubjectCard from '../SubjectCard'

interface PendingViewProps {
  classes: ClassRow[]
  subjects: Subject[]
  examDates: ExamDate[]
  paperStatusMap: PaperStatusMap
  getTrackItems: (cls: ClassRow) => string[]
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateDate: (subjectId: string, itemType: string, date: string) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
}

export default function PendingView({ classes, subjects, examDates, paperStatusMap, getTrackItems, onToggle, onUpdateDate, onUpdateSubject, onDelete, onMove }: PendingViewProps) {
  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const pendingItems: { cls: ClassRow; subject: Subject }[] = []
  classes.forEach(cls => {
    const trackItems = getTrackItems(cls)
    subjects.filter(s => s.class_id === cls.id).forEach(s => {
      const status = paperStatusMap[s.id]
      const doneCount = trackItems.reduce((sum, item) => sum + (status?.[item]?.checked ? 1 : 0), 0)
      if (doneCount < trackItems.length) pendingItems.push({ cls, subject: s })
    })
  })

  if (!pendingItems.length) {
    return <p className="text-center py-16 text-emerald-600 dark:text-emerald-400 italic text-sm">✓ All papers received. Nothing pending.</p>
  }

  pendingItems.sort((a, b) => {
    if (!a.subject.exam_date && !b.subject.exam_date) return 0
    if (!a.subject.exam_date) return 1
    if (!b.subject.exam_date) return -1
    return new Date(a.subject.exam_date).getTime() - new Date(b.subject.exam_date).getTime()
  })

  const byDate: Record<string, typeof pendingItems> = {}
  pendingItems.forEach(it => { const key = it.subject.exam_date || 'No date set'; (byDate[key] = byDate[key] || []).push(it) })

  return (
    <>
      <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        <strong>{pendingItems.length}</strong> paper{pendingItems.length === 1 ? '' : 's'} still pending · sorted by nearest exam date
      </div>
      {Object.entries(byDate).sort(([a], [b]) => a === 'No date set' ? 1 : b === 'No date set' ? -1 : a.localeCompare(b)).map(([date, items]) => {
        const dateInfo = examDates.find(d => d.date === date)
        return (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                {date === 'No date set' ? 'No Exam Date Set' : `${formatDate(date)}${dateInfo ? ' · ' + dateInfo.day : ''}`}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map(({ cls, subject }) => (
                <SubjectCard key={subject.id} cls={cls} subject={subject} allClasses={classes} paperStatusMap={paperStatusMap} getTrackItems={getTrackItems}
                  onToggle={onToggle} onUpdateDate={onUpdateDate} onUpdateSubject={onUpdateSubject} onDelete={onDelete} onMove={onMove} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
