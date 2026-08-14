import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import SubjectCard from '@/components/dashboard/SubjectCard'
import type { ClassRow, Subject, PaperStatusMap } from '@/lib/types'

const mockClass: ClassRow = {
  id: 'class-1', tracker_id: 'tracker-1', label: '6',
  track_items: ['qp', 'bp', 'ms', 'edited', 'proofread', 'corrected', 'final'],
  sort_order: 1, created_at: '2026-01-01'
}

const mockSubject: Subject = {
  id: 'sub-1', class_id: 'class-1', name: 'Mathematics',
  category: 'Mathematics', exam_date: '2026-09-08',
  contact: 'Mrs. Sharma', sort_order: 1, created_at: '2026-01-01'
}

const emptyStatusMap: PaperStatusMap = {}
const getTrackItems = (cls: ClassRow) => cls.track_items

describe('SubjectCard', () => {
  it('renders subject name input and class label', () => {
    render(
      <SubjectCard cls={mockClass} subject={mockSubject} allClasses={[mockClass]}
        paperStatusMap={emptyStatusMap} getTrackItems={getTrackItems}
        onToggle={jest.fn()} onUpdateDate={jest.fn()} onUpdateSubject={jest.fn()}
        onDelete={jest.fn()} onMove={jest.fn()} />
    )
    expect(screen.getByTitle('Edit subject name')).toHaveValue('Mathematics')
    expect(screen.getByText('CLASS 6')).toBeInTheDocument()
  })

  it('shows pending status when no items checked', () => {
    render(
      <SubjectCard cls={mockClass} subject={mockSubject} allClasses={[mockClass]}
        paperStatusMap={emptyStatusMap} getTrackItems={getTrackItems}
        onToggle={jest.fn()} onUpdateDate={jest.fn()} onUpdateSubject={jest.fn()}
        onDelete={jest.fn()} onMove={jest.fn()} />
    )
    expect(screen.getByText('0/7')).toBeInTheDocument()
  })

  it('shows correct count when some items checked', () => {
    const statusMap: PaperStatusMap = {
      'sub-1': { 'qp': { checked: true, received_date: '2026-09-01' } }
    }
    render(
      <SubjectCard cls={mockClass} subject={mockSubject} allClasses={[mockClass]}
        paperStatusMap={statusMap} getTrackItems={getTrackItems}
        onToggle={jest.fn()} onUpdateDate={jest.fn()} onUpdateSubject={jest.fn()}
        onDelete={jest.fn()} onMove={jest.fn()} />
    )
    expect(screen.getByText('1/7')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn()
    render(
      <SubjectCard cls={mockClass} subject={mockSubject} allClasses={[mockClass]}
        paperStatusMap={emptyStatusMap} getTrackItems={getTrackItems}
        onToggle={jest.fn()} onUpdateDate={jest.fn()} onUpdateSubject={jest.fn()}
        onDelete={onDelete} onMove={jest.fn()} />
    )
    fireEvent.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith('sub-1', 'Mathematics')
  })

  it('calls onToggle when checkbox clicked', () => {
    const onToggle = jest.fn()
    render(
      <SubjectCard cls={mockClass} subject={mockSubject} allClasses={[mockClass]}
        paperStatusMap={emptyStatusMap} getTrackItems={getTrackItems}
        onToggle={onToggle} onUpdateDate={jest.fn()} onUpdateSubject={jest.fn()}
        onDelete={jest.fn()} onMove={jest.fn()} />
    )
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    expect(onToggle).toHaveBeenCalledWith('sub-1', 'qp', true)
  })

  it('shows Print Workflow divider for grade 6+', () => {
    render(
      <SubjectCard cls={mockClass} subject={mockSubject} allClasses={[mockClass]}
        paperStatusMap={emptyStatusMap} getTrackItems={getTrackItems}
        onToggle={jest.fn()} onUpdateDate={jest.fn()} onUpdateSubject={jest.fn()}
        onDelete={jest.fn()} onMove={jest.fn()} />
    )
    expect(screen.getByText('Print Workflow')).toBeInTheDocument()
  })

  it('renders all checklist items', () => {
    render(
      <SubjectCard cls={mockClass} subject={mockSubject} allClasses={[mockClass]}
        paperStatusMap={emptyStatusMap} getTrackItems={getTrackItems}
        onToggle={jest.fn()} onUpdateDate={jest.fn()} onUpdateSubject={jest.fn()}
        onDelete={jest.fn()} onMove={jest.fn()} />
    )
    expect(screen.getByText('Question Paper')).toBeInTheDocument()
    expect(screen.getByText('Blueprint')).toBeInTheDocument()
    expect(screen.getByText('Marking Scheme')).toBeInTheDocument()
    expect(screen.getByText('Edited')).toBeInTheDocument()
    expect(screen.getByText('Proofread')).toBeInTheDocument()
    expect(screen.getByText('Corrected')).toBeInTheDocument()
    expect(screen.getByText('Final Print')).toBeInTheDocument()
  })
})
