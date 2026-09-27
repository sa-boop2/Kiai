import { useSyncExternalStore, useMemo } from 'react'
import { EXERCISES } from '../data/generated/exercises'
import { DEFAULT_SETTINGS } from '../data/settings'
import type { FlexibilityRecord, Kata, Profile, Session, Settings, StoredCredential } from '../data/types'

/**
 * Persisted app state — the web equivalent of the native app's SwiftData store.
 * Lives in localStorage under a versioned key. Content (exercises, techniques, arts…) is bundled
 * code, so only user data is stored here.
 */
export interface AppState {
  isPremium?: boolean
  version: 1
  profile: Profile
  settings: Settings
  /** User-created Kata's. Premade Kata's come from bundled content. */
  katas: Kata[]
  /** Premade key → last performed timestamp. */
  premadeLastPerformed: Record<string, number>
  sessions: Session[]
  /** Local email/password accounts, keyed by lower-cased email. See lib/auth.ts. */
  accounts: Record<string, StoredCredential>
  /** 1.1: Analytics → Flexibility check-ins. */
  flexibilityRecords: FlexibilityRecord[]
  /** 1.2: Custom exercises created by the user */
  customExercises: import('../data/types').Exercise[]
  favoriteExercises?: string[]
}

export const STORAGE_KEY = 'kiai.state.v1'

export function freshProfile(): Profile {
  return {
    name: '',
    primaryArt: null,
    avatar: null,
    avatarSymbol: null,
    avatarTint: null,
    createdAt: Date.now(),
    onboardingComplete: false,
    hasChosenSignInMethod: false,
    authProvider: 'guest',
    accountEmail: null,
    experienceLevel: 'beginner',
  }
}

export function freshState(): AppState {
  return {
    version: 1,
    profile: freshProfile(),
    settings: { ...DEFAULT_SETTINGS },
    katas: [],
    premadeLastPerformed: {},
    sessions: [],
    accounts: {},
    flexibilityRecords: [],
    customExercises: [],
    favoriteExercises: [],
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = freshState()
    // Merge defensively so older saves pick up newly added settings.
    return {
      version: 1,
      profile: { ...base.profile, ...parsed.profile },
      settings: { ...base.settings, ...parsed.settings },
      katas: Array.isArray(parsed.katas) ? parsed.katas : [],
      premadeLastPerformed: parsed.premadeLastPerformed ?? {},
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      accounts: parsed.accounts ?? {},
      flexibilityRecords: Array.isArray(parsed.flexibilityRecords) ? parsed.flexibilityRecords : [],
      customExercises: Array.isArray(parsed.customExercises) ? parsed.customExercises : [],
      favoriteExercises: Array.isArray(parsed.favoriteExercises) ? parsed.favoriteExercises : [],
      isPremium: parsed.isPremium ?? false,
    }
  } catch {
    return freshState()
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()
let persistTimer: number | undefined

function persistNow() {
  window.clearTimeout(persistTimer)
  persistTimer = undefined
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    // Quota exceeded (usually a huge avatar) — keep the app running in memory.
    console.warn('Kiai: could not save state', error)
  }
}

function schedulePersist() {
  window.clearTimeout(persistTimer)
  persistTimer = window.setTimeout(persistNow, 120)
}

// Flush pending writes when the app is backgrounded or closed (important on iOS).
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => persistTimer !== undefined && persistNow())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && persistTimer !== undefined) persistNow()
  })
  // Keep multiple open tabs in sync.
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    state = load()
    listeners.forEach((listener) => listener())
  })
}

export function getState(): AppState {
  return state
}

export function setState(updater: (current: AppState) => AppState) {
  const next = updater(state)
  if (next === state) return
  state = next
  listeners.forEach((listener) => listener())
  schedulePersist()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Subscribes a component to a slice of state. Selectors must return existing references
 * (e.g. `s => s.sessions`), not new objects, to avoid re-render loops.
 */
export function useAppState<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}

export const useProfile = () => useAppState((s) => s.profile)
export const useSettings = () => useAppState((s) => s.settings)
export const useSessions = () => useAppState((s) => s.sessions)
export const useUserKatas = () => useAppState((s) => s.katas)
export const usePremadeLastPerformed = () => useAppState((s) => s.premadeLastPerformed)
export const useFlexibilityRecords = () => useAppState((s) => s.flexibilityRecords)
export const useCustomExercises = () => useAppState((s) => s.customExercises)
export const useAllExercises = () => {
  const custom = useCustomExercises()
  return useMemo(() => [...EXERCISES, ...custom], [custom])
}


const EMPTY_FAVORITES: string[] = []
export const useFavoriteExercises = () => useAppState((s) => s.favoriteExercises ?? EMPTY_FAVORITES)


