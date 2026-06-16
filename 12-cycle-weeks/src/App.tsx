import { useState } from 'react'
import { twelveCycleConfig } from './config'
import { createSwapCalendarCycle } from './utils'
import SwapCalendar from './SwapCalendar'

function App() {
  const [cycle, setCycle] = useState(() => createSwapCalendarCycle())

  function handleCellClick(weekIndex: number, dayIndex: number, current: boolean) {
    setCycle(prev =>
      prev.map((week, wi) =>
        wi === weekIndex
          ? week.map((day, di) => (di === dayIndex ? !day : day))
          : week
      )
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ marginBottom: '25px' }}>Shift Swap Calendar</h1>
      <p style={{ marginBottom: '32px', color: 'var(--text)' }}>
        Cycle starting {new Date(twelveCycleConfig.cycleStart).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
        {' · '}{twelveCycleConfig.cycleLength} weeks
      </p>
      <SwapCalendar
        cycle={cycle}
        cycleStart={twelveCycleConfig.cycleStart}
        onCellClick={handleCellClick}
      />
    </div>
  )
}

export default App
