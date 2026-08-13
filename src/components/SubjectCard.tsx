'use client'

import type { Subject, Class } from '@/lib/types'
import { WORKFLOW_ITEMS, ITEM_LABELS, CATEGORIES } from '@/lib/types'

interface Props {
  subject: Subject
  classItem: Class
  trackItems: string[]
  status: Record<string, { checked: boolean; received_date: string | null }>
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateDate: (subjectId: string, itemType: string, date: string) => void
  onUpdateSubject: (subjectId: string, updates: Partial<Subject>) => void
  onDelete: (subjectId: string, name: string) => void
  getUrgencyInfo: (examDate: string) => { cls: string; label: string }
}

export default function SubjectCard({
  subject,
  classItem,
  trackItems,
  status,
  onToggle,
  onUpdateDate,
  onUpdateSubject,
  onDelete,
  getUrgencyInfo,
}: Props) {
  const totalDone = trackItems.reduce((sum, item) => sum + (status[item]?.checked ? 1 : 0), 0)
  const maxItems = trackItems.length

  let overall: 'complete' | 'partial' | 'pending' = 'pending'
  if (totalDone === maxItems && maxItems > 0) overall = 'complete'
  else if (totalDone > 0) overall = 'partial'

  const urgencyInfo = subject.exam_date && overall !== 'complete' ? getUrgencyInfo(subject.exam_date) : null

  const stampLabel = overall === 'complete' ? '✓' : `${totalDone}/${maxItems}`

  const borderClass = overall === 'complete' ? 'subject-card-complete'
    : overall === 'partial' ? 'subject-card-partial'
    : urgencyInfo?.cls === 'overdue' ? 'subject-card-overdue'
    : urgencyInfo?.cls === 'urgent' ? 'subject-card-urgent'
    : 'subject-card-pending'

  const stampClass = overall === 'complete' ? 'stamp-complete'
    : overall === 'partial' ? 'stamp-partial'
    : 'stamp-pending'

  return (
    <div
      className={`relative p-3 pb-2 rounded-sm ${borderClass}`}
      style={{
        backgroundColor: 'var(--panel)',
        border: '1px solid var(--rule-strong)',
      }}
    >
      {/* Urgency badge */}
      {urgencyInfo?.label && (
        <div
          className="absolute -top-2.5 right-2.5 text-[0.6em] font-mono font-bold px-2 py-0.5 rounded-full text-white shadow-md"
          style={{ backgroundColor: urgencyInfo.cls === 'overdue' ? 'var(--red)' : 'var(--gold)' }}
          dangerouslySetInnerHTML={{ __html: urgencyInfo.label }}
        />
      )}

      {/* Header */}
      <div className="flex items-start gap-1.5 mb-1.5">
        <input
          type="text"
          defaultValue={subject.name}
          onBlur={(e) => {
            if (e.target.value !== subject.name) {
              onUpdateSubject(subject.id, { name: e.target.value })
            }
          }}
          className="flex-1 min-w-0 bg-transparent border-b border-dashed text-sm font-bold"
          style={{ color: 'var(--ink)', borderColor: 'var(--rule-strong)' }}
        />
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[0.68em] font-mono font-bold border-2 ${stampClass}`}
          title={overall}
        >
          <span dangerouslySetInnerHTML={{ __html: stampLabel }} />
        </div>
      </div>

      {/* Meta tags */}
      <div className="flex gap-1 mb-2 flex-wrap items-center">
        <span className="text-[0.65em] px-1.5 py-0.5 rounded font-mono" style={{ border: '1px solid var(--royal)', color: 'var(--royal)' }}>
          CLASS {classItem.label}
        </span>
        <select
          defaultValue={subject.category}
          onChange={(e) => onUpdateSubject(subject.id, { category: e.target.value })}
          className="text-[0.65em] px-1 py-0.5 rounded cursor-pointer"
          style={{ backgroundColor: 'var(--royal-soft)', border: '1px solid var(--rule)', color: 'var(--royal)' }}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="date"
          defaultValue={subject.exam_date || ''}
          onChange={(e) => onUpdateSubject(subject.id, { exam_date: e.target.value || null })}
          className="text-[0.65em] px-1 py-0.5 rounded cursor-pointer font-mono"
          style={{ backgroundColor: 'var(--green-soft)', border: '1px solid var(--rule)', color: 'var(--green)' }}
          title="Exam date"
        />
        <button
          onClick={() => onDelete(subject.id, subject.name)}
          className="w-[18px] h-[18px] rounded-full text-[0.9em] leading-none flex items-center justify-center ml-auto"
          style={{ border: '1px solid var(--red)', color: 'var(--red)', background: 'none' }}
          title="Delete"
        >
          ×
        </button>
      </div>

      {/* Contact */}
      <input
        type="text"
        defaultValue={subject.contact || ''}
        onBlur={(e) => onUpdateSubject(subject.id, { contact: e.target.value })}
        placeholder="Teacher / contact"
        className="w-full text-[0.72em] px-2 py-1 rounded mb-1.5"
        style={{
          backgroundColor: 'var(--panel-2)',
          border: '1px solid var(--rule)',
          color: 'var(--ink-soft)',
        }}
        title="Responsible teacher or contact"
      />

      {/* Checklist */}
      <div className="flex flex-col gap-0.5">
        {trackItems.filter(i => !(WORKFLOW_ITEMS as readonly string[]).includes(i)).map(item => (
          <CheckRow
            key={item}
            subjectId={subject.id}
            item={item}
            status={status}
            onToggle={onToggle}
            onUpdateDate={onUpdateDate}
          />
        ))}
        {trackItems.some(i => (WORKFLOW_ITEMS as readonly string[]).includes(i)) && (
          <div className="text-[0.6em] uppercase tracking-widest mt-1.5 pt-1.5" style={{ color: 'var(--ink-faint)', borderTop: '1px dashed var(--rule)' }}>
            Print Workflow
          </div>
        )}
        {trackItems.filter(i => (WORKFLOW_ITEMS as readonly string[]).includes(i)).map(item => (
          <CheckRow
            key={item}
            subjectId={subject.id}
            item={item}
            status={status}
            onToggle={onToggle}
            onUpdateDate={onUpdateDate}
          />
        ))}
      </div>

      {/* Mini progress bar */}
      <div className="w-full h-[3px] rounded-full overflow-hidden mt-2" style={{ backgroundColor: 'var(--rule)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.round((totalDone / maxItems) * 100)}%`, backgroundColor: 'var(--green)' }}
        />
      </div>
    </div>
  )
}

function CheckRow({
  subjectId,
  item,
  status,
  onToggle,
  onUpdateDate,
}: {
  subjectId: string
  item: string
  status: Record<string, { checked: boolean; received_date: string | null }>
  onToggle: (subjectId: string, itemType: string, checked: boolean) => void
  onUpdateDate: (subjectId: string, itemType: string, date: string) => void
}) {
  const checked = status[item]?.checked || false
  const dateVal = status[item]?.received_date || ''
  const uid = `${item}_${subjectId}`

  return (
    <div
      className="flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer"
      style={{ backgroundColor: checked ? 'var(--green-soft)' : 'var(--panel-2)' }}
    >
      <input
        type="checkbox"
        id={uid}
        checked={checked}
        onChange={(e) => onToggle(subjectId, item, e.target.checked)}
        className="w-3 h-3 cursor-pointer"
        style={{ accentColor: 'var(--green)' }}
      />
      <label htmlFor={uid} className="flex-1 text-[0.74em] cursor-pointer" style={{ color: 'var(--ink)' }}>
        {ITEM_LABELS[item] || item}
      </label>
      <input
        type="date"
        value={dateVal}
        onChange={(e) => onUpdateDate(subjectId, item, e.target.value)}
        className="text-[0.66em] font-mono w-20 text-right bg-transparent border-none"
        style={{ color: 'var(--ink-soft)' }}
        title="Received date"
      />
    </div>
  )
}
