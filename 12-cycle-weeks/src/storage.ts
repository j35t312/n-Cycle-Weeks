import type { CycleConfig } from './config'
import { twelveCycleConfig } from './config'
import {
  pruneSelections,
  pruneShiftLabels,
  type ShiftLabelMap,
  type SwapSelectionMap,
} from './utils'

function selectionsStorageKey(config: CycleConfig): string {
  return `swap-calendar-v2-${config.cycleStart}`
}

function shiftLabelsStorageKey(config: CycleConfig): string {
  return `swap-shift-labels-v1-${config.cycleStart}`
}

function parseRawSelections(raw: string | null): SwapSelectionMap {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as SwapSelectionMap
    }
    return {}
  } catch {
    return {}
  }
}

function readRawSelections(config: CycleConfig = twelveCycleConfig): SwapSelectionMap {
  return parseRawSelections(localStorage.getItem(selectionsStorageKey(config)))
}

function writeRawSelections(
  selections: SwapSelectionMap,
  config: CycleConfig = twelveCycleConfig
): void {
  localStorage.setItem(selectionsStorageKey(config), JSON.stringify(selections))
}

export function selectionsEqual(a: SwapSelectionMap, b: SwapSelectionMap): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Read disk, prune to current window, write back if stale keys were removed. */
export function compactStoredSelections(
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): SwapSelectionMap {
  const raw = readRawSelections(config)
  const pruned = pruneSelections(raw, config, reference)
  if (!selectionsEqual(raw, pruned)) {
    writeRawSelections(pruned, config)
  }
  return pruned
}

/** Load selections with silent disk compaction on startup. */
export function loadAndCompactSelections(
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): SwapSelectionMap {
  return compactStoredSelections(config, reference)
}

/** Prune then persist; returns the pruned map written to disk. */
export function persistSelections(
  selections: SwapSelectionMap,
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): SwapSelectionMap {
  const pruned = pruneSelections(selections, config, reference)
  writeRawSelections(pruned, config)
  return pruned
}

function parseRawShiftLabels(raw: string | null): ShiftLabelMap {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as ShiftLabelMap
    }
    return {}
  } catch {
    return {}
  }
}

function writeRawShiftLabels(labels: ShiftLabelMap, config: CycleConfig = twelveCycleConfig): void {
  localStorage.setItem(shiftLabelsStorageKey(config), JSON.stringify(labels))
}

/** Read disk, prune to current window, write back if stale keys were removed. */
export function compactStoredShiftLabels(
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): ShiftLabelMap {
  const raw = parseRawShiftLabels(localStorage.getItem(shiftLabelsStorageKey(config)))
  const pruned = pruneShiftLabels(raw, config, reference)
  if (JSON.stringify(raw) !== JSON.stringify(pruned)) {
    writeRawShiftLabels(pruned, config)
  }
  return pruned
}

export function loadAndCompactShiftLabels(
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): ShiftLabelMap {
  return compactStoredShiftLabels(config, reference)
}

export function persistShiftLabels(
  labels: ShiftLabelMap,
  config: CycleConfig = twelveCycleConfig,
  reference = new Date()
): ShiftLabelMap {
  const pruned = pruneShiftLabels(labels, config, reference)
  writeRawShiftLabels(pruned, config)
  return pruned
}
