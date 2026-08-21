import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import StatsGrid from '@/components/dashboard/StatsGrid'

describe('StatsGrid', () => {
  it('renders all 4 stat cards', () => {
    render(<StatsGrid stats={{ total: 100, received: 40, pending: 60, percentage: 40 }} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('40')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('renders all labels', () => {
    render(<StatsGrid stats={{ total: 0, received: 0, pending: 0, percentage: 0 }} />)
    expect(screen.getByText('Total Papers')).toBeInTheDocument()
    expect(screen.getByText('Received')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('shows 0% when no papers', () => {
    render(<StatsGrid stats={{ total: 0, received: 0, pending: 0, percentage: 0 }} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
