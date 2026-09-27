// Content index: fast lookups over the generated seed data.
import { MARTIAL_ARTS } from './generated/arts'
import { EXERCISES } from './generated/exercises'
import { TECHNIQUES } from './generated/techniques'
import { PREMADE_WORKOUTS } from './generated/workouts'
import { QUOTES, QUOTE_KIND_LABELS } from './generated/quotes'
import { getState } from '../lib/store'
import type { Exercise, HowTo, Kata, MartialArt, PremadeWorkout, Technique, WorkoutItem, WorkoutTemplate } from './types'

export { EXERCISES, TECHNIQUES, MARTIAL_ARTS, PREMADE_WORKOUTS, QUOTES, QUOTE_KIND_LABELS }

const exerciseMap = new Map(EXERCISES.map((e) => [e.slug, e]))
const techniqueMap = new Map(TECHNIQUES.map((t) => [t.slug, t]))
const artMap = new Map(MARTIAL_ARTS.map((a) => [a.id, a]))

export const exerciseBySlug = (slug: string): Exercise | undefined => {
  const builtIn = exerciseMap.get(slug)
  if (builtIn) return builtIn
  try {
    const custom = getState().customExercises
    return custom?.find((e) => e.slug === slug)
  } catch {
    return undefined
  }
}
export const techniqueBySlug = (slug: string): Technique | undefined => techniqueMap.get(slug)
export const artById = (id: string | null | undefined): MartialArt | undefined => (id ? artMap.get(id) : undefined)
export const techniquesForArt = (id: string): Technique[] => TECHNIQUES.filter((t) => t.art === id)

export function howToForExercise(exercise: Exercise): HowTo {
  return { title: exercise.name, summary: exercise.summary, steps: exercise.instructions, tips: exercise.tips, symbol: exercise.symbol }
}

export function howToForTechnique(technique: Technique): HowTo {
  return { title: technique.name, summary: technique.summary, steps: technique.steps, tips: technique.keyPoints, symbol: technique.symbol }
}

// ---------------------------------------------------------------------------------------------
// Routines
// ---------------------------------------------------------------------------------------------

export const PREMADE_UUID_PREFIX = 'premade:'

export function premadeToKata(workout: PremadeWorkout, index: number, lastPerformedAt: number | null): Kata {
  return {
    uuid: PREMADE_UUID_PREFIX + workout.key,
    name: workout.name,
    subtitle: workout.subtitle,
    symbol: workout.symbol,
    tint: workout.tint as Kata['tint'],
    isPremade: true,
    premadeKey: workout.key,
    art: workout.art,
    difficulty: (workout.difficulty as Kata['difficulty']) ?? 'beginner',
    restSeconds: null,
    createdAt: index,
    updatedAt: index,
    lastPerformedAt,
    items: workout.items,
  }
}

/** A complete flow (warm-up → art-specific stretches → cool-down). Mirrors MartialArt.recommendedTemplate. */
export function recommendedTemplate(art: MartialArt): WorkoutTemplate {
  const items: WorkoutItem[] = [
    { slug: 'joint-circles', duration: 45, phase: 'warmup' },
    { slug: 'jumping-jacks', duration: 45, phase: 'warmup' },
    ...art.stretches.map((r) => ({ slug: r.slug, duration: exerciseBySlug(r.slug)?.duration ?? 60, phase: 'main' as const })),
    { slug: 'supine-twist', duration: 60, phase: 'cooldown' },
    { slug: 'box-breathing', duration: 60, phase: 'cooldown' },
  ]
  return { name: `${art.name} Flow`, workoutUUID: null, art: art.id, restSeconds: null, items }
}

/** Every new Kata starts with a sensible warm-up and cool-down. */
export const NEW_KATA_ITEMS: WorkoutItem[] = [
  { slug: 'joint-circles', duration: 60, phase: 'warmup' },
  { slug: 'jumping-jacks', duration: 45, phase: 'warmup' },
  { slug: 'childs-pose', duration: 60, phase: 'cooldown' },
  { slug: 'box-breathing', duration: 60, phase: 'cooldown' },
]

export const KATA_SYMBOLS = [
  'figure.martial.arts',
  'figure.kickboxing',
  'figure.wrestling',
  'figure.taichi',
  'figure.flexibility',
  'figure.lunge',
  'figure.split',
  'figure.forward.fold',
  'figure.balance',
  'figure.yoga',
  'figure.mind.and.body',
  'figure.core.training',
  'figure.cooldown',
  'flame.fill',
  'bolt.fill',
  'shield.checkered',
  'trophy.fill',
  'leaf.fill',
  'moon.stars.fill',
  'sunrise.fill',
]

export function kataTemplate(kata: Kata): WorkoutTemplate {
  return { name: kata.name, workoutUUID: kata.uuid, art: kata.art, restSeconds: kata.restSeconds, items: orderedItems(kata.items) }
}

const PHASE_ORDER = { warmup: 0, main: 1, cooldown: 2 } as Record<string, number>

/** Stable sort by phase (warm-up → main → cool-down). */
export function orderedItems(items: WorkoutItem[]): WorkoutItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (PHASE_ORDER[a.item.phase] ?? 1) - (PHASE_ORDER[b.item.phase] ?? 1) || a.index - b.index)
    .map((x) => x.item)
}

export function estimatedSeconds(template: { items: WorkoutItem[]; restSeconds: number | null }, defaultRest: number): number {
  const work = template.items.reduce((sum, item) => sum + item.duration, 0)
  const rest = (template.restSeconds ?? defaultRest) * Math.max(0, template.items.length - 1)
  return work + rest
}
