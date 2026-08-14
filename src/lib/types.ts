export interface School {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface UserProfile {
  id: string
  school_id: string
  email: string
  role: string
  created_at: string
}

export interface Tracker {
  id: string
  school_id: string
  name: string
  subtitle: string
  note_banner: string
  created_at: string
}

export interface ClassRow {
  id: string
  tracker_id: string
  label: string
  track_items: string[]
  sort_order: number
  created_at: string
}

export interface ExamDate {
  id: string
  tracker_id: string
  date: string
  day: string
}

export interface Subject {
  id: string
  class_id: string
  name: string
  category: string
  exam_date: string | null
  contact: string
  sort_order: number
  created_at: string
}

export interface PaperStatus {
  id: string
  subject_id: string
  item_type: string
  checked: boolean
  received_date: string | null
  updated_by: string | null
  updated_at: string
}

export interface PaperStatusMap {
  [subjectId: string]: {
    [itemType: string]: { checked: boolean; received_date: string | null }
  }
}

export type ViewMode = 'datewise' | 'gradewise' | 'subjectwise' | 'pending'

export const WORKFLOW_ITEMS = ['edited', 'proofread', 'corrected', 'final'] as const

export const ITEM_LABELS: Record<string, string> = {
  qp: 'Question Paper',
  bp: 'Blueprint',
  ms: 'Marking Scheme',
  edited: 'Edited',
  proofread: 'Proofread',
  corrected: 'Corrected',
  final: 'Final Print',
}

export const CATEGORIES = [
  'Language',
  'Main Subject',
  'Science',
  'Commerce',
  'Humanities',
  'Mathematics',
  'Technology',
  'Elective',
  'Skill',
] as const

export const DEFAULT_TRACK_ITEMS_GRADE_6PLUS = ['qp', 'bp', 'ms', ...WORKFLOW_ITEMS]
export const DEFAULT_TRACK_ITEMS_BELOW_6 = ['qp', ...WORKFLOW_ITEMS]
