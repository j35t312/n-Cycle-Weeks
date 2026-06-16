type CycleConfig = {
    cycleStart: string;
    cycleLength: number
    maxAllowedSwappableDay: number
}

export const twelveCycleConfig: CycleConfig = {
    cycleStart: '2026-03-23T00:00:00.000Z',
    cycleLength: 12,
    maxAllowedSwappableDay: 90
}