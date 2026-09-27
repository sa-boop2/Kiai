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
      title: 'Stiff Oak',
      subtitle: 'Standing Wide Straddle',
      description: 'Hands on knees, hips spread roughly 45° with upright posture.',
      symbol: 'figure.stand',
    },
    {
      level: 2,
      percent: 30,
      title: 'Bamboo Bend',
      subtitle: 'Hands to Floor',
      description: 'Palms easily touch the floor between feet in a wide stance.',
      symbol: 'figure.forward.fold',
    },
    {
      level: 3,
      percent: 50,
      title: 'Low Horse',
      subtitle: 'Forearms to Floor',
      description: 'Forearms resting on mat, adductors opening past 90° spread.',
      symbol: 'figure.lunge',
    },
    {
      level: 4,
      percent: 70,
      title: 'Tiger Slump',
      subtitle: 'Block Depth (6")',
      description: 'Pelvis resting 6 inches from floor, using a yoga block for support.',
      symbol: 'figure.pigeon',
    },
    {
      level: 5,
      percent: 85,
      title: 'Crane Touch',
      subtitle: 'Near Ground (2")',
      description: 'Pelvis hovering 2 inches from the mat, full straight-leg line.',
      symbol: 'figure.flexibility',
    },
    {
      level: 6,
      percent: 100,
      title: 'Grandmaster Flat',
      subtitle: 'Full 180° Flat Split',
      description: 'Groin and thighs resting flat on the floor with upright torso.',
      symbol: 'figure.split',
    },
  ],
  kickHeight: [
    {
      level: 1,
      percent: 15,
      title: 'Low Sweep',
      subtitle: 'Thigh Level',
      description: 'Low kick trajectory below hip line, stable standing leg.',
      symbol: 'figure.stand',
    },
    {
      level: 2,
      percent: 30,
      title: 'Belt Line',
      subtitle: 'Waist & Solar Plexus',
      description: 'Mid-section kick height with controlled hip rotation.',
      symbol: 'figure.martial.arts',
    },
    {
      level: 3,
      percent: 50,
      title: 'Chest Strike',
      subtitle: 'Sternum & Shoulders',
      description: 'Solid shoulder-height extension without leaning torso backwards.',
      symbol: 'figure.kickboxing',
    },
    {
      level: 4,
      percent: 70,
      title: 'Head Hunter',
      subtitle: 'Eye & Temple Height',
      description: 'Strikes reach head height with sharp chamber and balance.',
      symbol: 'figure.kickboxing',
    },
    {
      level: 5,
      percent: 85,
      title: 'Crown Kick',
      subtitle: 'Top of Head & Crown',
      description: 'Kick extends above forehead with upright spinal alignment.',
      symbol: 'flame.fill',
    },
    {
      level: 6,
      percent: 100,
      title: 'Sky Blade',
      subtitle: 'Vertical 180° Axe',
      description: 'Near-vertical extension past 180°, true martial mastery.',
      symbol: 'bolt.fill',
    },
  ],
  pikeStretch: [
    {
      level: 1,
      percent: 15,
      title: 'Knee Hugger',
      subtitle: 'Fingertips to Knees',
      description: 'Fingertips comfortably resting at knee line with straight spine.',
      symbol: 'figure.stand',
    },
    {
      level: 2,
      percent: 30,
      title: 'Shin Tap',
      subtitle: 'Hands to Mid-Shin',
      description: 'Hands reach mid-shin with neutral lumbar curve.',
      symbol: 'figure.forward.fold',
    },
    {
      level: 3,
      percent: 50,
      title: 'Ankle Lock',
      subtitle: 'Grasping Ankles',
      description: 'Hands securely cup the ankles with micro-bent knees.',
      symbol: 'figure.forward.fold',
    },
    {
      level: 4,
      percent: 70,
      title: 'Toe Touch',
      subtitle: 'Fingers Under Toes',
      description: 'Fingertips wrap under toes, hamstrings fully lengthened.',
      symbol: 'figure.cooldown',
    },
    {
      level: 5,
      percent: 85,
      title: 'Palm Floor',
      subtitle: 'Palms Flat Beside Feet',
      description: 'Both palms press completely flat on the floor beside your feet.',
      symbol: 'figure.mind.and.body',
    },
    {
      level: 6,
      percent: 100,
      title: 'Forehead to Shin',
      subtitle: 'Full Fold Compression',
      description: 'Torso pressed flush against thighs, forehead touching shins.',
      symbol: 'figure.childs.pose',
    },
  ],
}

const META: Record<FlexibilityBenchmark, { title: string; goalDescription: string; symbol: string; tint: string }> = {
  splits: { title: 'Splits', goalDescription: 'Stepping milestones from standing straddle to flat splits.', symbol: 'figure.split', tint: 'var(--crimson)' },
  kickHeight: { title: 'Kick Height', goalDescription: 'Stepping milestones from low sweeps to overhead sky blades.', symbol: 'figure.kickboxing', tint: 'var(--gold)' },
  pikeStretch: { title: 'Pike Stretch', goalDescription: 'Stepping milestones from knees to chest-to-thigh fold.', symbol: 'figure.forward.fold', tint: 'var(--jade)' },
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
