import { twelveCycleConfig } from "./config"

type Week = boolean[]
type SwapCalendarCycle = Week[]
export function createSwapCalendarCycle(): SwapCalendarCycle {
    const swapCalendarCycle: SwapCalendarCycle = []
    for (let i = 0; i < twelveCycleConfig.cycleLength; i++) {
        const week: Week = []
        for (let i = 0; i < 7; i++) {
            week.push(false)
        }
        swapCalendarCycle.push(week)
    }
    return swapCalendarCycle
}