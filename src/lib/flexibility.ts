import type { FlexibilityBenchmark } from '../data/types'

export const FLEXIBILITY_BENCHMARKS: FlexibilityBenchmark[] = ['splits', 'kickHeight', 'pikeStretch']

export interface Milestone {
  level: number
  percent: number
  title: string
  subtitle: string
  description: string
  symbol: string
}

export interface BenchmarkMeta {
  title: string
  goalDescription: string
  symbol: string
  tint: string
  milestones: Milestone[]
}

export const BENCHMARK_MILESTONES: Record<FlexibilityBenchmark, Milestone[]> = {
  splits: [
    {
      level: 1,
      percent: 15,
      title: 'Standing Straddle',
      subtitle: 'Wide Stance',
      description: 'Hands on knees or thighs in a wide standing stance, opening the hips.',
      symbol: 'figure.stand',
    },
    {
      level: 2,
      percent: 30,
      title: 'Hands to Floor',
      subtitle: 'Palms Touching Down',
      description: 'Palms easily touch the floor between feet in a wide straddle stance.',
      symbol: 'figure.forward.fold',
    },
    {
      level: 3,
      percent: 50,
      title: 'Forearms to Mat',
      subtitle: 'Halfway Down',
      description: 'Forearms resting on the floor with legs spread and knees straight.',
      symbol: 'figure.lunge',
    },
    {
      level: 4,
      percent: 70,
      title: 'Low Split',
      subtitle: '6 Inches Off Floor',
      description: 'Hips lowered to roughly 6 inches from the floor, supported by hands or block.',
      symbol: 'figure.pigeon',
    },
    {
      level: 5,
      percent: 85,
      title: 'Almost Flat',
      subtitle: '2 Inches Off Floor',
      description: 'Pelvis hovering just 2 inches above the mat with straight leg lines.',
      symbol: 'figure.flexibility',
    },
    {
      level: 6,
      percent: 100,
      title: 'Full Flat Split',
      subtitle: 'Flat On Floor (180°)',
      description: 'Hips and thighs resting flat on the mat with an upright torso.',
      symbol: 'figure.split',
    },
  ],
  kickHeight: [
    {
      level: 1,
      percent: 15,
      title: 'Low Kick',
      subtitle: 'Thigh & Knee Level',
      description: 'Controlled kicks striking comfortably at low thigh and knee height.',
      symbol: 'figure.stand',
    },
    {
      level: 2,
      percent: 30,
      title: 'Mid Kick',
      subtitle: 'Waist & Ribs Level',
      description: 'Clean mid-section kicks reaching belt and floating rib height.',
      symbol: 'figure.martial.arts',
    },
    {
      level: 3,
      percent: 50,
      title: 'Chest Height',
      subtitle: 'Chest & Shoulder Level',
      description: 'Solid kicks reaching chest and shoulder level without leaning backward.',
      symbol: 'figure.kickboxing',
    },
    {
      level: 4,
      percent: 70,
      title: 'Chin Height',
      subtitle: 'Chin & Jaw Level',
      description: 'High kicks extending to chin and jaw level with steady balance.',
      symbol: 'figure.kickboxing',
    },
    {
      level: 5,
      percent: 85,
      title: 'Head Height',
      subtitle: 'Forehead & Crown Level',
      description: 'Kicks cleanly extending above eye and forehead level with good form.',
      symbol: 'flame.fill',
    },
    {
      level: 6,
      percent: 100,
      title: 'Overhead Kick',
      subtitle: 'Vertical Axe Height',
      description: 'Vertical extension past 180° for axe kicks and high flexibility strikes.',
      symbol: 'bolt.fill',
    },
  ],
  pikeStretch: [
    {
      level: 1,
      percent: 15,
      title: 'Knees Reach',
      subtitle: 'Fingertips to Knees',
      description: 'Fingertips comfortably resting at knee level with a straight spine.',
      symbol: 'figure.stand',
    },
    {
      level: 2,
      percent: 30,
      title: 'Shin Reach',
      subtitle: 'Hands to Mid-Shin',
      description: 'Hands reach mid-shin with straight legs and a relaxed back.',
      symbol: 'figure.forward.fold',
    },
    {
      level: 3,
      percent: 50,
      title: 'Ankles Reach',
      subtitle: 'Hands to Ankles',
      description: 'Hands securely wrap around the ankles with legs straight.',
      symbol: 'figure.forward.fold',
    },
    {
      level: 4,
      percent: 70,
      title: 'Toe Touch',
      subtitle: 'Fingertips to Toes',
      description: 'Fingers comfortably reach and wrap under the toes.',
      symbol: 'figure.cooldown',
    },
    {
      level: 5,
      percent: 85,
      title: 'Palms to Floor',
      subtitle: 'Palms Flat Beside Feet',
      description: 'Both palms press completely flat on the floor beside your feet.',
      symbol: 'figure.mind.and.body',
    },
    {
      level: 6,
      percent: 100,
      title: 'Full Fold',
      subtitle: 'Chest & Head to Shins',
      description: 'Torso pressed flat against thighs with forehead touching shins.',
      symbol: 'figure.childs.pose',
    },
  ],
}

const META: Record<FlexibilityBenchmark, { title: string; goalDescription: string; symbol: string; tint: string }> = {
  splits: { title: 'Splits', goalDescription: 'Progress from wide straddle to a flat 180° floor split.', symbol: 'figure.split', tint: 'var(--crimson)' },
  kickHeight: { title: 'Kick Height', goalDescription: 'Progress from low thigh kicks to overhead axe kicks.', symbol: 'figure.kickboxing', tint: 'var(--gold)' },
  pikeStretch: { title: 'Forward Fold', goalDescription: 'Progress from knees reach to a full chest-to-shin fold.', symbol: 'figure.forward.fold', tint: 'var(--jade)' },
}

export function flexibilityMeta(benchmark: FlexibilityBenchmark): BenchmarkMeta {
  return {
    ...META[benchmark],
    milestones: BENCHMARK_MILESTONES[benchmark],
  }
}

export function currentMilestone(benchmark: FlexibilityBenchmark, percent: number): Milestone {
  const list = BENCHMARK_MILESTONES[benchmark]
  for (let i = list.length - 1; i >= 0; i--) {
    if (percent >= list[i].percent) return list[i]
  }
  return list[0]
}
