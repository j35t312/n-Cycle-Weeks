import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { twelveCycleConfig } from './config'
import {
  applyPatternSlots,
  createPattern,
  deletePattern,
  loadPatterns,
  selectionsToPatternSlots,
  updatePattern,
  type SwapPattern,
} from './patterns'
import {
  compactStoredSelections,
  loadAndCompactSelections,
  persistSelections,
} from './storage'
import {
  buildCalendarWeeks,
  formatCalendarDateLong,
  getCycleStartDate,
  getSwappableRange,
  pruneSelections,
  type SwapSelectionMap,
} from './utils'
import SwapCalendar from './SwapCalendar'

const initialSelections = loadAndCompactSelections()

function App() {
  const [selections, setSelections] = useState<SwapSelectionMap>(initialSelections)
  const [savedSelections, setSavedSelections] = useState<SwapSelectionMap>(initialSelections)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')
  const [resetPending, setResetPending] = useState(false)
  const [patterns, setPatterns] = useState<SwapPattern[]>(() => loadPatterns())
  const [selectedPatternId, setSelectedPatternId] = useState('')
  const [savePatternModalOpen, setSavePatternModalOpen] = useState(false)
  const [newPatternName, setNewPatternName] = useState('')
  const patternNameInputRef = useRef<HTMLInputElement>(null)

  const calendarWeeks = useMemo(
    () => buildCalendarWeeks(selections, twelveCycleConfig),
    [selections]
  )

  const { start: swappableStart, end: swappableEnd } = getSwappableRange(twelveCycleConfig)
  const selectedPattern = patterns.find((pattern) => pattern.id === selectedPatternId)

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

  useEffect(() => {
    if (!savePatternModalOpen) return
    setNewPatternName('')
    const t = setTimeout(() => patternNameInputRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [savePatternModalOpen])

  useEffect(() => {
    if (selectedPatternId && !patterns.some((pattern) => pattern.id === selectedPatternId)) {
      setSelectedPatternId('')
    }
  }, [patterns, selectedPatternId])

  const syncSelectionCompaction = useCallback(() => {
    compactStoredSelections(twelveCycleConfig)
    setSelections((prev) => pruneSelections(prev))
    setSavedSelections((prev) => pruneSelections(prev))
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncSelectionCompaction()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    const interval = window.setInterval(syncSelectionCompaction, 60 * 60 * 1000)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearInterval(interval)
    }
  }, [syncSelectionCompaction])

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
    const pruned = persistSelections(selections)
    setSelections(pruned)
    setSavedSelections(pruned)
    setSaveStatus('saved')
  }

  function handleResetClick() {
    if (!resetPending) {
      setResetPending(true)
      return
    }
    const fresh = persistSelections({})
    setSelections(fresh)
    setSavedSelections(fresh)
    setSaveStatus('idle')
    setResetPending(false)
  }

  function handleApplyPattern() {
    if (!selectedPattern) return
    setSelections(applyPatternSlots(selectedPattern.slots, twelveCycleConfig))
  }

  function handleOpenSavePatternModal() {
    setSavePatternModalOpen(true)
  }

  function handleCloseSavePatternModal() {
    setSavePatternModalOpen(false)
    setNewPatternName('')
  }

  function handleConfirmSavePattern() {
    const name = newPatternName.trim()
    if (!name) return

    const slots = selectionsToPatternSlots(selections, twelveCycleConfig)
    const { patterns: nextPatterns, pattern } = createPattern(name, slots, patterns, twelveCycleConfig)
    setPatterns(nextPatterns)
    setSelectedPatternId(pattern.id)
    handleCloseSavePatternModal()
  }

  function handleUpdatePattern() {
    if (!selectedPattern) return
    const slots = selectionsToPatternSlots(selections, twelveCycleConfig)
    setPatterns(updatePattern(selectedPattern.id, slots, patterns, twelveCycleConfig))
  }

  function handleDeletePattern() {
    if (!selectedPattern) return
    setPatterns(deletePattern(selectedPattern.id, patterns, twelveCycleConfig))
    setSelectedPatternId('')
  }

  const cycleStartLabel = formatCalendarDateLong(getCycleStartDate(twelveCycleConfig))

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__main">
          <h1 className="app-header__title">Shift Swap Calendar</h1>
          <div className="app-header__meta">
            <p>
              Cycle starting {cycleStartLabel}
              {' · '}{twelveCycleConfig.cycleLength} weeks
            </p>
            <p>
              Swappable {formatCalendarDateLong(swappableStart)} through {formatCalendarDateLong(swappableEnd)}
            </p>
          </div>
        </div>
        <div className="app-header__actions">
          {hasUnsavedChanges && (
            <span className="app-header__status">Unsaved changes</span>
          )}
          {saveStatus === 'saved' && !hasUnsavedChanges && (
            <span className="app-header__status app-header__status--saved">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
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
      </header>

      <div className="pattern-toolbar">
        <select
          className="pattern-select"
          value={selectedPatternId}
          onChange={(event) => setSelectedPatternId(event.target.value)}
          aria-label="Select pattern"
        >
          <option value="">Select pattern…</option>
          {patterns.map((pattern) => (
            <option key={pattern.id} value={pattern.id}>
              {pattern.name}
            </option>
          ))}
        </select>
        <button
          className="btn-reset"
          onClick={handleApplyPattern}
          disabled={!selectedPattern}
        >
          Apply Pattern
        </button>
        <button className="btn-reset" onClick={handleOpenSavePatternModal}>
          Save Pattern
        </button>
        <button
          className="btn-reset"
          onClick={handleUpdatePattern}
          disabled={!selectedPattern}
        >
          Update Pattern
        </button>
        <button
          className="btn-reset btn-reset--confirm"
          onClick={handleDeletePattern}
          disabled={!selectedPattern}
        >
          Delete Pattern
        </button>
      </div>

      <SwapCalendar weeks={calendarWeeks} onCellClick={handleCellClick} />

      {savePatternModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseSavePatternModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-pattern-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="save-pattern-title">Save Pattern</h2>
            <p className="modal__hint">
              Snapshot the current calendar clicks as a reusable single-cycle pattern.
            </p>
            <label className="modal__label" htmlFor="pattern-name">
              Pattern name
            </label>
            <input
              ref={patternNameInputRef}
              id="pattern-name"
              className="modal__input"
              type="text"
              value={newPatternName}
              onChange={(event) => setNewPatternName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleConfirmSavePattern()
                if (event.key === 'Escape') handleCloseSavePatternModal()
              }}
              placeholder="e.g. Weekends off"
            />
            <div className="modal__actions">
              <button className="btn-reset" onClick={handleCloseSavePatternModal}>
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleConfirmSavePattern}
                disabled={!newPatternName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
