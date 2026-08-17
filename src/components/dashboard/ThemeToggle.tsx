'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('paperTrackerTheme') || 'light'
    setDark(saved === 'dark')
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    setDark(!dark)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('paperTrackerTheme', next)
  }

  return (
    <button
      onClick={toggle}
      className="relative w-14 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 dark:from-indigo-600 dark:to-purple-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-inner"
      title="Toggle dark mode"
      aria-label="Toggle dark mode"
    >
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-200 shadow-md flex items-center justify-center text-xs transition-transform duration-300 ${dark ? 'translate-x-7' : ''}`}>
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
