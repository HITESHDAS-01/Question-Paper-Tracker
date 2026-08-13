'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('paperTrackerTheme') as 'light' | 'dark' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('paperTrackerTheme', next)
  }

  return (
    <button
      onClick={toggle}
      className="relative w-[52px] h-[26px] rounded-full cursor-pointer p-0 flex-none"
      style={{
        border: '1px solid var(--rule-strong)',
        background: 'linear-gradient(180deg, var(--panel-2), var(--panel))',
      }}
      title="Toggle dark mode"
      aria-label="Toggle dark mode"
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 text-xs"
        style={{ left: 6, color: theme === 'dark' ? 'var(--ink-faint)' : 'var(--gold)' }}
      >
        ☀
      </span>
      <span
        className="absolute top-1/2 -translate-y-1/2 text-xs"
        style={{ right: 6, color: theme === 'dark' ? 'var(--royal)' : 'var(--ink-faint)' }}
      >
        ☾
      </span>
      <span
        className="absolute top-[2px] w-5 h-5 rounded-full transition-transform duration-300"
        style={{
          left: theme === 'dark' ? 28 : 2,
          background: theme === 'dark' ? 'linear-gradient(135deg, var(--royal), #3a6da8)' : 'linear-gradient(135deg, var(--gold), #c99a2e)',
          boxShadow: '0 2px 5px rgba(0,0,0,.3)',
          transform: theme === 'dark' ? 'translateX(0)' : 'translateX(0)',
        }}
      />
    </button>
  )
}
