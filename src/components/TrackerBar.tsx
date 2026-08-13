'use client'

import type { Tracker } from '@/lib/types'

interface Props {
  trackers: Tracker[]
  activeTrackerId: string | null
  onSwitch: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export default function TrackerBar({ trackers, activeTrackerId, onSwitch, onNew, onDelete }: Props) {
  return (
    <div className="flex gap-2 items-center flex-wrap mb-4 pb-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--rule)' }}>
      {trackers.map(tracker => (
        <div
          key={tracker.id}
          onClick={() => onSwitch(tracker.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer whitespace-nowrap transition-all"
          style={{
            backgroundColor: tracker.id === activeTrackerId ? 'var(--royal)' : 'var(--panel-2)',
            color: tracker.id === activeTrackerId ? '#fff' : 'var(--ink-soft)',
            border: `1px solid ${tracker.id === activeTrackerId ? 'var(--royal)' : 'var(--rule-strong)'}`,
            fontWeight: tracker.id === activeTrackerId ? 700 : 400,
          }}
        >
          {tracker.name}
          {tracker.id === activeTrackerId && trackers.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(tracker.id)
              }}
              className="ml-1 text-white opacity-80 hover:opacity-100"
              title="Delete tracker"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <div
        onClick={onNew}
        className="px-3 py-1.5 rounded-full text-xs font-mono cursor-pointer whitespace-nowrap transition-all"
        style={{
          border: '1px dashed var(--gold)',
          color: 'var(--gold)',
          backgroundColor: 'transparent',
        }}
      >
        + New Tracker
      </div>
    </div>
  )
}
