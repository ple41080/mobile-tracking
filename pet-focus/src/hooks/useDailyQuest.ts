import { useState, useEffect } from 'react'
import { DailyQuest, DAILY_QUESTS } from '@/types/focus'
import { useFocusStore } from '@/stores/focusStore'

export function useDailyQuest() {
  const { totalFocusMinutes } = useFocusStore()
  const [quests, setQuests] = useState<(DailyQuest & { progress: number; done: boolean })[]>([])

  useEffect(() => {
    const updated = DAILY_QUESTS.map((q) => {
      let progress = 0
      if (q.type === 'focus') {
        progress = Math.min(q.target, totalFocusMinutes)
      }
      return { ...q, progress, done: progress >= q.target }
    })
    setQuests(updated)
  }, [totalFocusMinutes])

  return { quests }
}
