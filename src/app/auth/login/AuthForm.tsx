'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'admin' },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      setSuccess('Account created! Check your email for confirmation link, then login.')
      setLoading(false)
      return
    }

    // If auto-confirmed, try to create user profile and redirect
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        school_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: data.user.email || email,
        role: 'admin',
      })
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--paper)' }}>
      {/* Left side — Info */}
      <div
        className="hidden lg:flex flex-col justify-center px-16 w-[55%]"
        style={{ backgroundColor: 'var(--royal-soft)' }}
      >
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg font-mono"
              style={{ backgroundColor: 'var(--royal)' }}
            >
              QP
            </div>
            <span className="font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>
              Paper Tracker
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold mb-4 leading-tight" style={{ color: 'var(--ink)' }}>
            Never miss a<br />question paper again.
          </h1>
          <p className="text-base mb-10 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            Track question papers, blueprints, marking schemes, and print workflow
            across every class and subject — all in one place.
          </p>

          <div className="space-y-5">
            {[
              { icon: '✓', title: 'Multi-view Dashboard', desc: 'Date-wise, Grade-wise, Subject-wise, or Pending Only — switch views instantly' },
              { icon: '✓', title: 'Print Workflow Tracking', desc: 'Track Edited → Proofread → Corrected → Final Print for every paper' },
              { icon: '✓', title: 'Urgency Alerts', desc: 'Auto-detects overdue and due-today papers with visual badges' },
              { icon: '✓', title: 'Multi-tracker Profiles', desc: 'Separate trackers for Half Yearly, Term II, Annual Exam — all in one place' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                  style={{ backgroundColor: 'var(--green)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{item.title}</div>
                  <div className="text-xs" style={{ color: 'var(--ink-soft)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--rule)' }}>
            <p className="text-xs italic" style={{ color: 'var(--ink-faint)' }}>
              Built for Royal Global School, Guwahati
            </p>
          </div>
        </div>
      </div>

      {/* Right side — Auth Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm font-mono"
              style={{ backgroundColor: 'var(--royal)' }}
            >
              QP
            </div>
            <span className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>
              Paper Tracker
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)' }}>
            {mode === 'login'
              ? 'Sign in to manage your paper tracker'
              : 'Sign up to start tracking question papers'}
          </p>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--ink-soft)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--panel-2)',
                  border: '1px solid var(--rule-strong)',
                  color: 'var(--ink)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--royal)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--rule-strong)')}
                placeholder="admin@royalglobal.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--ink-soft)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--panel-2)',
                  border: '1px solid var(--rule-strong)',
                  color: 'var(--ink)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--royal)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--rule-strong)')}
                placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--red-soft)', color: 'var(--red)' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--green-soft)', color: 'var(--green)' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-white transition-all"
              style={{
                backgroundColor: loading ? 'var(--ink-faint)' : 'var(--royal)',
              }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError('')
                setSuccess('')
              }}
              className="text-sm font-medium"
              style={{ color: 'var(--royal)' }}
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>

          <p className="text-center text-xs mt-10" style={{ color: 'var(--ink-faint)' }}>
            Developed by <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Pranjit</span>
          </p>
        </div>
      </div>
    </div>
  )
}
