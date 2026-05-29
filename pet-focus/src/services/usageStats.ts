import { Platform, NativeModules } from 'react-native'
import { AppUsage } from '@/types/focus'

const { UsageStatsModule } = NativeModules

export async function checkUsageStatsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false
  try {
    return await UsageStatsModule?.hasPermission?.() ?? false
  } catch {
    return false
  }
}

export async function requestUsageStatsPermission(): Promise<void> {
  if (Platform.OS !== 'android') return
  try {
    await UsageStatsModule?.requestPermission?.()
  } catch {
    // User must grant manually in Settings
  }
}

export async function getTodayAppUsage(): Promise<AppUsage[]> {
  if (Platform.OS !== 'android') return getMockUsageData()
  try {
    const hasPermission = await checkUsageStatsPermission()
    if (!hasPermission) return []
    const raw = await UsageStatsModule?.getTodayUsage?.()
    return raw ?? []
  } catch {
    return getMockUsageData()
  }
}

export async function getTotalScreenTimeToday(): Promise<number> {
  const apps = await getTodayAppUsage()
  return apps.reduce((sum, app) => sum + app.minutes, 0)
}

function getMockUsageData(): AppUsage[] {
  return [
    { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', minutes: 45 },
    { name: 'YouTube', packageName: 'com.google.android.youtube', minutes: 30 },
    { name: 'Instagram', packageName: 'com.instagram.android', minutes: 20 },
    { name: 'LINE', packageName: 'jp.naver.line.android', minutes: 15 },
    { name: 'Chrome', packageName: 'com.android.chrome', minutes: 12 },
  ]
}
