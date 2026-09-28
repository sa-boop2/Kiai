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
    id: 'technique_driller',
    title: 'Technique Driller',
    description: 'Complete your first Martial Art Technique drill.',
    icon: 'figure.martial.arts',
    tint: 'var(--slate)',
    progress: (state) => {
      const drills = state.sessions.filter((s) => s.kind === 'technique').length
      return { current: Math.min(drills, 1), max: 1, unlocked: drills >= 1 }
    },
  },
  {
    id: 'kata_grandmaster',
    title: 'Kata Grandmaster',
    description: 'Design and save 15 custom Kata routines.',
    icon: 'text.book.closed.fill',
    tint: 'var(--slate)',
    progress: (state) => {
      const customKatas = state.katas.filter((k) => !k.isPremade).length
      return { current: Math.min(customKatas, 15), max: 15, unlocked: customKatas >= 15 }
    },
  },
  {
    id: 'early_bird',
    title: 'Early Riser Dojo',
    description: 'Complete a mobility session before 8:00 AM.',
    icon: 'sun.max.fill',
    tint: 'var(--gold)',
    progress: (state) => {
      const early = state.sessions.filter((s) => new Date(s.startedAt).getHours() < 8).length
      return { current: Math.min(early, 1), max: 1, unlocked: early >= 1 }
    },
  },
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
  {
    id: 'streak_30',
    title: 'Unbreakable Spirit',
    description: 'Maintain a 30-day training streak.',
    icon: 'flame.fill',
    tint: 'var(--ember)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      const maxStreak = Math.max(snap.currentStreak, snap.longestStreak)
      return { current: Math.min(maxStreak, 30), max: 30, unlocked: maxStreak >= 30 }
    },
  },
  {
    id: 'streak_100',
    title: 'The Hundred-Day Legend',
    description: 'Maintain a 100-day training streak.',
    icon: 'crown.fill',
    tint: 'var(--gold)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      const maxStreak = Math.max(snap.currentStreak, snap.longestStreak)
      return { current: Math.min(maxStreak, 100), max: 100, unlocked: maxStreak >= 100 }
    },
  },
  {
    id: 'sessions_100',
    title: 'Iron Consistency',
    description: 'Complete 100 martial mobility sessions.',
    icon: 'checkmark.seal.fill',
    tint: 'var(--jade)',
    progress: (state) => {
      const count = state.sessions.length
      return { current: Math.min(count, 100), max: 100, unlocked: count >= 100 }
    },
  },
  {
    id: 'minutes_1000',
    title: 'Thousand-Minute Master',
    description: 'Accumulate 1,000 minutes of active martial mobility.',
    icon: 'hourglass.bottomhalf.filled',
    tint: 'var(--indigo)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      const mins = Math.floor(snap.totalSeconds / 60)
      return { current: Math.min(mins, 1000), max: 1000, unlocked: mins >= 1000 }
    },
  },
  {
    id: 'splits_master',
    title: 'The Full Van Damme',
    description: 'Reach Level 5 (Full Split) in Splits.',
    icon: 'figure.split',
    tint: 'var(--gold)',
    progress: (state) => {
      const records = state.flexibilityRecords.filter((r) => r.benchmark === 'splits')
      const maxPercent = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
      return { current: Math.min(maxPercent, 100), max: 100, unlocked: maxPercent >= 100 }
    },
  },
  {
    id: 'kata_sensei',
    title: 'Kata Sensei',
    description: 'Design and save 5 custom Kata routines.',
    icon: 'text.book.closed.fill',
    tint: 'var(--sakura)',
    progress: (state) => {
      const customKatas = state.katas.filter((k) => !k.isPremade).length
      return { current: Math.min(customKatas, 5), max: 5, unlocked: customKatas >= 5 }
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


