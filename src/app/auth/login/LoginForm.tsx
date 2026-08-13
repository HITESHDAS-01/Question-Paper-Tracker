'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--paper)' }}>
      <div className="w-full max-w-md p-8 rounded" style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--rule-strong)' }}>
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
            Question Paper Tracker
          </h1>
          <p className="text-sm italic" style={{ color: 'var(--ink-soft)' }}>
            Royal Global School, Guwahati
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--ink-faint)' }}>
            Session 2026-27
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: 'var(--panel-2)',
                border: '1px solid var(--rule-strong)',
                color: 'var(--ink)',
              }}
              placeholder="admin@royalglobal.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded text-sm"
              style={{
                backgroundColor: 'var(--panel-2)',
                border: '1px solid var(--rule-strong)',
                color: 'var(--ink)',
              }}
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded" style={{ backgroundColor: 'var(--red-soft)', color: 'var(--red)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded text-sm font-bold text-white transition-colors"
            style={{
              backgroundColor: loading ? 'var(--ink-faint)' : 'var(--royal)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--ink-faint)' }}>
          Developed by <span style={{ color: 'var(--gold)' }}>Pranjit</span>
        </p>
      </div>
    </div>
  )
}
