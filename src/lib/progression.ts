import {
  DAILY_MINUTE_CAP,
  KI_PER_MINUTE,
  RANKS,
  STREAK_BONUS_MAX_DAYS,
  STREAK_BONUS_PER_DAY,
  nextRank,
  type Rank,
} from '../data/levels'
import type { Session } from '../data/types'

/** Local start-of-day timestamp. */
export function startOfDay(time: number | Date): number {
  const d = new Date(time)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function addDays(dayStart: number, days: number): number {
  const d = new Date(dayStart)
  d.setDate(d.getDate() + days)
  return startOfDay(d)
}

export interface FavoriteExercise {
  name: string
  seconds: number
}

/**
 * Everything derived from session history. A direct port of `ProgressSnapshot` in the native app,
 * so streaks, Ki, ranks and consistency are identical on both platforms.
 */
export interface ProgressSnapshot {
  totalSeconds: number
  sessionCount: number
  ki: number
  activeDays: number
  currentStreak: number
  longestStreak: number
  trainedToday: boolean
  /** 0...1 */
  consistency: number
  rank: Rank
  /** 0...1 progress toward the next rank. */
  rankProgress: number
  favorite: FavoriteExercise | null
  /** Start-of-day → sessions. */
  sessionsByDay: Map<number, Session[]>
}

export function makeSnapshot(sessions: Session[], joinDate: number, includeFavorite = false, now = Date.now()): ProgressSnapshot {
  const snap: ProgressSnapshot = {
    totalSeconds: 0,
    sessionCount: sessions.length,
    ki: 0,
    activeDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    trainedToday: false,
    consistency: 0,
    rank: RANKS[0],
    rankProgress: 0,
    favorite: null,
    sessionsByDay: new Map(),
  }
  if (sessions.length === 0) return snap

  const today = startOfDay(now)
  const secondsByDay = new Map<number, number>()
  for (const session of sessions) {
    const day = startOfDay(session.startedAt)
    const list = snap.sessionsByDay.get(day)
    if (list) list.push(session)
    else snap.sessionsByDay.set(day, [session])
    secondsByDay.set(day, (secondsByDay.get(day) ?? 0) + session.activeSeconds)
    snap.totalSeconds += session.activeSeconds
  }
  snap.activeDays = snap.sessionsByDay.size
  snap.trainedToday = snap.sessionsByDay.has(today)

  // Streaks + Ki: each day's minutes (capped) earn Ki, boosted by the streak leading into it.
  const days = [...snap.sessionsByDay.keys()].sort((a, b) => a - b)
  let run = 0
  let previous: number | null = null
  let ki = 0
  for (const day of days) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1
    snap.longestStreak = Math.max(snap.longestStreak, run)
    const minutes = Math.min((secondsByDay.get(day) ?? 0) / 60, DAILY_MINUTE_CAP)
    const bonus = 1 + STREAK_BONUS_PER_DAY * Math.min(run - 1, STREAK_BONUS_MAX_DAYS)
    ki += minutes * KI_PER_MINUTE * bonus
    previous = day
  }
  snap.ki = Math.round(ki)

  // The current streak stays alive until the end of the day after the last session.
  const last = days[days.length - 1]
  snap.currentStreak = last === today || last === addDays(today, -1) ? run : 0

  snap.consistency = consistency(new Set(days), joinDate, today)

  // Rank: highest rank whose Ki AND day requirements are both met.
  let rank = RANKS[0]
  for (const candidate of RANKS) {
    if (snap.ki >= candidate.requiredKi && snap.activeDays >= candidate.requiredDays) rank = candidate
  }
  snap.rank = rank
  const next = nextRank(rank)
  if (next) {
    const kiProgress = (snap.ki - rank.requiredKi) / (next.requiredKi - rank.requiredKi)
    const dayProgress = (snap.activeDays - rank.requiredDays) / Math.max(1, next.requiredDays - rank.requiredDays)
    snap.rankProgress = Math.min(Math.max(Math.min(kiProgress, dayProgress), 0), 1)
  } else {
    snap.rankProgress = 1
  }

  if (includeFavorite) {
    const totals = new Map<string, FavoriteExercise>()
    for (const session of sessions) {
      for (const entry of session.entries) {
        const current = totals.get(entry.slug)
        totals.set(entry.slug, { name: current?.name ?? entry.name, seconds: (current?.seconds ?? 0) + entry.seconds })
      }
    }
    for (const value of totals.values()) {
      if (value.seconds > 0 && (!snap.favorite || value.seconds > snap.favorite.seconds)) snap.favorite = value
    }
  }
  return snap
}

/**
 * Weighted share of recent days with training. The last 7 days count double. The window is 28 days,
 * shortened for new users; today only counts once it's been trained (no penalty mid-day).
 */
export function consistency(activeDays: Set<number>, joinDate: number, today: number): number {
  const joinDay = startOfDay(joinDate)
  const daysSinceJoin = Math.round((today - joinDay) / 86_400_000) + 1
  const window = Math.min(28, Math.max(7, daysSinceJoin))
  let earned = 0
  let possible = 0
  for (let offset = 0; offset < window; offset++) {
    const day = addDays(today, -offset)
    const trained = activeDays.has(day)
    if (offset === 0 && !trained) continue
    const weight = offset < 7 ? 2 : 1
    possible += weight
    if (trained) earned += weight
  }
  return possible > 0 ? earned / possible : 0
}

export function consistencyLabel(value: number): string {
  if (value < 0.15) return 'Asleep on the mat'
  if (value < 0.35) return 'Warming up'
  if (value < 0.55) return 'Finding rhythm'
  if (value < 0.75) return 'Solid discipline'
  if (value < 0.9) return 'Relentless'
  return 'Unstoppable'
}

export function gaugeColor(value: number): string {
  if (value < 0.35) return 'var(--slate)'
  if (value < 0.6) return 'var(--gold)'
  if (value < 0.85) return 'var(--ember)'
  return 'var(--jade)'
}
