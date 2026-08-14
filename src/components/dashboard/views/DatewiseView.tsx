'use client'

import type { ClassRow, ExamDate, Subject, PaperStatusMap } from '@/lib/types'
import SubjectCard from '../SubjectCard'

interface DatewiseViewProps {
  examDates: ExamDate[]
  subjects: Subject[]
  classes: ClassRow[]
  selectedDate: string | null
  paperStatusMap: PaperStatusMap
  getTrackItems: (cls: ClassRow) => string[]
  setSelectedDate: (d: string | null) => void
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateDate: (subjectId: string, itemType: string, date: string) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
}

export default function DatewiseView({ examDates, subjects, classes, selectedDate, paperStatusMap, getTrackItems, setSelectedDate, onToggle, onUpdateDate, onUpdateSubject, onDelete, onMove }: DatewiseViewProps) {
  const datesToShow = selectedDate ? examDates.filter(d => d.date === selectedDate) : examDates
  const sortedClasses = [...classes].sort((a, b) => {
    const aCam = a.label.includes('(Cambridge)') ? 0 : 1
    const bCam = b.label.includes('(Cambridge)') ? 0 : 1
    return aCam - bCam
  })

  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <>
      {selectedDate && (
        <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Showing <strong>{formatDate(selectedDate)}</strong> only ·{' '}
          <button className="text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setSelectedDate(null)}>Show all dates</button>
        </div>
      )}
      {datesToShow.map(dateInfo => {
        const dateSubjects = subjects.filter(s => s.exam_date === dateInfo.date)
        return (
          <div key={dateInfo.date} className="mb-6">
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{formatDate(dateInfo.date)} · {dateInfo.day}</h3>
            </div>
            {dateSubjects.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No exams scheduled.</p>
            ) : (
              sortedClasses.map(cls => {
                const clsSubjects = dateSubjects.filter(s => s.class_id === cls.id)
                if (!clsSubjects.length) return null
                return (
                  <div key={cls.id} className="mb-3">
                    <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">{cls.label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {clsSubjects.map(s => (
                        <SubjectCard key={s.id} cls={cls} subject={s} allClasses={classes} paperStatusMap={paperStatusMap} getTrackItems={getTrackItems}
                          onToggle={onToggle} onUpdateDate={onUpdateDate} onUpdateSubject={onUpdateSubject} onDelete={onDelete} onMove={onMove} />
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )
      })}
    </>
  )
}
