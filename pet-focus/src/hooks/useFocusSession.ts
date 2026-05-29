import { useEffect, useRef } from 'react'
import { useFocusStore, getCoinsForDuration } from '@/stores/focusStore'
import { usePetStore } from '@/stores/petStore'
import { startFocusTimer, stopFocusTimer, signalComplete } from '@/services/focusTimer'
import { startBlocking, stopBlocking } from '@/services/appBlock'
import { DEFAULT_BLOCKED_APPS } from '@/types/focus'

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
  const didMount = useRef(false)

  useEffect(() => {
    if (status === 'in_progress') {
      const packages = DEFAULT_BLOCKED_APPS.map((a) => a.packageName)
      startBlocking(packages).catch(() => {})

      startFocusTimer(
        () => {
          useFocusStore.getState().tickSecond()
          const { status: s, remainingSeconds: r } = useFocusStore.getState()
          if (s === 'completed' || r === 0) {
            handleComplete()
          }
        },
        handleFail,
        handleComplete
      )
    }
    return () => {}
  }, [status])

  function handleComplete() {
    stopFocusTimer()
    stopBlocking().catch(() => {})
    const coins = getCoinsForDuration(selectedMinutes)
    addCoins(coins)
    addExp(coins * 2)
    updateHappiness(10)
    completeSession()
  }

  function handleFail() {
    stopBlocking().catch(() => {})
    updateHappiness(-5)
    failSession()
  }

  function begin() {
    startSession()
  }

  function cancel() {
    stopFocusTimer()
    stopBlocking().catch(() => {})
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
