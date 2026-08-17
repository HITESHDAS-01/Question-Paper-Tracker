'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Tracker, School } from '@/lib/types'
import { useTracker } from '@/hooks/useTracker'

import Letterhead from '@/components/dashboard/Letterhead'
import TrackerBar from '@/components/dashboard/TrackerBar'
import StatsGrid from '@/components/dashboard/StatsGrid'
import TabsBar from '@/components/dashboard/TabsBar'
import Sidebar from '@/components/dashboard/Sidebar'
import Toast from '@/components/dashboard/Toast'

import DatewiseView from '@/components/dashboard/views/DatewiseView'
import GradewiseView from '@/components/dashboard/views/GradewiseView'
import SubjectwiseView from '@/components/dashboard/views/SubjectwiseView'
import PendingView from '@/components/dashboard/views/PendingView'

import NewTrackerModal from '@/components/dashboard/modals/NewTrackerModal'
import AddClassModal from '@/components/dashboard/modals/AddClassModal'
import AddSubjectModal from '@/components/dashboard/modals/AddSubjectModal'
import AddDateModal from '@/components/dashboard/modals/AddDateModal'

interface Props {
  user: User
  userProfile: { id: string; school_id: string; email: string; role: string }
  school: School | null
  initialTrackers: Tracker[]
}

export default function DashboardClient({ user, initialTrackers, school }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [showNewTracker, setShowNewTracker] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showAddDate, setShowAddDate] = useState(false)

  const t = useTracker(user, initialTrackers)

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/auth/login'); router.refresh() }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <Letterhead
          school={school}
          tracker={t.activeTracker}
          examDates={t.examDates}
          onRenameTracker={t.handleRenameTracker}
          onUpdateSubtitle={t.handleUpdateSubtitle}
        />

        <TrackerBar
          trackers={t.trackers}
          activeTrackerId={t.activeTracker?.id || null}
          onSelect={t.switchTracker}
          onRename={t.handleRenameTracker}
          onNew={() => setShowNewTracker(true)}
          onLogout={handleLogout}
        />

        {t.activeTracker?.note_banner && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/15 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300 shadow-sm">
            <span className="font-semibold">Note:</span> {t.activeTracker.note_banner}
          </div>
        )}

        <StatsGrid stats={t.stats} />

        <TabsBar
          currentView={t.currentView}
          onViewChange={v => { t.setCurrentView(v); if (v !== 'datewise') t.setSelectedDate(null) }}
          onAddClass={() => setShowAddClass(true)}
          onAddSubject={() => setShowAddSubject(true)}
          onAddDate={() => setShowAddDate(true)}
          onMarkAllReceived={t.handleMarkAllReceived}
          onClearAllStatus={t.handleClearAllStatus}
        />

        <div className="flex gap-0 relative">
          <Sidebar
            examDates={t.examDates}
            subjects={t.subjects}
            selectedDate={t.selectedDate}
            onSelectDate={d => { t.setSelectedDate(t.selectedDate === d ? null : d); t.setCurrentView('datewise') }}
            onDeleteDate={t.handleDeleteDate}
            onEditDate={t.handleEditDate}
            isOpen={t.sidebarOpen}
            onToggle={() => t.setSidebarOpen(!t.sidebarOpen)}
          />

          <main className="flex-1 min-w-0 p-4">
            {t.loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400" />
              </div>
            ) : t.currentView === 'datewise' ? (
              <DatewiseView examDates={t.examDates} subjects={t.subjects} classes={t.classes} selectedDate={t.selectedDate}
                paperStatusMap={t.paperStatusMap} getTrackItems={t.getTrackItems} setSelectedDate={t.setSelectedDate}
                onToggle={t.handleTogglePaper} onUpdateSubject={t.handleUpdateSubject}
                onDelete={t.handleDeleteSubject} onMove={t.handleMoveSubject} />
            ) : t.currentView === 'gradewise' ? (
              <GradewiseView classes={t.classes} subjects={t.subjects} selectedGrade={t.selectedGrade}
                paperStatusMap={t.paperStatusMap} getTrackItems={t.getTrackItems} setSelectedGrade={t.setSelectedGrade}
                onToggle={t.handleTogglePaper} onUpdateSubject={t.handleUpdateSubject}
                onDelete={t.handleDeleteSubject} onMove={t.handleMoveSubject} />
            ) : t.currentView === 'subjectwise' ? (
              <SubjectwiseView classes={t.classes} subjects={t.subjects} selectedSubjectCategory={t.selectedSubjectCategory}
                paperStatusMap={t.paperStatusMap} getTrackItems={t.getTrackItems} setSelectedSubjectCategory={t.setSelectedSubjectCategory}
                onToggle={t.handleTogglePaper} onUpdateSubject={t.handleUpdateSubject}
                onDelete={t.handleDeleteSubject} onMove={t.handleMoveSubject} />
            ) : (
              <PendingView classes={t.classes} subjects={t.subjects} examDates={t.examDates}
                paperStatusMap={t.paperStatusMap} getTrackItems={t.getTrackItems}
                onToggle={t.handleTogglePaper} onUpdateSubject={t.handleUpdateSubject}
                onDelete={t.handleDeleteSubject} onMove={t.handleMoveSubject} />
            )}
          </main>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200" onClick={t.handleExport}>Export data</button>
          <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md transition-all duration-200" onClick={() => document.getElementById('importFile')!.click()}>Import data</button>
          <input type="file" id="importFile" style={{ display: 'none' }} accept=".json" onChange={async e => {
            const file = e.target.files?.[0]; if (!file) return
            const text = await file.text()
            try { const imported = JSON.parse(text); t.handleImport(imported) } catch { alert('Invalid file format!') }
          }} />
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200" onClick={() => t.showToast('All changes auto-saved.')}>Save changes</button>
          <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-red-500 dark:text-red-400 text-sm font-semibold border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-md transition-all duration-200" onClick={t.handleResetAll}>Reset all</button>
        </div>

        <footer className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <span>Question Paper Tracker · Session 2026–27 · Half Yearly Examination</span>
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          </div>
          <div className="mt-1">Developed by <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pranjit</span></div>
        </footer>
      </div>

      <Toast message={t.toast} toastKey={t.toastKey} />

      {showNewTracker && <NewTrackerModal onSubmit={t.handleAddTracker} onClose={() => setShowNewTracker(false)} />}
      {showAddClass && <AddClassModal onSubmit={t.handleAddClass} onClose={() => setShowAddClass(false)} />}
      {showAddSubject && <AddSubjectModal classes={t.classes} onSubmit={t.handleAddSubject} onClose={() => setShowAddSubject(false)} />}
      {showAddDate && <AddDateModal onSubmit={t.handleAddDate} onClose={() => setShowAddDate(false)} />}
    </div>
  )
}
