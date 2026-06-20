/** quest_id → display title (sync with pet-focus CHORE_QUESTS) */
export const CHORE_QUEST_LABELS: Record<string, string> = {
  chore_sweep: 'กวาดบ้าน',
  chore_dishes: 'ล้างจาน',
  chore_desk: 'จัดโต๊ะเรียน',
  chore_laundry: 'รีดเสื้อผ้า',
}

export function resolveChoreQuestLabel(questId: string): string {
  return CHORE_QUEST_LABELS[questId] ?? questId
}
