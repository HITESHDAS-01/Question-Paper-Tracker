'use client'

import { useState } from 'react'
import type { ClassRow, Subject, ExamDate, PaperStatusMap } from '@/lib/types'
import SubjectCard from '../SubjectCard'

interface PendingViewProps {
  classes: ClassRow[]
  subjects: Subject[]
  examDates: ExamDate[]
  paperStatusMap: PaperStatusMap
  getTrackItems: (cls: ClassRow) => string[]
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
}

const ITEM_TYPE_FILTERS = [
  { key: 'qp', label: 'QP', color: 'from-blue-500 to-indigo-500' },
  { key: 'bp', label: 'BP', color: 'from-purple-500 to-pink-500' },
  { key: 'ms', label: 'MS', color: 'from-amber-500 to-orange-500' },
] as const

export default function PendingView({ classes, subjects, examDates, paperStatusMap, getTrackItems, onToggle, onUpdateSubject, onDelete, onMove }: PendingViewProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const pendingItems: { cls: ClassRow; subject: Subject }[] = []
  classes.forEach(cls => {
    if (selectedGrade && cls.id !== selectedGrade) return
    const trackItems = getTrackItems(cls)
    subjects.filter(s => s.class_id === cls.id).forEach(s => {
      const status = paperStatusMap[s.id]
      const doneCount = trackItems.reduce((sum, item) => sum + (status?.[item]?.checked ? 1 : 0), 0)
      if (doneCount < trackItems.length) {
        if (selectedTypes.length > 0) {
          const hasPendingType = selectedTypes.some(type => trackItems.includes(type) && !status?.[type]?.checked)
          if (hasPendingType) pendingItems.push({ cls, subject: s })
        } else {
          pendingItems.push({ cls, subject: s })
        }
      }
    })
  })

  if (!pendingItems.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">All papers received. Nothing pending!</p>
      </div>
    )
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
      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending for:</span>
          {ITEM_TYPE_FILTERS.map(f => (
            <button
              key={f.key}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${selectedTypes.includes(f.key) ? `bg-gradient-to-r ${f.color} border-transparent text-white shadow-md` : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
              onClick={() => toggleType(f.key)}
            >{f.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${!selectedGrade ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-blue-500/25' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
            onClick={() => setSelectedGrade(null)}
          >All Grades</button>
          {classes.map(c => (
            <button
              key={c.id}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${selectedGrade === c.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md shadow-blue-500/25' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
              onClick={() => setSelectedGrade(c.id)}
            >{c.label}</button>
          ))}
        </div>
      </div>

      <div className="mb-3 text-xs text-slate-600 dark:text-slate-400">
        <strong>{pendingItems.length}</strong> paper{pendingItems.length === 1 ? '' : 's'} still pending · sorted by nearest exam date
      </div>
      {Object.entries(byDate).sort(([a], [b]) => a === 'No date set' ? 1 : b === 'No date set' ? -1 : a.localeCompare(b)).map(([date, items]) => {
        const dateInfo = examDates.find(d => d.date === date)
        return (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                {date === 'No date set' ? 'No Exam Date Set' : `${formatDate(date)}${dateInfo ? ' · ' + dateInfo.day : ''}`}
              </h3>
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
