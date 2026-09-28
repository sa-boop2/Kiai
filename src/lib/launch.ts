import { useMemo } from 'react'
import {
  PREMADE_UUID_PREFIX,
  PREMADE_WORKOUTS,
  artById,
  kataTemplate,
  premadeToKata,
  recommendedTemplate,
  techniqueBySlug,
} from '../data/content'
import type { Kata, Technique, WorkoutTemplate } from '../data/types'
import { audio } from './audio'
import { nav } from './nav'
import { planForTechnique, planForTemplate, type WorkoutPlan } from './plan'
import { type AppState, getState, usePremadeLastPerformed, useUserKatas } from './store'

// Kata lookups ------------------------------------------------------------------------------------

export function premadeKatas(lastPerformed: Record<string, number>): Kata[] {
  return PREMADE_WORKOUTS.map((w, i) => premadeToKata(w, i, lastPerformed[w.key] ?? null))
}

export function findKata(id: string, state: AppState = getState()): Kata | undefined {
  if (id.startsWith(PREMADE_UUID_PREFIX)) {
    const key = id.slice(PREMADE_UUID_PREFIX.length)
    const index = PREMADE_WORKOUTS.findIndex((w) => w.key === key)
    return index >= 0 ? premadeToKata(PREMADE_WORKOUTS[index], index, state.premadeLastPerformed[key] ?? null) : undefined
  }
  return state.katas.find((k) => k.uuid === id)
}

export function usePremadeKatas(): Kata[] {
  const lastPerformed = usePremadeLastPerformed()
  return useMemo(() => premadeKatas(lastPerformed), [lastPerformed])
}

export function useKata(id: string): Kata | undefined {
  const katas = useUserKatas()
  const lastPerformed = usePremadeLastPerformed()
  return useMemo(() => findKata(id, { ...getState(), katas, premadeLastPerformed: lastPerformed }), [id, katas, lastPerformed])
}

// Launching ---------------------------------------------------------------------------------------

function present(plan: WorkoutPlan) {
  if (plan.steps.length === 0) return
  // Called inside a tap: unlock Web Audio for iOS and pre-render this theme's cues.
  audio.unlock()
  if (plan.soundEnabled) audio.prepare(plan.sound)
  nav.startPlan(plan)
}

export function startTemplate(template: WorkoutTemplate) {
  const plan = planForTemplate(template, getState().settings);
  present(plan)
}

export function startKata(kata: Kata) {
  startTemplate(kataTemplate(kata))
}

export function startTechnique(technique: Technique, options: { rounds: number; workSeconds: number; restSeconds: number; includeWarmup: boolean }) {
  present(planForTechnique(technique, options, getState().settings))
}

type QuickTarget =
  | { kind: 'kata'; kata: Kata }
  | { kind: 'template'; template: WorkoutTemplate }
  | { kind: 'technique'; technique: Technique }

/** Repeats the most recent session; falls back to "Daily Kiai Flow". Mirrors QuickStartResolver. */
export function resolveQuickStart(state: AppState = getState()): QuickTarget | null {
  const last = state.sessions.reduce<AppState['sessions'][number] | undefined>(
    (latest, session) => (!latest || session.startedAt > latest.startedAt ? session : latest),
    undefined
  )
  if (last) {
    const kata = last.workoutUUID ? findKata(last.workoutUUID, state) : undefined
    if (kata) return { kind: 'kata', kata }
    if (last.kind === 'technique') {
      const technique = last.entries.map((e) => techniqueBySlug(e.slug)).find(Boolean)
      if (technique) return { kind: 'technique', technique }
    }
    const art = artById(last.art)
    if (art) return { kind: 'template', template: recommendedTemplate(art) }
  }
  const fallback = findKata(PREMADE_UUID_PREFIX + 'daily-kiai-flow', state)
  return fallback ? { kind: 'kata', kata: fallback } : null
}

export function quickStartLabel(state: AppState): { title: string; isRepeat: boolean } {
  const target = resolveQuickStart(state)
  const hasHistory = state.sessions.length > 0
  if (!target) return { title: 'Daily Kiai Flow', isRepeat: false }
  if (target.kind === 'kata') return { title: target.kata.name, isRepeat: hasHistory }
  if (target.kind === 'template') return { title: target.template.name, isRepeat: true }
  return { title: `${target.technique.name} Drill`, isRepeat: true }
}

export function quickStart() {
  const target = resolveQuickStart()
  if (!target) return
  if (target.kind === 'kata') startKata(target.kata)
  else if (target.kind === 'template') startTemplate(target.template)
  else {
    const t = target.technique
    startTechnique(t, { rounds: t.rounds, workSeconds: t.work, restSeconds: t.rest, includeWarmup: true })
  }
}

