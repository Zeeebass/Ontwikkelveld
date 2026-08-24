import type { PlayerQuestion } from '../types/app'

export function LearningItemCard({ item }: { item: PlayerQuestion }) {
  return (
    <article className="learning-item">
      <div className="learning-item__meta">
        <span>{item.category || 'Persoonlijk leeritem'}</span>
        <span>{item.periodName || 'Altijd relevant'}</span>
      </div>
      <h3>{item.question}</h3>
      <p className="learning-item__description">{item.answer}</p>
    </article>
  )
}
