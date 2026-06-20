import type { RotationImportConfig } from '../config'
import type { ShiftLabelMap, SwapSelectionMap } from '../utils'

export type MappableShift = 'D' | 'D2' | 'D3' | 'D4' | 'E' | 'N'

export const MAPPABLE_SHIFTS: MappableShift[] = ['D', 'D2', 'D3', 'D4', 'E', 'N']

export type ParsedSheet = {
  sheetName: string
  rows: string[][]
}

export type { RotationImportConfig }

export type ApplyAnalystResult = {
  selections: SwapSelectionMap
  shiftLabels: ShiftLabelMap
  matchedDays: number
}
