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
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  onMove: (fromClassId: string, subjectId: string, toClassId: string) => void
}

function getUrgencyInfo(examDate: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const exam = new Date(examDate + 'T00:00:00')
  const diffDays = Math.round((exam.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return { cls: 'border-l-red-500', badge: '⚠ Overdue', badgeBg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  if (diffDays === 0) return { cls: 'border-l-orange-500', badge: '⚠ Due Today', badgeBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' }
  if (diffDays <= 2) return { cls: 'border-l-amber-500', badge: `⚠ Due in ${diffDays}d`, badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
  return { cls: '', badge: '', badgeBg: '' }
}

export default function SubjectCard({ cls, subject, allClasses, paperStatusMap, getTrackItems, onToggle, onUpdateSubject, onDelete, onMove }: SubjectCardProps) {
  const status = paperStatusMap[subject.id] || {}
  const trackItems = getTrackItems(cls)
  const totalDone = trackItems.reduce((sum, item) => sum + (status[item]?.checked ? 1 : 0), 0)
  const maxItems = trackItems.length
  let overall: 'complete' | 'partial' | 'pending' = 'pending'
  if (totalDone === maxItems && maxItems > 0) overall = 'complete'
  else if (totalDone > 0) overall = 'partial'

  const examDate = subject.exam_date || ''
  let urgency = { cls: '', badge: '', badgeBg: '' }
  if (examDate && overall !== 'complete') urgency = getUrgencyInfo(examDate)

  const cardBg = overall === 'complete'
    ? 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/15 dark:to-green-900/15 border-emerald-300 dark:border-emerald-800'
    : overall === 'partial'
    ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/15 border-amber-300 dark:border-amber-800'
    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'

  const mainItems = trackItems.filter(i => !(WORKFLOW_ITEMS as readonly string[]).includes(i))
  const workflowItems = trackItems.filter(i => (WORKFLOW_ITEMS as readonly string[]).includes(i))

  return (
    <div className={`rounded-xl border-l-4 border p-4 transition-all duration-200 hover:shadow-lg shadow-sm ${cardBg} ${urgency.cls} group`}>
      {urgency.badge && (
        <div className={`text-xs font-bold mb-2 px-2 py-1 rounded-lg inline-block ${urgency.badgeBg}`}>{urgency.badge}</div>
      )}

      {/* Header: Subject name + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <input
          type="text"
          defaultValue={subject.name}
          title="Edit subject name"
          className="text-sm font-bold text-slate-800 dark:text-white bg-transparent border-none outline-none flex-1 min-w-0 focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1"
          onBlur={e => { if (e.target.value !== subject.name) onUpdateSubject(subject.id, { name: e.target.value }) }}
        />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm ${
          overall === 'complete' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
          : overall === 'partial' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`} title={overall}>
          {overall === 'complete' ? '✓' : `${totalDone}/${maxItems}`}
        </span>
      </div>

      {/* Meta: class, category, date, move, delete */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase tracking-wide">{cls.label}</span>
        <select
          className="text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-300"
          defaultValue={subject.category}
          onChange={e => onUpdateSubject(subject.id, { category: e.target.value })}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          className="text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-300"
          defaultValue={examDate}
          title="Exam date"
          onChange={e => onUpdateSubject(subject.id, { exam_date: e.target.value || null })}
        />
        <select
          className="text-[10px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-300"
          value=""
          onChange={e => { if (e.target.value) onMove(cls.id, subject.id, e.target.value) }}
          title="Move to grade"
        >
          <option value="">&#8599;</option>
          {allClasses.filter(c => c.id !== cls.id).map(c => <option key={c.id} value={c.id}>To {c.label}</option>)}
        </select>
        <button
          className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 text-sm transition-colors ml-auto opacity-0 group-hover:opacity-100"
          onClick={() => onDelete(subject.id, subject.name)}
          title="Delete"
        >×</button>
      </div>

      {/* Contact */}
      <div className="mb-3">
        <input
          type="text"
          className="text-xs w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
          defaultValue={subject.contact || ''}
          placeholder="Teacher / contact"
          title="Responsible teacher or contact"
          onBlur={e => onUpdateSubject(subject.id, { contact: e.target.value })}
        />
      </div>

      {/* Two-column checklist */}
      <div className="flex flex-col lg:flex-row gap-2">
        {mainItems.length > 0 && (
          <div className="lg:flex-1 min-w-0 space-y-0.5">
            {mainItems.map(item => (
              <label key={item} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${status[item]?.checked ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/30'}`}>
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  checked={!!status[item]?.checked}
                  onChange={e => onToggle(subject.id, item, e.target.checked)}
                />
                <span className="flex-1">{ITEM_LABELS[item] || item}</span>
              </label>
            ))}
          </div>
        )}

        {mainItems.length > 0 && workflowItems.length > 0 && (
          <div className="hidden lg:block w-px bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600" />
        )}

        {workflowItems.length > 0 && (
          <div className="lg:flex-1 min-w-0">
            <div className="text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-1 whitespace-nowrap flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Workflow
            </div>
            <div className="space-y-0.5">
              {workflowItems.map(item => (
                <label key={item} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${status[item]?.checked ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/30'}`}>
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
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
      <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            overall === 'complete' ? 'bg-gradient-to-r from-emerald-400 to-green-500'
            : overall === 'partial' ? 'bg-gradient-to-r from-amber-400 to-orange-500'
            : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500'
          }`}
          style={{ width: `${maxItems ? Math.round((totalDone / maxItems) * 100) : 0}%` }}
        />
      </div>
    </div>
  )
}
