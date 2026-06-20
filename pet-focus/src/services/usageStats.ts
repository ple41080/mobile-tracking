import { Platform, NativeModules, Linking, Alert } from 'react-native'
import { normalizeAppUsage } from '@shared/appLabels'
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
  if (Platform.OS !== 'android' || !AppBlockModule?.isUsageAccessEnabled) return false
  try {
    return await AppBlockModule.isUsageAccessEnabled()
  } catch {
    return false
  }
}

export async function requestUsageStatsPermission(): Promise<void> {
  if (Platform.OS !== 'android') return

  if (AppBlockModule?.openUsageAccessSettings) {
    try {
      await AppBlockModule.openUsageAccessSettings()
      return
    } catch {
      // fall through
    }
  }

  Alert.alert(
    'เปิด Usage Access',
    'ไปที่ Settings → Apps → Special app access → Usage access แล้วเปิดให้ pet-focus',
    [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ไปที่ Settings', onPress: () => Linking.openSettings() },
    ]
  )
}

export async function getTodayAppUsage(): Promise<AppUsage[]> {
  if (Platform.OS !== 'android' || !AppBlockModule?.getTodayUsage) return []
  try {
    const hasPermission = await checkUsageStatsPermission()
    if (!hasPermission) return []
    const raw: AppUsage[] = await AppBlockModule.getTodayUsage()
    return normalizeAppUsage(mergeAppUsage(raw ?? []))
  } catch {
    return []
  }
}

export async function getTotalScreenTimeToday(): Promise<number> {
  const apps = await getTodayAppUsage()
  return apps.reduce((sum, app) => sum + app.minutes, 0)
}
