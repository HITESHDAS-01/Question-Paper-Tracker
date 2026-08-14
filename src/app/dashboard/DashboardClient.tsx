/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { School, Tracker, Class, ExamDate, Subject, PaperStatus } from '@/lib/types'
import { WORKFLOW_ITEMS, ITEM_LABELS, CATEGORIES, DEFAULT_TRACK_ITEMS_GRADE_6PLUS, DEFAULT_TRACK_ITEMS_BELOW_6 } from '@/lib/types'

interface Props {
  user: User
  userProfile: { id: string; school_id: string; email: string; role: string }
  school: School | null
  initialTrackers: Tracker[]
}

type ViewMode = 'datewise' | 'gradewise' | 'subjectwise' | 'pending'

function escapeAttr(str: string) { return String(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;') }

export default function DashboardClient({ user, userProfile, school, initialTrackers }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [trackers, setTrackers] = useState<Tracker[]>(initialTrackers)
  const [activeTrackerId, setActiveTrackerId] = useState<string | null>(initialTrackers[0]?.id || null)
  const [classes, setClasses] = useState<Class[]>([])
  const [examDates, setExamDates] = useState<ExamDate[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [paperStatuses, setPaperStatuses] = useState<PaperStatus[]>([])
  const [currentView, setCurrentView] = useState<ViewMode>('datewise')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewTracker, setShowNewTracker] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showAddDate, setShowAddDate] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)

  // Init theme
  useEffect(() => {
    const saved = localStorage.getItem('paperTrackerTheme') || 'light'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const showToast = (msg: string) => { setToast(msg); setToastKey(k => k + 1) }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getTrackItems = (cls: Class): string[] => {
    if (cls.track_items?.length) return cls.track_items
    const gradeNum = parseInt(cls.label)
    if (!isNaN(gradeNum) && gradeNum >= 6) return DEFAULT_TRACK_ITEMS_GRADE_6PLUS
    return DEFAULT_TRACK_ITEMS_BELOW_6
  }

  const getPaperStatusForSubject = (subjectId: string): Record<string, { checked: boolean; received_date: string | null }> => {
    const result: Record<string, { checked: boolean; received_date: string | null }> = {}
    paperStatuses.filter(ps => ps.subject_id === subjectId).forEach(ps => {
      result[ps.item_type] = { checked: ps.checked, received_date: ps.received_date }
    })
    return result
  }

  const getUrgencyInfo = (examDate: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate + 'T00:00:00')
    const diffDays = Math.round((exam.getTime() - today.getTime()) / 86400000)
    if (diffDays < 0) return { cls: 'overdue', label: '⚠ Overdue' }
    if (diffDays === 0) return { cls: 'urgent', label: '⚠ Due Today' }
    if (diffDays <= 2) return { cls: 'urgent', label: `⚠ Due in ${diffDays}d` }
    return { cls: '', label: '' }
  }

  const normalizeSubjectName = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('english')) return 'English'
    if (n.includes('hindi')) return 'Hindi'
    if (n.includes('assamese')) return 'Assamese'
    if (n.includes('french')) return 'French'
    if (n.includes('sanskrit')) return 'Sanskrit'
    if (n.includes('social')) return 'Social Science'
    if (n.includes('computer science')) return 'Computer Science'
    if (n.includes('political science')) return 'Political Science'
    if (n === 'science') return 'Science'
    if (n.includes('math')) return 'Mathematics'
    if (n.includes('g.k') || n.includes('general knowledge')) return 'General Knowledge'
    if (n.includes('a.i') || n.includes('artificial intelligence')) return 'A.I.'
    if (n.includes('i.t') || n.includes('it ')) return 'I.T.'
    if (n.includes('computer')) return 'Computer'
    if (n.includes('paint')) return 'Painting'
    return name
  }

  // Data fetching
  const fetchTrackerData = useCallback(async (trackerId: string) => {
    setLoading(true)
    const classesRes = await supabase.from('classes').select('*').eq('tracker_id', trackerId).order('sort_order')
    const allClasses = classesRes.data || []
    setClasses(allClasses)

    const datesRes = await supabase.from('exam_dates').select('*').eq('tracker_id', trackerId).order('date')
    setExamDates(datesRes.data || [])

    const classIds = allClasses.map((c: any) => c.id)
    if (classIds.length > 0) {
      const subjectsRes = await supabase.from('subjects').select('*').in('class_id', classIds).order('sort_order')
      const allSubjects = subjectsRes.data || []
      setSubjects(allSubjects)
      const subjectIds = allSubjects.map((s: any) => s.id)
      if (subjectIds.length > 0) {
        const statusRes = await supabase.from('paper_status').select('*').in('subject_id', subjectIds)
        setPaperStatuses(statusRes.data || [])
      } else { setPaperStatuses([]) }
    } else { setSubjects([]); setPaperStatuses([]) }
    setLoading(false)
  }, [supabase])

  useEffect(() => { if (activeTrackerId) fetchTrackerData(activeTrackerId) }, [activeTrackerId, fetchTrackerData])

  useEffect(() => {
    let t: any
    if (toast) { t = setTimeout(() => setToast(null), 2600) }
    return () => clearTimeout(t)
  }, [toast, toastKey])

  // CRUD
  const handleTogglePaper = async (subjectId: string, itemType: string, checked: boolean) => {
    setPaperStatuses(prev => {
      const existing = prev.find(ps => ps.subject_id === subjectId && ps.item_type === itemType)
      if (existing) {
        return prev.map(ps => ps.subject_id === subjectId && ps.item_type === itemType
          ? { ...ps, checked, received_date: checked ? new Date().toISOString().split('T')[0] : null } : ps)
      }
      return [...prev, { id: crypto.randomUUID(), subject_id: subjectId, item_type: itemType, checked, received_date: checked ? new Date().toISOString().split('T')[0] : null, updated_by: user.id, updated_at: new Date().toISOString() }]
    })
    const { data: existing } = await supabase.from('paper_status').select('id').eq('subject_id', subjectId).eq('item_type', itemType).single()
    if (existing) {
      await supabase.from('paper_status').update({ checked, received_date: checked ? new Date().toISOString().split('T')[0] : null, updated_by: user.id }).eq('id', existing.id)
    } else {
      await supabase.from('paper_status').insert({ subject_id: subjectId, item_type: itemType, checked, received_date: checked ? new Date().toISOString().split('T')[0] : null, updated_by: user.id })
    }
  }

  const handleUpdateReceivedDate = async (subjectId: string, itemType: string, date: string) => {
    setPaperStatuses(prev => prev.map(ps => ps.subject_id === subjectId && ps.item_type === itemType ? { ...ps, received_date: date || null } : ps))
    const { data: existing } = await supabase.from('paper_status').select('id').eq('subject_id', subjectId).eq('item_type', itemType).single()
    if (existing) await supabase.from('paper_status').update({ received_date: date || null }).eq('id', existing.id)
  }

  const handleAddTracker = async (name: string, subtitle: string, classLabels: string[], trackBpMs: boolean) => {
    const trackItems = (trackBpMs ? ['qp', 'bp', 'ms'] : ['qp']).concat([...WORKFLOW_ITEMS])
    const { data: tracker } = await supabase.from('trackers').insert({ school_id: userProfile.school_id, name, subtitle }).select().single()
    if (!tracker) return
    for (const label of classLabels) { await supabase.from('classes').insert({ tracker_id: tracker.id, label, track_items: trackItems }) }
    setTrackers(prev => [...prev, tracker]); setActiveTrackerId(tracker.id); setShowNewTracker(false)
  }

  const handleDeleteTracker = async (trackerId: string) => {
    if (!confirm('Delete this tracker and all its data?')) return
    await supabase.from('trackers').delete().eq('id', trackerId)
    setTrackers(prev => prev.filter(t => t.id !== trackerId))
    if (activeTrackerId === trackerId) { const remaining = trackers.filter(t => t.id !== trackerId); setActiveTrackerId(remaining[0]?.id || null) }
  }

  const handleAddClass = async (label: string, trackBpMs: boolean) => {
    if (!activeTrackerId) return
    const trackItems = (trackBpMs ? ['qp', 'bp', 'ms'] : ['qp']).concat([...WORKFLOW_ITEMS])
    const { data: cls } = await supabase.from('classes').insert({ tracker_id: activeTrackerId, label, track_items: trackItems, sort_order: classes.length }).select().single()
    if (cls) { setClasses(prev => [...prev, cls]); setShowAddClass(false) }
  }

  const handleAddSubject = async (classId: string, name: string, category: string, examDate: string, contact: string) => {
    const { data: subject } = await supabase.from('subjects').insert({ class_id: classId, name, category, exam_date: examDate || null, contact, sort_order: subjects.filter(s => s.class_id === classId).length }).select().single()
    if (subject) { setSubjects(prev => [...prev, subject]); setShowAddSubject(false) }
  }

  const handleAddDate = async (date: string) => {
    if (!activeTrackerId) return
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const day = dayNames[new Date(date + 'T00:00:00').getDay()]
    const { data: ed } = await supabase.from('exam_dates').upsert({ tracker_id: activeTrackerId, date, day }, { onConflict: 'tracker_id,date' }).select().single()
    if (ed) { setExamDates(prev => [...prev.filter(e => e.date !== date), ed].sort((a, b) => a.date.localeCompare(b.date))); setShowAddDate(false) }
  }

  const handleDeleteDate = async (date: string) => {
    if (!confirm(`Delete ${formatDate(date)}?`)) return
    await supabase.from('exam_dates').delete().eq('tracker_id', activeTrackerId!).eq('date', date)
    setExamDates(prev => prev.filter(e => e.date !== date))
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

  const handleMarkAllReceived = async () => {
    if (!confirm('Mark ALL papers as received (all tracked stages)?')) return
    const today = new Date().toISOString().split('T')[0]
    const newStatuses: PaperStatus[] = []
    for (const cls of classes) {
      const items = getTrackItems(cls)
      const clsSubjects = subjects.filter(s => s.class_id === cls.id)
      for (const s of clsSubjects) {
        for (const item of items) {
          newStatuses.push({ id: crypto.randomUUID(), subject_id: s.id, item_type: item, checked: true, received_date: today, updated_by: user.id, updated_at: new Date().toISOString() })
          await supabase.from('paper_status').upsert({ subject_id: s.id, item_type: item, checked: true, received_date: today, updated_by: user.id }, { onConflict: 'subject_id,item_type' })
        }
      }
    }
    setPaperStatuses(newStatuses)
  }

  const handleClearAllStatus = async () => {
    if (!confirm('Clear ALL received status?')) return
    setPaperStatuses([])
    // Delete all paper_status for this tracker's subjects
    const classIds = classes.map(c => c.id)
    if (classIds.length > 0) {
      const { data: subs } = await supabase.from('subjects').select('id').in('class_id', classIds)
      if (subs && subs.length > 0) {
        await supabase.from('paper_status').delete().in('subject_id', subs.map((s: any) => s.id))
      }
    }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/auth/login'); router.refresh() }

  // Stats
  const stats = (() => {
    let total = 0, received = 0, urgent = 0
    classes.forEach(cls => {
      const trackItems = getTrackItems(cls)
      subjects.filter(s => s.class_id === cls.id).forEach(s => {
        total++
        const status = getPaperStatusForSubject(s.id)
        const doneCount = trackItems.reduce((sum, item) => sum + (status[item]?.checked ? 1 : 0), 0)
        if (doneCount === trackItems.length && trackItems.length > 0) received++
        if (doneCount < trackItems.length && s.exam_date) { const info = getUrgencyInfo(s.exam_date); if (info.cls) urgent++ }
      })
    })
    return { total, received, pending: total - received, urgent, percentage: total ? Math.round((received / total) * 100) : 0 }
  })()

  const activeTracker = trackers.find(t => t.id === activeTrackerId)

  // Render subject card (exact HTML from original)
  const renderSubjectCard = (cls: Class, subject: Subject) => {
    const status = getPaperStatusForSubject(subject.id)
    const trackItems = getTrackItems(cls)
    const totalDone = trackItems.reduce((sum, item) => sum + (status[item]?.checked ? 1 : 0), 0)
    const maxItems = trackItems.length
    let overall: 'complete' | 'partial' | 'pending' = 'pending'
    if (totalDone === maxItems && maxItems > 0) overall = 'complete'
    else if (totalDone > 0) overall = 'partial'
    const examDate = subject.exam_date || ''
    const stampLabel = overall === 'complete' ? '✓' : `${totalDone}/${maxItems}`
    let urgencyClass = '', urgencyBadge = ''
    if (examDate && overall !== 'complete') { const info = getUrgencyInfo(examDate); urgencyClass = info.cls; urgencyBadge = info.label }

    return (
      <div className={`subject-card ${overall} ${urgencyClass}`} key={subject.id}>
        {urgencyBadge && <div className="urgency-badge" dangerouslySetInnerHTML={{ __html: urgencyBadge }} />}
        <div className="subject-header">
          <div className="subject-name">
            <input type="text" defaultValue={subject.name} title="Edit subject name"
              onBlur={e => { if (e.target.value !== subject.name) handleUpdateSubject(subject.id, { name: e.target.value }) }} />
          </div>
          <div className="stamp" title={overall}><span dangerouslySetInnerHTML={{ __html: stampLabel }} /></div>
        </div>
        <div className="subject-meta">
          <span className="meta-tag">CLASS {cls.label}</span>
          <select className="category-select" defaultValue={subject.category} onChange={e => handleUpdateSubject(subject.id, { category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" className="exam-date-input" defaultValue={examDate} title="Exam date"
            onChange={e => handleUpdateSubject(subject.id, { exam_date: e.target.value || null })} />
          <button className="delete-btn" onClick={() => handleDeleteSubject(subject.id, subject.name)} title="Delete">×</button>
        </div>
        <div className="contact-row">
          <input type="text" className="contact-input" defaultValue={subject.contact || ''} placeholder="Teacher / contact" title="Responsible teacher or contact"
            onBlur={e => handleUpdateSubject(subject.id, { contact: e.target.value })} />
        </div>
        <div className="checklist">
          {trackItems.filter(i => !(WORKFLOW_ITEMS as readonly string[]).includes(i)).map(item => (
            <div key={item} className={`check-item ${status[item]?.checked ? 'received' : ''}`}>
              <input type="checkbox" id={`${item}_${subject.id}`} checked={!!status[item]?.checked}
                onChange={e => handleTogglePaper(subject.id, item, e.target.checked)} />
              <label htmlFor={`${item}_${subject.id}`}>{ITEM_LABELS[item] || item}</label>
              <input type="date" className="editable-date" value={status[item]?.received_date || ''}
                onChange={e => handleUpdateReceivedDate(subject.id, item, e.target.value)} title="Received date" />
            </div>
          ))}
          {trackItems.some(i => (WORKFLOW_ITEMS as readonly string[]).includes(i)) && <div className="checklist-divider">Print Workflow</div>}
          {trackItems.filter(i => (WORKFLOW_ITEMS as readonly string[]).includes(i)).map(item => (
            <div key={item} className={`check-item ${status[item]?.checked ? 'received' : ''}`}>
              <input type="checkbox" id={`${item}_${subject.id}`} checked={!!status[item]?.checked}
                onChange={e => handleTogglePaper(subject.id, item, e.target.checked)} />
              <label htmlFor={`${item}_${subject.id}`}>{ITEM_LABELS[item] || item}</label>
              <input type="date" className="editable-date" value={status[item]?.received_date || ''}
                onChange={e => handleUpdateReceivedDate(subject.id, item, e.target.value)} title="Received date" />
            </div>
          ))}
        </div>
        <div className="mini-progress"><div className="mini-progress-fill" style={{ width: `${Math.round((totalDone / maxItems) * 100)}%` }} /></div>
      </div>
    )
  }

  // Views
  const renderDatewiseView = () => {
    const datesToShow = selectedDate ? examDates.filter(d => d.date === selectedDate) : examDates
    return (
      <>
        {selectedDate && (
          <div style={{ marginBottom: 10, fontSize: '.8em', color: 'var(--ink-soft)' }}>
            Showing <strong>{formatDate(selectedDate)}</strong> only ·{' '}
            <a href="#" onClick={e => { e.preventDefault(); setSelectedDate(null) }} style={{ color: 'var(--royal)' }}>Show all dates</a>
          </div>
        )}
        {datesToShow.map(dateInfo => {
          const dateSubjects = subjects.filter(s => s.exam_date === dateInfo.date)
          return (
            <div key={dateInfo.date} className="grade-section">
              <div className="grade-header"><div className="grade-title">{formatDate(dateInfo.date)} · {dateInfo.day}</div></div>
              {dateSubjects.length === 0 ? <p style={{ color: 'var(--ink-soft)' }}>No exams scheduled.</p> : (
                <>{classes.map(cls => {
                  const clsSubjects = dateSubjects.filter(s => s.class_id === cls.id)
                  if (!clsSubjects.length) return null
                  return (<div key={cls.id}><h4 style={{ fontFamily: 'var(--font-display)', margin: '14px 0 8px', color: 'var(--royal)' }}>{cls.label}</h4><div className="subject-grid">{clsSubjects.map(s => renderSubjectCard(cls, s))}</div></div>)
                })}</>
              )}
            </div>
          )
        })}
      </>
    )
  }

  const renderGradewiseView = () => {
    const allGrades = classes.map(c => c.id)
    const gradesToShow = selectedGrade ? allGrades.filter(g => g === selectedGrade) : allGrades
    return (
      <>
        <div className="grade-filter-bar">
          <div className={`grade-chip ${!selectedGrade ? 'active' : ''}`} onClick={() => setSelectedGrade(null)}>All Classes</div>
          {classes.map(c => <div key={c.id} className={`grade-chip ${selectedGrade === c.id ? 'active' : ''}`} onClick={() => setSelectedGrade(c.id)}>{c.label}</div>)}
        </div>
        {gradesToShow.map(gradeId => {
          const cls = classes.find(c => c.id === gradeId)!
          const clsSubjects = subjects.filter(s => s.class_id === cls.id)
          const trackItems = getTrackItems(cls)
          let received = 0
          clsSubjects.forEach(s => { const st = getPaperStatusForSubject(s.id); if (trackItems.some(item => st[item]?.checked)) received++ })
          const progress = clsSubjects.length ? Math.round((received / clsSubjects.length) * 100) : 0
          return (
            <div key={cls.id} className="grade-section">
              <div className="grade-header">
                <div className="grade-title">{cls.label}</div>
                <div className="grade-progress">
                  <span className="progress-text">{received}/{clsSubjects.length} received</span>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                </div>
              </div>
              <div className="subject-grid">{clsSubjects.map(s => renderSubjectCard(cls, s))}</div>
            </div>
          )
        })}
      </>
    )
  }

  const renderSubjectwiseView = () => {
    const bySubject: Record<string, { cls: Class; subject: Subject }[]> = {}
    classes.forEach(cls => {
      subjects.filter(s => s.class_id === cls.id).forEach(s => {
        const key = normalizeSubjectName(s.name)
        ;(bySubject[key] = bySubject[key] || []).push({ cls, subject: s })
      })
    })
    const subjectNames = Object.keys(bySubject).sort()
    return (
      <>
        <div className="grade-filter-bar">
          <div className={`grade-chip ${!selectedSubjectCategory ? 'active' : ''}`} onClick={() => setSelectedSubjectCategory(null)}>All Subjects</div>
          {subjectNames.map(c => <div key={c} className={`grade-chip ${selectedSubjectCategory === c ? 'active' : ''}`} onClick={() => setSelectedSubjectCategory(c)}>{c}</div>)}
        </div>
        {subjectNames.map(category => {
          if (selectedSubjectCategory && category !== selectedSubjectCategory) return null
          const items = bySubject[category]
          return (
            <div key={category} className="grade-section">
              <div className="grade-header"><div className="grade-title">{category}</div></div>
              <div className="subject-grid">{items.map(({ cls, subject }) => renderSubjectCard(cls, subject))}</div>
            </div>
          )
        })}
      </>
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
    if (!pendingItems.length) return <p style={{ textAlign: 'center', padding: '50px 10px', color: 'var(--green)', fontStyle: 'italic' }}>✓ All papers received. Nothing pending.</p>
    pendingItems.sort((a, b) => {
      if (!a.subject.exam_date && !b.subject.exam_date) return 0
      if (!a.subject.exam_date) return 1; if (!b.subject.exam_date) return -1
      return new Date(a.subject.exam_date).getTime() - new Date(b.subject.exam_date).getTime()
    })
    const byDate: Record<string, typeof pendingItems> = {}
    pendingItems.forEach(it => { const key = it.subject.exam_date || 'No date set'; (byDate[key] = byDate[key] || []).push(it) })
    return (
      <>
        <div style={{ marginBottom: 12, fontSize: '.8em', color: 'var(--ink-soft)' }}>
          <strong>{pendingItems.length}</strong> paper{pendingItems.length === 1 ? '' : 's'} still pending · sorted by nearest exam date
        </div>
        {Object.entries(byDate).sort(([a], [b]) => a === 'No date set' ? 1 : b === 'No date set' ? -1 : a.localeCompare(b)).map(([date, items]) => {
          const dateInfo = examDates.find(d => d.date === date)
          return (
            <div key={date} className="grade-section">
              <div className="grade-header"><div className="grade-title">{date === 'No date set' ? 'No Exam Date Set' : `${formatDate(date)}${dateInfo ? ' · ' + dateInfo.day : ''}`}</div></div>
              <div className="subject-grid">{items.map(({ cls, subject }) => renderSubjectCard(cls, subject))}</div>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="container">
      {/* Letterhead */}
      <header className="letterhead">
        <div className="letterhead-logos">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rgs-logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjU2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNTYiIGZpbGw9IiMyRTVDOEEiIHJ4PSI4Ii8+PHRleHQgeD0iNjAiIHk9IjM2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5ST1lBTCBHT0xEIElOSVRJQ0FMIFNDSUVFTjwvdGV4dD48L3N2Zz4=" alt="Royal Global School" />
          <div className="logo-divider"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cambridge-logo" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjM0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMzQiIGZpbGw9IiMyRTVDOEEiIHJ4PSI2Ii8+PHRleHQgeD0iNTAiIHk9IjIyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSJib2xkIj5DQU1CUklER0UgU1RSRUFNUzwvdGV4dD48L3N2Zz4=" alt="Cambridge" />
        </div>
        <h1 onClick={() => {
          const val = prompt('Tracker title:', activeTracker?.name || '')
          if (val && val.trim()) {
            supabase.from('trackers').update({ name: val.trim() }).eq('id', activeTrackerId!)
            setTrackers(prev => prev.map(t => t.id === activeTrackerId ? { ...t, name: val.trim() } : t))
          }
        }} title="Click to rename this tracker">
          QUESTION PAPER TRACKER — {(activeTracker?.name || 'SESSION 2026-27').toUpperCase()}
        </h1>
        <p className="sub" onClick={() => {
          const val = prompt('Subtitle:', activeTracker?.subtitle || '')
          if (val !== null) {
            supabase.from('trackers').update({ subtitle: val.trim() }).eq('id', activeTrackerId!)
            setTrackers(prev => prev.map(t => t.id === activeTrackerId ? { ...t, subtitle: val.trim() } : t))
          }
        }} title="Click to edit">
          {activeTracker?.subtitle || 'Half Yearly Examination · Grade III to XII · Royal Global School, Guwahati'}
        </p>
        <div className="rule"></div>
        <div className="exam-info">
          <span>{examDates.length ? (examDates.length === 1 ? formatDate(examDates[0].date) : `${formatDate(examDates[0].date)} – ${formatDate(examDates[examDates.length - 1].date)}`) : 'No exam dates added yet'}</span>
          <span>Verified against official datesheet</span>
          <span>Click any field to edit</span>
        </div>
      </header>

      {/* Tracker bar */}
      <div className="tracker-bar">
        {trackers.map(p => (
          <div key={p.id} className={`tracker-pill ${p.id === activeTrackerId ? 'active' : ''}`} onClick={() => { if (p.id !== activeTrackerId) setActiveTrackerId(p.id) }}>
            {escapeAttr(p.name)}
            {p.id === activeTrackerId && (
              <span className="tracker-pill-actions">
                <button onClick={e => { e.stopPropagation(); const val = prompt('Rename tracker:', p.name); if (val && val.trim()) { supabase.from('trackers').update({ name: val.trim() }).eq('id', p.id); setTrackers(prev => prev.map(t => t.id === p.id ? { ...t, name: val.trim() } : t)) } }} title="Rename">✎</button>
                {trackers.length > 1 && <button onClick={e => { e.stopPropagation(); handleDeleteTracker(p.id) }} title="Delete">×</button>}
              </span>
            )}
          </div>
        ))}
        <div className="tracker-pill new" onClick={() => setShowNewTracker(true)}>+ New Tracker</div>
      </div>

      {/* Note banner */}
      {activeTracker?.note_banner && <div className="note-banner">{activeTracker.note_banner}</div>}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card total"><h3>{stats.total}</h3><p>Total Papers</p></div>
        <div className="stat-card received"><h3>{stats.received}</h3><p>Received</p></div>
        <div className="stat-card pending"><h3>{stats.pending}</h3><p>Pending</p></div>
        <div className="stat-card urgent"><h3>{stats.urgent}</h3><p>Urgent / Overdue</p></div>
        <div className="stat-card percentage"><h3>{stats.percentage}%</h3><p>Complete</p></div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {(['datewise', 'gradewise', 'subjectwise', 'pending'] as ViewMode[]).map(view => (
          <button key={view} className={`tab-btn ${currentView === view ? 'active' : ''}`} onClick={() => { setCurrentView(view); if (view !== 'datewise') setSelectedDate(null) }}>
            {view === 'datewise' ? 'Date-wise' : view === 'gradewise' ? 'Grade-wise' : view === 'subjectwise' ? 'Subject-wise' : 'Pending Only'}
          </button>
        ))}
        <div className="tabs-actions">
          <button className="tab-btn util" onClick={() => setShowAddClass(true)}>+ Class</button>
          <button className="tab-btn util" onClick={() => setShowAddSubject(true)}>+ Subject</button>
          <button className="tab-btn util" onClick={() => setShowAddDate(true)}>+ Date</button>
          <button className="tab-btn util" onClick={handleMarkAllReceived}>Mark all received</button>
          <button className="tab-btn util" onClick={handleClearAllStatus}>Clear all status</button>
          <button className="theme-switch" onClick={() => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
            const next = current === 'dark' ? 'light' : 'dark'
            document.documentElement.setAttribute('data-theme', next)
            localStorage.setItem('paperTrackerTheme', next)
          }} title="Toggle dark mode" aria-label="Toggle dark mode">
            <span className="theme-switch-icon sun">☀</span>
            <span className="theme-switch-icon moon">☾</span>
            <span className="theme-switch-thumb"></span>
          </button>
          <button className="tab-btn util" style={{ color: 'var(--red)' }} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div className="sidebar">
          <h3>Exam Dates</h3>
          <div className="date-list">
            {examDates.map(dateInfo => {
              let count = 0
              classes.forEach(g => subjects.forEach(s => { if (s.exam_date === dateInfo.date) count++ }))
              return (
                <div key={dateInfo.date} className={`date-item ${selectedDate === dateInfo.date ? 'active' : ''}`}
                  onClick={() => { setSelectedDate(selectedDate === dateInfo.date ? null : dateInfo.date); setCurrentView('datewise') }}>
                  <div className="date-row">
                    <span className="date">{formatDate(dateInfo.date)}</span>
                    <button className="date-delete-btn" onClick={e => { e.stopPropagation(); handleDeleteDate(dateInfo.date) }} title="Delete date">×</button>
                  </div>
                  <div className="day">{dateInfo.day}</div>
                  <div className="subjects-count">{count} paper{count === 1 ? '' : 's'}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="content-area">
          {loading ? <p style={{ color: 'var(--ink-soft)' }}>Loading...</p>
            : currentView === 'datewise' ? renderDatewiseView()
            : currentView === 'gradewise' ? renderGradewiseView()
            : currentView === 'subjectwise' ? renderSubjectwiseView()
            : renderPendingView()
          }
        </div>
      </div>

      {/* Actions */}
      <div className="actions-bar">
        <button className="action-btn primary" onClick={() => {
          const obj = { datesheet: { examTitle: activeTracker?.name, dates: examDates, classes: classes.map(c => ({ ...c, subjects: subjects.filter(s => s.class_id === c.id) })) }, paperStatus: Object.fromEntries(paperStatuses.map(ps => [ps.subject_id + '_' + ps.item_type, { checked: ps.checked, received_date: ps.received_date }])), exportDate: new Date().toISOString() }
          const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${(activeTracker?.name || 'tracker').replace(/[^a-z0-9]+/gi, '_')}_Backup.json`; a.click(); URL.revokeObjectURL(url)
        }}>Export data</button>
        <button className="action-btn" onClick={() => document.getElementById('importFile')!.click()}>Import data</button>
        <input type="file" id="importFile" style={{ display: 'none' }} accept=".json" onChange={async e => {
          const file = e.target.files?.[0]; if (!file) return
          const text = await file.text()
          try { const imported = JSON.parse(text); showToast('Data imported! (Refresh to see changes)'); console.log('Import:', imported) } catch { alert('Invalid file!') }
        }} />
        <button className="action-btn success" onClick={() => showToast('All changes saved.')}>Save changes</button>
        <button className="action-btn danger" onClick={() => { if (confirm('Reset all data?')) { fetchTrackerData(activeTrackerId!) } }}>Reset all</button>
      </div>

      {/* Footer */}
      <footer>
        <div>Question Paper Tracker · Half Yearly Examination · Based on official Term-I datesheet</div>
        <div className="footer-credit">Developed by <span>Pranjit</span></div>
      </footer>

      {/* Toast */}
      <div key={toastKey} className={`toast ${toast ? 'show' : ''}`}>{toast}</div>

      {/* Modals */}
      {showNewTracker && (
        <div className="modal active" onClick={() => setShowNewTracker(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Create new tracker</h2><button className="close-btn" onClick={() => setShowNewTracker(false)}>×</button></div>
            <NewTrackerForm onSubmit={handleAddTracker} onClose={() => setShowNewTracker(false)} />
          </div>
        </div>
      )}
      {showAddClass && (
        <div className="modal active" onClick={() => setShowAddClass(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add class / group</h2><button className="close-btn" onClick={() => setShowAddClass(false)}>×</button></div>
            <AddClassForm onSubmit={handleAddClass} onClose={() => setShowAddClass(false)} />
          </div>
        </div>
      )}
      {showAddSubject && (
        <div className="modal active" onClick={() => setShowAddSubject(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add subject</h2><button className="close-btn" onClick={() => setShowAddSubject(false)}>×</button></div>
            <AddSubjectForm classes={classes} onSubmit={handleAddSubject} onClose={() => setShowAddSubject(false)} />
          </div>
        </div>
      )}
      {showAddDate && (
        <div className="modal active" onClick={() => setShowAddDate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add exam date</h2><button className="close-btn" onClick={() => setShowAddDate(false)}>×</button></div>
            <AddDateForm onSubmit={handleAddDate} onClose={() => setShowAddDate(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

// Forms
function NewTrackerForm({ onSubmit, onClose }: { onSubmit: (name: string, subtitle: string, groups: string[], bpMs: boolean) => void; onClose: () => void }) {
  const [name, setName] = useState(''); const [sub, setSub] = useState(''); const [groups, setGroups] = useState(''); const [bpMs, setBpMs] = useState(true)
  return (
    <>
      <div className="form-group"><label>Exam / tracker name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Unit Test 1, Term II 2026-27, Annual Exam" /></div>
      <div className="form-group"><label>Subtitle (optional)</label><input type="text" value={sub} onChange={e => setSub(e.target.value)} placeholder="e.g. Grade VI to X, ABC Public School" /></div>
      <div className="form-group"><label>Classes / groups (comma separated)</label><input type="text" value={groups} onChange={e => setGroups(e.target.value)} placeholder="e.g. 6,7,8,9,10 or Nursery,LKG,UKG" /></div>
      <div className="form-group checkbox-group"><label><input type="checkbox" checked={bpMs} onChange={e => setBpMs(e.target.checked)} /> Also track Blueprint &amp; Marking Scheme (uncheck for Question-Paper-only tracking)</label></div>
      <button className="action-btn primary" style={{ width: '100%' }} onClick={() => {
        const g = groups.split(',').map(s => s.trim()).filter(Boolean)
        if (!name) { alert('Enter tracker name'); return }
        if (!g.length) { alert('Enter at least one class/group'); return }
        onSubmit(name, sub, g, bpMs)
      }}>Create tracker</button>
    </>
  )
}

function AddClassForm({ onSubmit, onClose }: { onSubmit: (label: string, bpMs: boolean) => void; onClose: () => void }) {
  const [label, setLabel] = useState(''); const [bpMs, setBpMs] = useState(true)
  return (
    <>
      <div className="form-group"><label>Class / Group name</label><input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Grade 6, Semester 1, Section A" /></div>
      <div className="form-group checkbox-group"><label><input type="checkbox" checked={bpMs} onChange={e => setBpMs(e.target.checked)} /> Also track Blueprint &amp; Marking Scheme (uncheck for Question-Paper-only tracking)</label></div>
      <button className="action-btn primary" style={{ width: '100%' }} onClick={() => { if (!label.trim()) { alert('Enter class name'); return } onSubmit(label.trim(), bpMs); setLabel('') }}>Add class / group</button>
    </>
  )
}

function AddSubjectForm({ classes, onSubmit, onClose }: { classes: Class[]; onSubmit: (classId: string, name: string, cat: string, date: string, contact: string) => void; onClose: () => void }) {
  const [classId, setClassId] = useState(classes[0]?.id || ''); const [name, setName] = useState(''); const [cat, setCat] = useState('Language'); const [date, setDate] = useState(''); const [contact, setContact] = useState('')
  return (
    <>
      <div className="form-group"><label>Class / Group</label><select value={classId} onChange={e => setClassId(e.target.value)}>{classes.length ? classes.map(c => <option key={c.id} value={c.id}>{c.label}</option>) : <option value="">No class yet</option>}</select></div>
      <div className="form-group"><label>Subject name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sanskrit" /></div>
      <div className="form-group"><label>Category</label><select value={cat} onChange={e => setCat(e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      <div className="form-group"><label>Exam date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <div className="form-group"><label>Teacher / contact (optional)</label><input type="text" value={contact} onChange={e => setContact(e.target.value)} placeholder="e.g. Mrs. Sharma, 98xxxxxxx" /></div>
      <button className="action-btn primary" style={{ width: '100%' }} onClick={() => { if (!classId) { alert('Add a class first'); return } if (!name.trim()) { alert('Enter subject name'); return } onSubmit(classId, name.trim(), cat, date, contact); setName(''); setContact('') }}>Add subject</button>
    </>
  )
}

function AddDateForm({ onSubmit, onClose }: { onSubmit: (date: string) => void; onClose: () => void }) {
  const [date, setDate] = useState('')
  return (
    <>
      <div className="form-group"><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <button className="action-btn primary" style={{ width: '100%' }} onClick={() => { if (!date) { alert('Select a date'); return } onSubmit(date); setDate('') }}>Add date</button>
    </>
  )
}
