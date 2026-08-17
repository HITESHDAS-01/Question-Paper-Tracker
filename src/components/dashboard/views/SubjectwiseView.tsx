'use client'

import type { ClassRow, Subject, PaperStatusMap } from '@/lib/types'
import SubjectCard from '../SubjectCard'
import MarkTypeButtons from '../MarkTypeButtons'

function normalizeSubjectName(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('english')) return 'English'
  if (n.includes('hindi')) return 'Hindi'
  if (n.includes('assamese')) return 'Assamese'
  if (n.includes('french')) return 'French'
  if (n.includes('sanskrit')) return 'Sanskrit'
  if (n.includes('social')) return 'Social Science'
  if (n.includes('computer science')) return 'Computer Science'
  if (n.includes('political science')) return 'Political Science'
  if (n === 'science') return 'Science'
  if (n.includes('math')) return 'Mathematics'
  if (n.includes('g.k') || n.includes('general knowledge')) return 'General Knowledge'
  if (n.includes('a.i') || n.includes('artificial intelligence')) return 'A.I.'
  if (n.includes('i.t') || n.includes('it ')) return 'I.T.'
  if (n.includes('computer')) return 'Computer'
  if (n.includes('paint')) return 'Painting'
  return name
}

function getGradeNum(label: string): number | null {
  const romanMap: Record<string, number> = { 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12 }
  const m = label.match(/(III|IV|V|VI|VII|VIII|IX|X|XI|XII|\d+)/i)
  if (!m) return null
  const up = m[1].toUpperCase()
  if (romanMap[up] !== undefined) return romanMap[up]
  const n = parseInt(up)
  return isNaN(n) ? null : n
}

interface SubjectwiseViewProps {
  classes: ClassRow[]
  subjects: Subject[]
  selectedSubjectCategory: string | null
  paperStatusMap: PaperStatusMap
  getTrackItems: (cls: ClassRow) => string[]
  setSelectedSubjectCategory: (c: string | null) => void
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
  onMarkAllByType: (itemType: string, options?: { date?: string; classId?: string; category?: string }) => void
}

export default function SubjectwiseView({ classes, subjects, selectedSubjectCategory, paperStatusMap, getTrackItems, setSelectedSubjectCategory, onToggle, onUpdateSubject, onDelete, onMove, onMarkAllByType }: SubjectwiseViewProps) {
  const filteredClasses = classes.filter(cls => { const g = getGradeNum(cls.label); return g !== null && g >= 6 })

  const bySubject: Record<string, { cls: ClassRow; subject: Subject }[]> = {}
  filteredClasses.forEach(cls => {
    subjects.filter(s => s.class_id === cls.id).forEach(s => {
      const key = normalizeSubjectName(s.name)
      ;(bySubject[key] = bySubject[key] || []).push({ cls, subject: s })
    })
  })
  const subjectNames = Object.keys(bySubject).sort()

  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${!selectedSubjectCategory ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-blue-500/25' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
          onClick={() => setSelectedSubjectCategory(null)}
        >All Subjects</button>
        {subjectNames.map(c => (
          <button
            key={c}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${selectedSubjectCategory === c ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-blue-500/25' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
            onClick={() => setSelectedSubjectCategory(c)}
          >{c}</button>
        ))}
      </div>
      {subjectNames.map(category => {
        if (selectedSubjectCategory && category !== selectedSubjectCategory) return null
        const items = bySubject[category]
        return (
          <div key={category} className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                {category}
              </h3>
              {selectedSubjectCategory && (
                <MarkTypeButtons
                  label="Mark all"
                  onMark={(type) => onMarkAllByType(type, { category })}
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map(({ cls, subject }) => (
                <SubjectCard key={subject.id} cls={cls} subject={subject} allClasses={classes} paperStatusMap={paperStatusMap} getTrackItems={getTrackItems}
                  onToggle={onToggle} onUpdateSubject={onUpdateSubject} onDelete={onDelete} onMove={onMove} />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
