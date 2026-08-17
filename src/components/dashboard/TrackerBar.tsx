'use client'

import { useState, useRef, useEffect } from 'react'
import type { Tracker } from '@/lib/types'

interface TrackerBarProps {
  trackers: Tracker[]
  activeTrackerId: string | null
  onSelect: (trackerId: string) => void
  onRename: (trackerId: string, name: string) => void
  onNew: () => void
  onLogout: () => void
  userEmail: string
}

export default function TrackerBar({ trackers, activeTrackerId, onSelect, onRename, onNew, onLogout, userEmail }: TrackerBarProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : 'U'

  return (
    <div className="flex gap-1.5 sm:gap-2 items-center flex-wrap mb-3 pb-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
      {trackers.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          onDoubleClick={() => { const n = prompt('Rename tracker:', t.name); if (n?.trim()) onRename(t.id, n.trim()) }}
          className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
            activeTrackerId === t.id
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 scale-[1.02]'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
          }`}
          title="Double-click to rename"
        >
          {t.name}
        </button>
      ))}
      <button
        onClick={onNew}
        className="text-xs font-semibold px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-200 whitespace-nowrap"
      >+ New Tracker</button>
      <div className="flex-1" />

      {/* User profile dropdown */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-blue-500/25">
            {initials}
          </span>
          <span className="hidden sm:inline text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[140px] truncate">{userEmail}</span>
          <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {profileOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-40 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-md shadow-blue-500/25">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-white truncate">{userEmail}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Signed in</div>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <button
                  className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => { setProfileOpen(false); onLogout() }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Sign out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
