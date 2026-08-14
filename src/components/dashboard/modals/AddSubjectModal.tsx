'use client'

import { useState } from 'react'
import type { ClassRow } from '@/lib/types'
import { CATEGORIES } from '@/lib/types'

interface Props {
  classes: ClassRow[]
  onSubmit: (classId: string, name: string, cat: string, date: string, contact: string) => void
  onClose: () => void
}

export default function AddSubjectModal({ classes, onSubmit, onClose }: Props) {
  const [classId, setClassId] = useState(classes[0]?.id || '')
  const [name, setName] = useState('')
  const [cat, setCat] = useState('Language')
  const [date, setDate] = useState('')
  const [contact, setContact] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add subject</h2>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl" onClick={onClose}>×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Class / Group</label>
            <select value={classId} onChange={e => setClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              {classes.length ? classes.map(c => <option key={c.id} value={c.id}>{c.label}</option>) : <option value="">No class yet</option>}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sanskrit"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category</label>
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Exam date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Teacher / contact (optional)</label>
            <input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g. Mrs. Sharma, 98xxxxxxx"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => { if (!classId) { alert('Add a class first'); return } if (!name.trim()) { alert('Enter subject name'); return } onSubmit(classId, name.trim(), cat, date, contact); setName(''); setContact('') }}
          >Add subject</button>
        </div>
      </div>
    </div>
  )
}
