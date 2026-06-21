export type CycleConfig = {
  cycleStart: string
  /** Number of weeks in one cycle. Max swappable span is derived as cycleLength * 7 days. */
  cycleLength: number
  /**
   * Optional fixed last swappable calendar day (UTC date in ISO string). When
   * omitted, the last swappable day is dynamic: it rolls forward each day to a
   * full cycle (cycleLength weeks) counting today as day 1.
   */
  lastSwappableDate?: string
}

export const twelveCycleConfig: CycleConfig = {
  cycleStart: '2026-03-23T00:00:00.000Z',
  cycleLength: 12,
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
