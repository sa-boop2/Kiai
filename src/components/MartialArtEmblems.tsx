import type { CSSProperties } from 'react'

interface EmblemProps {
  artId: string
  size?: number
  tint?: string
  className?: string
  style?: CSSProperties
}

/**
 * Custom distinct, aesthetic vector emblems for each martial art discipline.
 * Replaces generic icons with iconic, martial-authentic crests.
 */
export function MartialArtEmblem({ artId, size = 48, tint = 'var(--accent)', className = '', style }: EmblemProps) {
  const s = size
  const strokeColor = tint
  const fillColor = `color-mix(in srgb, ${tint} 22%, transparent)`

  const renderGraphic = () => {
    switch (artId) {
      case 'karate':
        // Japanese Rising Sun with Focused Traditional Fist
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="24" cy="24" r="16" fill="color-mix(in srgb, var(--ember) 35%, transparent)" />
            {/* Sunburst rays */}
            <path d="M24 4 L24 9 M24 39 L24 44 M4 24 L9 24 M39 24 L44 24 M10 10 L14 14 M34 34 L38 38 M10 38 L14 34 M34 14 L38 10" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            {/* Martial Fist Symbol */}
            <rect x="17" y="17" width="14" height="13" rx="4" fill={strokeColor} />
            <path d="M17 21 L31 21 M21 21 L21 30 M27 21 L27 30" stroke="#10121a" strokeWidth="1.4" />
            <path d="M19 30 L29 30" stroke="#10121a" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )

      case 'bjj':
        // Geometric Submission Triangle with Black Belt Rank Bar
        return (
          <g>
            <polygon points="24,6 42,39 6,39" fill={fillColor} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
            <polygon points="24,14 36,36 12,36" fill="none" stroke={strokeColor} strokeWidth="1.2" opacity="0.5" />
            {/* Belt wrap with red rank bar */}
            <rect x="14" y="27" width="20" height="5" rx="1.5" fill="#18181b" stroke={strokeColor} strokeWidth="1" />
            <rect x="25" y="27" width="7" height="5" fill="#ef4444" />
            <rect x="29.5" y="27" width="1.5" height="5" fill="#ffffff" />
          </g>
        )

      case 'muay-thai':
        // Crossed Ancient Krabi-Krabong Blades & Sacred Mongkhon
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Mongkhon headpiece loop */}
            <path d="M16 11 C16 7 32 7 32 11 C32 14 26 16 24 18 C22 16 16 14 16 11 Z" fill="none" stroke="#facc15" strokeWidth="1.8" />
            <circle cx="24" cy="9" r="1.5" fill="#facc15" />
            {/* Crossed Thai Scimitars */}
            <path d="M12 36 L36 16 C34 13 29 15 28 17 L10 32 Z" fill={strokeColor} />
            <path d="M36 36 L12 16 C14 13 19 15 20 17 L38 32 Z" fill={strokeColor} opacity="0.85" />
            <circle cx="24" cy="28" r="3" fill="#facc15" />
          </g>
        )

      case 'judo':
        // Sacred Kuzushi Circular Throwing Vortex
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Dynamic Swirling Arcs */}
            <path d="M24 7 A17 17 0 0 1 41 24" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M41 24 A17 17 0 0 1 24 41" fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
            <path d="M24 41 A17 17 0 0 1 7 24" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M7 24 A17 17 0 0 1 24 7" fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
            {/* Center Kodokan Octagonal Star */}
            <circle cx="24" cy="24" r="8" fill="#ef4444" />
            <circle cx="24" cy="24" r="4" fill="#ffffff" />
          </g>
        )

      case 'mma':
        // Championship Octagon Combat Cage & Strike Shield
        return (
          <g>
            <polygon points="17,5 31,5 42,16 42,30 31,41 17,41 6,30 6,16" fill={fillColor} stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
            {/* Octagon Wire Mesh Lines */}
            <line x1="17" y1="5" x2="31" y2="41" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
            <line x1="31" y1="5" x2="17" y2="41" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
            <line x1="6" y1="16" x2="42" y2="30" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
            <line x1="6" y1="30" x2="42" y2="16" stroke={strokeColor} strokeWidth="0.8" opacity="0.4" />
            {/* Center Combat 4oz Glove Glyph */}
            <circle cx="24" cy="23" r="7.5" fill={strokeColor} />
            <path d="M20 25 L28 25 M22 21 L26 21" stroke="#12141c" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )

      case 'boxing':
        // Vintage Crossed Leather Gloves & Victory Laurel
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Left Glove */}
            <path d="M14 26 C12 21 15 16 19 16 C23 16 25 19 23 25 C21 29 17 30 14 26 Z" fill={strokeColor} />
            <rect x="13" y="27" width="7" height="4" rx="1.5" fill="#facc15" />
            {/* Right Glove */}
            <path d="M34 26 C36 21 33 16 29 16 C25 16 23 19 25 25 C27 29 31 30 34 26 Z" fill={strokeColor} opacity="0.9" />
            <rect x="28" y="27" width="7" height="4" rx="1.5" fill="#facc15" />
            {/* Laurel Wreath Crown */}
            <path d="M10 20 C9 14 14 9 20 8 M38 20 C39 14 34 9 28 8" fill="none" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )

      case 'kickboxing':
        // Dynamic High Kick Strike Shield & Lightning
        return (
          <g>
            {/* Pointed Strike Shield */}
            <path d="M24 5 L40 12 L36 33 C33 40 24 44 24 44 C24 44 15 40 12 33 L8 12 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round" />
            {/* Electric Strike Flash */}
            <path d="M26 12 L17 25 L24 25 L21 36 L32 22 L24 22 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
          </g>
        )

      case 'taekwondo':
        // Flying High Crescent Kick & Korean Taegeuk Swirl
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Taegeuk Yin-Yang Wave */}
            <path d="M24 8 A16 16 0 0 1 24 40 C19 40 16 36 16 32 C16 28 20 26 24 24 C28 22 32 20 32 16 C32 12 29 8 24 8 Z" fill="#ef4444" opacity="0.85" />
            <path d="M24 40 A16 16 0 0 1 24 8 C29 8 32 12 32 16 C32 20 28 22 24 24 C20 26 16 28 16 32 C16 36 19 40 24 40 Z" fill="#3b82f6" opacity="0.85" />
            {/* Dynamic Foot Strike Arc */}
            <path d="M10 16 Q24 6 38 18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="39,18 35,14 36,20" fill="#ffffff" />
          </g>
        )

      case 'wrestling':
        // Greco-Roman Locked Arms / Bridge Arch Shield
        return (
          <g>
            <path d="M24 6 C35 6 41 12 41 24 C41 36 33 42 24 42 C15 42 7 36 7 24 C7 12 13 6 24 6 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.8" />
            {/* Interlocking Grip Torc */}
            <path d="M15 22 C15 17 21 14 26 16 L29 20 C31 23 28 27 24 26" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M33 26 C33 31 27 34 22 32 L19 28 C17 25 20 21 24 22" fill="none" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
          </g>
        )

      case 'wushu':
        // Flowing Chinese Dao Saber & Silk Ribbon
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Curved Dao Blade */}
            <path d="M13 36 C18 30 26 23 35 11 C38 8 37 13 33 19 C28 26 22 31 16 37 Z" fill="#e2e8f0" stroke={strokeColor} strokeWidth="1" />
            <circle cx="12" cy="37" r="2.5" fill="#facc15" />
            {/* Flowing Crimson Silk Ribbon */}
            <path d="M10 39 C7 36 9 30 14 30 C19 30 23 35 28 35 C33 35 37 31 38 27" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        )

      case 'taichi':
        // Pure Yin-Yang Taijitu with Circulating Bagua Currents
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill="#0d1117" stroke={strokeColor} strokeWidth="1.6" />
            {/* White Half */}
            <path d="M24 4 A20 20 0 0 1 24 44 A10 10 0 0 1 24 24 A10 10 0 0 0 24 4 Z" fill="#ffffff" />
            {/* Black Half */}
            <path d="M24 44 A20 20 0 0 1 24 4 A10 10 0 0 1 24 24 A10 10 0 0 0 24 44 Z" fill="#18181b" />
            {/* Inner Dots */}
            <circle cx="24" cy="14" r="3.2" fill="#18181b" />
            <circle cx="24" cy="34" r="3.2" fill="#ffffff" />
          </g>
        )

      case 'aikido':
        // Continuous Redirection Harmony Spiral
        return (
          <g>
            <circle cx="24" cy="24" r="21" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Sacred Harmony Spiral */}
            <path d="M24 24 A3 3 0 0 1 27 21 A6 6 0 0 1 33 27 A9 9 0 0 1 24 36 A12 12 0 0 1 12 24 A15 15 0 0 1 27 9" fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="24" cy="24" r="2" fill="#facc15" />
          </g>
        )

      default:
        return (
          <circle cx="24" cy="24" r="18" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
        )
    }
  }

  return (
    <div
      className={`martial-art-emblem ${className}`}
      style={{
        width: s,
        height: s,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        {renderGraphic()}
      </svg>
    </div>
  )
}
