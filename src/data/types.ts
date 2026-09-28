// Core content + user data types. Mirrors the native app's SwiftData models (see ../Kiai/Models).

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type BodyRegion = 'neck' | 'shoulders' | 'chest' | 'lats' | 'arms' | 'core' | 'lowerBack' | 'glutes' | 'hipFlexors' | 'adductors' | 'hamstrings' | 'quads' | 'calves' | 'shins' | 'feet' | 'fullBody'
export type Equipment = 'none' | 'mat' | 'wall' | 'strap' | 'chair' | 'yogaBlocks' | 'resistanceBand' | 'foamRoller' | 'heavyBag' | 'partner'
export type Phase = 'warmup' | 'main' | 'cooldown'
export type Tint = 'ember' | 'crimson' | 'jade' | 'gold' | 'indigo' | 'sakura' | 'slate' | 'amethyst'
export type QuoteKind = 'motivation' | 'fact' | 'wisdom'

export interface Exercise {
  slug: string
  name: string
  summary: string
  instructions: string[]
  tips: string[]
  category: BodyRegion | string
  equipment: (Equipment | string)[]
  /** Martial art ids this is especially relevant for. Empty = universal. */
  arts: string[]
  targets: string[]
  /** Default seconds. */
  duration: number
  /** Performed per side — the player cues a side switch halfway. */
  bilateral: boolean
  symbol: string
  tint?: Tint | string
}

export interface Technique {
  slug: string
  art: string
  name: string
  nativeName: string | null
  group: string
  difficulty: Difficulty | string
  summary: string
  steps: string[]
  keyPoints: string[]
  mistakes: string[]
  symbol: string
  rounds: number
  work: number
  rest: number
  bothSides: boolean
}

export interface WorkoutItem {
  slug: string
  duration: number
  phase: Phase | string
  note?: string
  pnf?: boolean
}

export interface PremadeWorkout {
  key: string
  name: string
  subtitle: string
  symbol: string
  tint: Tint | string
  art: string | null
  difficulty: Difficulty | string
  items: WorkoutItem[]
}

export interface Recommendation {
  slug: string
  why: string
}

export interface MartialArt {
  id: string
  name: string
  origin: string
  symbol: string
  tint: Tint | string
  tagline: string
  about: string
  focusAreas: string[]
  stretches: Recommendation[]
  drills: Recommendation[]
}

export interface Quote {
  id: number
  text: string
  kind: QuoteKind | string
}

// ---------------------------------------------------------------------------------------------
// User data (persisted in localStorage)
// ---------------------------------------------------------------------------------------------

/** A routine, shown to the user as a "Kata". */
export interface Kata {
  uuid: string
  name: string
  subtitle: string
  symbol: string
  tint: Tint
  isPremade: boolean
  premadeKey: string | null
  art: string | null
  /** Rest between exercises. `null` = use the app-wide setting. */
  restSeconds: number | null
  createdAt: number
  updatedAt: number
  lastPerformedAt: number | null
  items: WorkoutItem[]
  /** 1.15: tiers "Browse all premade workouts" and shows as a chip on the Home card. */
  difficulty: Difficulty
}

export interface SessionEntry {
  slug: string
  name: string
  seconds: number
  phase: Phase | null
}

/** 1.1: Analytics → Flexibility. Mirrors FlexibilityBenchmark/FlexibilityRecord.swift. */
export type FlexibilityBenchmark = 'splits' | 'kickHeight' | 'pikeStretch'

export interface FlexibilityRecord {
  id: string
  benchmark: FlexibilityBenchmark
  progressPercent: number
  recordedAt: number
}

export type SessionKind = 'routine' | 'technique'

export interface Session {
  uuid: string
  startedAt: number
  endedAt: number
  title: string
  workoutUUID: string | null
  kind: SessionKind
  art: string | null
  /** Seconds spent in work steps (rest and pauses excluded). */
  activeSeconds: number
  /** false when ended early. */
  completed: boolean
  entries: SessionEntry[]
}

/** How the current profile is signed in. Kiai has no server, so `apple`/`google` only carry the
 * name/email captured at sign-in — they don't sync anywhere on the web (unlike iOS's CloudKit). */
export type AuthProvider = 'guest' | 'apple' | 'google' | 'email'

export interface Profile {
  name: string
  primaryArt: string | null
  /** JPEG data URL, downscaled. */
  avatar: string | null
  /** 1.15: a fun icon + colour, randomly generated on the onboarding name step. Shown when there's
   * no real `avatar` photo yet — see `AvatarView`. */
  avatarSymbol: string | null
  avatarTint: Tint | null
  createdAt: number
  onboardingComplete: boolean
  /** Whether the one-time login screen has been shown and answered. */
  hasChosenSignInMethod: boolean
  authProvider: AuthProvider
  accountEmail: string | null
  /** Default difficulty when browsing/adding exercises (Settings → Experience level). */
  experienceLevel: Difficulty
}

export type AppearanceMode = 'system' | 'light' | 'dark'
// 1.16: French and German dropped — English, Spanish, Dutch and Russian are the fully supported set.
export type AppLanguage = 'system' | 'en' | 'nl' | 'ru' | 'es'
export type CountdownSound = 'gong' | 'jingle' | 'smooth'
export type ReminderMode = 'smart' | 'fixed'

export interface Settings {
  appearance: AppearanceMode
  language: AppLanguage
  /** 0 (off), 3, 5, 10 or 15. */
  restSeconds: number
  pauseBetweenSets: boolean
  soundEnabled: boolean
  sound: CountdownSound
  hapticsEnabled: boolean
  prepareSeconds: number
  remindersEnabled: boolean
  reminderMode: ReminderMode
  reminderHour: number
  reminderMinute: number
  /** Skip warm-up/cool-down phases entirely when playing any workout. */
  disableWarmupCooldown: boolean
  /** 1.15: Settings → Appearance. Mirrors AppSettings.accentColorRaw / KiaiTint on iOS. */
  accentColor: Tint
  /** 1.5.3: Use Arabic numerals (1,2,3) instead of Kanji for the timer. */
  arabicTimer?: boolean
  /** 1.5: Keep screen awake during workouts (Wake Lock API). */
  keepScreenAwake?: boolean
  /** 1.5: Auto-advance to next stretch. */
  autoAdvance?: boolean
  /** 1.5: Subtle chime halfway through a timed stretch. */
  halfwayChime?: boolean
  /** 1.6: Pause between switching sides for bilateral exercises. */
  switchSidesSeconds?: number
}

/** Salted + PBKDF2-hashed local email/password credential (see lib/auth.ts). Never contains a
 * plaintext password. Device-local only — there is no backend to sync it to. */
export interface StoredCredential {
  saltB64: string
  hashB64: string
  displayName: string
}

/** A value description of a routine, used to build player plans and editor drafts. */
export interface WorkoutTemplate {
  name: string
  workoutUUID: string | null
  art: string | null
  restSeconds: number | null
  items: WorkoutItem[]
}

export interface HowTo {
  title: string
  summary: string
  steps: string[]
  tips: string[]
  symbol: string
}
