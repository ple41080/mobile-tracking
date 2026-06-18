import { NativeModules, NativeEventEmitter, Platform } from 'react-native'

const { AppBlockModule } = NativeModules
const emitter = AppBlockModule ? new NativeEventEmitter(AppBlockModule) : null

let tickSub: ReturnType<NonNullable<typeof emitter>['addListener']> | null = null
let blockSub: ReturnType<NonNullable<typeof emitter>['addListener']> | null = null
let jsInterval: ReturnType<typeof setInterval> | null = null
let onTickCallback: (() => void) | null = null
let onFailCallback: (() => void) | null = null
let onCompleteCallback: (() => void) | null = null

export async function startFocusTimer(
  onTick: () => void,
  onFail: () => void,
  onComplete: () => void,
  blockedPackages: string[] = [],
  totalSeconds: number = 1800
) {
  onTickCallback = onTick
  onFailCallback = onFail
  onCompleteCallback = onComplete

  if (Platform.OS === 'android' && AppBlockModule && emitter) {
    await AppBlockModule.startBlocking(blockedPackages)
    await AppBlockModule.startFocusService(totalSeconds)

    tickSub = emitter.addListener('onFocusTick', () => {
      onTickCallback?.()
    })

    blockSub = emitter.addListener('onBlockedAppDetected', () => {
      stopFocusTimer()
      onFailCallback?.()
    })
  } else {
    jsInterval = setInterval(() => {
      onTickCallback?.()
    }, 1000)
  }
}

export async function stopFocusTimer() {
  tickSub?.remove()
  blockSub?.remove()
  tickSub = null
  blockSub = null

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
  await stopFocusTimer()
  onCompleteCallback?.()
}
