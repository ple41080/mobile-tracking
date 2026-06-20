import { resolveAppLabel, type AppUsageDisplay } from '@shared/appLabels'

export type DayPoint = {
  date: string
  label: string
  value: number
}

export type StackedDayPoint = {
  date: string
  label: string
  completed: number
  failed: number
}

export type DashboardChartData = {
  focusStacked: StackedDayPoint[]
  focusMinutes: DayPoint[]
  avgScreenMinutes: DayPoint[]
  activeStudents: DayPoint[]
  topApps: AppUsageDisplay[]
}

type FocusRow = {
  status: string
  duration_minutes: number | null
  created_at: string
}

type UsageRow = {
  date: string
  total_screen_minutes: number | null
  focus_minutes: number | null
  top_apps: AppUsageDisplay[] | null
}

export function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function formatDayLabel(dateIso: string): string {
  const d = new Date(`${dateIso}T12:00:00`)
  return d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' })
}

function sessionDateKey(createdAt: string): string {
  return createdAt.slice(0, 10)
}

export function buildDashboardChartData(
  days: string[],
  focusSessions: FocusRow[],
  dailyUsage: UsageRow[]
): DashboardChartData {
  const focusByDay = new Map<string, { completed: number; failed: number; minutes: number }>()
  for (const day of days) {
    focusByDay.set(day, { completed: 0, failed: 0, minutes: 0 })
  }

  for (const row of focusSessions) {
    const key = sessionDateKey(row.created_at)
    const bucket = focusByDay.get(key)
    if (!bucket) continue
    if (row.status === 'completed') bucket.completed += 1
    if (row.status === 'failed') bucket.failed += 1
    bucket.minutes += row.duration_minutes ?? 0
  }

  const usageByDay = new Map<string, { screenTotal: number; count: number; active: number }>()
  for (const day of days) {
    usageByDay.set(day, { screenTotal: 0, count: 0, active: 0 })
  }

  const appTotals = new Map<string, AppUsageDisplay>()

  for (const row of dailyUsage) {
    const key = row.date
    const bucket = usageByDay.get(key)
    if (bucket) {
      bucket.screenTotal += row.total_screen_minutes ?? 0
      bucket.count += 1
      bucket.active += 1
    }

    for (const app of row.top_apps ?? []) {
      if (!app.packageName) continue
      const existing = appTotals.get(app.packageName)
      if (existing) {
        existing.minutes += app.minutes ?? 0
      } else {
        appTotals.set(app.packageName, {
          packageName: app.packageName,
          name: resolveAppLabel(app.packageName, app.name),
          minutes: app.minutes ?? 0,
          iconBase64: app.iconBase64,
        })
      }
    }
  }

  const focusStacked: StackedDayPoint[] = days.map((date) => {
    const bucket = focusByDay.get(date)!
    return {
      date,
      label: formatDayLabel(date),
      completed: bucket.completed,
      failed: bucket.failed,
    }
  })

  const focusMinutes: DayPoint[] = days.map((date) => ({
    date,
    label: formatDayLabel(date),
    value: focusByDay.get(date)!.minutes,
  }))

  const avgScreenMinutes: DayPoint[] = days.map((date) => {
    const bucket = usageByDay.get(date)!
    const avg = bucket.count > 0 ? Math.round(bucket.screenTotal / bucket.count) : 0
    return { date, label: formatDayLabel(date), value: avg }
  })

  const activeStudents: DayPoint[] = days.map((date) => ({
    date,
    label: formatDayLabel(date),
    value: usageByDay.get(date)!.active,
  }))

  const topApps = [...appTotals.values()]
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 5)

  return {
    focusStacked,
    focusMinutes,
    avgScreenMinutes,
    activeStudents,
    topApps,
  }
}
