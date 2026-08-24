import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LearningItemCard } from './LearningItemCard'

const item = {
  id: 'question-1', playerId: 'player-1', periodId: null, periodName: null,
  question: 'Waar kijk je voor de balaanname?', answer: 'Over beide schouders.',
  category: 'Tactisch', sortOrder: 1, createdAt: '2026-08-24T00:00:00Z',
}

describe('LearningItemCard', () => {
  it('toont het leeritem en de toelichting direct', () => {
    render(<LearningItemCard item={item} />)
    expect(screen.getByText(item.question)).toBeVisible()
    expect(screen.getByText(item.answer)).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
