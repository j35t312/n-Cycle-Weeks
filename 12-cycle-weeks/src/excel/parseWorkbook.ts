import * as XLSX from 'xlsx'
import type { ParsedSheet } from './types'

export async function parseWorkbookFile(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('Workbook has no sheets')
  }

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  }) as string[][]

  return {
    sheetName,
    rows: rows.map((row) => row.map((cell) => String(cell ?? '').trim())),
  }
}

export function columnLetterToIndex(column: string): number {
  const normalized = column.trim().toUpperCase()
  let index = 0
  for (let i = 0; i < normalized.length; i++) {
    index = index * 26 + (normalized.charCodeAt(i) - 64)
  }
  return index - 1
}

export function getCellValue(rows: string[][], rowIndex: number, columnIndex: number): string {
  return String(rows[rowIndex]?.[columnIndex] ?? '').trim()
}
