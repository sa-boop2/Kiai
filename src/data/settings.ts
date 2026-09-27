// Settings defaults and options. Mirrors AppSettings in ../Kiai/Models/UserProfile.swift.
import type { AppearanceMode, AppLanguage, CountdownSound, ReminderMode, Settings } from './types'

export const DEFAULT_SETTINGS: Settings = {
  appearance: 'system',
  language: 'system',
  restSeconds: 5,
  pauseBetweenSets: false,
  soundEnabled: true,
  sound: 'gong',
  hapticsEnabled: true,
  prepareSeconds: 5,
  remindersEnabled: false,
  reminderMode: 'smart',
  reminderHour: 18,
  reminderMinute: 0,
  disableWarmupCooldown: false,
  accentColor: 'ember',
  keepScreenAwake: true,
  autoAdvance: true,
  halfwayChime: false,
}

export const REST_OPTIONS = [0, 3, 5, 10, 15]
export const PREPARE_OPTIONS = [0, 3, 5, 10, 15]
/** Per-Kata rest override choices in the editor. */
export const KATA_REST_CHOICES = [0, 3, 5, 10, 15, 20, 30]

export function prepareLabel(seconds: number): string {
  return seconds === 0 ? 'None' : `${seconds}s`
}

export function restLabel(seconds: number): string {
  return seconds === 0 ? 'Off' : `${seconds}s`
}

export const APPEARANCE_OPTIONS: { value: AppearanceMode; title: string }[] = [
  { value: 'system', title: 'Automatic' },
  { value: 'light', title: 'Light' },
  { value: 'dark', title: 'Dark' },
]

export const SOUND_OPTIONS: { value: CountdownSound; title: string; symbol: string }[] = [
  { value: 'gong', title: 'Temple Gong', symbol: 'circle.circle' },
  { value: 'jingle', title: 'Bright Jingle', symbol: 'bell' },
  { value: 'smooth', title: 'Smooth Tone', symbol: 'waveform' },
]

export const REMINDER_MODES: { value: ReminderMode; title: string }[] = [
  { value: 'smart', title: 'Smart' },
  { value: 'fixed', title: 'Fixed time' },
]

/** Shown in their own language, as iOS does. */
export const LANGUAGE_OPTIONS: { value: AppLanguage; nativeName: string }[] = [
  { value: 'system', nativeName: 'System' },
  { value: 'en', nativeName: 'English' },
  { value: 'nl', nativeName: 'Nederlands' },
  { value: 'es', nativeName: 'Español' },
  { value: 'ru', nativeName: 'Русский' },
]

/** Placeholder support details — replace before publishing. */
export const SUPPORT = {
  email: 'support@kiai.app',
}

// Account (1.1) ------------------------------------------------------------------------------

/**
 * Google Identity Services client ID and Apple Sign-In Service ID. Both are real, working
 * integrations gated on these — empty strings mean "not configured yet", and the login screen
 * shows a "Setup needed" badge instead of a dead button. See lib/auth.ts for the full steps.
 */
export const GOOGLE_CLIENT_ID = ''
export const APPLE_CLIENT_ID = ''
export const APPLE_REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
