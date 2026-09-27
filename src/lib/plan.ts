import { exerciseBySlug, howToForExercise, howToForTechnique, orderedItems } from '../data/content'
import { phaseMeta } from '../data/meta'
import type { CountdownSound, HowTo, Phase, SessionKind, Settings, Technique, WorkoutTemplate } from '../data/types'
import { getState } from './store'

export type StepKind = 'prepare' | 'work' | 'rest'

/** One timed segment in the player. Mirrors `PlayerStep`. */
export interface PlayerStep {
  id: number
  kind: StepKind
  title: string
  detail: string
  phase: Phase | null
  duration: number
  slug: string | null
  symbol: string
  bilateral: boolean
  howTo: HowTo | null
  note?: string
  pnf?: boolean
}

/** Immutable run-sheet. Settings are captured at start so changes mid-workout can't desync. */
export interface WorkoutPlan {
  id: string
  title: string
  workoutUUID: string | null
  kind: SessionKind
  art: string | null
  steps: PlayerStep[]
  pauseBetweenSets: boolean
  soundEnabled: boolean
  sound: CountdownSound
  hapticsEnabled: boolean
  switchSidesSeconds: number
}

export function stepTint(step: PlayerStep): string {
  if (step.kind === 'prepare') return 'var(--gold)'
  if (step.kind === 'rest') return 'var(--jade)'
  return step.phase ? phaseMeta(step.phase).tint : 'var(--ember)'
}

export function stepEyebrow(step: PlayerStep): string {
  if (step.kind === 'prepare') return 'Get ready'
  if (step.kind === 'rest') return 'Rest'
  return step.phase ? phaseMeta(step.phase).title : 'Drill'
}

export const planTotalSeconds = (plan: WorkoutPlan) => plan.steps.reduce((sum, s) => sum + s.duration, 0)
export const planWorkSteps = (plan: WorkoutPlan) => plan.steps.filter((s) => s.kind === 'work')

let planCounter = 0

function basePlan(settings: Settings, fields: Pick<WorkoutPlan, 'title' | 'workoutUUID' | 'kind' | 'art' | 'steps' | 'pauseBetweenSets'>): WorkoutPlan {
  return {
    id: `plan-${Date.now()}-${planCounter++}`,
    soundEnabled: settings.soundEnabled,
    sound: settings.sound,
    hapticsEnabled: settings.hapticsEnabled,
    switchSidesSeconds: settings.switchSidesSeconds ?? 5,
    ...fields,
  }
}

function prepareStep(id: number, seconds: number, firstName: string): PlayerStep {
  return { id, kind: 'prepare', title: 'Get ready', detail: `First up: ${firstName}`, phase: null, duration: seconds, slug: null, symbol: 'figure.stand', bilateral: false, howTo: null }
}

function restStep(id: number, seconds: number, nextName: string): PlayerStep {
  return { id, kind: 'rest', title: 'Rest', detail: `Up next: ${nextName}`, phase: null, duration: seconds, slug: null, symbol: 'pause.circle', bilateral: false, howTo: null }
}

export function planForTemplate(template: WorkoutTemplate, settings: Settings): WorkoutPlan {
  // 1.1: Settings → "Skip warm-up & cool-down" — the phases stay in the Kata itself, they're
  // just left out of the plan that actually gets played.
  const items = settings.disableWarmupCooldown ? template.items.filter((i) => i.phase === 'main') : template.items
  const resolved = orderedItems(items)
    .map((item) => ({ item, exercise: exerciseBySlug(item.slug) }))
    .filter((entry): entry is { item: typeof entry.item; exercise: NonNullable<typeof entry.exercise> } => Boolean(entry.exercise))
  const rest = template.restSeconds ?? settings.restSeconds

  const steps: PlayerStep[] = []
  if (settings.prepareSeconds > 0 && resolved.length > 0) {
    steps.push(prepareStep(steps.length, settings.prepareSeconds, resolved[0].exercise.name))
  }
  resolved.forEach(({ item, exercise }, index) => {
    steps.push({
      id: steps.length,
      kind: 'work',
      title: exercise.name,
      detail: exercise.summary,
      phase: item.phase as Phase,
      duration: Math.max(5, item.duration),
      slug: exercise.slug,
      symbol: exercise.symbol,
      bilateral: exercise.bilateral,
      howTo: howToForExercise(exercise),
      note: item.note || getState().exerciseNotes?.[item.slug],
    })
    if (rest > 0 && index < resolved.length - 1) {
      steps.push(restStep(steps.length, rest, resolved[index + 1].exercise.name))
    }
  })

  return basePlan(settings, {
    title: template.name,
    workoutUUID: template.workoutUUID,
    kind: 'routine',
    art: template.art,
    steps,
    pauseBetweenSets: settings.pauseBetweenSets,
  })
}

/** Technique drilling: optional warm-up → timed rounds with rests → breathing cool-down. */
export function planForTechnique(
  technique: Technique,
  options: { rounds: number; workSeconds: number; restSeconds: number; includeWarmup: boolean },
  settings: Settings
): WorkoutPlan {
  const steps: PlayerStep[] = []
  if (settings.prepareSeconds > 0) {
    steps.push(prepareStep(steps.length, settings.prepareSeconds, options.includeWarmup ? 'Warm-up' : technique.name))
  }
  const appendExercise = (slug: string, seconds: number, phase: Phase) => {
    const exercise = exerciseBySlug(slug)
    if (!exercise) return
    steps.push({
      id: steps.length, kind: 'work', title: exercise.name, detail: exercise.summary, phase, duration: seconds,
      slug: exercise.slug, symbol: exercise.symbol, bilateral: exercise.bilateral, howTo: howToForExercise(exercise),
    })
  }

  if (options.includeWarmup) {
    appendExercise('joint-circles', 45, 'warmup')
    appendExercise('leg-swings-front', 45, 'warmup')
  }
  const rounds = Math.max(1, options.rounds)
  const howTo = howToForTechnique(technique)
  for (let round = 1; round <= rounds; round++) {
    if (round > 1 && options.restSeconds > 0) {
      steps.push(restStep(steps.length, options.restSeconds, `Round ${round} of ${rounds}`))
    }
    steps.push({
      id: steps.length,
      kind: 'work',
      title: technique.name,
      detail: `Round ${round} of ${rounds}`,
      phase: 'main',
      duration: Math.max(10, options.workSeconds),
      slug: technique.slug,
      symbol: technique.symbol,
      bilateral: technique.bothSides,
      howTo,
    })
  }
  if (options.includeWarmup) appendExercise('box-breathing', 60, 'cooldown')

  return basePlan(settings, {
    title: `${technique.name} Drill`,
    workoutUUID: null,
    kind: 'technique',
    art: technique.art,
    steps,
    pauseBetweenSets: false,
  })
}
