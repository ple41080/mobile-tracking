import { resolveAppLabel, type AppUsageDisplay } from '@shared/appLabels'

export type { AppUsageDisplay }

export function displayAppUsage<T extends AppUsageDisplay>(apps: T[]): T[] {
  return apps.map((app) => ({
    ...app,
    name: resolveAppLabel(app.packageName, app.name),
  }))
}

export function formatUsageMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}ชม. ${m}น.` : `${m} น.`
}

export function appIconSrc(iconBase64?: string): string | null {
  if (!iconBase64) return null
  return `data:image/png;base64,${iconBase64}`
}

export function appInitial(name: string): string {
  return name.charAt(0).toUpperCase() || '?'
}

const AVATAR_COLORS = ['#5DB347', '#F5C518', '#F57C00', '#FF8C00', '#6366F1']

export function appAvatarColor(packageName: string): string {
  let hash = 0
  for (let i = 0; i < packageName.length; i++) {
    hash = packageName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
