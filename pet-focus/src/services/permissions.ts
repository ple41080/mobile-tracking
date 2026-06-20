import { Platform, PermissionsAndroid, NativeModules, Linking, Alert } from 'react-native'

const { AppBlockModule } = NativeModules

export async function checkNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true
  if (Platform.Version >= 33) {
    try {
      const runtime = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      )
      if (!runtime) return false
    } catch {
      return false
    }
  }
  try {
    if (AppBlockModule?.areNotificationsEnabled) {
      return await AppBlockModule.areNotificationsEnabled()
    }
  } catch {
    return false
  }
  return true
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true
  if (Platform.Version < 33) return true

  const alreadyGranted = await checkNotificationPermission()
  if (alreadyGranted) return true

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'อนุญาตการแจ้งเตือน',
      message: 'ใช้แสดงเวลานับถอยหลัง Focus session ขณะแอปทำงานเบื้องหลัง',
      buttonPositive: 'อนุญาต',
      buttonNegative: 'ไม่ใช่ตอนนี้',
    }
  )

  if (result === PermissionsAndroid.RESULTS.GRANTED) return true

  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    Alert.alert(
      'เปิดการแจ้งเตือนใน Settings',
      'ไปที่ Settings → แอป pet-focus → Notifications แล้วเปิดการแจ้งเตือน',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ไปที่ Settings', onPress: () => openNotificationSettings() },
      ]
    )
  }

  return false
}

export async function openNotificationSettings(): Promise<void> {
  try {
    if (AppBlockModule?.openNotificationSettings) {
      await AppBlockModule.openNotificationSettings()
      return
    }
    await Linking.openSettings()
  } catch {
    await Linking.openSettings()
  }
}
