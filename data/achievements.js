// ============================================================================
// achievements.js — 60-Day Martial Arts Preparation Program
// Achievement System, Training Tips, and Benchmark Definitions
// ============================================================================

// ---------------------------------------------------------------------------
// ACHIEVEMENTS
// ---------------------------------------------------------------------------
window.ACHIEVEMENTS = [

  // ── Streak Achievements ──────────────────────────────────────────────────
  {
    id: 'first_flame',
    name: 'First Flame',
    description: 'Complete your first workout',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'workouts_completed', value: 1 },
    rarity: 'common'
  },
  {
    id: 'three_day_streak',
    name: 'Getting Started',
    description: '3-day workout streak',
    icon: '⚡',
    category: 'streak',
    condition: { type: 'streak', value: 3 },
    rarity: 'common'
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day workout streak',
    icon: '🗡️',
    category: 'streak',
    condition: { type: 'streak', value: 7 },
    rarity: 'common'
  },
  {
    id: 'two_week_titan',
    name: 'Two-Week Titan',
    description: '14-day workout streak',
    icon: '💎',
    category: 'streak',
    condition: { type: 'streak', value: 14 },
    rarity: 'rare'
  },
  {
    id: 'streak_machine',
    name: 'Streak Machine',
    description: '30-day workout streak',
    icon: '🏆',
    category: 'streak',
    condition: { type: 'streak', value: 30 },
    rarity: 'epic'
  },
  {
    id: 'iron_will',
    name: 'Iron Will',
    description: '45-day workout streak',
    icon: '👑',
    category: 'streak',
    condition: { type: 'streak', value: 45 },
    rarity: 'legendary'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Never miss 2 days in a row for 30 days',
    icon: '🛡️',
    category: 'streak',
    condition: { type: 'consistency', value: 30 },
    rarity: 'rare'
  },

  // ── Milestone Achievements ───────────────────────────────────────────────
  {
    id: 'phase_1_complete',
    name: 'Foundation Laid',
    description: 'Complete Phase 1 (Day 14)',
    icon: '🏗️',
    category: 'milestone',
    condition: { type: 'day_reached', value: 14 },
    rarity: 'common'
  },
  {
    id: 'phase_2_complete',
    name: 'Range Unlocked',
    description: 'Complete Phase 2 (Day 28)',
    icon: '🌊',
    category: 'milestone',
    condition: { type: 'day_reached', value: 28 },
    rarity: 'rare'
  },
  {
    id: 'phase_3_complete',
    name: 'Power Awakened',
    description: 'Complete Phase 3 (Day 42)',
    icon: '⚡',
    category: 'milestone',
    condition: { type: 'day_reached', value: 42 },
    rarity: 'epic'
  },
  {
    id: 'ready_for_battle',
    name: 'Ready for Battle',
    description: 'Complete the full 60-day program',
    icon: '🥋',
    category: 'milestone',
    condition: { type: 'day_reached', value: 60 },
    rarity: 'legendary'
  },
  {
    id: 'halfway',
    name: 'Halfway There',
    description: 'Reach Day 30',
    icon: '🎯',
    category: 'milestone',
    condition: { type: 'day_reached', value: 30 },
    rarity: 'rare'
  },
  {
    id: 'ten_workouts',
    name: 'Getting Serious',
    description: 'Complete 10 total workouts',
    icon: '💪',
    category: 'milestone',
    condition: { type: 'workouts_completed', value: 10 },
    rarity: 'common'
  },
  {
    id: 'twenty_five_workouts',
    name: 'Quarter Century',
    description: 'Complete 25 total workouts',
    icon: '🎖️',
    category: 'milestone',
    condition: { type: 'workouts_completed', value: 25 },
    rarity: 'rare'
  },
  {
    id: 'fifty_workouts',
    name: 'Half Hundred',
    description: 'Complete 50 total workouts',
    icon: '🏅',
    category: 'milestone',
    condition: { type: 'workouts_completed', value: 50 },
    rarity: 'epic'
  },

  // ── Flexibility Achievements ─────────────────────────────────────────────
  {
    id: 'first_measurement',
    name: 'Know Thyself',
    description: 'Record your first benchmark measurements',
    icon: '📏',
    category: 'flexibility',
    condition: { type: 'benchmarks_recorded', value: 1 },
    rarity: 'common'
  },
  {
    id: 'split_progress_25',
    name: 'Quarter Split',
    description: 'Reduce split distance by 25%',
    icon: '🦵',
    category: 'flexibility',
    condition: { type: 'split_improvement', value: 25 },
    rarity: 'rare'
  },
  {
    id: 'split_progress_50',
    name: 'Halfway Down',
    description: 'Reduce split distance by 50%',
    icon: '🤸',
    category: 'flexibility',
    condition: { type: 'split_improvement', value: 50 },
    rarity: 'epic'
  },
  {
    id: 'high_kick',
    name: 'High Kick Club',
    description: 'Kick height reaches chest level',
    icon: '🦶',
    category: 'flexibility',
    condition: { type: 'kick_height', value: 'chest' },
    rarity: 'rare'
  },
  {
    id: 'head_kick',
    name: 'Head Hunter',
    description: 'Kick height reaches head level',
    icon: '🎯',
    category: 'flexibility',
    condition: { type: 'kick_height', value: 'head' },
    rarity: 'legendary'
  },
  {
    id: 'deep_squat_master',
    name: 'Deep Squat Master',
    description: 'Hold full squat 2+ minutes heels flat',
    icon: '🏋️',
    category: 'flexibility',
    condition: { type: 'squat_hold', value: 120 },
    rarity: 'rare'
  },
  {
    id: 'sit_reach_improve',
    name: 'Reaching Further',
    description: 'Improve sit-and-reach by 5+ cm',
    icon: '📐',
    category: 'flexibility',
    condition: { type: 'sit_reach_improvement', value: 5 },
    rarity: 'rare'
  },

  // ── Technique Achievements ───────────────────────────────────────────────
  {
    id: 'iron_horse',
    name: 'Iron Horse',
    description: 'Hold Horse Stance for 2 minutes',
    icon: '🐴',
    category: 'technique',
    condition: { type: 'horse_stance', value: 120 },
    rarity: 'epic'
  },
  {
    id: 'wushu_warrior',
    name: 'Wushu Warrior',
    description: 'Complete 10 Wushu technique sessions',
    icon: '🐉',
    category: 'technique',
    condition: { type: 'discipline_sessions', value: { discipline: 'wushu', count: 10 } },
    rarity: 'rare'
  },
  {
    id: 'muay_thai_fighter',
    name: 'Nak Muay',
    description: 'Complete 10 Muay Thai technique sessions',
    icon: '🥊',
    category: 'technique',
    condition: { type: 'discipline_sessions', value: { discipline: 'muaythai', count: 10 } },
    rarity: 'rare'
  },
  {
    id: 'tai_chi_sage',
    name: 'Tai Chi Sage',
    description: 'Complete 10 Tai Chi sessions',
    icon: '☯️',
    category: 'technique',
    condition: { type: 'discipline_sessions', value: { discipline: 'taichi', count: 10 } },
    rarity: 'rare'
  },
  {
    id: 'sanda_striker',
    name: 'Sanda Striker',
    description: 'Complete 10 Sanda sessions',
    icon: '🥋',
    category: 'technique',
    condition: { type: 'discipline_sessions', value: { discipline: 'sanda', count: 10 } },
    rarity: 'rare'
  },
  {
    id: 'shaolin_disciple',
    name: 'Shaolin Disciple',
    description: 'Complete 10 Shaolin sessions',
    icon: '🏯',
    category: 'technique',
    condition: { type: 'discipline_sessions', value: { discipline: 'shaolin', count: 10 } },
    rarity: 'rare'
  },
  {
    id: 'all_rounder',
    name: 'Master of All',
    description: 'Complete sessions in all 5 disciplines',
    icon: '🌟',
    category: 'technique',
    condition: { type: 'all_disciplines', value: 5 },
    rarity: 'epic'
  },

  // ── Dedication Achievements ──────────────────────────────────────────────
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a workout before 7 AM',
    icon: '🌅',
    category: 'dedication',
    condition: { type: 'time_of_day', value: 7 },
    rarity: 'common'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a workout after 10 PM',
    icon: '🦉',
    category: 'dedication',
    condition: { type: 'time_of_day', value: 22 },
    rarity: 'common'
  },
  {
    id: 'benchmark_tracker',
    name: 'Data Driven',
    description: 'Record benchmarks 4 times',
    icon: '📊',
    category: 'dedication',
    condition: { type: 'benchmarks_recorded', value: 4 },
    rarity: 'rare'
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete workouts on 8 weekend days',
    icon: '🏖️',
    category: 'dedication',
    condition: { type: 'weekend_workouts', value: 8 },
    rarity: 'rare'
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Return after missing a day',
    icon: '🔄',
    category: 'dedication',
    condition: { type: 'comeback', value: 1 },
    rarity: 'common'
  },
  {
    id: 'total_time_5h',
    name: 'Five Hour Fighter',
    description: 'Accumulate 5 hours of training',
    icon: '⏱️',
    category: 'dedication',
    condition: { type: 'total_time', value: 18000 },
    rarity: 'rare'
  },
  {
    id: 'total_time_15h',
    name: 'Fifteen Hour Fighter',
    description: 'Accumulate 15 hours of training',
    icon: '⌛',
    category: 'dedication',
    condition: { type: 'total_time', value: 54000 },
    rarity: 'epic'
  },
  {
    id: 'total_time_25h',
    name: 'Twenty-Five Hour Master',
    description: 'Accumulate 25 hours of training',
    icon: '🕐',
    category: 'dedication',
    condition: { type: 'total_time', value: 90000 },
    rarity: 'legendary'
  }
];


