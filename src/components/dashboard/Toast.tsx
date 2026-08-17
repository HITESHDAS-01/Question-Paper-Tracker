'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string | null
  toastKey: number
}

export default function Toast({ message, toastKey }: ToastProps) {
  useEffect(() => {
    if (message) {
      const el = document.getElementById('app-toast')
      if (el) el.classList.add('show')
      return () => { if (el) el.classList.remove('show') }
    }
  }, [message, toastKey])

  return (
    <div id="app-toast" key={toastKey} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-sm font-semibold shadow-xl shadow-slate-900/30 transition-all duration-300 opacity-0 translate-y-4 pointer-events-none border border-slate-700
      [&.show]:opacity-100 [&.show]:translate-y-0 [&.show]:pointer-events-auto">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse" />
        {message}
      </div>
    </div>
  )
}
