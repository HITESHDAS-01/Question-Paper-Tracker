'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (date: string) => void
  onClose: () => void
}

export default function AddDateModal({ onSubmit, onClose }: Props) {
  const [date, setDate] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add exam date</h2>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl" onClick={onClose}>×</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => { if (!date) { alert('Select a date'); return } if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { alert('Invalid date format'); return } onSubmit(date); setDate('') }}
          >Add date</button>
        </div>
      </div>
    </div>
  )
}
