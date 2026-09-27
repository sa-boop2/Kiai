import { TINTS } from '../data/meta'
import type { Tint } from '../data/types'

/**
 * 1.15: randomly assigns a fun icon + colour avatar during onboarding, before someone has picked a
 * real photo. Mirrors `Kiai/Services/AvatarGenerator.swift` — kept to icons this app's hand-drawn
 * set actually has, so the same generated avatar renders identically on both platforms.
 */
const SYMBOLS = ['flame.fill', 'bolt.fill', 'star.fill', 'leaf.fill', 'moon.stars.fill', 'ladybug.fill', 'crown.fill', 'trophy.fill', 'sparkles']

export function randomAvatar(): { symbol: string; tint: Tint } {
  return {
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    tint: TINTS[Math.floor(Math.random() * TINTS.length)],
  }
}
