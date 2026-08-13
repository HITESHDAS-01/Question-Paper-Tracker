/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { School, Tracker, Class, ExamDate, Subject, PaperStatus } from '@/lib/types'
import { WORKFLOW_ITEMS, DEFAULT_TRACK_ITEMS_GRADE_6PLUS, DEFAULT_TRACK_ITEMS_BELOW_6 } from '@/lib/types'
import TrackerBar from '@/components/TrackerBar'
import StatsGrid from '@/components/StatsGrid'
import DateList from '@/components/DateList'
import SubjectCard from '@/components/SubjectCard'
import Modals from '@/components/Modals'
import ThemeToggle from '@/components/ThemeToggle'

import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  userProfile: { id: string; school_id: string; email: string; role: string }
  school: School | null
  initialTrackers: Tracker[]
}

type ViewMode = 'datewise' | 'gradewise' | 'subjectwise' | 'pending'

export default function DashboardClient({ user, userProfile, school, initialTrackers }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [trackers, setTrackers] = useState<Tracker[]>(initialTrackers)
  const [activeTrackerId, setActiveTrackerId] = useState<string | null>(
    initialTrackers[0]?.id || null
  )
  const [classes, setClasses] = useState<Class[]>([])
  const [examDates, setExamDates] = useState<ExamDate[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [paperStatuses, setPaperStatuses] = useState<PaperStatus[]>([])

  const [currentView, setCurrentView] = useState<ViewMode>('datewise')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  // Modal states
  const [showNewTracker, setShowNewTracker] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showAddDate, setShowAddDate] = useState(false)

  const [toast, setToast] = useState<string | null>(null)

  // ============================================================
  // Data fetching
  // ============================================================
  const fetchTrackerData = useCallback(async (trackerId: string) => {
    setLoading(true)

    const [classesRes, datesRes, subjectsRes, statusRes] = await Promise.all([
      supabase.from('classes').select('*').eq('tracker_id', trackerId).order('sort_order'),
      supabase.from('exam_dates').select('*').eq('tracker_id', trackerId).order('date'),
      supabase.from('subjects').select('*').in(
        'class_id',
        (await supabase.from('classes').select('id').eq('tracker_id', trackerId)).data?.map(c => c.id) || []
      ).order('sort_order'),
      supabase.from('paper_status').select('*').in(
        'subject_id',
        (await supabase.from('subjects').select('id').in(
          'class_id',
          (await supabase.from('classes').select('id').eq('tracker_id', trackerId)).data?.map(c => c.id) || []
        )).data?.map(s => s.id) || []
      ),
    ])

    setClasses(classesRes.data || [])
    setExamDates(datesRes.data || [])
    setSubjects(subjectsRes.data || [])
    setPaperStatuses(statusRes.data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (activeTrackerId) {
      fetchTrackerData(activeTrackerId)
    }
  }, [activeTrackerId, fetchTrackerData])

  // ============================================================
  // Helper functions
  // ============================================================
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  const getTrackItems = (classItem: Class): string[] => {
    if (classItem.track_items?.length) return classItem.track_items
    const gradeNum = parseInt(classItem.label)
    if (!isNaN(gradeNum) && gradeNum >= 6) return DEFAULT_TRACK_ITEMS_GRADE_6PLUS
    return DEFAULT_TRACK_ITEMS_BELOW_6
  }

  const getPaperStatusForSubject = (subjectId: string): Record<string, { checked: boolean; received_date: string | null }> => {
    const result: Record<string, { checked: boolean; received_date: string | null }> = {}
    paperStatuses
      .filter(ps => ps.subject_id === subjectId)
      .forEach(ps => {
        result[ps.item_type] = { checked: ps.checked, received_date: ps.received_date }
      })
    return result
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getUrgencyInfo = (examDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate + 'T00:00:00')
    const diffDays = Math.round((exam.getTime() - today.getTime()) / 86400000)
    if (diffDays < 0) return { cls: 'overdue', label: '⚠ Overdue' }
    if (diffDays === 0) return { cls: 'urgent', label: '⚠ Due Today' }
    if (diffDays <= 2) return { cls: 'urgent', label: `⚠ Due in ${diffDays}d` }
    return { cls: '', label: '' }
  }

  // ============================================================
  // CRUD operations
  // ============================================================
  const handleTogglePaper = async (subjectId: string, itemType: string, checked: boolean) => {
    // Optimistic update
    setPaperStatuses(prev => {
      const existing = prev.find(ps => ps.subject_id === subjectId && ps.item_type === itemType)
      if (existing) {
        return prev.map(ps =>
          ps.subject_id === subjectId && ps.item_type === itemType
            ? { ...ps, checked, received_date: checked ? new Date().toISOString().split('T')[0] : null }
            : ps
        )
      } else {
        return [...prev, {
          id: crypto.randomUUID(),
          subject_id: subjectId,
          item_type: itemType,
          checked,
          received_date: checked ? new Date().toISOString().split('T')[0] : null,
          updated_by: user.id as string,
          updated_at: new Date().toISOString(),
        }]
      }
    })

    // Server update
    const { data: existing } = await supabase
      .from('paper_status')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('item_type', itemType)
      .single()

    if (existing) {
      await supabase
        .from('paper_status')
        .update({ checked, received_date: checked ? new Date().toISOString().split('T')[0] : null, updated_by: user.id })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('paper_status')
        .insert({
          subject_id: subjectId,
          item_type: itemType,
          checked,
          received_date: checked ? new Date().toISOString().split('T')[0] : null,
          updated_by: user.id as string,
        })
    }
  }

  const handleUpdateReceivedDate = async (subjectId: string, itemType: string, date: string) => {
    setPaperStatuses(prev =>
      prev.map(ps =>
        ps.subject_id === subjectId && ps.item_type === itemType
          ? { ...ps, received_date: date || null }
          : ps
      )
    )

    const { data: existing } = await supabase
      .from('paper_status')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('item_type', itemType)
      .single()

    if (existing) {
      await supabase
        .from('paper_status')
        .update({ received_date: date || null })
        .eq('id', existing.id)
    }
  }

  const handleAddTracker = async (name: string, subtitle: string, classLabels: string[], trackBpMs: boolean) => {
    const trackItems = (trackBpMs ? ['qp', 'bp', 'ms'] : ['qp']).concat([...WORKFLOW_ITEMS])

    const { data: tracker, error } = await supabase
      .from('trackers')
      .insert({
        school_id: userProfile.school_id,
        name,
        subtitle,
      })
      .select()
      .single()

    if (error || !tracker) return

    // Create classes
    for (const label of classLabels) {
      await supabase.from('classes').insert({
        tracker_id: tracker.id,
        label,
        track_items: trackItems,
      })
    }

    setTrackers(prev => [...prev, tracker])
    setActiveTrackerId(tracker.id)
    setShowNewTracker(false)
    showToast(`Tracker "${name}" created!`)
  }

  const handleDeleteTracker = async (trackerId: string) => {
    if (!confirm('Delete this tracker and all its data?')) return

    await supabase.from('trackers').delete().eq('id', trackerId)
    setTrackers(prev => prev.filter(t => t.id !== trackerId))

    if (activeTrackerId === trackerId) {
      const remaining = trackers.filter(t => t.id !== trackerId)
      setActiveTrackerId(remaining[0]?.id || null)
    }
  }

  const handleAddClass = async (label: string, trackBpMs: boolean) => {
    if (!activeTrackerId) return
    const trackItems = (trackBpMs ? ['qp', 'bp', 'ms'] : ['qp']).concat([...WORKFLOW_ITEMS])

    const { data: classItem } = await supabase
      .from('classes')
      .insert({
        tracker_id: activeTrackerId,
        label,
        track_items: trackItems,
        sort_order: classes.length,
      })
      .select()
      .single()

    if (classItem) {
      setClasses(prev => [...prev, classItem])
      setShowAddClass(false)
    }
  }

  const handleAddSubject = async (classId: string, name: string, category: string, examDate: string, contact: string) => {
    const { data: subject } = await supabase
      .from('subjects')
      .insert({
        class_id: classId,
        name,
        category,
        exam_date: examDate || null,
        contact,
        sort_order: subjects.filter(s => s.class_id === classId).length,
      })
      .select()
      .single()

    if (subject) {
      setSubjects(prev => [...prev, subject])
      setShowAddSubject(false)
    }
  }

  const handleAddDate = async (date: string) => {
    if (!activeTrackerId) return
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const day = dayNames[new Date(date + 'T00:00:00').getDay()]

    const { data: examDate } = await supabase
      .from('exam_dates')
      .upsert({ tracker_id: activeTrackerId, date, day }, { onConflict: 'tracker_id,date' })
      .select()
      .single()

    if (examDate) {
      setExamDates(prev => {
        const filtered = prev.filter(ed => ed.date !== date)
        return [...filtered, examDate].sort((a, b) => a.date.localeCompare(b.date))
      })
      setShowAddDate(false)
    }
  }

  const handleDeleteDate = async (date: string) => {
    if (!confirm(`Delete ${formatDate(date)}?`)) return
    await supabase.from('exam_dates').delete().eq('tracker_id', activeTrackerId!).eq('date', date)
    setExamDates(prev => prev.filter(ed => ed.date !== date))
  }

  const handleUpdateSubject = async (subjectId: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...updates } : s))
    await supabase.from('subjects').update(updates).eq('id', subjectId)
  }

  const handleDeleteSubject = async (subjectId: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    await supabase.from('subjects').delete().eq('id', subjectId)
    setSubjects(prev => prev.filter(s => s.id !== subjectId))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // ============================================================
  // Computed stats
  // ============================================================
  const stats = (() => {
    let total = 0, received = 0, urgent = 0
    classes.forEach(cls => {
      const trackItems = getTrackItems(cls)
      const classSubjects = subjects.filter(s => s.class_id === cls.id)
      classSubjects.forEach(s => {
        total++
        const status = getPaperStatusForSubject(s.id)
        const doneCount = trackItems.reduce((sum, item) => sum + (status[item]?.checked ? 1 : 0), 0)
        if (doneCount === trackItems.length && trackItems.length > 0) received++
        if (doneCount < trackItems.length && s.exam_date) {
          const info = getUrgencyInfo(s.exam_date)
          if (info.cls) urgent++
        }
      })
    })
    return { total, received, pending: total - received, urgent, percentage: total ? Math.round((received / total) * 100) : 0 }
  })()

  const activeTracker = trackers.find(t => t.id === activeTrackerId)

  // ============================================================
  // Render subjects for a given date or view
  // ============================================================
  const renderSubjectCard = (cls: Class, subject: Subject) => {
    const status = getPaperStatusForSubject(subject.id)
    const trackItems = getTrackItems(cls)
    return (
      <SubjectCard
        key={subject.id}
        subject={subject}
        classItem={cls}
        trackItems={trackItems}
        status={status}
        onToggle={handleTogglePaper}
        onUpdateDate={handleUpdateReceivedDate}
        onUpdateSubject={handleUpdateSubject}
        onDelete={handleDeleteSubject}
        getUrgencyInfo={getUrgencyInfo}
      />
    )
  }

  // ============================================================
  // View renderers
  // ============================================================
  const renderDatewiseView = () => {
    const datesToShow = selectedDate ? examDates.filter(d => d.date === selectedDate) : examDates
    return (
      <div>
        {selectedDate && (
          <div className="mb-3 text-sm" style={{ color: 'var(--ink-soft)' }}>
            Showing <strong>{formatDate(selectedDate)}</strong> only ·{' '}
            <button
              onClick={() => setSelectedDate(null)}
              className="underline"
              style={{ color: 'var(--royal)' }}
            >
              Show all dates
            </button>
          </div>
        )}
        {datesToShow.map(dateInfo => {
          const dateSubjects = subjects.filter(s => s.exam_date === dateInfo.date)
          return (
            <div key={dateInfo.date} className="mb-5">
              <div className="flex justify-between items-baseline pb-2 mb-3" style={{ borderBottom: '1px solid var(--ink)' }}>
                <span className="font-display text-lg" style={{ color: 'var(--ink)' }}>
                  {formatDate(dateInfo.date)} · {dateInfo.day}
                </span>
              </div>
              {dateSubjects.length === 0 ? (
                <p style={{ color: 'var(--ink-soft)' }}>No exams scheduled.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {classes.map(cls => {
                    const clsSubjects = dateSubjects.filter(s => s.class_id === cls.id)
                    if (clsSubjects.length === 0) return null
                    return (
                      <div key={cls.id}>
                        <h4 className="font-display text-sm font-bold mb-2" style={{ color: 'var(--royal)' }}>
                          {cls.label}
                        </h4>
                        {clsSubjects.map(s => renderSubjectCard(cls, s))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderGradewiseView = () => {
    const gradesToShow = selectedGrade ? classes.filter(c => c.id === selectedGrade) : classes
    return (
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedGrade(null)}
            className="px-3 py-1.5 rounded-full text-xs font-mono transition-all"
            style={{
              backgroundColor: !selectedGrade ? 'var(--royal)' : 'var(--panel-2)',
              color: !selectedGrade ? '#fff' : 'var(--ink-soft)',
              border: `1px solid ${!selectedGrade ? 'var(--royal)' : 'var(--rule-strong)'}`,
            }}
          >
            All Classes
          </button>
          {classes.map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedGrade(cls.id)}
              className="px-3 py-1.5 rounded-full text-xs font-mono transition-all"
              style={{
                backgroundColor: selectedGrade === cls.id ? 'var(--royal)' : 'var(--panel-2)',
                color: selectedGrade === cls.id ? '#fff' : 'var(--ink-soft)',
                border: `1px solid ${selectedGrade === cls.id ? 'var(--royal)' : 'var(--rule-strong)'}`,
              }}
            >
              {cls.label}
            </button>
          ))}
        </div>
        {gradesToShow.map(cls => {
          const clsSubjects = subjects.filter(s => s.class_id === cls.id)
          const trackItems = getTrackItems(cls)
          let receivedCount = 0
          clsSubjects.forEach(s => {
            const status = getPaperStatusForSubject(s.id)
            if (trackItems.some(item => status[item]?.checked)) receivedCount++
          })
          const progress = clsSubjects.length ? Math.round((receivedCount / clsSubjects.length) * 100) : 0

          return (
            <div key={cls.id} className="mb-5">
              <div className="flex justify-between items-baseline pb-2 mb-3 flex-wrap gap-2" style={{ borderBottom: '1px solid var(--ink)' }}>
                <span className="font-display text-lg" style={{ color: 'var(--ink)' }}>{cls.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>
                    {receivedCount}/{clsSubjects.length} received
                  </span>
                  <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--rule)' }}>
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: 'var(--green)' }} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {clsSubjects.map(s => renderSubjectCard(cls, s))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderPendingView = () => {
    const pendingItems: { cls: Class; subject: Subject }[] = []
    classes.forEach(cls => {
      const trackItems = getTrackItems(cls)
      subjects.filter(s => s.class_id === cls.id).forEach(s => {
        const status = getPaperStatusForSubject(s.id)
        const doneCount = trackItems.reduce((sum, item) => sum + (status[item]?.checked ? 1 : 0), 0)
        if (doneCount < trackItems.length) pendingItems.push({ cls, subject: s })
      })
    })

    if (pendingItems.length === 0) {
      return (
        <p className="text-center py-12 italic" style={{ color: 'var(--green)' }}>
          ✓ All papers received. Nothing pending.
        </p>
      )
    }

    const byDate: Record<string, typeof pendingItems> = {}
    pendingItems.forEach(item => {
      const key = item.subject.exam_date || 'No date set'
      ;(byDate[key] = byDate[key] || []).push(item)
    })

    return (
      <div>
        <div className="mb-3 text-sm" style={{ color: 'var(--ink-soft)' }}>
          <strong>{pendingItems.length}</strong> paper{pendingItems.length === 1 ? '' : 's'} still pending
        </div>
        {Object.entries(byDate)
          .sort(([a], [b]) => {
            if (a === 'No date set') return 1
            if (b === 'No date set') return -1
            return a.localeCompare(b)
          })
          .map(([date, items]) => (
            <div key={date} className="mb-5">
              <div className="flex justify-between items-baseline pb-2 mb-3" style={{ borderBottom: '1px solid var(--ink)' }}>
                <span className="font-display text-lg" style={{ color: 'var(--ink)' }}>
                  {date === 'No date set' ? 'No Exam Date Set' : formatDate(date)}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {items.map(({ cls, subject }) => renderSubjectCard(cls, subject))}
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="max-w-[1500px] mx-auto px-4 pb-16">
      {/* Header */}
      <header className="text-center py-5 mb-4">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-wide" style={{ color: 'var(--ink)' }}>
          QUESTION PAPER TRACKER — {(activeTracker?.name || 'SESSION 2026-27').toUpperCase()}
        </h1>
        <p className="text-sm italic mt-1" style={{ color: 'var(--ink-soft)' }}>
          {activeTracker?.subtitle || 'Half Yearly Examination · Grade III to XII · Royal Global School, Guwahati'}
        </p>
        <div className="my-3 mx-auto max-w-[520px]" style={{ borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--ink)', height: 3 }} />
        <div className="flex justify-center gap-3 flex-wrap">
          {examDates.length > 0 && (
            <span className="text-xs font-mono px-3 py-1 rounded" style={{ backgroundColor: 'var(--royal-soft)', color: 'var(--royal)', border: '1px solid var(--rule)' }}>
              {examDates.length === 1
                ? formatDate(examDates[0].date)
                : `${formatDate(examDates[0].date)} – ${formatDate(examDates[examDates.length - 1].date)}`
              }
            </span>
          )}
          <span className="text-xs font-mono px-3 py-1 rounded" style={{ backgroundColor: 'var(--royal-soft)', color: 'var(--royal)', border: '1px solid var(--rule)' }}>
            {school?.name || 'School'}
          </span>
        </div>
      </header>

      {/* Tracker bar */}
      <TrackerBar
        trackers={trackers}
        activeTrackerId={activeTrackerId}
        onSwitch={setActiveTrackerId}
        onNew={() => setShowNewTracker(true)}
        onDelete={handleDeleteTracker}
      />

      {/* Note banner */}
      {activeTracker?.note_banner && (
        <div className="p-3 rounded text-sm mb-4" style={{ backgroundColor: 'var(--gold-soft)', border: '1px solid var(--gold)', color: 'var(--ink)' }}>
          {activeTracker.note_banner}
        </div>
      )}

      {/* Stats */}
      <StatsGrid stats={stats} />

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b-2 mb-0 pb-0" style={{ borderColor: 'var(--ink)' }}>
        {(['datewise', 'gradewise', 'subjectwise', 'pending'] as ViewMode[]).map(view => (
          <button
            key={view}
            onClick={() => {
              setCurrentView(view)
              if (view !== 'datewise') setSelectedDate(null)
            }}
            className="px-3 md:px-4 py-2 rounded-t-md text-xs md:text-sm transition-all -mb-0.5"
            style={{
              backgroundColor: currentView === view ? 'var(--panel)' : 'var(--panel-2)',
              color: currentView === view ? 'var(--royal)' : 'var(--ink-soft)',
              fontWeight: currentView === view ? 700 : 400,
              border: `1px solid ${currentView === view ? 'var(--ink)' : 'var(--rule-strong)'}`,
              borderBottom: currentView === view ? '1px solid var(--panel)' : 'none',
              transform: currentView === view ? 'translateY(2px)' : 'none',
            }}
          >
            {view === 'datewise' ? 'Date-wise' : view === 'gradewise' ? 'Grade-wise' : view === 'subjectwise' ? 'Subject-wise' : 'Pending Only'}
          </button>
        ))}
        <div className="flex items-center gap-1 ml-auto flex-wrap">
          <button onClick={() => setShowAddClass(true)} className="px-3 py-2 rounded-md text-xs" style={{ color: 'var(--ink-soft)' }}>+ Class</button>
          <button onClick={() => setShowAddSubject(true)} className="px-3 py-2 rounded-md text-xs" style={{ color: 'var(--ink-soft)' }}>+ Subject</button>
          <button onClick={() => setShowAddDate(true)} className="px-3 py-2 rounded-md text-xs" style={{ color: 'var(--ink-soft)' }}>+ Date</button>
          <ThemeToggle />
          <button onClick={handleLogout} className="px-3 py-2 rounded-md text-xs" style={{ color: 'var(--red)' }}>Logout</button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-4 rounded-b-md p-4" style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--ink)', borderTop: 'none' }}>
        {/* Sidebar */}
        <div>
          <h3 className="font-display text-sm font-bold mb-3 pb-1.5" style={{ color: 'var(--ink)', borderBottom: '1px solid var(--rule)' }}>
            Exam Dates
          </h3>
          <DateList
            dates={examDates}
            selectedDate={selectedDate}
            onSelect={(date) => {
              setSelectedDate(selectedDate === date ? null : date)
              setCurrentView('datewise')
            }}
            onDelete={handleDeleteDate}
            subjects={subjects}
            formatDate={formatDate}
          />
        </div>

        {/* Content area */}
        <div>
          {loading ? (
            <p className="text-center py-12" style={{ color: 'var(--ink-soft)' }}>Loading...</p>
          ) : currentView === 'datewise' ? renderDatewiseView()
            : currentView === 'gradewise' ? renderGradewiseView()
            : currentView === 'pending' ? renderPendingView()
            : renderDatewiseView()
          }
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 mt-6" style={{ borderTop: '1px solid var(--rule)', color: 'var(--ink-soft)' }}>
        <div className="text-sm italic">Question Paper Tracker · Session 2026-27 · Half Yearly Examination</div>
        <div className="text-xs mt-1.5 font-mono" style={{ color: 'var(--ink-faint)' }}>
          Developed by <span style={{ color: 'var(--gold)' }}>Pranjit</span>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 px-5 py-2.5 rounded-full text-sm shadow-lg z-50 transition-all"
          style={{ backgroundColor: 'var(--ink)', color: 'var(--paper)' }}>
          {toast}
        </div>
      )}

      {/* Modals */}
      <Modals
        showNewTracker={showNewTracker}
        onCloseNewTracker={() => setShowNewTracker(false)}
        onAddTracker={handleAddTracker}
        showAddClass={showAddClass}
        onCloseAddClass={() => setShowAddClass(false)}
        onAddClass={handleAddClass}
        showAddSubject={showAddSubject}
        onCloseAddSubject={() => setShowAddSubject(false)}
        onAddSubject={handleAddSubject}
        classes={classes}
        showAddDate={showAddDate}
        onCloseAddDate={() => setShowAddDate(false)}
        onAddDate={handleAddDate}
      />
    </div>
  )
}
