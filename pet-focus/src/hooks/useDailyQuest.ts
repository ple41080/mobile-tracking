import { useState, useEffect } from 'react'
import { DailyQuest, DAILY_QUESTS, CHORE_QUESTS } from '@/types/focus'
import { useFocusStore } from '@/stores/focusStore'
import { useChoreQuestStore } from '@/stores/choreQuestStore'

export function useDailyQuest() {
  const { totalFocusMinutes } = useFocusStore()
  const ensureToday = useChoreQuestStore((s) => s.ensureToday)
  const getQuestProgress = useChoreQuestStore((s) => s.getQuestProgress)
  const choreProgress = useChoreQuestStore((s) => s.progress)
  const [quests, setQuests] = useState<(DailyQuest & { progress: number; done: boolean })[]>([])
  const [choreQuests, setChoreQuests] = useState<
    (typeof CHORE_QUESTS[number] & { done: boolean; retryCount: number })[]
  >([])

  useEffect(() => {
    ensureToday()
  }, [ensureToday])

  useEffect(() => {
    const updated = DAILY_QUESTS.map((q) => {
      let progress = 0
      if (q.type === 'focus') {
        progress = Math.min(q.target, totalFocusMinutes)
      }
      return { ...q, progress, done: progress >= q.target }
    })
    setQuests(updated)

    const chores = CHORE_QUESTS.map((q) => {
      const progress = getQuestProgress(q.id)
      return {
        ...q,
        done: Boolean(progress.completedAt),
        retryCount: progress.retryCount,
      }
    })
    setChoreQuests(chores)
  }, [totalFocusMinutes, getQuestProgress, ensureToday, choreProgress])

  return { quests, choreQuests }
}
