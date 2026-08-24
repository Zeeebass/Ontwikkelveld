import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { PlayerQuestion } from '../types/app'

export function QuestionCard({ item }: { item: PlayerQuestion }) {
  const [open, setOpen] = useState(false)
  return (
    <article className={`question ${open ? 'question--open' : ''}`}>
      <div className="question__meta">
        <span>{item.category || 'Persoonlijk leeritem'}</span>
        <span>{item.periodName || 'Altijd relevant'}</span>
      </div>
      <h3>{item.question}</h3>
      <button className="text-button" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? 'Verberg antwoord' : 'Bekijk antwoord'} <ChevronDown aria-hidden="true" />
      </button>
      {open && <div className="question__answer"><p>{item.answer}</p></div>}
    </article>
  )
}
