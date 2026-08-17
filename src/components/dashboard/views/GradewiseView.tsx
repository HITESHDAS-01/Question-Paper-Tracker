'use client'

import type { ClassRow, Subject, PaperStatusMap } from '@/lib/types'
import SubjectCard from '../SubjectCard'
import MarkTypeButtons from '../MarkTypeButtons'

interface GradewiseViewProps {
  classes: ClassRow[]
  subjects: Subject[]
  selectedGrade: string | null
  paperStatusMap: PaperStatusMap
  getTrackItems: (cls: ClassRow) => string[]
  setSelectedGrade: (g: string | null) => void
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
  onMarkAllByType: (itemType: string, options?: { date?: string; classId?: string; category?: string }) => void
}

export default function GradewiseView({ classes, subjects, selectedGrade, paperStatusMap, getTrackItems, setSelectedGrade, onToggle, onUpdateSubject, onDelete, onMove, onMarkAllByType }: GradewiseViewProps) {
  const gradesToShow = selectedGrade ? classes.filter(c => c.id === selectedGrade) : classes

  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${!selectedGrade ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-blue-500/25' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
          onClick={() => setSelectedGrade(null)}
        >All Classes</button>
        {classes.map(c => (
          <button
            key={c.id}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${selectedGrade === c.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-blue-500/25' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
            onClick={() => setSelectedGrade(c.id)}
          >{c.label}</button>
        ))}
      </div>
      {gradesToShow.map(cls => {
        const clsSubjects = subjects.filter(s => s.class_id === cls.id)
        let received = 0
        clsSubjects.forEach(s => { const st = paperStatusMap[s.id]; if (st?.['qp']?.checked || st?.['bp']?.checked || st?.['ms']?.checked) received++ })
        const progress = clsSubjects.length ? Math.round((received / clsSubjects.length) * 100) : 0

        return (
          <div key={cls.id} className="mb-6">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                {cls.label}
              </h3>
              <div className="flex items-center gap-3">
                {selectedGrade && (
                  <MarkTypeButtons
                    label="Mark all"
                    onMark={(type) => onMarkAllByType(type, { classId: cls.id })}
                  />
                )}
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{received}/{clsSubjects.length} received</span>
                <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {clsSubjects.map(s => (
                <SubjectCard key={s.id} cls={cls} subject={s} allClasses={classes} paperStatusMap={paperStatusMap} getTrackItems={getTrackItems}
                  onToggle={onToggle} onUpdateSubject={onUpdateSubject} onDelete={onDelete} onMove={onMove} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
