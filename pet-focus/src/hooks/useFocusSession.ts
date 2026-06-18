import { useEffect } from 'react'
import { Alert, Linking, Platform } from 'react-native'
import { useFocusStore, getCoinsForDuration } from '@/stores/focusStore'
import { usePetStore } from '@/stores/petStore'
import { startFocusTimer, stopFocusTimer } from '@/services/focusTimer'
import { DEFAULT_BLOCKED_APPS } from '@/types/focus'

const { NativeModules } = require('react-native')
const { AppBlockModule } = NativeModules

async function checkAndPromptUsageAccess(): Promise<void> {
  if (Platform.OS !== 'android' || !AppBlockModule) return
  try {
    const enabled = await AppBlockModule.isUsageAccessEnabled()
    if (!enabled) {
      Alert.alert(
        'แนะนำ: เปิด Usage Access',
        'หากต้องการให้ Focus Mode ตรวจจับแอปที่ห้ามเปิด กรุณาเปิด "Usage Access" ให้ pet-focus\n\nSettings → Apps → Special app access → Usage access\n\n(ข้ามได้ — Focus Mode ยังทำงานปกติ)',
        [
          { text: 'ข้าม', style: 'cancel' },
          {
            text: 'ไปที่ Settings',
            onPress: () => AppBlockModule.openUsageAccessSettings(),
          },
        ]
      )
    }
  } catch {
    // ignore
  }
}

export function useFocusSession() {
  const {
    status,
    selectedMinutes,
    remainingSeconds,
    startSession,
    tickSecond,
    completeSession,
    failSession,
    resetSession,
    selectDuration,
  } = useFocusStore()

  const { addCoins, addExp, updateHappiness } = usePetStore()

  useEffect(() => {
    if (status !== 'in_progress') return

    const packages = DEFAULT_BLOCKED_APPS.map((a) => a.packageName)
    const totalSeconds = selectedMinutes * 60

    startFocusTimer(
      () => {
        useFocusStore.getState().tickSecond()
        const { status: s, remainingSeconds: r } = useFocusStore.getState()
        if (s === 'completed' || r === 0) {
          handleComplete()
        }
      },
      handleFail,
      handleComplete,
      packages,
      totalSeconds
    )

    return () => {
      stopFocusTimer().catch(() => {})
    }
  }, [status])

  function handleComplete() {
    stopFocusTimer().catch(() => {})
    const coins = getCoinsForDuration(selectedMinutes)
    addCoins(coins)
    addExp(coins * 2)
    updateHappiness(10)
    completeSession()
  }

  function handleFail() {
    failSession()
  }

  async function begin() {
    checkAndPromptUsageAccess()
    startSession()
  }

  function cancel() {
    stopFocusTimer().catch(() => {})
    resetSession()
  }

  return {
    status,
    selectedMinutes,
    remainingSeconds,
    begin,
    cancel,
    reset: resetSession,
    selectDuration,
  }
}
