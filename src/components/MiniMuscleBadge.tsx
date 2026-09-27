import React from 'react'
import type { Exercise, BodyRegion } from '../data/types'
import { categoryMeta } from '../data/meta'

interface MiniMuscleBadgeProps {
  exercise?: Exercise | null
  category?: BodyRegion | string | null
  size?: number
  className?: string
  style?: React.CSSProperties
}

/** Formats the target muscle(s) into a clean, concise display string. */
export function exerciseTargetLabel(exercise?: Exercise | null): string {
  if (!exercise) return ''
  const cat = exercise.category
  const meta = categoryMeta(cat)
  if (exercise.targets && exercise.targets.length > 0) {
    const raw = exercise.targets[0]
    const formatted = raw.charAt(0).toUpperCase() + raw.slice(1)
    if (formatted.toLowerCase() !== meta.title.toLowerCase()) {
      return `${formatted} · ${meta.title}`
    }
  }
  return meta.title
}

/**
 * Aesthetic mini anatomical body badge (as shown in iOS workout trackers).
 * Renders a dark circular badge with a stylized human silhouette highlighting
 * the active targeted muscle group in bright neon/accent color.
 */
export function MiniMuscleBadge({ exercise, category, size = 36, className = '', style }: MiniMuscleBadgeProps) {
  const cat = (exercise?.category || category || 'fullBody').toLowerCase()
  const targets = (exercise?.targets || []).map((t) => t.toLowerCase())
  const name = (exercise?.name || '').toLowerCase()

  // Detect which muscle group is active
  const isNeck = cat === 'neck' || targets.includes('neck') || name.includes('neck')
  const isShoulders = cat === 'shoulders' || targets.includes('shoulders') || targets.includes('deltoids') || name.includes('shoulder')
  const isChest = cat === 'chest' || targets.includes('chest') || targets.includes('pecs') || name.includes('chest')
  const isCore = cat === 'core' || targets.includes('core') || targets.includes('abs') || targets.includes('obliques') || name.includes('ab')
  const isBack = cat === 'lats' || cat === 'lowerback' || targets.includes('lats') || targets.includes('spine') || targets.includes('back')
  const isGlutes = cat === 'glutes' || targets.includes('glutes') || name.includes('glute') || name.includes('pigeon')
  const isQuads = cat === 'quads' || targets.includes('quads') || name.includes('quad') || name.includes('couch')
  const isHamstrings = cat === 'hamstrings' || targets.includes('hamstrings') || name.includes('hamstring') || name.includes('pike')
  const isHips = cat === 'hipflexors' || cat === 'adductors' || targets.includes('adductors') || targets.includes('hips') || targets.includes('groin')
  const isCalves = cat === 'calves' || cat === 'shins' || cat === 'feet' || targets.includes('calves') || name.includes('calf')
  const isArms = cat === 'arms' || targets.includes('arms') || targets.includes('biceps') || targets.includes('triceps')

  // Highlight colors
  const activeColor = '#facc15' // Neon Gold / Accent
  const baseColor = 'rgba(255, 255, 255, 0.28)'
  const glow = 'drop-shadow(0 0 2px rgba(250, 204, 21, 0.8))'

  return (
    <div
      className={`mini-muscle-badge ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '999px',
        background: 'linear-gradient(145deg, rgba(28, 32, 44, 0.95), rgba(16, 18, 25, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
      title={exerciseTargetLabel(exercise)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 36 36"
        width={size * 0.84}
        height={size * 0.84}
        style={{ overflow: 'visible' }}
      >
        <g transform="translate(0, 0)">
          {/* Head */}
          <circle
            cx="18"
            cy="6"
            r="3.2"
            fill={isNeck ? activeColor : baseColor}
            filter={isNeck ? glow : undefined}
          />

          {/* Neck / Traps */}
          <path
            d="M16 9.2 L20 9.2 L21 11.5 L15 11.5 Z"
            fill={isNeck || isShoulders ? activeColor : baseColor}
            filter={isNeck ? glow : undefined}
          />

          {/* Shoulders */}
          <circle
            cx="12"
            cy="12.5"
            r="2.2"
            fill={isShoulders ? activeColor : baseColor}
            filter={isShoulders ? glow : undefined}
          />
          <circle
            cx="24"
            cy="12.5"
            r="2.2"
            fill={isShoulders ? activeColor : baseColor}
            filter={isShoulders ? glow : undefined}
          />

          {/* Chest */}
          <path
            d="M14 11.5 L22 11.5 L21.5 15 L14.5 15 Z"
            fill={isChest || isBack ? activeColor : baseColor}
            filter={isChest || isBack ? glow : undefined}
          />

          {/* Arms */}
          <path
            d="M11.5 13 L9.5 19 L11 19 L13 13.5 Z"
            fill={isArms ? activeColor : baseColor}
            filter={isArms ? glow : undefined}
          />
          <path
            d="M24.5 13 L26.5 19 L25 19 L23 13.5 Z"
            fill={isArms ? activeColor : baseColor}
            filter={isArms ? glow : undefined}
          />

          {/* Core / Abs */}
          <rect
            x="15"
            y="15.8"
            width="6"
            height="5"
            rx="1"
            fill={isCore || isBack ? activeColor : baseColor}
            filter={isCore ? glow : undefined}
          />

          {/* Hips / Glutes */}
          <path
            d="M14 21.2 L22 21.2 L21 24 L15 24 Z"
            fill={isHips || isGlutes ? activeColor : baseColor}
            filter={isHips || isGlutes ? glow : undefined}
          />

          {/* Left Thigh (Front/Back) */}
          <rect
            x="13.5"
            y="24.5"
            width="3.8"
            height="5.5"
            rx="1.4"
            fill={isQuads || isHamstrings || isHips ? activeColor : baseColor}
            filter={isQuads || isHamstrings || isHips ? glow : undefined}
          />

          {/* Right Thigh (Front/Back) */}
          <rect
            x="18.7"
            y="24.5"
            width="3.8"
            height="5.5"
            rx="1.4"
            fill={isQuads || isHamstrings || isHips ? activeColor : baseColor}
            filter={isQuads || isHamstrings || isHips ? glow : undefined}
          />

          {/* Left Calf / Shin */}
          <rect
            x="14"
            y="30.5"
            width="3"
            height="4.5"
            rx="1"
            fill={isCalves ? activeColor : baseColor}
            filter={isCalves ? glow : undefined}
          />

          {/* Right Calf / Shin */}
          <rect
            x="19"
            y="30.5"
            width="3"
            height="4.5"
            rx="1"
            fill={isCalves ? activeColor : baseColor}
            filter={isCalves ? glow : undefined}
          />
        </g>
      </svg>
    </div>
  )
}
