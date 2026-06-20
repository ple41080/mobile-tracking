import { NativeModules, NativeEventEmitter, Platform, Alert } from 'react-native'

const { AppBlockModule } = NativeModules
const emitter = AppBlockModule ? new NativeEventEmitter(AppBlockModule) : null

let tickSub: ReturnType<NonNullable<typeof emitter>['addListener']> | null = null
let completeSub: ReturnType<NonNullable<typeof emitter>['addListener']> | null = null
let blockSub: ReturnType<NonNullable<typeof emitter>['addListener']> | null = null
let pauseSub: ReturnType<NonNullable<typeof emitter>['addListener']> | null = null
let resumeSub: ReturnType<NonNullable<typeof emitter>['addListener']> | null = null
let jsInterval: ReturnType<typeof setInterval> | null = null
let onTickCallback: (() => void) | null = null
let onFailCallback: (() => void) | null = null
let onCompleteCallback: (() => void) | null = null
let onPauseCallback: (() => void) | null = null
let onResumeCallback: (() => void) | null = null
let isPaused = false
let hasEnded = false

export async function startFocusTimer(
  onTick: () => void,
  onFail: () => void,
  onComplete: () => void,
  blockedPackages: string[] = [],
  totalSeconds: number = 1800,
  onPause?: () => void,
  onResume?: () => void
) {
  onTickCallback = onTick
  onFailCallback = onFail
  onCompleteCallback = onComplete
  onPauseCallback = onPause ?? null
  onResumeCallback = onResume ?? null
  isPaused = false
  hasEnded = false

  if (Platform.OS === 'android' && AppBlockModule && emitter) {
    try {
      await AppBlockModule.startFocusService(totalSeconds, blockedPackages)

      tickSub = emitter.addListener('onFocusTick', () => {
        if (!hasEnded) onTickCallback?.()
      })

      completeSub = emitter.addListener('onFocusComplete', () => {
        if (hasEnded) return
        hasEnded = true
        stopFocusTimer()
        onCompleteCallback?.()
      })

      blockSub = emitter.addListener('onBlockedAppDetected', () => {
        if (hasEnded) return
        hasEnded = true
        stopFocusTimer()
        onFailCallback?.()
      })

      pauseSub = emitter.addListener('onFocusPaused', () => {
        isPaused = true
        onPauseCallback?.()
      })

      resumeSub = emitter.addListener('onFocusResumed', () => {
        isPaused = false
        onResumeCallback?.()
      })
      return
    } catch (err) {
      if (__DEV__) console.warn('[focusTimer] native service failed:', err)
      if (Platform.OS === 'android') {
        Alert.alert(
          'ไม่สามารถแสดงการแจ้งเตือนได้',
          'กรุณาอนุญาตการแจ้งเตือนและ rebuild แอปด้วย npx expo run:android แล้วลองใหม่'
        )
      }
    }
  }

  jsInterval = setInterval(() => {
    if (!isPaused && !hasEnded) onTickCallback?.()
  }, 1000)
}

export async function stopFocusTimer() {
  tickSub?.remove()
  completeSub?.remove()
  blockSub?.remove()
  pauseSub?.remove()
  resumeSub?.remove()
  tickSub = null
  completeSub = null
  blockSub = null
  pauseSub = null
  resumeSub = null

  if (jsInterval) {
    clearInterval(jsInterval)
    jsInterval = null
  }

  if (Platform.OS === 'android' && AppBlockModule) {
    await AppBlockModule.stopFocusService().catch(() => {})
    await AppBlockModule.stopBlocking().catch(() => {})
  }
}

export async function signalComplete() {
  if (hasEnded) return
  hasEnded = true
  await stopFocusTimer()
  onCompleteCallback?.()
}
