import { describe, expect, it } from 'vitest'
import { demoAdminPlayer, demoConvertLearningItem, demoPeriods } from './demo'

const daanId = '10000000-0000-4000-8000-000000000001'

describe('leeritem omzetten naar progressie', () => {
  it('maakt progressie aan en verwijdert daarna het leeritem', () => {
    const before = demoAdminPlayer(daanId)
    const learningItem = before.questions[0]
    const currentPeriod = demoPeriods().find((period) => period.isCurrent)

    expect(learningItem).toBeDefined()
    expect(currentPeriod).toBeDefined()

    demoConvertLearningItem({
      learningItemId: learningItem.id,
      periodId: currentPeriod!.id,
      points: 125,
      title: 'Scannen zelfstandig toegepast',
      description: learningItem.answer,
    })

    const after = demoAdminPlayer(daanId)
    expect(after.questions).not.toContainEqual(expect.objectContaining({ id: learningItem.id }))
    expect(after.progress).toContainEqual(expect.objectContaining({
      periodId: currentPeriod!.id,
      points: 125,
      title: 'Scannen zelfstandig toegepast',
      description: learningItem.answer,
    }))
    expect(after.totalPoints).toBe(before.totalPoints + 125)
  })
})
