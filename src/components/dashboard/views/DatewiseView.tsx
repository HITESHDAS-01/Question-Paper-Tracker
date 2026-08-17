'use client'

import type { ClassRow, ExamDate, Subject, PaperStatusMap } from '@/lib/types'
import SubjectCard from '../SubjectCard'
import MarkTypeButtons from '../MarkTypeButtons'

interface DatewiseViewProps {
  examDates: ExamDate[]
  subjects: Subject[]
  classes: ClassRow[]
  selectedDate: string | null
  paperStatusMap: PaperStatusMap
  getTrackItems: (cls: ClassRow) => string[]
  setSelectedDate: (d: string | null) => void
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
  onMarkAllByType: (itemType: string, options?: { date?: string; classId?: string; category?: string }) => void
}

export default function DatewiseView({ examDates, subjects, classes, selectedDate, paperStatusMap, getTrackItems, setSelectedDate, onToggle, onUpdateSubject, onDelete, onMove, onMarkAllByType }: DatewiseViewProps) {
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
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Showing <strong>{formatDate(selectedDate)}</strong> only ·{' '}
            <button className="text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setSelectedDate(null)}>Show all dates</button>
          </div>
          <MarkTypeButtons
            label="Mark all"
            onMark={(type) => onMarkAllByType(type, { date: selectedDate })}
          />
        </div>
      )}
      {datesToShow.map(dateInfo => {
        const dateSubjects = subjects.filter(s => s.exam_date === dateInfo.date)
        return (
          <div key={dateInfo.date} className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                {formatDate(dateInfo.date)} · {dateInfo.day}
              </h3>
              {!selectedDate && dateSubjects.length > 0 && (
                <MarkTypeButtons
                  label="Mark all"
                  onMark={(type) => onMarkAllByType(type, { date: dateInfo.date })}
                />
              )}
            </div>
            {dateSubjects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-500 italic">No exams scheduled.</p>
            ) : (
              sortedClasses.map(cls => {
                const clsSubjects = dateSubjects.filter(s => s.class_id === cls.id)
                if (!clsSubjects.length) return null
                return (
                  <div key={cls.id} className="mb-3">
                    <h4 className="text-xs font-bold mb-2 uppercase tracking-wide px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 inline-block">{cls.label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {clsSubjects.map(s => (
                        <SubjectCard key={s.id} cls={cls} subject={s} allClasses={classes} paperStatusMap={paperStatusMap} getTrackItems={getTrackItems}
                          onToggle={onToggle} onUpdateSubject={onUpdateSubject} onDelete={onDelete} onMove={onMove} />
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
