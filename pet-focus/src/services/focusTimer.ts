import { AppState, AppStateStatus, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null
let onTickCallback: (() => void) | null = null
let onFailCallback: (() => void) | null = null
let onCompleteCallback: (() => void) | null = null
let didLeaveApp = false

export async function scheduleFocusNotification(minutes: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🐱 กำลังโฟกัส...',
      body: `เหลืออีก ${minutes} นาที โปโป้รอนายอยู่!`,
      sticky: true,
    },
    trigger: null,
  })
}

export async function cancelFocusNotification() {
  await Notifications.dismissAllNotificationsAsync()
}

export function startFocusTimer(
  onTick: () => void,
  onFail: () => void,
  onComplete: () => void
) {
  didLeaveApp = false
  onTickCallback = onTick
  onFailCallback = onFail
  onCompleteCallback = onComplete

  appStateSubscription = AppState.addEventListener('change', handleAppStateChange)

  timerInterval = setInterval(() => {
    if (onTickCallback) onTickCallback()
  }, 1000)
}

function handleAppStateChange(state: AppStateStatus) {
  if (state === 'background' || state === 'inactive') {
    didLeaveApp = true
  }
  if (state === 'active' && didLeaveApp) {
    stopFocusTimer()
    if (onFailCallback) onFailCallback()
    didLeaveApp = false
  }
}

export function stopFocusTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (appStateSubscription) {
    appStateSubscription.remove()
    appStateSubscription = null
  }
  cancelFocusNotification()
}

export function signalComplete() {
  stopFocusTimer()
  if (onCompleteCallback) onCompleteCallback()
}
