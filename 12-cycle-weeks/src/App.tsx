import { useState, useEffect } from 'react'
import { twelveCycleConfig } from './config'
import { createSwapCalendarCycle } from './utils'
import SwapCalendar from './SwapCalendar'

type Week = boolean[]
type SwapCalendarCycle = Week[]

const STORAGE_KEY = `swap-calendar-${twelveCycleConfig.cycleStart}`

function loadFromStorage(): SwapCalendarCycle | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      Array.isArray(parsed) &&
      parsed.length === twelveCycleConfig.cycleLength &&
      parsed.every((w: unknown) => Array.isArray(w) && (w as unknown[]).every(d => typeof d === 'boolean'))
    ) {
      return parsed as SwapCalendarCycle
    }
    return null
  } catch {
    return null
  }
}

function saveToStorage(cycle: SwapCalendarCycle) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cycle))
}

function App() {
  const [cycle, setCycle] = useState<SwapCalendarCycle>(
    () => loadFromStorage() ?? createSwapCalendarCycle()
  )
  const [savedCycle, setSavedCycle] = useState<SwapCalendarCycle>(
    () => loadFromStorage() ?? createSwapCalendarCycle()
  )
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [resetPending, setResetPending] = useState(false)

  const hasUnsavedChanges = JSON.stringify(cycle) !== JSON.stringify(savedCycle)

  useEffect(() => {
    if (saveStatus === 'saved') {
      const t = setTimeout(() => setSaveStatus('idle'), 2000)
      return () => clearTimeout(t)
    }
  }, [saveStatus])

  // Cancel pending reset if user clicks elsewhere
  useEffect(() => {
    if (!resetPending) return
    const t = setTimeout(() => setResetPending(false), 3000)
    return () => clearTimeout(t)
  }, [resetPending])

  function handleCellClick(weekIndex: number, dayIndex: number) {
    setCycle(prev =>
      prev.map((week, wi) =>
        wi === weekIndex
          ? week.map((day, di) => (di === dayIndex ? !day : day))
          : week
      )
    )
  }

  function handleSave() {
    saveToStorage(cycle)
    setSavedCycle(cycle)
    setSaveStatus('saved')
  }

  function handleResetClick() {
    if (!resetPending) {
      setResetPending(true)
      return
    }
    // Second click — confirmed
    const fresh = createSwapCalendarCycle()
    setCycle(fresh)
    saveToStorage(fresh)
    setSavedCycle(fresh)
    setSaveStatus('idle')
    setResetPending(false)
  }

  const cycleStartLabel = new Date(twelveCycleConfig.cycleStart).toLocaleDateString('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  })

  return (
    <div style={{ padding: '32px', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h1 style={{ margin: '0 0 20px' }}>Shift Swap Calendar</h1>
          <p style={{ color: 'var(--text)', margin: 0 }}>
            Cycle starting {cycleStartLabel}
            {' · '}{twelveCycleConfig.cycleLength} weeks
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
          {hasUnsavedChanges && (
            <span style={{ fontSize: '13px', color: 'var(--text)', opacity: 0.6 }}>
              Unsaved changes
            </span>
          )}
          {saveStatus === 'saved' && !hasUnsavedChanges && (
            <span style={{ fontSize: '13px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Saved
            </span>
          )}
          <button
            className={`btn-reset${resetPending ? ' btn-reset--confirm' : ''}`}
            onClick={handleResetClick}
          >
            {resetPending ? 'Confirm reset?' : 'Reset'}
          </button>
          <button className="btn-save" onClick={handleSave} disabled={!hasUnsavedChanges}>
            Save
          </button>
        </div>
      </div>

      <SwapCalendar
        cycle={cycle}
        cycleStart={twelveCycleConfig.cycleStart}
        onCellClick={handleCellClick}
      />
    </div>
  )
}

export default App
