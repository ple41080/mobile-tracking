import { todayKey } from '@/utils/imageTensor'

const EXIF_DATE_KEYS = ['DateTimeOriginal', 'DateTime', 'DateTimeDigitized']

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Local calendar date YYYY-MM-DD (matches how users think "today"). */
export function localTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function dateKeyLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function parseExifDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const normalized = value.trim().replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
  const asLocal = normalized.includes('T') ? normalized : normalized.replace(' ', 'T')
  const d = new Date(asLocal)
  return Number.isNaN(d.getTime()) ? null : d
}

function extractPhotoDate(exif: Record<string, unknown>): Date | null {
  for (const key of EXIF_DATE_KEYS) {
    const d = parseExifDate(exif[key])
    if (d) return d
  }

  for (const [key, value] of Object.entries(exif)) {
    if (/datetime/i.test(key)) {
      const d = parseExifDate(value)
      if (d) return d
    }
  }

  return null
}

export type PhotoFreshnessResult =
  | { ok: true; takenDate: string }
  | { ok: false; reason: string }

/** Gallery picks: require EXIF capture date = today. In-app camera skips this. */
export function verifyPhotoTakenToday(
  exif: Record<string, unknown> | null | undefined
): PhotoFreshnessResult {
  if (!exif || Object.keys(exif).length === 0) {
    return {
      ok: false,
      reason: 'ไม่พบวันที่ถ่ายในรูป — ใช้ปุ่ม「ถ่ายรูป」ในแอป หรือเลือกรูปที่ถ่ายวันนี้จากกล้อง',
    }
  }

  const takenAt = extractPhotoDate(exif)
  if (!takenAt) {
    if (__DEV__) {
      console.log('[PhotoFreshness] EXIF keys:', Object.keys(exif).join(', '))
    }
    return {
      ok: false,
      reason: 'ไม่พบวันที่ถ่ายในรูป — ใช้ปุ่ม「ถ่ายรูป」ในแอป หรือเลือกรูปที่ถ่ายวันนี้จากกล้อง',
    }
  }

  const takenDate = dateKeyLocal(takenAt)
  const today = localTodayKey()

  if (__DEV__) {
    console.log(`[PhotoFreshness] taken=${takenDate} today=${today} (store todayKey=${todayKey()})`)
  }

  if (takenDate !== today) {
    return {
      ok: false,
      reason: `รูปนี้ถ่ายเมื่อ ${takenDate} ไม่ใช่วันนี้ — ต้องใช้รูปที่ถ่ายวันนี้เท่านั้น`,
    }
  }

  return { ok: true, takenDate }
}
