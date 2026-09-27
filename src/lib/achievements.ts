import type { AppState } from './store'
import { makeSnapshot } from './progression'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  tint: string
  progress: (state: AppState) => { current: number; max: number; unlocked: boolean }
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_session',
    title: 'First Step',
    description: 'Complete your first martial mobility session.',
    icon: 'flame.fill',
    tint: 'var(--ember)',
    progress: (state) => {
      const count = state.sessions.length
      return { current: Math.min(count, 1), max: 1, unlocked: count >= 1 }
    },
  },
  {
    id: 'streak_3',
    title: 'Kindled Fire',
    description: 'Build a 3-day consecutive training streak.',
    icon: 'flame',
    tint: 'var(--gold)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      const maxStreak = Math.max(snap.currentStreak, snap.longestStreak)
      return { current: Math.min(maxStreak, 3), max: 3, unlocked: maxStreak >= 3 }
    },
  },
  {
    id: 'streak_7',
    title: 'Dojo Discipline',
    description: 'Maintain a 7-day training streak.',
    icon: 'bolt.fill',
    tint: 'var(--ember)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      const maxStreak = Math.max(snap.currentStreak, snap.longestStreak)
      return { current: Math.min(maxStreak, 7), max: 7, unlocked: maxStreak >= 7 }
    },
  },
  {
    id: 'minutes_60',
    title: 'Hour of Power',
    description: 'Accumulate 60 minutes on the mat.',
    icon: 'clock.fill',
    tint: 'var(--indigo)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      const mins = Math.floor(snap.totalSeconds / 60)
      return { current: Math.min(mins, 60), max: 60, unlocked: mins >= 60 }
    },
  },
  {
    id: 'minutes_300',
    title: 'Century Stretch',
    description: 'Complete 300 minutes of active martial mobility.',
    icon: 'trophy.fill',
    tint: 'var(--gold)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      const mins = Math.floor(snap.totalSeconds / 60)
      return { current: Math.min(mins, 300), max: 300, unlocked: mins >= 300 }
    },
  },
  {
    id: 'kata_architect',
    title: 'Kata Architect',
    description: 'Design and save your first custom Kata routine.',
    icon: 'figure.martial.arts',
    tint: 'var(--jade)',
    progress: (state) => {
      const customKatas = state.katas.filter((k) => !k.isPremade).length
      return { current: Math.min(customKatas, 1), max: 1, unlocked: customKatas >= 1 }
    },
  },
  {
    id: 'flex_milestone',
    title: 'Bodily Awareness',
    description: 'Check in to your first flexibility milestone.',
    icon: 'figure.flexibility',
    tint: 'var(--sakura)',
    progress: (state) => {
      const records = state.flexibilityRecords.length
      return { current: Math.min(records, 1), max: 1, unlocked: records >= 1 }
    },
  },
  {
    id: 'splits_adept',
    title: 'Low Horse Adept',
    description: 'Reach Level 3 (Low Horse) or higher in Splits.',
    icon: 'figure.split',
    tint: 'var(--crimson)',
    progress: (state) => {
      const records = state.flexibilityRecords.filter((r) => r.benchmark === 'splits')
      const maxPercent = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
      return { current: Math.min(maxPercent, 50), max: 50, unlocked: maxPercent >= 50 }
    },
  },
  {
    id: 'kicker_height',
    title: 'Head Hunter',
    description: 'Reach Level 3 (Chest Strike) or higher in Kick Height.',
    icon: 'figure.kickboxing',
    tint: 'var(--ember)',
    progress: (state) => {
      const records = state.flexibilityRecords.filter((r) => r.benchmark === 'kickHeight')
      const maxPercent = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
      return { current: Math.min(maxPercent, 50), max: 50, unlocked: maxPercent >= 50 }
    },
  },
]

export function computeAchievements(state: AppState) {
  return ACHIEVEMENTS.map((a) => {
    const stat = a.progress(state)
    return {
      ...a,
      ...stat,
    }
  })
}
