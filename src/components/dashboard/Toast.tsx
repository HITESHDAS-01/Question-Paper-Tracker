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
    <div id="app-toast" key={toastKey} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg transition-all duration-300 opacity-0 translate-y-4 pointer-events-none
      [&.show]:opacity-100 [&.show]:translate-y-0 [&.show]:pointer-events-auto">
      {message}
    </div>
  )
}
