'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Tracker, ClassRow, ExamDate, Subject, PaperStatus, PaperStatusMap, ViewMode } from '@/lib/types'
import { WORKFLOW_ITEMS, DEFAULT_TRACK_ITEMS_GRADE_6PLUS, DEFAULT_TRACK_ITEMS_BELOW_6 } from '@/lib/types'

interface UseTrackerReturn {
  trackers: Tracker[]
  activeTracker: Tracker | null
  classes: ClassRow[]
  examDates: ExamDate[]
  subjects: Subject[]
  paperStatuses: PaperStatus[]
  paperStatusMap: PaperStatusMap
  loading: boolean
  currentView: ViewMode
  selectedDate: string | null
  selectedGrade: string | null
  selectedSubjectCategory: string | null
  toast: string | null
  toastKey: number
  sidebarOpen: boolean
  stats: { total: number; received: number; pending: number; urgent: number; percentage: number }
  setCurrentView: (v: ViewMode) => void
  setSelectedDate: (d: string | null) => void
  setSelectedGrade: (g: string | null) => void
  setSelectedSubjectCategory: (c: string | null) => void
  setSidebarOpen: (open: boolean) => void
  getTrackItems: (cls: ClassRow) => string[]
  showToast: (msg: string) => void
  handleTogglePaper: (subjectId: string, itemType: string, checked: boolean) => Promise<void>
  handleUpdateReceivedDate: (subjectId: string, itemType: string, date: string) => Promise<void>
  handleAddTracker: (name: string, subtitle: string, classLabels: string[], trackBpMs: boolean) => Promise<void>
  handleDeleteTracker: (trackerId: string) => Promise<void>
  handleAddClass: (label: string, trackBpMs: boolean) => Promise<void>
  handleAddSubject: (classId: string, name: string, category: string, examDate: string, contact: string) => Promise<void>
  handleAddDate: (date: string) => Promise<void>
  handleDeleteDate: (date: string) => Promise<void>
  handleEditDate: (oldDate: string, newDate: string) => Promise<void>
  handleUpdateSubject: (subjectId: string, updates: Partial<Subject>) => Promise<void>
  handleDeleteSubject: (subjectId: string, name: string) => Promise<void>
  handleMoveSubject: (fromClassId: string, subjectId: string, toClassId: string) => Promise<void>
  handleMarkAllReceived: () => Promise<void>
  handleClearAllStatus: () => Promise<void>
  handleResetAll: () => Promise<void>
  handleImport: (json: Record<string, unknown>) => Promise<void>
  handleExport: () => void
  handleRenameTracker: (trackerId: string, name: string) => Promise<void>
  handleUpdateSubtitle: (subtitle: string) => Promise<void>
  handleUpdateTrackerName: (trackerId: string, name: string) => Promise<void>
  switchTracker: (id: string) => void
}

function getTrackItemsFromLabel(label: string, trackItems?: string[]): string[] {
  if (trackItems?.length) return trackItems
  const gradeNum = parseInt(label)
  if (!isNaN(gradeNum) && gradeNum >= 6) return DEFAULT_TRACK_ITEMS_GRADE_6PLUS
  return DEFAULT_TRACK_ITEMS_BELOW_6
}

export function useTracker(user: User, initialTrackers: Tracker[]): UseTrackerReturn {
  const supabase = createClient()

  const [trackers, setTrackers] = useState<Tracker[]>(initialTrackers)
  const [activeTrackerId, setActiveTrackerId] = useState<string | null>(initialTrackers[0]?.id || null)
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [examDates, setExamDates] = useState<ExamDate[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [paperStatuses, setPaperStatuses] = useState<PaperStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<ViewMode>('datewise')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastKey, setToastKey] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    setToastKey(k => k + 1)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [])

  const formatDate = useCallback((dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [])

  const getTrackItems = useCallback((cls: ClassRow): string[] => {
    return getTrackItemsFromLabel(cls.label, cls.track_items)
  }, [])

  const paperStatusMap = useCallback((): PaperStatusMap => {
    const map: PaperStatusMap = {}
    paperStatuses.forEach(ps => {
      if (!map[ps.subject_id]) map[ps.subject_id] = {}
      map[ps.subject_id][ps.item_type] = { checked: ps.checked, received_date: ps.received_date }
    })
    return map
  }, [paperStatuses])()

  const getUrgencyInfo = useCallback((examDate: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const exam = new Date(examDate + 'T00:00:00')
    const diffDays = Math.round((exam.getTime() - today.getTime()) / 86400000)
    if (diffDays < 0) return { cls: 'overdue', label: '⚠ Overdue' }
    if (diffDays === 0) return { cls: 'urgent', label: '⚠ Due Today' }
    if (diffDays <= 2) return { cls: 'urgent', label: `⚠ Due in ${diffDays}d` }
    return { cls: '', label: '' }
  }, [])

  const stats = useCallback(() => {
    let total = 0, received = 0, urgent = 0
    classes.forEach(cls => {
      const trackItems = getTrackItems(cls)
      subjects.filter(s => s.class_id === cls.id).forEach(s => {
        total++
        const status = paperStatusMap[s.id]
        if (status?.['qp']?.checked || status?.['bp']?.checked || status?.['ms']?.checked) received++
        const doneCount = trackItems.reduce((sum, item) => sum + (status?.[item]?.checked ? 1 : 0), 0)
        if (doneCount < trackItems.length && s.exam_date) { const info = getUrgencyInfo(s.exam_date); if (info.cls) urgent++ }
      })
    })
    return { total, received, pending: total - received, urgent, percentage: total ? Math.round((received / total) * 100) : 0 }
  }, [classes, subjects, paperStatusMap, getTrackItems, getUrgencyInfo])()

  const activeTracker = trackers.find(t => t.id === activeTrackerId) || null

  const switchTracker = useCallback((id: string) => {
    setActiveTrackerId(id)
    setSelectedDate(null)
    setSelectedGrade(null)
    setSelectedSubjectCategory(null)
    setCurrentView('datewise')
  }, [])

  const fetchTrackerData = useCallback(async (trackerId: string) => {
    setLoading(true)
    try {
      const classesRes = await supabase.from('classes').select('*').eq('tracker_id', trackerId).order('sort_order')
      if (classesRes.error) throw classesRes.error
      const allClasses = (classesRes.data || []) as ClassRow[]
      setClasses(allClasses)

      const datesRes = await supabase.from('exam_dates').select('*').eq('tracker_id', trackerId).order('date')
      if (datesRes.error) throw datesRes.error
      setExamDates((datesRes.data || []) as ExamDate[])

      const classIds = allClasses.map(c => c.id)
      if (classIds.length > 0) {
        const subjectsRes = await supabase.from('subjects').select('*').in('class_id', classIds).order('sort_order')
        if (subjectsRes.error) throw subjectsRes.error
        const allSubjects = (subjectsRes.data || []) as Subject[]
        setSubjects(allSubjects)

        const subjectIds = allSubjects.map(s => s.id)
        if (subjectIds.length > 0) {
          const statusRes = await supabase.from('paper_status').select('*').in('subject_id', subjectIds)
          if (statusRes.error) throw statusRes.error
          setPaperStatuses((statusRes.data || []) as PaperStatus[])
        } else {
          setPaperStatuses([])
        }
      } else {
        setSubjects([])
        setPaperStatuses([])
      }
    } catch (err) {
      console.error('Failed to load tracker data:', err)
      showToast('Failed to load data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [supabase, showToast])

  useEffect(() => { if (activeTrackerId) fetchTrackerData(activeTrackerId) }, [activeTrackerId, fetchTrackerData])

  // Real-time subscriptions
  useEffect(() => {
    if (!activeTrackerId) return
    const channel = supabase
      .channel(`tracker-${activeTrackerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'paper_status' }, () => {
        fetchTrackerData(activeTrackerId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => {
        fetchTrackerData(activeTrackerId)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_dates', filter: `tracker_id=eq.${activeTrackerId}` }, () => {
        fetchTrackerData(activeTrackerId)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeTrackerId, supabase, fetchTrackerData])

  // CRUD handlers with error handling
  const handleTogglePaper = useCallback(async (subjectId: string, itemType: string, checked: boolean) => {
    const today = new Date().toISOString().split('T')[0]
    setPaperStatuses(prev => {
      const existing = prev.find(ps => ps.subject_id === subjectId && ps.item_type === itemType)
      if (existing) {
        return prev.map(ps => ps.subject_id === subjectId && ps.item_type === itemType
          ? { ...ps, checked, received_date: checked ? today : null } : ps)
      }
      return [...prev, { id: crypto.randomUUID(), subject_id: subjectId, item_type: itemType, checked, received_date: checked ? today : null, updated_by: user.id, updated_at: new Date().toISOString() }]
    })
    try {
      const { data: existing } = await supabase.from('paper_status').select('id').eq('subject_id', subjectId).eq('item_type', itemType).single()
      if (existing) {
        const { error } = await supabase.from('paper_status').update({ checked, received_date: checked ? today : null, updated_by: user.id }).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('paper_status').insert({ subject_id: subjectId, item_type: itemType, checked, received_date: checked ? today : null, updated_by: user.id })
        if (error) throw error
      }
    } catch (err) {
      console.error('Failed to toggle paper:', err)
      showToast('Failed to save. Retrying...')
      if (activeTrackerId) fetchTrackerData(activeTrackerId)
    }
  }, [supabase, user.id, showToast, activeTrackerId, fetchTrackerData])

  const handleUpdateReceivedDate = useCallback(async (subjectId: string, itemType: string, date: string) => {
    setPaperStatuses(prev => prev.map(ps => ps.subject_id === subjectId && ps.item_type === itemType ? { ...ps, received_date: date || null } : ps))
    try {
      const { data: existing } = await supabase.from('paper_status').select('id').eq('subject_id', subjectId).eq('item_type', itemType).single()
      if (existing) {
        const { error } = await supabase.from('paper_status').update({ received_date: date || null }).eq('id', existing.id)
        if (error) throw error
      }
    } catch (err) {
      console.error('Failed to update date:', err)
      showToast('Failed to save date.')
    }
  }, [supabase, showToast])

  const handleAddTracker = useCallback(async (name: string, subtitle: string, classLabels: string[], trackBpMs: boolean) => {
    try {
      const trackItems = (trackBpMs ? ['qp', 'bp', 'ms'] : ['qp']).concat([...WORKFLOW_ITEMS])
      const { data: tracker, error } = await supabase.from('trackers').insert({ school_id: user.user_metadata?.school_id || '', name, subtitle }).select().single()
      if (error) throw error
      if (!tracker) return
      for (const label of classLabels) {
        const { error: clsErr } = await supabase.from('classes').insert({ tracker_id: tracker.id, label, track_items: trackItems })
        if (clsErr) throw clsErr
      }
      setTrackers(prev => [...prev, tracker as Tracker])
      setActiveTrackerId(tracker.id)
      showToast('Tracker created!')
    } catch (err) {
      console.error('Failed to create tracker:', err)
      showToast('Failed to create tracker.')
    }
  }, [supabase, user, showToast])

  const handleDeleteTracker = useCallback(async (trackerId: string) => {
    if (!confirm('Delete this tracker and all its data? This cannot be undone.')) return
    try {
      const { error } = await supabase.from('trackers').delete().eq('id', trackerId)
      if (error) throw error
      setTrackers(prev => {
        const remaining = prev.filter(t => t.id !== trackerId)
        if (activeTrackerId === trackerId) setActiveTrackerId(remaining[0]?.id || null)
        return remaining
      })
      showToast('Tracker deleted.')
    } catch (err) {
      console.error('Failed to delete tracker:', err)
      showToast('Failed to delete tracker.')
    }
  }, [supabase, activeTrackerId, showToast])

  const handleRenameTracker = useCallback(async (trackerId: string, name: string) => {
    try {
      const { error } = await supabase.from('trackers').update({ name }).eq('id', trackerId)
      if (error) throw error
      setTrackers(prev => prev.map(t => t.id === trackerId ? { ...t, name } : t))
    } catch (err) {
      console.error('Failed to rename tracker:', err)
      showToast('Failed to rename.')
    }
  }, [supabase, showToast])

  const handleUpdateSubtitle = useCallback(async (subtitle: string) => {
    if (!activeTrackerId) return
    try {
      const { error } = await supabase.from('trackers').update({ subtitle }).eq('id', activeTrackerId)
      if (error) throw error
      setTrackers(prev => prev.map(t => t.id === activeTrackerId ? { ...t, subtitle } : t))
    } catch (err) {
      console.error('Failed to update subtitle:', err)
    }
  }, [supabase, activeTrackerId])

  const handleUpdateTrackerName = useCallback(async (trackerId: string, name: string) => {
    try {
      const { error } = await supabase.from('trackers').update({ name }).eq('id', trackerId)
      if (error) throw error
      setTrackers(prev => prev.map(t => t.id === trackerId ? { ...t, name } : t))
    } catch (err) {
      console.error('Failed to update tracker name:', err)
    }
  }, [supabase])

  const handleAddClass = useCallback(async (label: string, trackBpMs: boolean) => {
    if (!activeTrackerId) return
    try {
      const trackItems = (trackBpMs ? ['qp', 'bp', 'ms'] : ['qp']).concat([...WORKFLOW_ITEMS])
      const { data: cls, error } = await supabase.from('classes').insert({ tracker_id: activeTrackerId, label, track_items: trackItems, sort_order: classes.length }).select().single()
      if (error) throw error
      if (cls) { setClasses(prev => [...prev, cls as ClassRow]); showToast('Class added!') }
    } catch (err) {
      console.error('Failed to add class:', err)
      showToast('Failed to add class.')
    }
  }, [supabase, activeTrackerId, classes.length, showToast])

  const handleAddSubject = useCallback(async (classId: string, name: string, category: string, examDate: string, contact: string) => {
    try {
      const { data: subject, error } = await supabase.from('subjects').insert({ class_id: classId, name, category, exam_date: examDate || null, contact, sort_order: subjects.filter(s => s.class_id === classId).length }).select().single()
      if (error) throw error
      if (subject) { setSubjects(prev => [...prev, subject as Subject]); showToast('Subject added!') }
    } catch (err) {
      console.error('Failed to add subject:', err)
      showToast('Failed to add subject.')
    }
  }, [supabase, subjects, showToast])

  const handleAddDate = useCallback(async (date: string) => {
    if (!activeTrackerId) return
    try {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const day = dayNames[new Date(date + 'T00:00:00').getDay()]
      const { data: ed, error } = await supabase.from('exam_dates').upsert({ tracker_id: activeTrackerId, date, day }, { onConflict: 'tracker_id,date' }).select().single()
      if (error) throw error
      if (ed) {
        setExamDates(prev => [...prev.filter(e => e.date !== date), ed as ExamDate].sort((a, b) => a.date.localeCompare(b.date)))
        showToast('Date added!')
      }
    } catch (err) {
      console.error('Failed to add date:', err)
      showToast('Failed to add date.')
    }
  }, [supabase, activeTrackerId, showToast])

  const handleDeleteDate = useCallback(async (date: string) => {
    if (!activeTrackerId) return
    if (!confirm(`Delete ${formatDate(date)}? Subjects on this date are kept.`)) return
    try {
      const { error } = await supabase.from('exam_dates').delete().eq('tracker_id', activeTrackerId).eq('date', date)
      if (error) throw error
      setExamDates(prev => prev.filter(e => e.date !== date))
      if (selectedDate === date) setSelectedDate(null)
      showToast('Date deleted.')
    } catch (err) {
      console.error('Failed to delete date:', err)
      showToast('Failed to delete date.')
    }
  }, [supabase, activeTrackerId, formatDate, selectedDate, showToast])

  const handleEditDate = useCallback(async (oldDate: string, newDate: string) => {
    if (!activeTrackerId || !newDate || oldDate === newDate) return
    try {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const newDay = dayNames[new Date(newDate + 'T00:00:00').getDay()]

      const affectedSubjects = subjects.filter(s => s.exam_date === oldDate)
      setExamDates(prev => {
        const updated = prev.map(e => e.date === oldDate ? { ...e, date: newDate, day: newDay } : e)
        const seen = new Set<string>()
        return updated.filter(e => { if (seen.has(e.date)) return false; seen.add(e.date); return true }).sort((a, b) => a.date.localeCompare(b.date))
      })
      setSubjects(prev => prev.map(s => s.exam_date === oldDate ? { ...s, exam_date: newDate } : s))

      await supabase.from('exam_dates').update({ date: newDate, day: newDay }).eq('tracker_id', activeTrackerId).eq('date', oldDate)
      if (affectedSubjects.length > 0) {
        await supabase.from('subjects').update({ exam_date: newDate }).in('id', affectedSubjects.map(s => s.id))
      }
      showToast(`Date updated — ${affectedSubjects.length} paper${affectedSubjects.length === 1 ? '' : 's'} moved.`)
    } catch (err) {
      console.error('Failed to edit date:', err)
      showToast('Failed to update date.')
      if (activeTrackerId) fetchTrackerData(activeTrackerId)
    }
  }, [supabase, activeTrackerId, subjects, showToast, fetchTrackerData])

  const handleUpdateSubject = useCallback(async (subjectId: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...updates } : s))
    try {
      const { error } = await supabase.from('subjects').update(updates).eq('id', subjectId)
      if (error) throw error
    } catch (err) {
      console.error('Failed to update subject:', err)
      showToast('Failed to save changes.')
    }
  }, [supabase, showToast])

  const handleDeleteSubject = useCallback(async (subjectId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', subjectId)
      if (error) throw error
      setSubjects(prev => prev.filter(s => s.id !== subjectId))
      setPaperStatuses(prev => prev.filter(ps => ps.subject_id !== subjectId))
      showToast(`"${name}" deleted.`)
    } catch (err) {
      console.error('Failed to delete subject:', err)
      showToast('Failed to delete subject.')
    }
  }, [supabase, showToast])

  const handleMoveSubject = useCallback(async (fromClassId: string, subjectId: string, toClassId: string) => {
    if (!toClassId || fromClassId === toClassId) return
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, class_id: toClassId } : s))
    try {
      const { error } = await supabase.from('subjects').update({ class_id: toClassId }).eq('id', subjectId)
      if (error) throw error
      showToast('Subject moved.')
    } catch (err) {
      console.error('Failed to move subject:', err)
      showToast('Failed to move subject.')
      if (activeTrackerId) fetchTrackerData(activeTrackerId)
    }
  }, [supabase, showToast, activeTrackerId, fetchTrackerData])

  const handleMarkAllReceived = useCallback(async () => {
    if (!confirm('Mark ALL papers as received (all tracked stages, including Edited/Proofread/Corrected/Final Print)?')) return
    const today = new Date().toISOString().split('T')[0]
    const newStatuses: PaperStatus[] = []
    try {
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
      showToast('All papers marked as received!')
    } catch (err) {
      console.error('Failed to mark all received:', err)
      showToast('Failed. Some changes may not have saved.')
      if (activeTrackerId) fetchTrackerData(activeTrackerId)
    }
  }, [classes, subjects, user.id, supabase, showToast, activeTrackerId, fetchTrackerData, getTrackItems])

  const handleClearAllStatus = useCallback(async () => {
    if (!confirm('Clear ALL received status? This resets everything.')) return
    try {
      const classIds = classes.map(c => c.id)
      if (classIds.length > 0) {
        const { data: subs } = await supabase.from('subjects').select('id').in('class_id', classIds)
        if (subs && subs.length > 0) {
          const { error } = await supabase.from('paper_status').delete().in('subject_id', (subs as { id: string }[]).map(s => s.id))
          if (error) throw error
        }
      }
      setPaperStatuses([])
      showToast('All status cleared.')
    } catch (err) {
      console.error('Failed to clear status:', err)
      showToast('Failed to clear status.')
    }
  }, [classes, supabase, showToast])

  const handleResetAll = useCallback(async () => {
    if (!confirm('Reset all data? This clears all received status.')) return
    try {
      const classIds = classes.map(c => c.id)
      if (classIds.length > 0) {
        const { data: subs } = await supabase.from('subjects').select('id').in('class_id', classIds)
        if (subs && subs.length > 0) {
          const { error } = await supabase.from('paper_status').delete().in('subject_id', (subs as { id: string }[]).map(s => s.id))
          if (error) throw error
        }
      }
      setPaperStatuses([])
      showToast('All data reset.')
    } catch (err) {
      console.error('Failed to reset:', err)
      showToast('Failed to reset data.')
    }
  }, [classes, supabase, showToast])

  const handleImport = useCallback(async (json: Record<string, unknown>) => {
    if (!activeTrackerId) return
    try {
      const ds = json.datesheet as Record<string, unknown> | undefined
      if (!ds) { showToast('Invalid import file.'); return }

      if (Array.isArray(ds.dates)) {
        for (const d of ds.dates as { date: string; day: string }[]) {
          if (!examDates.find(e => e.date === d.date)) {
            await supabase.from('exam_dates').upsert({ tracker_id: activeTrackerId, date: d.date, day: d.day }, { onConflict: 'tracker_id,date' })
          }
        }
      }

      if (ds.grades && typeof ds.grades === 'object') {
        for (const [key, gradeData] of Object.entries(ds.grades as Record<string, { name: string; subjects: Array<{ name: string; category?: string; examDate?: string; contact?: string }> }>)) {
          let cls = classes.find(c => c.label === (gradeData.name || key))
          if (!cls) {
            const trackItems = DEFAULT_TRACK_ITEMS_GRADE_6PLUS
            const { data: newCls } = await supabase.from('classes').insert({ tracker_id: activeTrackerId, label: gradeData.name || key, track_items: trackItems, sort_order: classes.length }).select().single()
            if (newCls) { cls = newCls as ClassRow; setClasses(prev => [...prev, cls!]) }
          }
          if (cls && gradeData.subjects) {
            for (const s of gradeData.subjects) {
              const { data: existing } = await supabase.from('subjects').select('id').eq('class_id', cls.id).eq('name', s.name).maybeSingle()
              if (!existing) {
                await supabase.from('subjects').insert({ class_id: cls.id, name: s.name, category: s.category || 'Language', exam_date: s.examDate || null, contact: s.contact || '', sort_order: 0 })
              }
            }
          }
        }
      }

      fetchTrackerData(activeTrackerId)
      showToast('Data imported successfully!')
    } catch (err) {
      console.error('Import failed:', err)
      showToast('Import failed. Check file format.')
    }
  }, [activeTrackerId, classes, examDates, supabase, showToast, fetchTrackerData])

  const handleExport = useCallback(() => {
    try {
      const obj = {
        datesheet: {
          examTitle: activeTracker?.name,
          dates: examDates,
          classes: classes.map(c => ({ ...c, subjects: subjects.filter(s => s.class_id === c.id) })),
        },
        paperStatus: Object.fromEntries(paperStatuses.map(ps => [ps.subject_id + '_' + ps.item_type, { checked: ps.checked, received_date: ps.received_date }])),
        exportDate: new Date().toISOString(),
      }
      const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(activeTracker?.name || 'tracker').replace(/[^a-z0-9]+/gi, '_')}_Backup.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Data exported!')
    } catch (err) {
      console.error('Export failed:', err)
      showToast('Export failed.')
    }
  }, [activeTracker, examDates, classes, subjects, paperStatuses, showToast])

  return {
    trackers, activeTracker, classes, examDates, subjects, paperStatuses, paperStatusMap,
    loading, currentView, selectedDate, selectedGrade, selectedSubjectCategory,
    toast, toastKey, sidebarOpen, stats,
    setCurrentView, setSelectedDate, setSelectedGrade, setSelectedSubjectCategory, setSidebarOpen,
    getTrackItems, showToast, switchTracker,
    handleTogglePaper, handleUpdateReceivedDate,
    handleAddTracker, handleDeleteTracker, handleRenameTracker, handleUpdateSubtitle, handleUpdateTrackerName,
    handleAddClass, handleAddSubject, handleAddDate, handleDeleteDate, handleEditDate,
    handleUpdateSubject, handleDeleteSubject, handleMoveSubject,
    handleMarkAllReceived, handleClearAllStatus, handleResetAll,
    handleImport, handleExport,
  }
}
