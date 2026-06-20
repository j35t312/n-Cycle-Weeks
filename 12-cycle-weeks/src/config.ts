export type CycleConfig = {
  cycleStart: string
  /** Number of weeks in one cycle. Max swappable span is derived as cycleLength * 7 days. */
  cycleLength: number
  /** Fixed last swappable calendar day (UTC date in ISO string). */
  lastSwappableDate?: string
}

export const twelveCycleConfig: CycleConfig = {
  cycleStart: '2026-03-23T00:00:00.000Z',
  cycleLength: 12,
  lastSwappableDate: '2026-09-10T00:00:00.000Z',
}

export type RotationImportConfig = {
  idColumn: string
  firstDayColumn: string
  dataStartRow: number
}

export const rotationImportConfig: RotationImportConfig = {
  idColumn: 'J',
  firstDayColumn: 'K',
  dataStartRow: 3,
}
