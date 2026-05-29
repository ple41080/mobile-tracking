import { useState, useEffect } from 'react'
import { AppUsage } from '@/types/focus'
import { getTodayAppUsage, getTotalScreenTimeToday, checkUsageStatsPermission } from '@/services/usageStats'

export function useScreenTime() {
  const [apps, setApps] = useState<AppUsage[]>([])
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const perm = await checkUsageStatsPermission()
      setHasPermission(perm)
      const data = await getTodayAppUsage()
      setApps(data)
      const total = data.reduce((sum, a) => sum + a.minutes, 0)
      setTotalMinutes(total)
      setIsLoading(false)
    }
    load()
  }, [])

  async function refresh() {
    const data = await getTodayAppUsage()
    setApps(data)
    setTotalMinutes(data.reduce((sum, a) => sum + a.minutes, 0))
  }

  return { apps, totalMinutes, hasPermission, isLoading, refresh }
}
