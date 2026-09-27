import { PREMADE_UUID_PREFIX, orderedItems } from '../data/content'
import { MINIMUM_ACTIVE_SECONDS } from '../data/levels'
import { DEFAULT_SETTINGS } from '../data/settings'
import type { Difficulty, FlexibilityBenchmark, FlexibilityRecord, Kata, Phase, Profile, Session, Settings, WorkoutItem } from '../data/types'
import { deleteEmailAccount, type SignInResult } from './auth'
import { freshState, getState, setState } from './store'

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function saveCustomExercise(exercise: import('../data/types').Exercise) {
  setState((s) => {
    const existing = s.customExercises.findIndex((e) => e.slug === exercise.slug)
    if (existing !== -1) {
      const next = [...s.customExercises]
      next[existing] = exercise
      return { ...s, customExercises: next }
    }
    return { ...s, customExercises: [...s.customExercises, exercise] }
  })
}

// Profile ----------------------------------------------------------------------------------------

export function updateProfile(patch: Partial<Profile>) {
  setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
}

export function completeOnboarding(
  name: string,
  avatar: { symbol: string; tint: string },
  primaryArt: string | null = null,
  experienceLevel: Difficulty = 'beginner'
) {
  updateProfile({
    name: name.trim(),
    primaryArt,
    experienceLevel,
    avatarSymbol: avatar.symbol,
    avatarTint: avatar.tint as Profile['avatarTint'],
    createdAt: Date.now(),
    onboardingComplete: true,
  })
}

// Account (1.1) ------------------------------------------------------------------------------

/** Applies a sign-in result. Name/email are only overwritten when the provider supplied one —
 * Apple/Google only send those on someone's very first authorization. */
export function applySignIn(result: SignInResult) {
  setState((s) => ({
    ...s,
    profile: {
      ...s.profile,
      hasChosenSignInMethod: true,
      authProvider: result.provider,
      accountEmail: result.email ?? s.profile.accountEmail,
      name: result.displayName && !s.profile.name.trim() ? result.displayName : s.profile.name,
    },
  }))
}

export function continueAsGuest() {
  updateProfile({ hasChosenSignInMethod: true })
}

/** Ends the session but keeps all data — it belongs to the account, not to being signed in. */
export function signOut() {
  updateProfile({ authProvider: 'guest', accountEmail: null })
}

/** Destructive: removes the local email credential (if any) and erases all local data. */
export function deleteAccount() {
  const email = getState().profile.accountEmail
  if (getState().profile.authProvider === 'email' && email) deleteEmailAccount(email)
  eraseUserData()
}

// Settings ---------------------------------------------------------------------------------------

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

// Kata's -----------------------------------------------------------------------------------------

export interface KataDraft {
  name: string
  subtitle?: string
  symbol: string
  tint: Kata['tint']
  art: string | null
  restSeconds: number | null
  items: WorkoutItem[]
}

/** Creates a new Kata, or updates `existingId` in place. Returns the Kata's uuid. */
export function saveKata(draft: KataDraft, existingId?: string): string {
  const now = Date.now()
  const id = existingId && !existingId.startsWith(PREMADE_UUID_PREFIX) ? existingId : uuid()
  setState((s) => {
    const existing = s.katas.find((k) => k.uuid === id)
    const kata: Kata = {
      uuid: id,
      name: draft.name.trim(),
      subtitle: draft.subtitle ?? existing?.subtitle ?? '',
      symbol: draft.symbol,
      tint: draft.tint,
      isPremade: false,
      premadeKey: null,
      art: draft.art,
      // User-built Kata's aren't tiered — always beginner, matching iOS (see Workout.difficultyRaw).
      difficulty: 'beginner',
      restSeconds: draft.restSeconds,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastPerformedAt: existing?.lastPerformedAt ?? null,
      items: orderedItems(draft.items),
    }
    const katas = existing ? s.katas.map((k) => (k.uuid === id ? kata : k)) : [kata, ...s.katas]
    return { ...s, katas }
  })
  return id
}

export function duplicateKata(source: Kata): string {
  return saveKata({
    name: source.isPremade ? source.name : `${source.name} Copy`,
    subtitle: source.subtitle,
    symbol: source.symbol,
    tint: source.tint,
    art: source.art,
    restSeconds: source.restSeconds,
    items: source.items,
  })
}

export function addExerciseToKata(kataUuid: string, exerciseSlug: string, duration = 30, phase: Phase = 'main'): boolean {
  let found = false
  setState((s) => {
    const kataIndex = s.katas.findIndex((k) => k.uuid === kataUuid)
    if (kataIndex === -1) return s
    found = true
    const targetKata = s.katas[kataIndex]
    const newItem: WorkoutItem = { slug: exerciseSlug, duration, phase }
    const updatedKata: Kata = {
      ...targetKata,
      items: orderedItems([...targetKata.items, newItem]),
      updatedAt: Date.now(),
    }
    const nextKatas = [...s.katas]
    nextKatas[kataIndex] = updatedKata
    return { ...s, katas: nextKatas }
  })
  return found
}

export function deleteKata(id: string) {
  setState((s) => ({ ...s, katas: s.katas.filter((k) => k.uuid !== id) }))
}

export function reorderKatas(fromIndex: number, toIndex: number) {
  setState((s) => {
    const list = [...s.katas]
    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length || fromIndex === toIndex) return s
    const [item] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, item)
    return { ...s, katas: list }
  })
}

export function sortUserKatas(compareFn: (a: Kata, b: Kata) => number) {
  setState((s) => {
    const list = [...s.katas].sort(compareFn)
    return { ...s, katas: list }
  })
}

// Flexibility ------------------------------------------------------------------------------------

/** 1.1: logs a Flexibility check-in (0-100% self-rating). */
export function logFlexibility(benchmark: FlexibilityBenchmark, progressPercent: number) {
  const record: FlexibilityRecord = { id: uuid(), benchmark, progressPercent, recordedAt: Date.now() }
  setState((s) => ({ ...s, flexibilityRecords: [...s.flexibilityRecords, record] }))
}

// Sessions ---------------------------------------------------------------------------------------

/** Persists a finished session. Returns null if too little was done to count. */
export function recordSession(session: Omit<Session, 'uuid'>): Session | null {
  if (session.activeSeconds < MINIMUM_ACTIVE_SECONDS) return null
  const saved: Session = { ...session, uuid: uuid() }
  const id = session.workoutUUID
  setState((s) => {
    let { katas, premadeLastPerformed } = s
    if (id?.startsWith(PREMADE_UUID_PREFIX)) {
      premadeLastPerformed = { ...premadeLastPerformed, [id.slice(PREMADE_UUID_PREFIX.length)]: saved.endedAt }
    } else if (id) {
      katas = katas.map((k) => (k.uuid === id ? { ...k, lastPerformedAt: saved.endedAt } : k))
    }
    return { ...s, katas, premadeLastPerformed, sessions: [...s.sessions, saved] }
  })
  return saved
}

// Delete account & data ----------------------------------------------------------------------

/** Permanently erases the profile, Kata's, history, settings and any local credential, returning
 * the app to the very first launch screen. Use `signOut()` for the non-destructive path. */
export function eraseUserData() {
  setState(() => ({ ...freshState(), settings: { ...DEFAULT_SETTINGS } }))
}

export function lastSession(): Session | undefined {
  const sessions = getState().sessions
  let latest: Session | undefined
  for (const session of sessions) if (!latest || session.startedAt > latest.startedAt) latest = session
  return latest
}

export function toggleFavoriteExercise(slug: string) {
  setState((s) => {
    const list = s.favoriteExercises || []
    if (list.includes(slug)) return { ...s, favoriteExercises: list.filter((x) => x !== slug) }
    return { ...s, favoriteExercises: [...list, slug] }
  })
}
