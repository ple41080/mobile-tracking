import { usePetStore } from '@/stores/petStore'
import { getPetMood, PET_MOOD_CONFIG, getLevelTitle, EXP_PER_LEVEL } from '@/types/pet'

export function usePetStatus() {
  const { name, level, exp, hp, happiness, coins, gems, species } = usePetStore()

  const mood = getPetMood(happiness)
  const { emoji, text: moodText } = PET_MOOD_CONFIG[mood]
  const levelTitle = getLevelTitle(level)
  const expProgress = exp / EXP_PER_LEVEL

  return {
    name,
    species,
    level,
    exp,
    hp,
    happiness,
    coins,
    gems,
    mood,
    moodEmoji: emoji,
    moodText,
    levelTitle,
    expProgress,
  }
}
