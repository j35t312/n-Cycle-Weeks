import { Fragment, type FC } from 'react'
import type { CalendarWeek } from './utils'
import { formatCalendarDate } from './utils'
import './SwapCalendar.css'

interface SwapCalendarProps {
  weeks: CalendarWeek[]
  onCellClick?: (dateKey: string, current: boolean) => void
  /** When false, only existing swaps can be removed; new swaps are locked. */
  canSwap?: boolean
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SwapCalendar: FC<SwapCalendarProps> = ({ weeks, onCellClick, canSwap = false }) => {
  return (
    <div className="swap-calendar">
      <div className="swap-calendar__grid">
        <div className="swap-calendar__corner" />
        {DAY_LABELS.map((label) => (
          <div key={label} className="swap-calendar__day-header">
            {label}
          </div>
        ))}

        {weeks.map((week, weekIndex) => (
          <Fragment key={week.weekStartDate.toISOString()}>
            <div className="swap-calendar__week-label">
              <span className="swap-calendar__week-number">W{week.cycleWeekNumber}</span>
              <span className="swap-calendar__week-date">
                {formatCalendarDate(week.weekStartDate)}
              </span>
            </div>
            {week.days.map((cell, dayIndex) => {
              if (!cell) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="swap-calendar__cell swap-calendar__cell--empty" />
              }

              const { dateKey, date, wantsSwap, shiftLabel } = cell
              const isWeekend = dayIndex >= 5
              // New swaps require a loaded rotation; existing swaps can always be removed.
              const interactive = canSwap || wantsSwap

              return (
                <button
                  key={dateKey}
                  className={[
                    'swap-calendar__cell',
                    wantsSwap ? 'swap-calendar__cell--active' : '',
                    isWeekend ? 'swap-calendar__cell--weekend' : '',
                    interactive ? 'swap-calendar__cell--clickable' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={interactive ? () => onCellClick?.(dateKey, wantsSwap) : undefined}
                  disabled={!interactive}
                  title={`${formatCalendarDate(date)} — ${wantsSwap ? 'Wants swap' : 'No swap'}${shiftLabel ? ` (${shiftLabel})` : ''}`}
                  aria-pressed={wantsSwap}
                  aria-label={`${DAY_LABELS[dayIndex]}, cycle week ${week.cycleWeekNumber}, ${formatCalendarDate(date)}, ${wantsSwap ? 'wants swap' : 'no swap'}${shiftLabel ? `, shift ${shiftLabel}` : ''}`}
                >
                  <span className="swap-calendar__cell-date">{formatCalendarDate(date)}</span>
                  {wantsSwap && shiftLabel ? (
                    <span className="swap-calendar__cell-shift">{shiftLabel}</span>
                  ) : null}
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default SwapCalendar
