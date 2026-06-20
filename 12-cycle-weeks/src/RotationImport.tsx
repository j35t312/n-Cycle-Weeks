import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { rotationImportConfig, twelveCycleConfig } from './config'
import {
  applyAnalystShiftsToCalendar,
  listAnalystIds,
} from './excel/analystRotation'
import { parseWorkbookFile } from './excel/parseWorkbook'
import { MAPPABLE_SHIFTS, type MappableShift, type ParsedSheet } from './excel/types'
import type { ShiftLabelMap, SwapSelectionMap } from './utils'

interface RotationImportProps {
  onApply: (selections: SwapSelectionMap, shiftLabels: ShiftLabelMap) => void
}

function createDefaultCheckedShifts(): Record<MappableShift, boolean> {
  return {
    D: true,
    D2: true,
    D3: true,
    D4: true,
    E: true,
    N: true,
  }
}

function RotationImport({ onApply }: RotationImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [fileName, setFileName] = useState('')
  const [loadError, setLoadError] = useState('')
  const [selectedAnalystId, setSelectedAnalystId] = useState('')
  const [checkedShifts, setCheckedShifts] = useState(createDefaultCheckedShifts)
  const [applyMessage, setApplyMessage] = useState('')

  const analystIds = useMemo(
    () => (sheet ? listAnalystIds(sheet, rotationImportConfig) : []),
    [sheet]
  )

  const selectedShiftSet = useMemo(() => {
    const set = new Set<MappableShift>()
    for (const shift of MAPPABLE_SHIFTS) {
      if (checkedShifts[shift]) set.add(shift)
    }
    return set
  }, [checkedShifts])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setLoadError('')
    setApplyMessage('')
    if (!file) return

    try {
      const parsed = await parseWorkbookFile(file)
      setSheet(parsed)
      setFileName(file.name)
      setSelectedAnalystId('')
    } catch (error) {
      setSheet(null)
      setFileName('')
      setLoadError(error instanceof Error ? error.message : 'Failed to read workbook')
    } finally {
      event.target.value = ''
    }
  }

  function handleApply() {
    setApplyMessage('')
    if (!sheet || !selectedAnalystId) return
    if (selectedShiftSet.size === 0) {
      setApplyMessage('Select at least one shift type.')
      return
    }

    try {
      const result = applyAnalystShiftsToCalendar(
        sheet,
        selectedAnalystId,
        selectedShiftSet,
        rotationImportConfig,
        twelveCycleConfig
      )
      onApply(result.selections, result.shiftLabels)

      const duplicateNote =
        result.duplicateCount > 0
          ? ` Used first of ${result.duplicateCount + 1} rows with this ID.`
          : ''
      setApplyMessage(`Applied ${result.matchedDays} day(s) to the calendar.${duplicateNote}`)
    } catch (error) {
      setApplyMessage(error instanceof Error ? error.message : 'Failed to apply rotation')
    }
  }

  return (
    <div className="rotation-import">
      <h2 className="rotation-import__title">Import Rotation</h2>
      <div className="rotation-import__row">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="rotation-import__file-input"
          onChange={handleFileChange}
          aria-label="Upload rotation Excel file"
        />
        <button
          type="button"
          className="btn-reset"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Excel file
        </button>
        {fileName && (
          <span className="rotation-import__filename">
            {fileName}
            {sheet ? ` · ${sheet.sheetName}` : ''}
          </span>
        )}
      </div>

      {loadError && <p className="rotation-import__message rotation-import__message--error">{loadError}</p>}

      {sheet && (
        <>
          <div className="rotation-import__row">
            <label className="rotation-import__label" htmlFor="analyst-id">
              Analyst ID (column {rotationImportConfig.idColumn})
            </label>
            <select
              id="analyst-id"
              className="pattern-select"
              value={selectedAnalystId}
              onChange={(event) => {
                setSelectedAnalystId(event.target.value)
                setApplyMessage('')
              }}
            >
              <option value="">Select ID…</option>
              {analystIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="rotation-import__shifts">
            <legend className="rotation-import__label">Map shift types to calendar</legend>
            <div className="rotation-import__checkboxes">
              {MAPPABLE_SHIFTS.map((shift) => (
                <label key={shift} className="rotation-import__checkbox">
                  <input
                    type="checkbox"
                    checked={checkedShifts[shift]}
                    onChange={(event) => {
                      setCheckedShifts((prev) => ({ ...prev, [shift]: event.target.checked }))
                      setApplyMessage('')
                    }}
                  />
                  {shift}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rotation-import__row">
            <button
              type="button"
              className="btn-reset"
              onClick={handleApply}
              disabled={!selectedAnalystId || selectedShiftSet.size === 0}
            >
              Apply to calendar
            </button>
            {applyMessage && (
              <span className="rotation-import__message">{applyMessage}</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default RotationImport
