export type PetSpecies = 'cat' | 'dog' | 'rabbit' | 'hamster'

export type PetId = 'pet_cat' | 'pet_dog'

export const DEFAULT_PET_ID: PetId = 'pet_cat'
export const DEFAULT_PET_NAME = 'น้องแมว'

export interface PetCatalogEntry {
  id: PetId
  species: PetSpecies
  emoji: string
  name: string
  requiresPurchase: boolean
}

export const PET_CATALOG: PetCatalogEntry[] = [
  { id: 'pet_cat', species: 'cat', emoji: '🐱', name: 'แมว', requiresPurchase: false },
  { id: 'pet_dog', species: 'dog', emoji: '🐕', name: 'สุนัข', requiresPurchase: true },
]

export function getPetCatalogEntry(petId: PetId): PetCatalogEntry {
  return PET_CATALOG.find((p) => p.id === petId) ?? PET_CATALOG[0]
}

export function isPetOwned(petId: PetId, ownedItems: string[]): boolean {
  const entry = getPetCatalogEntry(petId)
  if (!entry.requiresPurchase) return true
  return ownedItems.includes(petId)
}

export interface Pet {
  name: string
  species: PetSpecies
  level: number
  exp: number
  hp: number
  happiness: number
  equippedItems: string[]
}

export type PetMood = 'happy' | 'neutral' | 'sad'

export interface PetEvolutionStage {
  name: string
  emoji: string
  expRequired: number
}

export const PET_EVOLUTION: Record<number, PetEvolutionStage> = {
  1: { name: 'ลูกสัตว์', emoji: '🐣', expRequired: 0 },
  5: { name: 'วัยซน', emoji: '🐱', expRequired: 4000 },
  10: { name: 'โตเต็มวัย', emoji: '😸', expRequired: 9000 },
  20: { name: 'ร่างพิเศษ', emoji: '✨🐱✨', expRequired: 19000 },
}

export const PET_MOOD_CONFIG: Record<PetMood, { emoji: string; text: string }> = {
  happy: { emoji: '🐱', text: 'วิ่งเล่น — มีความสุขมาก' },
  neutral: { emoji: '😐', text: 'เฉยๆ' },
  sad: { emoji: '😴', text: 'ง่วงและเศร้า' },
}

export function getPetMood(happiness: number): PetMood {
  if (happiness > 70) return 'happy'
  if (happiness >= 40) return 'neutral'
  return 'sad'
}

export function getLevelTitle(level: number): string {
  if (level >= 20) return 'ร่างพิเศษ'
  if (level >= 10) return 'โตเต็มวัย'
  if (level >= 5) return 'วัยซน'
  return 'ลูกสัตว์'
}

export const EXP_PER_LEVEL = 1000

export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  bonus?: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_focus', title: 'โฟกัสครั้งแรก', desc: 'ทำ Focus session ครั้งแรก', icon: '🎯' },
  { id: 'streak_7', title: '7 วันต่อเนื่อง', desc: 'Streak 7 วัน', icon: '🔥', bonus: 100 },
  { id: 'streak_30', title: 'หนึ่งเดือนเต็ม', desc: 'Streak 30 วัน', icon: '💎', bonus: 500 },
  { id: 'level_10', title: 'สัตว์โตแล้ว!', desc: 'สัตว์เลี้ยงถึง Level 10', icon: '⭐' },
  { id: 'coins_1000', title: 'เศรษฐีน้อย', desc: 'มีเหรียญ 1,000', icon: '🪙' },
  { id: 'focus_master', title: 'Focus Master', desc: 'โฟกัสครบ 100 ชั่วโมงรวม', icon: '🏆' },
]
