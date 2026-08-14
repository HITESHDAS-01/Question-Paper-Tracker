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
    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800'
    : overall === 'partial'
    ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'
    : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'

  const mainItems = trackItems.filter(i => !(WORKFLOW_ITEMS as readonly string[]).includes(i))
  const workflowItems = trackItems.filter(i => (WORKFLOW_ITEMS as readonly string[]).includes(i))

  return (
    <div className={`rounded-xl border p-4 transition-all duration-150 hover:shadow-md shadow-sm ${cardBg} ${urgency.cls}`}>
      {urgency.badge && (
        <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">{urgency.badge}</div>
      )}

      {/* Header: Subject name + status */}
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
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
        }`} title={overall}>
          {overall === 'complete' ? '✓' : `${totalDone}/${maxItems}`}
        </span>
      </div>

      {/* Meta: class, category, date, move, delete */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 uppercase tracking-wide">{cls.label}</span>
        <select
          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
          defaultValue={subject.category}
          onChange={e => onUpdateSubject(subject.id, { category: e.target.value })}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
          defaultValue={examDate}
          title="Exam date"
          onChange={e => onUpdateSubject(subject.id, { exam_date: e.target.value || null })}
        />
        <select
          className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none"
          value=""
          onChange={e => { if (e.target.value) onMove(cls.id, subject.id, e.target.value) }}
          title="Move to grade"
        >
          <option value="">&#8599;</option>
          {allClasses.filter(c => c.id !== cls.id).map(c => <option key={c.id} value={c.id}>To {c.label}</option>)}
        </select>
        <button
          className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 text-sm transition-colors ml-auto"
          onClick={() => onDelete(subject.id, subject.name)}
          title="Delete"
        >×</button>
      </div>

      {/* Contact */}
      <div className="mb-3">
        <input
          type="text"
          className="text-xs w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-300"
          defaultValue={subject.contact || ''}
          placeholder="Teacher / contact"
          title="Responsible teacher or contact"
          onBlur={e => onUpdateSubject(subject.id, { contact: e.target.value })}
        />
      </div>

      {/* Two-column checklist */}
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Left: Main items (QP, BP, MS) */}
        {mainItems.length > 0 && (
          <div className="lg:flex-1 min-w-0 space-y-0.5">
            {mainItems.map(item => (
              <label key={item} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors ${status[item]?.checked ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={!!status[item]?.checked}
                  onChange={e => onToggle(subject.id, item, e.target.checked)}
                />
                <span className="flex-1 whitespace-nowrap">{ITEM_LABELS[item] || item}</span>
                <input
                  type="date"
                  className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none shrink-0 w-[110px]"
                  value={status[item]?.received_date || ''}
                  onChange={e => onUpdateDate(subject.id, item, e.target.value)}
                  title="Received date"
                />
              </label>
            ))}
          </div>
        )}

        {/* Divider on desktop when both columns exist */}
        {mainItems.length > 0 && workflowItems.length > 0 && (
          <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700" />
        )}

        {/* Right: Print Workflow — compact, no date inputs */}
        {workflowItems.length > 0 && (
          <div className="lg:flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">Print Workflow</div>
            <div className="space-y-0.5">
              {workflowItems.map(item => (
                <label key={item} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition-colors ${status[item]?.checked ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={!!status[item]?.checked}
                    onChange={e => onToggle(subject.id, item, e.target.checked)}
                  />
                  <span className="flex-1">{ITEM_LABELS[item] || item}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${maxItems ? Math.round((totalDone / maxItems) * 100) : 0}%` }} />
      </div>
    </div>
  )
}
