import { Platform, NativeModules, Linking } from 'react-native'

const { AppBlockModule } = NativeModules

export async function checkAccessibilityPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false
  try {
    return await AppBlockModule?.isAccessibilityEnabled?.() ?? false
  } catch {
    return false
  }
}

export async function openAccessibilitySettings(): Promise<void> {
  if (Platform.OS === 'android') {
    Linking.openSettings()
  }
}

export async function startBlocking(packages: string[]): Promise<void> {
  if (Platform.OS !== 'android') return
  try {
    await AppBlockModule?.startBlocking?.(packages)
  } catch {
    console.warn('App blocking unavailable — Accessibility Service not enabled')
  }
}

export async function stopBlocking(): Promise<void> {
  if (Platform.OS !== 'android') return
  try {
    await AppBlockModule?.stopBlocking?.()
  } catch {
    // ignore
  }
}
