'use client'

import { useState } from 'react'
import type { Class } from '@/lib/types'

interface Props {
  showNewTracker: boolean
  onCloseNewTracker: () => void
  onAddTracker: (name: string, subtitle: string, classLabels: string[], trackBpMs: boolean) => void
  showAddClass: boolean
  onCloseAddClass: () => void
  onAddClass: (label: string, trackBpMs: boolean) => void
  showAddSubject: boolean
  onCloseAddSubject: () => void
  onAddSubject: (classId: string, name: string, category: string, examDate: string, contact: string) => void
  classes: Class[]
  showAddDate: boolean
  onCloseAddDate: () => void
  onAddDate: (date: string) => void
}

const CATEGORIES = ['Language', 'Main Subject', 'Science', 'Commerce', 'Humanities', 'Mathematics', 'Technology', 'Elective', 'Skill']

export default function Modals({
  showNewTracker, onCloseNewTracker, onAddTracker,
  showAddClass, onCloseAddClass, onAddClass,
  showAddSubject, onCloseAddSubject, onAddSubject, classes,
  showAddDate, onCloseAddDate, onAddDate,
}: Props) {
  return (
    <>
      {showNewTracker && <NewTrackerModal onClose={onCloseNewTracker} onSubmit={onAddTracker} />}
      {showAddClass && <AddClassModal onClose={onCloseAddClass} onSubmit={onAddClass} />}
      {showAddSubject && <AddSubjectModal onClose={onCloseAddSubject} onSubmit={onAddSubject} classes={classes} />}
      {showAddDate && <AddDateModal onClose={onCloseAddDate} onSubmit={onAddDate} />}
    </>
  )
}

function NewTrackerModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (name: string, subtitle: string, classLabels: string[], trackBpMs: boolean) => void }) {
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [groups, setGroups] = useState('')
  const [trackBpMs, setTrackBpMs] = useState(true)

  const handleSubmit = () => {
    const labels = groups.split(',').map(s => s.trim()).filter(Boolean)
    if (!name) return alert('Please enter a tracker name')
    if (!labels.length) return alert('Please enter at least one class/group')
    onSubmit(name, subtitle, labels, trackBpMs)
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="font-display text-lg font-bold mb-4" style={{ color: 'var(--ink)' }}>Create new tracker</h2>
      <FormField label="Exam / tracker name">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Unit Test 1, Term II 2026-27" />
      </FormField>
      <FormField label="Subtitle (optional)">
        <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="e.g. Grade VI to X" />
      </FormField>
      <FormField label="Classes / groups (comma separated)">
        <input type="text" value={groups} onChange={e => setGroups(e.target.value)} placeholder="e.g. 6,7,8,9,10" />
      </FormField>
      <label className="flex items-start gap-2 text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
        <input type="checkbox" checked={trackBpMs} onChange={e => setTrackBpMs(e.target.checked)} className="mt-1" />
        Also track Blueprint &amp; Marking Scheme
      </label>
      <button onClick={handleSubmit} className="w-full py-2.5 rounded text-sm font-bold text-white" style={{ backgroundColor: 'var(--royal)' }}>
        Create tracker
      </button>
    </ModalOverlay>
  )
}

function AddClassModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (label: string, trackBpMs: boolean) => void }) {
  const [label, setLabel] = useState('')
  const [trackBpMs, setTrackBpMs] = useState(true)

  const handleSubmit = () => {
    if (!label.trim()) return alert('Please enter a class/group name')
    onSubmit(label.trim(), trackBpMs)
    setLabel('')
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="font-display text-lg font-bold mb-4" style={{ color: 'var(--ink)' }}>Add class / group</h2>
      <FormField label="Class / Group name">
        <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Grade 6" />
      </FormField>
      <label className="flex items-start gap-2 text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
        <input type="checkbox" checked={trackBpMs} onChange={e => setTrackBpMs(e.target.checked)} className="mt-1" />
        Also track Blueprint &amp; Marking Scheme
      </label>
      <button onClick={handleSubmit} className="w-full py-2.5 rounded text-sm font-bold text-white" style={{ backgroundColor: 'var(--royal)' }}>
        Add class / group
      </button>
    </ModalOverlay>
  )
}

function AddSubjectModal({ onClose, onSubmit, classes }: { onClose: () => void; onSubmit: (classId: string, name: string, category: string, examDate: string, contact: string) => void; classes: Class[] }) {
  const [classId, setClassId] = useState(classes[0]?.id || '')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Language')
  const [examDate, setExamDate] = useState('')
  const [contact, setContact] = useState('')

  const handleSubmit = () => {
    if (!classId) return alert('Please add a class first')
    if (!name.trim()) return alert('Please enter a subject name')
    onSubmit(classId, name.trim(), category, examDate, contact)
    setName('')
    setContact('')
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="font-display text-lg font-bold mb-4" style={{ color: 'var(--ink)' }}>Add subject</h2>
      <FormField label="Class / Group">
        <select value={classId} onChange={e => setClassId(e.target.value)}>
          {classes.length === 0 && <option value="">No class yet — add one first</option>}
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Subject name">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sanskrit" />
      </FormField>
      <FormField label="Category">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FormField>
      <FormField label="Exam date">
        <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
      </FormField>
      <FormField label="Teacher / contact (optional)">
        <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g. Mrs. Sharma" />
      </FormField>
      <button onClick={handleSubmit} className="w-full py-2.5 rounded text-sm font-bold text-white" style={{ backgroundColor: 'var(--royal)' }}>
        Add subject
      </button>
    </ModalOverlay>
  )
}

function AddDateModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (date: string) => void }) {
  const [date, setDate] = useState('')

  const handleSubmit = () => {
    if (!date) return alert('Please select a date')
    onSubmit(date)
    setDate('')
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="font-display text-lg font-bold mb-4" style={{ color: 'var(--ink)' }}>Add exam date</h2>
      <FormField label="Date">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </FormField>
      <button onClick={handleSubmit} className="w-full py-2.5 rounded text-sm font-bold text-white" style={{ backgroundColor: 'var(--royal)' }}>
        Add date
      </button>
    </ModalOverlay>
  )
}

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(32,42,60,.55)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded p-6 max-h-[88vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--ink)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--rule)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</label>
      <div className="w-full">{children}</div>
      <style jsx>{`
        div :global(input), div :global(select) {
          width: 100%;
          padding: 9px;
          background-color: var(--panel-2);
          border: 1px solid var(--rule-strong);
          border-radius: 3px;
          color: var(--ink);
          font-size: 0.92em;
          font-family: inherit;
        }
        div :global(input:focus), div :global(select:focus) {
          outline: none;
          border-color: var(--royal);
        }
      `}</style>
    </div>
  )
}
