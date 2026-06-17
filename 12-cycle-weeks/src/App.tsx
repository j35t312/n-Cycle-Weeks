import { useMemo, useState, useEffect } from 'react'
import { twelveCycleConfig } from './config'
import {
  buildCalendarWeeks,
  formatCalendarDateLong,
  getCycleStartDate,
  getSwappableRange,
  pruneSelections,
  type SwapSelectionMap,
} from './utils'
import SwapCalendar from './SwapCalendar'

const STORAGE_KEY = `swap-calendar-v2-${twelveCycleConfig.cycleStart}`

function loadFromStorage(): SwapSelectionMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return pruneSelections(parsed as SwapSelectionMap)
    }
    return {}
  } catch {
    return {}
  }
}

function saveToStorage(selections: SwapSelectionMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
}

function App() {
  const [selections, setSelections] = useState<SwapSelectionMap>(() => loadFromStorage())
  const [savedSelections, setSavedSelections] = useState<SwapSelectionMap>(() => loadFromStorage())
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [resetPending, setResetPending] = useState(false)

  const calendarWeeks = useMemo(
    () => buildCalendarWeeks(selections, twelveCycleConfig),
    [selections]
  )

  const { start: swappableStart, end: swappableEnd } = getSwappableRange(twelveCycleConfig)

  const hasUnsavedChanges = JSON.stringify(selections) !== JSON.stringify(savedSelections)

  useEffect(() => {
    if (saveStatus === 'saved') {
      const t = setTimeout(() => setSaveStatus('idle'), 2000)
      return () => clearTimeout(t)
    }
  }, [saveStatus])

  useEffect(() => {
    if (!resetPending) return
    const t = setTimeout(() => setResetPending(false), 3000)
    return () => clearTimeout(t)
  }, [resetPending])

  function handleCellClick(dateKey: string) {
    setSelections((prev) => {
      const next = { ...prev }
      if (next[dateKey]) {
        delete next[dateKey]
      } else {
        next[dateKey] = true
      }
      return next
    })
  }

  function handleSave() {
    const pruned = pruneSelections(selections)
    saveToStorage(pruned)
    setSelections(pruned)
    setSavedSelections(pruned)
    setSaveStatus('saved')
  }

  function handleResetClick() {
    if (!resetPending) {
      setResetPending(true)
      return
    }
    const fresh: SwapSelectionMap = {}
    setSelections(fresh)
    saveToStorage(fresh)
    setSavedSelections(fresh)
    setSaveStatus('idle')
    setResetPending(false)
  }

  const cycleStartLabel = formatCalendarDateLong(getCycleStartDate(twelveCycleConfig))

  return (
    <div style={{ padding: '32px', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h1 style={{ margin: '0 0 8px' }}>Shift Swap Calendar</h1>
          <p style={{ color: 'var(--text)', margin: 0 }}>
            Cycle starting {cycleStartLabel}
            {' · '}{twelveCycleConfig.cycleLength} weeks
          </p>
          <p style={{ color: 'var(--text)', margin: '4px 0 0', opacity: 0.75 }}>
            Swappable {formatCalendarDateLong(swappableStart)} through {formatCalendarDateLong(swappableEnd)}
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

      <SwapCalendar weeks={calendarWeeks} onCellClick={handleCellClick} />
    </div>
  )
}

export default App
