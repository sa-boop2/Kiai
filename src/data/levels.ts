// Kiai ranks. Mirrors ../Kiai/Services/Progression.swift.
// Progress requires BOTH accumulated Ki (time, boosted by streaks) AND distinct training days.

export interface Rank {
  index: number
  level: number
  id: string
  title: string
  blurb: string
  requiredKi: number
  requiredDays: number
  /** CSS colour (belt-inspired, defined for light + dark in tokens.css). */
  color: string
  symbol: string
}

const raw: Array<Omit<Rank, 'index' | 'level' | 'color'>> = [
  { id: 'initiate', title: 'Initiate', blurb: 'You found the dojo. Shoes off, please.', requiredKi: 0, requiredDays: 0, symbol: 'seal.fill' },
  { id: 'student', title: 'Student', blurb: 'Showing up is becoming a habit.', requiredKi: 300, requiredDays: 3, symbol: 'seal.fill' },
  { id: 'disciple', title: 'Disciple', blurb: 'Your hamstrings have started trusting you.', requiredKi: 1_200, requiredDays: 10, symbol: 'seal.fill' },
  { id: 'practitioner', title: 'Practitioner', blurb: 'Consistency is now part of who you are.', requiredKi: 3_000, requiredDays: 25, symbol: 'seal.fill' },
  { id: 'adept', title: 'Adept', blurb: 'Stances deep, kicks high, excuses low.', requiredKi: 6_500, requiredDays: 50, symbol: 'seal.fill' },
  { id: 'master', title: 'Master', blurb: "Other people stretch near you hoping it's contagious.", requiredKi: 12_000, requiredDays: 90, symbol: 'crown.fill' },
  { id: 'grandmaster', title: 'Grandmaster', blurb: "Your warm-up is someone else's workout.", requiredKi: 20_000, requiredDays: 150, symbol: 'crown.fill' },
  { id: 'literalGod', title: 'A Literal God', blurb: 'Mortals fear your splits. Ascension complete.', requiredKi: 35_000, requiredDays: 250, symbol: 'sparkles' },
]

export const RANKS: Rank[] = raw.map((rank, index) => ({
  ...rank,
  index,
  level: index + 1,
  color: `var(--rank-${index})`,
}))

export function nextRank(rank: Rank): Rank | null {
  return RANKS[rank.index + 1] ?? null
}

/** Ki per minute trained, daily minute cap, and max streak bonus steps (5% each). */
export const KI_PER_MINUTE = 10
export const DAILY_MINUTE_CAP = 90
export const STREAK_BONUS_PER_DAY = 0.05
export const STREAK_BONUS_MAX_DAYS = 10
/** Minimum active seconds for a session to count. */
export const MINIMUM_ACTIVE_SECONDS = 20
