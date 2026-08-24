import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QuestionCard } from './QuestionCard'

const item = {
  id: 'question-1', playerId: 'player-1', periodId: null, periodName: null,
  question: 'Waar kijk je voor de balaanname?', answer: 'Over beide schouders.',
  category: 'Tactisch', sortOrder: 1, createdAt: '2026-08-24T00:00:00Z',
}

describe('QuestionCard', () => {
  it('verbergt het antwoord totdat de speler het opent', async () => {
    const user = userEvent.setup()
    render(<QuestionCard item={item} />)
    expect(screen.queryByText(item.answer)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Bekijk antwoord' }))
    expect(screen.getByText(item.answer)).toBeVisible()
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
  })
})
