export type CycleConfig = {
  cycleStart: string
  cycleLength: number
  /** Max span from first swappable day when lastSwappableDate is not set (inclusive day count). */
  maxAllowedSwappableDay: number
  /** Fixed last swappable calendar day (UTC date in ISO string). */
  lastSwappableDate?: string
}

export const twelveCycleConfig: CycleConfig = {
  cycleStart: '2026-03-23T00:00:00.000Z',
  cycleLength: 12,
  maxAllowedSwappableDay: 84,
  lastSwappableDate: '2026-09-10T00:00:00.000Z',
}
