'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (label: string, bpMs: boolean) => void
  onClose: () => void
}

export default function AddClassModal({ onSubmit, onClose }: Props) {
  const [label, setLabel] = useState('')
  const [bpMs, setBpMs] = useState(true)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add class / group</h2>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl" onClick={onClose}>×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Class / Group name</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Grade 6, Semester 1, Section A"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <input type="checkbox" checked={bpMs} onChange={e => setBpMs(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            Also track Blueprint &amp; Marking Scheme
          </label>
          <button
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => { if (!label.trim()) { alert('Enter class name'); return } onSubmit(label.trim(), bpMs); setLabel('') }}
          >Add class / group</button>
        </div>
      </div>
    </div>
  )
}
