'use client'

import type { ClassRow, Subject, PaperStatusMap } from '@/lib/types'
import { WORKFLOW_ITEMS, ITEM_LABELS, CATEGORIES } from '@/lib/types'

interface SubjectCardProps {
  cls: ClassRow
  subject: Subject
  allClasses: ClassRow[]
  paperStatusMap: PaperStatusMap
  getTrackItems: (cls: ClassRow) => string[]
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateDate: (subjectId: string, itemType: string, date: string) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
}

function getUrgencyInfo(examDate: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exam = new Date(examDate + 'T00:00:00')
  const diffDays = Math.round((exam.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return { cls: 'border-l-4 border-l-red-400', badge: '⚠ Overdue' }
  if (diffDays === 0) return { cls: 'border-l-4 border-l-orange-400', badge: '⚠ Due Today' }
  if (diffDays <= 2) return { cls: 'border-l-4 border-l-amber-400', badge: `⚠ Due in ${diffDays}d` }
  return { cls: '', badge: '' }
}

export default function SubjectCard({ cls, subject, allClasses, paperStatusMap, getTrackItems, onToggle, onUpdateDate, onUpdateSubject, onDelete, onMove }: SubjectCardProps) {
  const status = paperStatusMap[subject.id] || {}
  const trackItems = getTrackItems(cls)
  const totalDone = trackItems.reduce((sum, item) => sum + (status[item]?.checked ? 1 : 0), 0)
  const maxItems = trackItems.length
  let overall: 'complete' | 'partial' | 'pending' = 'pending'
  if (totalDone === maxItems && maxItems > 0) overall = 'complete'
  else if (totalDone > 0) overall = 'partial'

  const examDate = subject.exam_date || ''
  let urgency = { cls: '', badge: '' }
  if (examDate && overall !== 'complete') urgency = getUrgencyInfo(examDate)

  const cardBg = overall === 'complete'
    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
    : overall === 'partial'
    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'

  return (
    <div className={`rounded-xl border p-4 transition-all duration-150 hover:shadow-md ${cardBg} ${urgency.cls}`}>
      {urgency.badge && (
        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">{urgency.badge}</div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <input
          type="text"
          defaultValue={subject.name}
          title="Edit subject name"
          className="text-sm font-semibold text-slate-800 dark:text-white bg-transparent border-none outline-none flex-1 min-w-0 focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1"
          onBlur={e => { if (e.target.value !== subject.name) onUpdateSubject(subject.id, { name: e.target.value }) }}
        />
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
          overall === 'complete' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
          : overall === 'partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
        }`} title={overall}>
          {overall === 'complete' ? '✓' : `${totalDone}/${maxItems}`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">CLASS {cls.label}</span>
        <select
          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
          defaultValue={subject.category}
          onChange={e => onUpdateSubject(subject.id, { category: e.target.value })}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
          defaultValue={examDate}
          title="Exam date"
          onChange={e => onUpdateSubject(subject.id, { exam_date: e.target.value || null })}
        />
        <select
          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
          value=""
          onChange={e => { if (e.target.value) onMove(cls.id, subject.id, e.target.value) }}
          title="Move to grade"
        >
          <option value="">&#8599;</option>
          {allClasses.filter(c => c.id !== cls.id).map(c => <option key={c.id} value={c.id}>To {c.label}</option>)}
        </select>
        <button
          className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 text-sm transition-colors ml-auto"
          onClick={() => onDelete(subject.id, subject.name)}
          title="Delete"
        >×</button>
      </div>

      <div className="mb-2">
        <input
          type="text"
          className="text-xs w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-500"
          defaultValue={subject.contact || ''}
          placeholder="Teacher / contact"
          title="Responsible teacher or contact"
          onBlur={e => onUpdateSubject(subject.id, { contact: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        {trackItems.filter(i => !(WORKFLOW_ITEMS as readonly string[]).includes(i)).map(item => (
          <label key={item} className={`flex items-center gap-2 text-xs px-2 py-1 rounded transition-colors ${status[item]?.checked ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
            <input
              type="checkbox"
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={!!status[item]?.checked}
              onChange={e => onToggle(subject.id, item, e.target.checked)}
            />
            <span className="flex-1">{ITEM_LABELS[item] || item}</span>
            <input
              type="date"
              className="text-[10px] px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none w-24"
              value={status[item]?.received_date || ''}
              onChange={e => onUpdateDate(subject.id, item, e.target.value)}
              title="Received date"
            />
          </label>
        ))}
        {trackItems.some(i => (WORKFLOW_ITEMS as readonly string[]).includes(i)) && (
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider pt-1 border-t border-slate-100 dark:border-slate-700 mt-1">Print Workflow</div>
        )}
        {trackItems.filter(i => (WORKFLOW_ITEMS as readonly string[]).includes(i)).map(item => (
          <label key={item} className={`flex items-center gap-2 text-xs px-2 py-1 rounded transition-colors ${status[item]?.checked ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
            <input
              type="checkbox"
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={!!status[item]?.checked}
              onChange={e => onToggle(subject.id, item, e.target.checked)}
            />
            <span className="flex-1">{ITEM_LABELS[item] || item}</span>
            <input
              type="date"
              className="text-[10px] px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none w-24"
              value={status[item]?.received_date || ''}
              onChange={e => onUpdateDate(subject.id, item, e.target.value)}
              title="Received date"
            />
          </label>
        ))}
      </div>

      <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${maxItems ? Math.round((totalDone / maxItems) * 100) : 0}%` }} />
      </div>
    </div>
  )
}
