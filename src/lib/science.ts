import type { PlayerStep } from './plan'
import type { FlexibilityRecord } from '../data/types'
import { currentMilestone } from './flexibility'
import { exerciseBySlug } from '../data/content'

/**
 * The Science-Based Progression Engine.
 * 
 * Injects PNF (Proprioceptive Neuromuscular Facilitation) and progression overrides
 * into workout plans based on the user's flexibility milestones.
 */
export function applyScienceProgression(steps: PlayerStep[], records: FlexibilityRecord[] = []): PlayerStep[] {
  // Map of user's highest achieved flexibility level per benchmark
  const levels = new Map<string, number>()
  for (const r of (records || [])) {
    const existing = levels.get(r.benchmark) ?? 0
    const m = currentMilestone(r.benchmark, r.progressPercent)
    levels.set(r.benchmark, Math.max(existing, m.level))
  }

  return steps.map((step) => {
    if (step.kind !== 'work' || !step.slug) return step

    const ex = exerciseBySlug(step.slug)
    if (!ex) return step

    // Check if the exercise targets a region related to a benchmark
    const targets = ex.targets || []
    let relatedLevel = 0
    if (targets.includes('splits') || targets.includes('adductors') || ex.category === 'splits') {
      relatedLevel = Math.max(relatedLevel, levels.get('splits') ?? 0)
    }
    if (targets.includes('hamstrings') || ex.category === 'pikeStretch') {
      relatedLevel = Math.max(relatedLevel, levels.get('pikeStretch') ?? 0)
    }
    if (targets.includes('quads') || ex.category === 'kickHeight') {
      relatedLevel = Math.max(relatedLevel, levels.get('kickHeight') ?? 0)
    }

    // PNF is introduced at Level 3 and above.
    // Minimum 30 seconds required to effectively do PNF (Passive 10s, Contract 5s, Relax 15s).
    if (relatedLevel >= 3 && step.duration >= 30) {
      return {
        ...step,
        pnf: true,
        detail: 'PNF Progression Unlocked',
      }
    }

    return step
  })
}

