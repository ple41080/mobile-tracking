import ImageLabeling from '@react-native-ml-kit/image-labeling'
import { ChoreQuest } from '@/types/focus'
import { verifyFace } from '@/services/faceVerifier'

export type DetectedLabel = { text: string; confidence: number }

export interface ChoreVerifyResult {
  passed: boolean
  reason?: string
  faceSimilarity?: number
  matchedLabels?: string[]
  detectedLabels?: DetectedLabel[]
}

function logMlKitLabels(quest: ChoreQuest, labels: DetectedLabel[], matchedLabels: string[]) {
  const sorted = [...labels].sort((a, b) => b.confidence - a.confidence)
  const lines = sorted.map((l) => `  ${l.text} (${Math.round(l.confidence * 100)}%)`)

  // console.log(
  //   `[ChoreVerify] quest=${quest.id} (${quest.title})\n` +
  //     `  expected: ${quest.expectedLabels.join(', ')} (need ${quest.minLabelMatches} @ ≥${Math.round(quest.minConfidence * 100)}%)\n` +
  //     `  matched: ${matchedLabels.length ? matchedLabels.join(', ') : '(none)'}\n` +
  //     `  ML Kit labels (${sorted.length}):\n${lines.join('\n') || '  (empty)'}`
  // )
}

function formatDetectedLabelsHint(labels: DetectedLabel[], limit = 8): string {
  const top = [...labels]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit)
    .map((l) => `${l.text} ${Math.round(l.confidence * 100)}%`)
  if (top.length === 0) return ''
  return `\n\nML Kit เห็น:\n${top.join('\n')}`
}

export async function verifyChoreLabels(
  uri: string,
  quest: ChoreQuest
): Promise<{
  matched: boolean
  matchedLabels: string[]
  detectedLabels: DetectedLabel[]
  reason?: string
}> {
  const raw = await ImageLabeling.label(uri)
  const detectedLabels: DetectedLabel[] = raw.map((label) => ({
    text: label.text,
    confidence: label.confidence,
  }))

  const matchedLabels = detectedLabels
    .filter(
      (label) =>
        label.confidence >= quest.minConfidence &&
        quest.expectedLabels.some((expected) =>
          label.text.toLowerCase().includes(expected.toLowerCase())
        )
    )
    .map((label) => label.text)

  // logMlKitLabels(quest, detectedLabels, matchedLabels)

  if (matchedLabels.length >= quest.minLabelMatches) {
    return { matched: true, matchedLabels, detectedLabels }
  }

  const reason =
    'ไม่พบหลักฐานงานบ้านที่ตรงเควส'
    //  +
    // (__DEV__ ? formatDetectedLabelsHint(detectedLabels) : '')

  return {
    matched: false,
    matchedLabels,
    detectedLabels,
    reason,
  }
}

export async function verifyChorePhoto(
  quest: ChoreQuest,
  uri: string
): Promise<ChoreVerifyResult> {
  const face = await verifyFace(uri)
  if (!face.matched) {
    return {
      passed: false,
      reason: face.reason ?? 'ใบหน้าไม่ตรงกับที่ลงทะเบียน',
      faceSimilarity: face.similarity,
    }
  }

  const chore = await verifyChoreLabels(uri, quest)
  if (!chore.matched) {
    return {
      passed: false,
      reason: chore.reason,
      faceSimilarity: face.similarity,
      matchedLabels: chore.matchedLabels,
      detectedLabels: chore.detectedLabels,
    }
  }

  return {
    passed: true,
    faceSimilarity: face.similarity,
    matchedLabels: chore.matchedLabels,
    detectedLabels: chore.detectedLabels,
  }
}
