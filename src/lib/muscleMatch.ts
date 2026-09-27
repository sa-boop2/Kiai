import type { BodyPart } from '../components/BodyDiagram'
import type { Exercise } from '../data/types'

/** True if an exercise targets the given body-diagram muscle, by category, name or tag keywords. */
export function matchesBodyPart(exercise: Exercise, part: BodyPart): boolean {
  const cat = (exercise.category || '').toLowerCase()
  const name = exercise.name.toLowerCase()
  const p = part.toLowerCase()

  if (p === 'arms' || p === 'biceps' || p === 'triceps') {
    return (
      cat === 'arms' ||
      cat.includes('arm') ||
      name.includes('arm') ||
      name.includes('bicep') ||
      name.includes('tricep') ||
      name.includes('wrist') ||
      name.includes('forearm')
    )
  }
  if (p === 'neck') return cat === 'neck' || name.includes('neck')
  if (p === 'shoulders') return cat === 'shoulders' || name.includes('shoulder') || name.includes('deltoid')
  if (p === 'chest') return cat === 'chest' || name.includes('chest') || name.includes('pec')
  if (p === 'core') return cat === 'core' || name.includes('core') || name.includes('ab') || name.includes('oblique')
  if (p === 'lowerback') return cat === 'lowerback' || name.includes('lower back') || name.includes('lumbar')
  if (p === 'lats') return cat === 'lats' || name.includes('lat') || name.includes('upper back') || name.includes('rhomboid')
  if (p === 'glutes') return cat === 'glutes' || name.includes('glute') || name.includes('butt') || name.includes('piriformis')
  if (p === 'hipflexors') return cat === 'hipflexors' || name.includes('hip') || name.includes('psoas')
  if (p === 'adductors') return cat === 'adductors' || name.includes('adductor') || name.includes('groin') || name.includes('inner thigh')
  if (p === 'hamstrings') return cat === 'hamstrings' || name.includes('hamstring')
  if (p === 'quads') return cat === 'quads' || name.includes('quad') || name.includes('thigh')
  if (p === 'calves') return cat === 'calves' || cat === 'shins' || name.includes('calf') || name.includes('calves') || name.includes('shin')
  if (p === 'feet') return cat === 'feet' || name.includes('foot') || name.includes('feet') || name.includes('ankle') || name.includes('toe')
  return cat === p || (exercise.targets ? exercise.targets.some((t) => t.toLowerCase().includes(p)) : false)
}

/** Higher = a stronger match between the exercise and the selected muscle, for relevance sorting. */
export function getExerciseRelevance(exercise: Exercise, part: BodyPart | null): number {
  if (!part) return 0
  const name = exercise.name.toLowerCase()
  const cat = (exercise.category || '').toLowerCase()
  const p = part.toLowerCase()

  // 1. Direct primary name match
  if (name.includes(p)) return 100
  if (p === 'hamstrings' && (name.includes('hamstring') || name.includes('pike') || name.includes('forward fold'))) return 95
  if (p === 'quads' && (name.includes('quad') || name.includes('couch') || name.includes('lunge'))) return 95
  if (p === 'shoulders' && (name.includes('shoulder') || name.includes('deltoid') || name.includes('dislocat'))) return 95
  if (p === 'chest' && (name.includes('chest') || name.includes('pec') || name.includes('doorway'))) return 95
  if (p === 'glutes' && (name.includes('glute') || name.includes('pigeon') || name.includes('figure four'))) return 95
  if (p === 'hipflexors' && (name.includes('hip') || name.includes('lunge') || name.includes('psoas'))) return 95
  if (p === 'calves' && (name.includes('calf') || name.includes('calves') || name.includes('downward dog') || name.includes('achilles'))) return 95
  if (p === 'core' && (name.includes('core') || name.includes('cobra') || name.includes('twist') || name.includes('ab'))) return 95
  if (p === 'lats' && (name.includes('lat') || name.includes('puppy') || name.includes('child'))) return 95
  if (p === 'adductors' && (name.includes('frog') || name.includes('groin') || name.includes('butterfly') || name.includes('straddle') || name.includes('adductor'))) return 95

  // 2. Direct category match
  if (cat === p) return 80

  // 3. Targets array match
  if (exercise.targets && exercise.targets.some((t) => t.toLowerCase().includes(p))) return 70

  return 50
}
