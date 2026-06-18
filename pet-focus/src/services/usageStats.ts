import { Platform, NativeModules } from 'react-native'
import { AppUsage } from '@/types/focus'

const { AppBlockModule } = NativeModules

function mergeAppUsage(apps: AppUsage[]): AppUsage[] {
  const byPackage = new Map<string, AppUsage>()
  for (const app of apps) {
    const existing = byPackage.get(app.packageName)
    if (existing) {
      existing.minutes += app.minutes
    } else {
      byPackage.set(app.packageName, { ...app })
    }
  }
  return [...byPackage.values()].sort((a, b) => b.minutes - a.minutes)
}

export async function checkUsageStatsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || !AppBlockModule) return false
  try {
    return await AppBlockModule.isUsageAccessEnabled()
  } catch {
    return false
  }
}

export async function requestUsageStatsPermission(): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockModule) return
  try {
    await AppBlockModule.openUsageAccessSettings()
  } catch {
    // ignore
  }
}

export async function getTodayAppUsage(): Promise<AppUsage[]> {
  if (Platform.OS !== 'android' || !AppBlockModule) return []
  try {
    const hasPermission = await checkUsageStatsPermission()
    if (!hasPermission) return []
    const raw: AppUsage[] = await AppBlockModule.getTodayUsage()
    return mergeAppUsage(raw ?? [])
  } catch {
    return []
  }
}

export async function getTotalScreenTimeToday(): Promise<number> {
  const apps = await getTodayAppUsage()
  return apps.reduce((sum, app) => sum + app.minutes, 0)
}
