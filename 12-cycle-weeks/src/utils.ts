import type { CycleConfig } from './config'
import { twelveCycleConfig } from './config'

const MS_PER_DAY = 86_400_000

export type SwapSelectionMap = Record<string, boolean>

/** Maps a date key to its shift code (e.g. "D2") from an imported rotation. */
export type ShiftLabelMap = Record<string, string>

export type CalendarCell = {
  dateKey: string
  date: Date
  wantsSwap: boolean
  shiftLabel?: string
}

export type CalendarWeek = {
  cycleWeekNumber: number
  weekStartDate: Date
  days: (CalendarCell | null)[]
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addLocalDays(date: Date, days: number): Date {
  const d = startOfLocalDay(date)
  d.setDate(d.getDate() + days)
  return d
}

/** First swappable day: tomorrow + 1 (two days after today). */
export function getFirstSwappableDay(reference = new Date()): Date {
  return addLocalDays(reference, 2)
}

export function getCycleStartDate(config: CycleConfig): Date {
  return parseConfigLocalDate(config.cycleStart)
}

function parseConfigLocalDate(iso: string): Date {
  const parsed = new Date(iso)
  return startOfLocalDay(
    new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  )
}

export function getLastSwappableDate(config: CycleConfig): Date | null {
  if (!config.lastSwappableDate) return null
  return parseConfigLocalDate(config.lastSwappableDate)
}

/** Total days in one cycle, derived from cycleLength (weeks × 7). */
export function getCycleDayCount(config: CycleConfig): number {
  return config.cycleLength * 7
}

export function daysBetween(start: Date, end: Date): number {
  return Math.round((startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime()) / MS_PER_DAY)
}

/** Cycle week W1..cycleLength; label uses the row's Monday (Option A). */
export function getCycleWeekNumber(date: Date, config: CycleConfig): number {
  const daysSinceStart = daysBetween(getCycleStartDate(config), date)
  const weekIndex = Math.floor(daysSinceStart / 7)
  const mod = ((weekIndex % config.cycleLength) + config.cycleLength) % config.cycleLength
  return mod + 1
}

export function getMondayOfWeek(date: Date): Date {
  const d = startOfLocalDay(date)
  const weekday = d.getDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  d.setDate(d.getDate() - daysFromMonday)
  return d
}

export function getSwappableRange(config: CycleConfig, reference = new Date()) {
  const start = getFirstSwappableDay(reference)
  // Default span is one full cycle (cycleLength weeks); a fixed lastSwappableDate overrides it.
  const endByCycle = addLocalDays(start, getCycleDayCount(config) - 1)
  const fixedEnd = getLastSwappableDate(config)
  const end = fixedEnd ?? endByCycle
  return { start, end: start.getTime() <= end.getTime() ? end : start }
}

export function isDateInSwappableRange(date: Date, config: CycleConfig, reference = new Date()) {
  const { start, end } = getSwappableRange(config, reference)
  const day = startOfLocalDay(date).getTime()
  return day >= start.getTime() && day <= end.getTime()
}

export function pruneSelections(
  selections: SwapSelectionMap,
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): SwapSelectionMap {
  const { start, end } = getSwappableRange(config, reference)
  const pruned: SwapSelectionMap = {}
  for (const [dateKey, wantsSwap] of Object.entries(selections)) {
    if (!wantsSwap) continue
    const date = startOfLocalDay(new Date(`${dateKey}T00:00:00`))
    if (date.getTime() >= start.getTime() && date.getTime() <= end.getTime()) {
      pruned[dateKey] = true
    }
  }
  return pruned
}

export function pruneShiftLabels(
  labels: ShiftLabelMap,
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): ShiftLabelMap {
  const { start, end } = getSwappableRange(config, reference)
  const pruned: ShiftLabelMap = {}
  for (const [dateKey, label] of Object.entries(labels)) {
    if (!label) continue
    const date = startOfLocalDay(new Date(`${dateKey}T00:00:00`))
    if (date.getTime() >= start.getTime() && date.getTime() <= end.getTime()) {
      pruned[dateKey] = label
    }
  }
  return pruned
}

export function buildCalendarWeeks(
  selections: SwapSelectionMap,
  config: CycleConfig = twelveCycleConfig,
  reference = new Date(),
  shiftLabels: ShiftLabelMap = {}
): CalendarWeek[] {
  const { start, end } = getSwappableRange(config, reference)
  const weeks: CalendarWeek[] = []

  let weekStart = getMondayOfWeek(start)
  const lastWeekStart = getMondayOfWeek(end)

  while (weekStart.getTime() <= lastWeekStart.getTime()) {
    const days: (CalendarCell | null)[] = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = addLocalDays(weekStart, dayIndex)
      const dateKey = toDateKey(date)

      if (date.getTime() < start.getTime() || date.getTime() > end.getTime()) {
        days.push(null)
      } else {
        const wantsSwap = selections[dateKey] ?? false
        days.push({
          dateKey,
          date,
          wantsSwap,
          shiftLabel: wantsSwap ? shiftLabels[dateKey] : undefined,
        })
      }
    }

    weeks.push({
      cycleWeekNumber: getCycleWeekNumber(weekStart, config),
      weekStartDate: weekStart,
      days,
    })

    weekStart = addLocalDays(weekStart, 7)
  }

  return weeks
}

export function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export function formatCalendarDateLong(date: Date): string {
  return date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
}
