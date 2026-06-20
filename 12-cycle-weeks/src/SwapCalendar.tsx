import { Fragment, type FC } from 'react'
import type { CalendarWeek } from './utils'
import { formatCalendarDate } from './utils'
import './SwapCalendar.css'

interface SwapCalendarProps {
  weeks: CalendarWeek[]
  onCellClick?: (dateKey: string, current: boolean) => void
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

const SwapCalendar: FC<SwapCalendarProps> = ({ weeks, onCellClick }) => {
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

              return (
                <button
                  key={dateKey}
                  className={[
                    'swap-calendar__cell',
                    wantsSwap ? 'swap-calendar__cell--active' : '',
                    isWeekend ? 'swap-calendar__cell--weekend' : '',
                    'swap-calendar__cell--clickable',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onCellClick?.(dateKey, wantsSwap)}
                  title={`${formatCalendarDate(date)} — ${wantsSwap ? 'Wants swap' : 'No swap'}${shiftLabel ? ` (${shiftLabel})` : ''}`}
                  aria-pressed={wantsSwap}
                  aria-label={`${DAY_LABELS[dayIndex]}, cycle week ${week.cycleWeekNumber}, ${formatCalendarDate(date)}, ${wantsSwap ? 'wants swap' : 'no swap'}${shiftLabel ? `, shift ${shiftLabel}` : ''}`}
                >
                  <span className="swap-calendar__cell-date">{formatCalendarDate(date)}</span>
                  {wantsSwap ? (
                    shiftLabel ? (
                      <span className="swap-calendar__cell-shift">{shiftLabel}</span>
                    ) : (
                      <SwapIcon />
                    )
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
