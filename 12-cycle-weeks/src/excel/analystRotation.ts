import type { CycleConfig, RotationImportConfig } from '../config'
import {
  addLocalDays,
  getCycleDayCount,
  getSwappableRange,
  toDateKey,
  type ShiftLabelMap,
  type SwapSelectionMap,
} from '../utils'
import { getCycleDayOffset } from '../patterns'
import { columnLetterToIndex, getCellValue } from './parseWorkbook'
import { MAPPABLE_SHIFTS, type ApplyAnalystResult, type MappableShift, type ParsedSheet } from './types'

export function normalizeShift(value: string): string {
  return String(value ?? '').trim().toUpperCase()
}

export function isMappableShift(value: string): value is MappableShift {
  return (MAPPABLE_SHIFTS as string[]).includes(normalizeShift(value))
}

export function getLastDayColumnIndex(
  importConfig: RotationImportConfig,
  cycleConfig: CycleConfig
): number {
  return (
    columnLetterToIndex(importConfig.firstDayColumn) + getCycleDayCount(cycleConfig) - 1
  )
}

export function listAnalystIds(
  sheet: ParsedSheet,
  importConfig: RotationImportConfig
): string[] {
  const idCol = columnLetterToIndex(importConfig.idColumn)
  const ids = new Set<string>()
  const startRow = importConfig.dataStartRow - 1

  for (let rowIndex = startRow; rowIndex < sheet.rows.length; rowIndex++) {
    const id = getCellValue(sheet.rows, rowIndex, idCol)
    if (id) ids.add(id)
  }

  return [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

export function findAnalystRowIndex(
  sheet: ParsedSheet,
  analystId: string,
  importConfig: RotationImportConfig
): { rowIndex: number; duplicateCount: number } | null {
  const idCol = columnLetterToIndex(importConfig.idColumn)
  const startRow = importConfig.dataStartRow - 1
  let firstMatch = -1
  let duplicateCount = 0

  for (let rowIndex = startRow; rowIndex < sheet.rows.length; rowIndex++) {
    const id = getCellValue(sheet.rows, rowIndex, idCol)
    if (id !== analystId) continue
    if (firstMatch === -1) {
      firstMatch = rowIndex
    } else {
      duplicateCount++
    }
  }

  if (firstMatch === -1) return null
  return { rowIndex: firstMatch, duplicateCount }
}

export function getCycleDaysFromRow(
  sheet: ParsedSheet,
  rowIndex: number,
  importConfig: RotationImportConfig,
  cycleConfig: CycleConfig
): string[] {
  const firstCol = columnLetterToIndex(importConfig.firstDayColumn)
  const dayCount = getCycleDayCount(cycleConfig)
  const days: string[] = []

  for (let offset = 0; offset < dayCount; offset++) {
    days.push(getCellValue(sheet.rows, rowIndex, firstCol + offset))
  }

  return days
}

export function getAnalystCycleDays(
  sheet: ParsedSheet,
  analystId: string,
  importConfig: RotationImportConfig,
  cycleConfig: CycleConfig
): { cycleDays: string[]; duplicateCount: number } {
  const match = findAnalystRowIndex(sheet, analystId, importConfig)
  if (!match) {
    throw new Error(`No row found for analyst ID "${analystId}" in column ${importConfig.idColumn}`)
  }

  return {
    cycleDays: getCycleDaysFromRow(sheet, match.rowIndex, importConfig, cycleConfig),
    duplicateCount: match.duplicateCount,
  }
}

export function analystCycleDaysToSelections(
  cycleDays: string[],
  checkedShifts: ReadonlySet<MappableShift>,
  cycleConfig: CycleConfig,
  reference = new Date()
): ApplyAnalystResult {
  const { start, end } = getSwappableRange(cycleConfig, reference)
  const selections: SwapSelectionMap = {}
  const shiftLabels: ShiftLabelMap = {}
  let matchedDays = 0

  // The rotation row is a single-cycle template. Each matched dayIndex is a
  // cycle slot that repeats across every cycle, so we tile it over the
  // swappable window instead of anchoring only to the first cycle.
  const slotShift = new Map<number, MappableShift>()
  for (let dayIndex = 0; dayIndex < cycleDays.length; dayIndex++) {
    const shift = normalizeShift(cycleDays[dayIndex]) as MappableShift
    if (checkedShifts.has(shift)) {
      slotShift.set(dayIndex, shift)
    }
  }

  for (let date = start; date.getTime() <= end.getTime(); date = addLocalDays(date, 1)) {
    const shift = slotShift.get(getCycleDayOffset(date, cycleConfig))
    if (shift) {
      const dateKey = toDateKey(date)
      selections[dateKey] = true
      shiftLabels[dateKey] = shift
      matchedDays++
    }
  }

  return { selections, shiftLabels, matchedDays }
}

export function applyAnalystShiftsToCalendar(
  sheet: ParsedSheet,
  analystId: string,
  checkedShifts: ReadonlySet<MappableShift>,
  importConfig: RotationImportConfig,
  cycleConfig: CycleConfig,
  reference = new Date()
): ApplyAnalystResult & { duplicateCount: number } {
  const { cycleDays, duplicateCount } = getAnalystCycleDays(
    sheet,
    analystId,
    importConfig,
    cycleConfig
  )
  const result = analystCycleDaysToSelections(
    cycleDays,
    checkedShifts,
    cycleConfig,
    reference
  )
  return { ...result, duplicateCount }
}
