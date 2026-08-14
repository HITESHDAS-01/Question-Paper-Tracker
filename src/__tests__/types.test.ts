import { WORKFLOW_ITEMS, ITEM_LABELS, CATEGORIES, DEFAULT_TRACK_ITEMS_GRADE_6PLUS, DEFAULT_TRACK_ITEMS_BELOW_6 } from '@/lib/types'

describe('types', () => {
  it('WORKFLOW_ITEMS contains exactly 4 items', () => {
    expect(WORKFLOW_ITEMS).toHaveLength(4)
    expect(WORKFLOW_ITEMS).toContain('edited')
    expect(WORKFLOW_ITEMS).toContain('proofread')
    expect(WORKFLOW_ITEMS).toContain('corrected')
    expect(WORKFLOW_ITEMS).toContain('final')
  })

  it('ITEM_LABELS maps all items correctly', () => {
    expect(ITEM_LABELS['qp']).toBe('Question Paper')
    expect(ITEM_LABELS['bp']).toBe('Blueprint')
    expect(ITEM_LABELS['ms']).toBe('Marking Scheme')
    expect(ITEM_LABELS['edited']).toBe('Edited')
    expect(ITEM_LABELS['proofread']).toBe('Proofread')
    expect(ITEM_LABELS['corrected']).toBe('Corrected')
    expect(ITEM_LABELS['final']).toBe('Final Print')
  })

  it('CATEGORIES has 9 categories', () => {
    expect(CATEGORIES).toHaveLength(9)
    expect(CATEGORIES).toContain('Language')
    expect(CATEGORIES).toContain('Mathematics')
  })

  it('DEFAULT_TRACK_ITEMS_GRADE_6PLUS has 7 items', () => {
    expect(DEFAULT_TRACK_ITEMS_GRADE_6PLUS).toHaveLength(7)
    expect(DEFAULT_TRACK_ITEMS_GRADE_6PLUS).toContain('qp')
    expect(DEFAULT_TRACK_ITEMS_GRADE_6PLUS).toContain('bp')
    expect(DEFAULT_TRACK_ITEMS_GRADE_6PLUS).toContain('ms')
    expect(DEFAULT_TRACK_ITEMS_GRADE_6PLUS).toContain('edited')
  })

  it('DEFAULT_TRACK_ITEMS_BELOW_6 has 5 items', () => {
    expect(DEFAULT_TRACK_ITEMS_BELOW_6).toHaveLength(5)
    expect(DEFAULT_TRACK_ITEMS_BELOW_6).toContain('qp')
    expect(DEFAULT_TRACK_ITEMS_BELOW_6).not.toContain('bp')
    expect(DEFAULT_TRACK_ITEMS_BELOW_6).not.toContain('ms')
  })
})
