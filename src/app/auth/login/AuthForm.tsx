'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { School } from '@/lib/types'

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (mode === 'signup') {
      supabase.from('schools').select('*').order('name').then(({ data }: { data: School[] | null }) => {
        if (data) setSchools(data)
      })
    }
  }, [supabase, mode])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }

    // Check user profile exists
    if (data.user) {
      const { data: profile } = await supabase
        .from('users').select('school_id').eq('id', data.user.id).single()

      if (!profile) {
        await supabase.auth.signOut()
        setError('Account not found. Please sign up first.')
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!schoolId) { setError('Please select your school.'); setLoading(false); return }

    const { data, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { role: 'admin', school_id: schoolId } },
    })
    if (authError) { setError(authError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        school_id: schoolId,
        email: data.user.email || email,
        role: 'admin',
      })
    }

    if (data.user && !data.session) {
      setSuccess('Account created! Check your email for confirmation link, then login.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight">Paper Tracker</div>
              <div className="text-blue-200/70 text-[11px] tracking-wide uppercase">Multi-school Platform</div>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-5">
            Never miss a<br />question paper again.
          </h1>
          <p className="text-blue-100/80 text-base leading-relaxed max-w-md">
            Track question papers, blueprints, marking schemes, and print workflow
            across every class and subject — all in one place.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '📊', title: 'Multi-view Dashboard', desc: 'Date-wise, Grade-wise, Subject-wise, or Pending Only' },
            { icon: '🖨', title: 'Print Workflow Tracking', desc: 'Edited → Proofread → Corrected → Final Print' },
            { icon: '⚡', title: 'Urgency Alerts', desc: 'Auto-detects overdue and due-today papers' },
            { icon: '🏫', title: 'Multi-school Support', desc: 'Each school gets its own isolated workspace' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center text-sm flex-shrink-0 group-hover:bg-white/20 transition-colors">
                {item.icon}
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{item.title}</div>
                <div className="text-blue-200/70 text-xs">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10">
          <p className="text-blue-200/50 text-xs">Question Paper Tracker — Multi-school Platform</p>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Paper Tracker</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wide">Multi-school Platform</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? 'Sign in to manage your paper tracker' : 'Select your school and create an account'}
            </p>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {/* School selector — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">School</label>
                <select
                  value={schoolId}
                  onChange={e => setSchoolId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Select your school</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="admin@yourschool.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-600 dark:text-emerald-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Please wait...
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); setSchoolId('') }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {mode === 'login' ? (
                <>Don&apos;t have an account? <span className="font-semibold text-blue-600 dark:text-blue-400">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-semibold text-blue-600 dark:text-blue-400">Sign in</span></>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-12">
            Developed by <span className="font-semibold text-slate-600 dark:text-slate-300">Pranjit</span>
          </p>
        </div>
      </div>
    </div>
  )
}
