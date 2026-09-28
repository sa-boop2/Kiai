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
    title: 'First Step on the Mat',
    description: 'Complete your first flexibility Kata.',
    icon: 'figure.martial.arts',
    tint: 'var(--ember)',
    progress: (state) => {
      const count = state.sessions.length
      return { current: Math.min(count, 1), max: 1, unlocked: count >= 1 }
    },
  },
  {
    id: 'early_bird',
    title: 'Dawn Discipline',
    description: 'Complete a mobility session before 8:00 AM.',
    icon: 'sun.horizon.fill',
    tint: 'var(--gold)',
    progress: (state) => {
      const early = state.sessions.filter((s) => new Date(s.startedAt).getHours() < 8).length
      return { current: Math.min(early, 1), max: 1, unlocked: early >= 1 }
    },
  },
  {
    id: 'night_owl',
    title: 'Night Ronin',
    description: 'Complete a mobility session after 9:00 PM.',
    icon: 'moon.stars.fill',
    tint: 'var(--indigo)',
    progress: (state) => {
      const late = state.sessions.filter((s) => new Date(s.startedAt).getHours() >= 21).length
      return { current: Math.min(late, 1), max: 1, unlocked: late >= 1 }
    },
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Train on a Saturday or Sunday.',
    icon: 'shield.fill',
    tint: 'var(--ember)',
    progress: (state) => {
      const weekend = state.sessions.filter((s) => {
        const d = new Date(s.startedAt).getDay()
        return d === 0 || d === 6
      }).length
      return { current: Math.min(weekend, 1), max: 1, unlocked: weekend >= 1 }
    },
  },
  {
    id: 'streak_3',
    title: 'Three Days Flow',
    description: 'Maintain a 3-day training streak.',
    icon: 'flame',
    tint: 'var(--ember)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      return { current: Math.min(snap.currentStreak, 3), max: 3, unlocked: snap.currentStreak >= 3 }
    },
  },
  {
    id: 'streak_7',
    title: 'Unbroken Week',
    description: 'Maintain a 7-day training streak.',
    icon: 'flame.fill',
    tint: 'var(--ember-deep)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      return { current: Math.min(snap.currentStreak, 7), max: 7, unlocked: snap.currentStreak >= 7 }
    },
  },
  {
    id: 'streak_30',
    title: 'Iron Consistency',
    description: 'Maintain a 30-day training streak.',
    icon: 'bolt.shield.fill',
    tint: 'var(--gold)',
    progress: (state) => {
      const snap = makeSnapshot(state.sessions, state.profile.createdAt)
      return { current: Math.min(snap.currentStreak, 30), max: 30, unlocked: snap.currentStreak >= 30 }
    },
  },
  {
    id: 'minutes_60',
    title: 'First Hour',
    description: 'Log 60 total minutes of flexibility training.',
    icon: 'hourglass',
    tint: 'var(--jade)',
    progress: (state) => {
      const totalSec = state.sessions.reduce((acc, s) => acc + s.activeSeconds, 0)
      const mins = Math.floor(totalSec / 60)
      return { current: Math.min(mins, 60), max: 60, unlocked: mins >= 60 }
    },
  },
  {
    id: 'minutes_300',
    title: 'Five Hours on the Mat',
    description: 'Log 300 total minutes of training.',
    icon: 'clock.badge.checkmark.fill',
    tint: 'var(--jade)',
    progress: (state) => {
      const totalSec = state.sessions.reduce((acc, s) => acc + s.activeSeconds, 0)
      const mins = Math.floor(totalSec / 60)
      return { current: Math.min(mins, 300), max: 300, unlocked: mins >= 300 }
    },
  },
  {
    id: 'minutes_1000',
    title: 'The Thousand-Minute Mindset',
    description: 'Log 1,000 total minutes of mobility training.',
    icon: 'crown.fill',
    tint: 'var(--gold)',
    progress: (state) => {
      const totalSec = state.sessions.reduce((acc, s) => acc + s.activeSeconds, 0)
      const mins = Math.floor(totalSec / 60)
      return { current: Math.min(mins, 1000), max: 1000, unlocked: mins >= 1000 }
    },
  },
  {
    id: 'centurion',
    title: 'The Centurion',
    description: 'Complete 100 training sessions.',
    icon: 'shield.checkered',
    tint: 'var(--deep-blue)',
    progress: (state) => {
      const count = state.sessions.length
      return { current: Math.min(count, 100), max: 100, unlocked: count >= 100 }
    },
  },
  {
    id: 'kata_architect',
    title: 'Kata Architect',
    description: 'Create your first custom Kata routine.',
    icon: 'plus.square.fill',
    tint: 'var(--accent)',
    progress: (state) => {
      const custom = state.katas.filter((k) => !k.isPremade).length
      return { current: Math.min(custom, 1), max: 1, unlocked: custom >= 1 }
    },
  },
  {
    id: 'kata_connoisseur',
    title: 'Kata Connoisseur',
    description: 'Complete 10 routine training sessions.',
    icon: 'star.circle.fill',
    tint: 'var(--sakura)',
    progress: (state) => {
      const count = state.sessions.filter((s) => s.kind === 'routine').length
      return { current: Math.min(count, 10), max: 10, unlocked: count >= 10 }
    },
  },
  {
    id: 'kata_sensei',
    title: 'Kata Sensei',
    description: 'Create 5 unique custom Kata routines.',
    icon: 'scroll.fill',
    tint: 'var(--amber-deep)',
    progress: (state) => {
      const custom = state.katas.filter((k) => !k.isPremade).length
      return { current: Math.min(custom, 5), max: 5, unlocked: custom >= 5 }
    },
  },
  {
    id: 'technique_driller',
    title: 'Technique Driller',
    description: 'Train a specific martial technique mobility routine.',
    icon: 'figure.kickboxing',
    tint: 'var(--crimson)',
    progress: (state) => {
      const tech = state.sessions.filter((s) => s.kind === 'technique').length
      return { current: Math.min(tech, 1), max: 1, unlocked: tech >= 1 }
    },
  },
  {
    id: 'flex_milestone',
    title: 'Flexibility Check-in',
    description: 'Log your first flexibility benchmark milestone.',
    icon: 'checkmark.seal.fill',
    tint: 'var(--amethyst)',
    progress: (state) => {
      const count = state.flexibilityRecords.length
      return { current: Math.min(count, 1), max: 1, unlocked: count >= 1 }
    },
  },
  {
    id: 'splits_pioneer',
    title: 'Front Split Explorer',
    description: 'Reach Level 2 (Kneeling Half Split) or higher.',
    icon: 'figure.split',
    tint: 'var(--crimson)',
    progress: (state) => {
      const records = state.flexibilityRecords.filter((r) => r.benchmark === 'splits')
      const maxPercent = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
      return { current: Math.min(maxPercent, 35), max: 35, unlocked: maxPercent >= 35 }
    },
  },
  {
    id: 'splits_master',
    title: 'Grandmaster Split',
    description: 'Achieve Level 6 (Full Ground Split Mastery).',
    icon: 'trophy.fill',
    tint: 'var(--gold)',
    progress: (state) => {
      const records = state.flexibilityRecords.filter((r) => r.benchmark === 'splits')
      const maxPercent = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
      return { current: Math.min(maxPercent, 100), max: 100, unlocked: maxPercent >= 100 }
    },
  },
  {
    id: 'shoulder_bulletproof',
    title: 'Pike Stretch Mobility',
    description: 'Reach Level 3 or higher on the Pike benchmark.',
    icon: 'shield.lefthalf.filled',
    tint: 'var(--indigo)',
    progress: (state) => {
      const records = state.flexibilityRecords.filter((r) => r.benchmark === 'pikeStretch')
      const maxPercent = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
      return { current: Math.min(maxPercent, 50), max: 50, unlocked: maxPercent >= 50 }
    },
  },
  {
    id: 'kicker_height',
    title: 'High Kicker',
    description: 'Reach Level 4 or higher on the High Kick benchmark.',
    icon: 'figure.kickboxing',
    tint: 'var(--ember)',
    progress: (state) => {
      const records = state.flexibilityRecords.filter((r) => r.benchmark === 'kickHeight')
      const maxPercent = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
      return { current: Math.min(maxPercent, 65), max: 65, unlocked: maxPercent >= 65 }
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


