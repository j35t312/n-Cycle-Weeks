import type { CycleConfig } from './config'
import { twelveCycleConfig } from './config'
import {
  addLocalDays,
  daysBetween,
  getCycleDayCount,
  getCycleStartDate,
  getSwappableRange,
  startOfLocalDay,
  toDateKey,
  type SwapSelectionMap,
} from './utils'

export type SwapPattern = {
  id: string
  name: string
  slots: number[]
}

function patternsStorageKey(config: CycleConfig): string {
  return `swap-patterns-${config.cycleStart}-${config.cycleLength}`
}

function isSwapPattern(value: unknown): value is SwapPattern {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SwapPattern).id === 'string' &&
    typeof (value as SwapPattern).name === 'string' &&
    Array.isArray((value as SwapPattern).slots) &&
    (value as SwapPattern).slots.every((slot) => typeof slot === 'number')
  )
}

export function getCycleDayOffset(date: Date, config: CycleConfig): number {
  const daysSinceStart = daysBetween(getCycleStartDate(config), date)
  const cycleDays = getCycleDayCount(config)
  return ((daysSinceStart % cycleDays) + cycleDays) % cycleDays
}

export function selectionsToPatternSlots(
  selections: SwapSelectionMap,
  config: CycleConfig = twelveCycleConfig
): number[] {
  const slots = new Set<number>()

  for (const [dateKey, selected] of Object.entries(selections)) {
    if (!selected) continue
    const date = startOfLocalDay(new Date(`${dateKey}T00:00:00`))
    slots.add(getCycleDayOffset(date, config))
  }

  return [...slots].sort((a, b) => a - b)
}

export function applyPatternSlots(
  slots: number[],
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): SwapSelectionMap {
  const slotSet = new Set(slots)
  const { start, end } = getSwappableRange(config, reference)
  const selections: SwapSelectionMap = {}

  for (let date = start; date.getTime() <= end.getTime(); date = addLocalDays(date, 1)) {
    if (slotSet.has(getCycleDayOffset(date, config))) {
      selections[toDateKey(date)] = true
    }
  }

  return selections
}

export function loadPatterns(config: CycleConfig = twelveCycleConfig): SwapPattern[] {
  try {
    const raw = localStorage.getItem(patternsStorageKey(config))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSwapPattern)
  } catch {
    return []
  }
}

export function persistPatterns(
  patterns: SwapPattern[],
  config: CycleConfig = twelveCycleConfig
): void {
  localStorage.setItem(patternsStorageKey(config), JSON.stringify(patterns))
}

export function createPattern(
  name: string,
  slots: number[],
  patterns: SwapPattern[],
  config: CycleConfig = twelveCycleConfig
): { patterns: SwapPattern[]; pattern: SwapPattern } {
  const pattern: SwapPattern = {
    id: crypto.randomUUID(),
    name: name.trim(),
    slots,
  }
  const next = [...patterns, pattern]
  persistPatterns(next, config)
  return { patterns: next, pattern }
}

export function updatePattern(
  id: string,
  slots: number[],
  patterns: SwapPattern[],
  config: CycleConfig = twelveCycleConfig
): SwapPattern[] {
  const next = patterns.map((pattern) =>
    pattern.id === id ? { ...pattern, slots } : pattern
  )
  persistPatterns(next, config)
  return next
}

export function deletePattern(
  id: string,
  patterns: SwapPattern[],
  config: CycleConfig = twelveCycleConfig
): SwapPattern[] {
  const next = patterns.filter((pattern) => pattern.id !== id)
  persistPatterns(next, config)
  return next
}
