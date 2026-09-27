/**
 * KIAI 1.5 — Data backup & restore utilities.
 * Export all user state to a stamped JSON file; import with merge or replace semantics.
 */
import { getState, setState, type AppState } from './store'

export interface KiaiBackup {
  /** Schema identifier so we can version-gate imports. */
  _kiai: 'backup'
  /** Semver of the app that generated this file. */
  version: string
  /** ISO 8601 timestamp of when the export was created. */
  exportedAt: string
  state: AppState
}

const APP_VERSION = '1.5.3'

// ─── Export ──────────────────────────────────────────────────────────────────

/** Serialises the current app state and triggers a browser file download. */
export function exportData(): void {
  const backup: KiaiBackup = {
    _kiai: 'backup',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    state: getState(),
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const date = new Date().toISOString().split('T')[0]
  const a = document.createElement('a')
  a.href = url
  a.download = `kiai-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Validate ─────────────────────────────────────────────────────────────────

function isValidBackup(data: unknown): data is KiaiBackup {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (d._kiai !== 'backup') return false
  if (!d.state || typeof d.state !== 'object') return false
  const s = d.state as Record<string, unknown>
  // Require the core user data arrays
  if (!Array.isArray(s.katas)) return false
  if (!Array.isArray(s.sessions)) return false
  return true
}

// ─── Import ───────────────────────────────────────────────────────────────────

export type ImportMode = 'replace' | 'merge'

/**
 * Parses a File as a KiaiBackup and applies it to the current app state.
 * @param file   The .json backup file selected by the user.
 * @param mode   'replace' overwrites all state; 'merge' combines lists by uuid/id.
 * @returns      A promise that resolves with a summary string on success, or rejects with an Error.
 */
export async function importData(file: File, mode: ImportMode): Promise<string> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('The selected file is not valid JSON.')
  }

  if (!isValidBackup(parsed)) {
    throw new Error('The selected file is not a valid Kiai backup. Make sure you exported it from the Kiai app.')
  }

  const backup = parsed as KiaiBackup

  if (mode === 'replace') {
    // Wholesale replace — keep schema version at current
    const incoming: AppState = {
      ...backup.state,
      version: 1,
    }
    setState(() => incoming)
    return `All data restored from backup (${backup.exportedAt.split('T')[0]}).`
  }

  // Merge mode — combine lists without duplicates
  const current = getState()
  const incomingState = backup.state

  // Merge katas by uuid (incoming wins on conflict)
  const kataMap = new Map(current.katas.map(k => [k.uuid, k]))
  for (const k of incomingState.katas ?? []) kataMap.set(k.uuid, k)

  // Merge custom exercises by slug (incoming wins)
  const exMap = new Map((current.customExercises ?? []).map(e => [e.slug, e]))
  for (const e of incomingState.customExercises ?? []) exMap.set(e.slug, e)

  // Merge sessions by uuid (incoming wins)
  const sessionMap = new Map(current.sessions.map(s => [s.uuid, s]))
  for (const s of incomingState.sessions ?? []) sessionMap.set(s.uuid, s)

  // Merge flexibility records by id (incoming wins)
  const flexMap = new Map((current.flexibilityRecords ?? []).map(r => [r.id, r]))
  for (const r of incomingState.flexibilityRecords ?? []) flexMap.set(r.id, r)

  // Merge premade timestamps — pick the most recent
  const premadeMap: Record<string, number> = { ...current.premadeLastPerformed }
  for (const [key, ts] of Object.entries(incomingState.premadeLastPerformed ?? {})) {
    if (!premadeMap[key] || (ts as number) > premadeMap[key]) premadeMap[key] = ts as number
  }

  const merged: AppState = {
    ...current,
    katas: Array.from(kataMap.values()),
    customExercises: Array.from(exMap.values()),
    sessions: Array.from(sessionMap.values()).sort((a, b) => a.startedAt - b.startedAt),
    flexibilityRecords: Array.from(flexMap.values()).sort((a, b) => a.recordedAt - b.recordedAt),
    premadeLastPerformed: premadeMap,
  }

  setState(() => merged)

  const katasDiff = merged.katas.length - current.katas.length
  const sessionsDiff = merged.sessions.length - current.sessions.length
  return `Merged: +${katasDiff} Kata${katasDiff === 1 ? '' : 's'}, +${sessionsDiff} session${sessionsDiff === 1 ? '' : 's'}.`
}
