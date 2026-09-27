// Display metadata for enum-like values. Mirrors ../Kiai/Models/Enums.swift.
import type { BodyRegion, Difficulty, Equipment, Phase, Tint } from './types'

/** CSS custom property for each named tint (defined in styles/tokens.css, light + dark). */
export const TINT_VAR: Record<Tint, string> = {
  ember: 'var(--ember)',
  crimson: 'var(--crimson)',
  jade: 'var(--jade)',
  gold: 'var(--gold)',
  indigo: 'var(--indigo)',
  sakura: 'var(--sakura)',
  slate: 'var(--slate)',
}

export const TINTS = Object.keys(TINT_VAR) as Tint[]

// Mirrors KiaiTint.title in Theme.swift.
export const TINT_TITLE: Record<Tint, string> = {
  ember: 'Ember',
  crimson: 'Crimson',
  jade: 'Jade',
  gold: 'Gold',
  indigo: 'Indigo',
  sakura: 'Sakura',
  slate: 'Slate',
}

export function tintTitle(tint: string | null | undefined): string {
  return TINT_TITLE[(tint ?? 'ember') as Tint] ?? TINT_TITLE.ember
}

export function tintColor(tint: string | null | undefined): string {
  return TINT_VAR[(tint ?? 'ember') as Tint] ?? TINT_VAR.ember
}

// 1.15: `themedTitle` is fun belt theming for the onboarding experience-level picker only —
// badges/chips elsewhere (Home cards, premade tiers) keep plain `title` so nothing gets harder
// to scan at a glance. Mirrors Difficulty.themedTitle in Enums.swift.
export const DIFFICULTY: Record<Difficulty, { title: string; themedTitle: string; level: number; tint: string }> = {
  beginner: { title: 'Beginner', themedTitle: 'White Belt', level: 1, tint: 'var(--jade)' },
  intermediate: { title: 'Intermediate', themedTitle: 'Blue Belt', level: 2, tint: 'var(--gold)' },
  advanced: { title: 'Advanced', themedTitle: 'Black Belt', level: 3, tint: 'var(--ember)' },
}

export const DIFFICULTIES = Object.keys(DIFFICULTY) as Difficulty[]

export function difficultyMeta(value: string) {
  return DIFFICULTY[value as Difficulty] ?? DIFFICULTY.beginner
}

export const CATEGORY: Record<BodyRegion, { title: string; symbol: string; tint: string }> = {
  neck: { title: 'Neck', symbol: 'person.fill', tint: 'var(--slate)' },
  shoulders: { title: 'Shoulders', symbol: 'figure.arms.open', tint: 'var(--indigo)' },
  chest: { title: 'Chest', symbol: 'lungs', tint: 'var(--jade)' },
  lats: { title: 'Lats & Back', symbol: 'figure.run', tint: 'var(--deep-blue)' },
  arms: { title: 'Arms', symbol: 'hand.raised', tint: 'var(--slate)' },
  core: { title: 'Core & Abs', symbol: 'figure.core.training', tint: 'var(--gold)' },
  lowerBack: { title: 'Lower Back', symbol: 'figure.strengthtraining.functional', tint: 'var(--gold)' },
  glutes: { title: 'Glutes', symbol: 'figure.walk', tint: 'var(--crimson)' },
  hipFlexors: { title: 'Hip Flexors', symbol: 'figure.flexibility', tint: 'var(--crimson)' },
  adductors: { title: 'Adductors', symbol: 'figure.gymnastics', tint: 'var(--crimson)' },
  hamstrings: { title: 'Hamstrings', symbol: 'figure.walk', tint: 'var(--ember)' },
  quads: { title: 'Quadriceps', symbol: 'figure.walk', tint: 'var(--ember)' },
  calves: { title: 'Calves', symbol: 'figure.step.training', tint: 'var(--sakura)' },
  shins: { title: 'Shins', symbol: 'figure.step.training', tint: 'var(--sakura)' },
  feet: { title: 'Feet & Ankles', symbol: 'shoe', tint: 'var(--sakura)' },
  fullBody: { title: 'Full Body', symbol: 'figure.mind.and.body', tint: 'var(--indigo)' },
}

export const CATEGORIES = Object.keys(CATEGORY) as BodyRegion[]

export function categoryMeta(value: string) {
  return CATEGORY[value as BodyRegion] ?? CATEGORY.fullBody
}

export const EQUIPMENT: Record<Equipment, { title: string; symbol: string }> = {
  none: { title: 'None', symbol: 'figure.flexibility' },
  mat: { title: 'Mat', symbol: 'rectangle.portrait' },
  wall: { title: 'Wall', symbol: 'square.split.bottomrightquarter' },
  strap: { title: 'Belt / strap', symbol: 'lasso' },
  chair: { title: 'Chair', symbol: 'chair' },
  yogaBlocks: { title: 'Yoga blocks', symbol: 'cube' },
  resistanceBand: { title: 'Resistance band', symbol: 'lasso' },
  foamRoller: { title: 'Foam roller', symbol: 'cylinder' },
  heavyBag: { title: 'Heavy bag', symbol: 'figure.boxing' },
  partner: { title: 'Partner', symbol: 'person.2' },
}

export function equipmentMeta(value: string) {
  return EQUIPMENT[value as Equipment] ?? { title: value, symbol: 'shippingbox' }
}

export const PHASE: Record<Phase, { title: string; tint: string; symbol: string }> = {
  warmup: { title: 'Warm-up', tint: 'var(--gold)', symbol: 'flame.fill' },
  main: { title: 'Main set', tint: 'var(--ember)', symbol: 'bolt.fill' },
  cooldown: { title: 'Cool-down', tint: 'var(--jade)', symbol: 'leaf.fill' },
}

export const PHASES = Object.keys(PHASE) as Phase[]

export function phaseMeta(value: string | null | undefined) {
  return PHASE[(value ?? 'main') as Phase] ?? PHASE.main
}
