import type { FC } from 'react'
import './SwapCalendar.css'

type Week = boolean[]
type SwapCalendarCycle = Week[]

interface SwapCalendarProps {
  cycle: SwapCalendarCycle
  /** ISO date string — day 0, week 0 of the cycle. Pass twelveCycleConfig.cycleStart directly. */
  cycleStart: string
  onCellClick?: (weekIndex: number, dayIndex: number, current: boolean) => void
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function SwapIcon() {
  return (
    <svg
      className="swap-icon"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Wants to swap"
    >
      <path
        d="M4 6h12M13 3l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 14H4M7 11l-3 3 3 3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * cycleStart is day 0 of week 0 of the cycle.
 * Cell (weekIndex, dayIndex) = cycleStart + (weekIndex * 7 + dayIndex) days.
 * Uses UTC milliseconds to avoid DST shifts.
 */
function getDateForCell(cycleStart: string, weekIndex: number, dayIndex: number): Date {
  const startMs = Date.parse(cycleStart)
  const offsetDays = weekIndex * 7 + dayIndex
  return new Date(startMs + offsetDays * 86_400_000)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

const SwapCalendar: FC<SwapCalendarProps> = ({ cycle, cycleStart, onCellClick }) => {
  return (
    <div className="swap-calendar">
      <div className="swap-calendar__grid">
        {/* Header row */}
        <div className="swap-calendar__corner" />
        {DAY_LABELS.map((label) => (
          <div key={label} className="swap-calendar__day-header">
            {label}
          </div>
        ))}

        {/* Week rows */}
        {cycle.map((week, weekIndex) => {
          const weekStartDate = getDateForCell(cycleStart, weekIndex, 0)

          return (
            <>
              <div key={`week-label-${weekIndex}`} className="swap-calendar__week-label">
                <span className="swap-calendar__week-number">W{weekIndex + 1}</span>
                <span className="swap-calendar__week-date">
                  {formatDate(weekStartDate)}
                </span>
              </div>
              {week.map((wantsSwap, dayIndex) => {
                const date = getDateForCell(cycleStart, weekIndex, dayIndex)
                const isWeekend = dayIndex >= 5

                return (
                  <button
                    key={`cell-${weekIndex}-${dayIndex}`}
                    className={[
                      'swap-calendar__cell',
                      wantsSwap ? 'swap-calendar__cell--active' : '',
                      isWeekend ? 'swap-calendar__cell--weekend' : '',
                      onCellClick ? 'swap-calendar__cell--clickable' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={
                      onCellClick
                        ? () => onCellClick(weekIndex, dayIndex, wantsSwap)
                        : undefined
                    }
                    title={`${formatDate(date)} — ${wantsSwap ? 'Wants swap' : 'No swap'}`}
                    aria-pressed={onCellClick ? wantsSwap : undefined}
                    aria-label={`${DAY_LABELS[dayIndex]} of week ${weekIndex + 1}, ${formatDate(date)}, ${wantsSwap ? 'wants swap' : 'no swap'}`}
                    disabled={!onCellClick}
                  >
                    {wantsSwap ? <SwapIcon /> : null}
                  </button>
                )
              })}
            </>
          )
        })}
      </div>
    </div>
  )
}

export default SwapCalendar
