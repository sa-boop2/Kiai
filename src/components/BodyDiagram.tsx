import { haptic } from '../lib/haptics'

export type BodyPart =
  | 'neck'
  | 'shoulders'
  | 'chest'
  | 'arms'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'lowerBack'
  | 'lats'
  | 'glutes'
  | 'hipFlexors'
  | 'adductors'
  | 'hamstrings'
  | 'quads'
  | 'calves'
  | 'feet'

export interface BodyDiagramProps {
  selectedPart: BodyPart | null
  onSelectPart: (part: BodyPart | null) => void
}

const MUSCLE_INFO: Record<BodyPart, { title: string; secondary: string }> = {
  shoulders: { title: 'SHOULDERS', secondary: 'TRAPS & NECK' },
  neck: { title: 'TRAPS & NECK', secondary: 'UPPER BACK' },
  chest: { title: 'CHEST', secondary: 'SHOULDERS & TRICEPS' },
  arms: { title: 'ARMS', secondary: 'FOREARMS & DELTOIDS' },
  biceps: { title: 'BICEPS', secondary: 'FOREARMS & BACK' },
  triceps: { title: 'TRICEPS', secondary: 'CHEST & SHOULDERS' },
  core: { title: 'CORE & ABS', secondary: 'HIP FLEXORS' },
  lowerBack: { title: 'LOWER BACK', secondary: 'GLUTES & HAMSTRINGS' },
  lats: { title: 'LATS & BACK', secondary: 'TRAPS & BICEPS' },
  glutes: { title: 'GLUTES', secondary: 'HAMSTRINGS & LOWER BACK' },
  hipFlexors: { title: 'HIP FLEXORS', secondary: 'QUADS & CORE' },
  adductors: { title: 'ADDUCTORS', secondary: 'HIPS & HAMSTRINGS' },
  hamstrings: { title: 'HAMSTRINGS', secondary: 'GLUTES & CALVES' },
  quads: { title: 'QUADRICEPS', secondary: 'HIP FLEXORS & KNEES' },
  calves: { title: 'CALVES & SHINS', secondary: 'FEET & ANKLES' },
  feet: { title: 'FEET & ANKLES', secondary: 'CALVES' },
}

export function BodyDiagram({ selectedPart, onSelectPart }: BodyDiagramProps) {
  const clickPart = (part: BodyPart, e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('selection')
    onSelectPart(selectedPart === part ? null : part)
  }

  const isSel = (part: BodyPart) => selectedPart === part

  const info = selectedPart ? MUSCLE_INFO[selectedPart] : null

  return (
    <div className="card anatomy-card">
      {/* Header matching reference mockup */}
      <div className="anatomy-header">
        <div className="anatomy-title-row">
          <h3 className="anatomy-title">Muscles Worked</h3>
          {selectedPart && (
            <button
              type="button"
              className="clear-filter-btn"
              onClick={() => onSelectPart(null)}
              aria-label="Clear muscle filter"
            >
              Clear ✕
            </button>
          )}
        </div>

        <div className="anatomy-badges-row">
          <div className="anatomy-badge-item">
            <span className="anatomy-badge-label">Primary</span>
            <span className={`anatomy-pill primary ${info ? 'active' : ''}`}>
              {info ? info.title : 'TAP A MUSCLE'}
            </span>
          </div>

          <div className="anatomy-badge-item">
            <span className="anatomy-badge-label">Secondary</span>
            <span className={`anatomy-pill secondary ${info ? 'active' : ''}`}>
              {info ? info.secondary : 'FRONT & BACK'}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side Dual Anatomical Figures SVG */}
      <div className="anatomy-stage">
        <svg viewBox="0 0 380 340" className="anatomy-svg" aria-label="Interactive body diagram">
          <defs>
            <filter id="purple-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a78bfa" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* ================================================================================= */}
          {/* FRONT FIGURE (Left, centered at X=100) */}
          {/* ================================================================================= */}

          {/* Head & Cranium */}
          <path
            d="M100 24 C90 24 83 31 83 43 C83 55 90 64 100 64 C110 64 117 55 117 43 C117 31 110 24 100 24 Z"
            className="anatomy-part neutral"
          />

          {/* Neck / Anterior Traps */}
          <path
            d="M93 64 L107 64 L110 76 L119 82 L81 82 L90 76 Z"
            className={`anatomy-part selectable ${isSel('neck') ? 'selected' : ''}`}
            onClick={(e) => clickPart('neck', e)}
          />

          {/* Left Shoulder (Anterior Deltoid) */}
          <path
            d="M79 82 C72 84 62 90 58 102 C55 112 60 119 68 119 C74 119 78 108 80 98 Z"
            className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
            onClick={(e) => clickPart('shoulders', e)}
          />

          {/* Right Shoulder (Anterior Deltoid) */}
          <path
            d="M121 82 C128 84 138 90 142 102 C145 112 140 119 132 119 C126 119 122 108 120 98 Z"
            className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
            onClick={(e) => clickPart('shoulders', e)}
          />

          {/* Left Pectoral (Chest) */}
          <path
            d="M80 84 L99 86 L99 116 L80 114 C76 104 77 92 80 84 Z"
            className={`anatomy-part selectable ${isSel('chest') ? 'selected' : ''}`}
            onClick={(e) => clickPart('chest', e)}
          />

          {/* Right Pectoral (Chest) */}
          <path
            d="M120 84 L101 86 L101 116 L120 114 C124 104 123 92 120 84 Z"
            className={`anatomy-part selectable ${isSel('chest') ? 'selected' : ''}`}
            onClick={(e) => clickPart('chest', e)}
          />

          {/* Left Bicep & Arm */}
          <path
            d="M58 104 L52 136 L62 138 L68 120 Z"
            className={`anatomy-part selectable ${isSel('arms') || isSel('biceps') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Right Bicep & Arm */}
          <path
            d="M142 104 L148 136 L138 138 L132 120 Z"
            className={`anatomy-part selectable ${isSel('arms') || isSel('biceps') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Left Forearm */}
          <path
            d="M52 138 L43 178 L53 180 L62 140 Z"
            className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Right Forearm */}
          <path
            d="M148 138 L157 178 L147 180 L138 140 Z"
            className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Left Hand */}
          <path d="M42 180 L35 204 L43 205 L49 182 Z" className="anatomy-part neutral" />
          {/* Right Hand */}
          <path d="M158 180 L165 204 L157 205 L151 182 Z" className="anatomy-part neutral" />

          {/* Core / Abdominals (Upper, Mid, Lower) */}
          <path
            d="M82 118 L98 118 L98 134 L82 134 Z M102 118 L118 118 L118 134 L102 134 Z M82 136 L98 136 L98 152 L82 152 Z M102 136 L118 136 L118 152 L102 152 Z M84 154 L98 154 L98 168 L84 168 Z M102 154 L116 154 L116 168 L102 168 Z"
            className={`anatomy-part selectable ${isSel('core') ? 'selected' : ''}`}
            onClick={(e) => clickPart('core', e)}
          />

          {/* Obliques & Flanks */}
          <path
            d="M74 116 L80 118 L80 166 L74 162 Z M126 116 L120 118 L120 166 L126 162 Z"
            className={`anatomy-part selectable ${isSel('core') ? 'selected' : ''}`}
            onClick={(e) => clickPart('core', e)}
          />

          {/* Hip Flexors & Groin */}
          <path
            d="M76 168 L124 168 L108 190 L92 190 Z"
            className={`anatomy-part selectable ${isSel('hipFlexors') || isSel('adductors') ? 'selected' : ''}`}
            onClick={(e) => clickPart('hipFlexors', e)}
          />

          {/* Left Quadriceps (Front Thigh) */}
          <path
            d="M74 172 C68 188 64 215 72 245 C78 248 88 248 90 238 C90 216 88 188 84 172 Z"
            className={`anatomy-part selectable ${isSel('quads') ? 'selected' : ''}`}
            onClick={(e) => clickPart('quads', e)}
          />

          {/* Right Quadriceps (Front Thigh) */}
          <path
            d="M126 172 C132 188 136 215 128 245 C122 248 112 248 110 238 C110 216 112 188 116 172 Z"
            className={`anatomy-part selectable ${isSel('quads') ? 'selected' : ''}`}
            onClick={(e) => clickPart('quads', e)}
          />

          {/* Knee joints */}
          <circle cx="80" cy="251" r="5" className="anatomy-part neutral" />
          <circle cx="120" cy="251" r="5" className="anatomy-part neutral" />

          {/* Left Calves & Shin */}
          <path
            d="M74 257 C68 274 70 295 74 316 L83 316 C85 295 86 274 84 257 Z"
            className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
            onClick={(e) => clickPart('calves', e)}
          />

          {/* Right Calves & Shin */}
          <path
            d="M126 257 C132 274 130 295 126 316 L117 316 C115 295 114 274 116 257 Z"
            className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
            onClick={(e) => clickPart('calves', e)}
          />

          {/* Feet (Front) */}
          <path
            d="M71 318 L67 332 L83 332 L81 318 Z M129 318 L133 332 L117 332 L119 318 Z"
            className={`anatomy-part selectable ${isSel('feet') ? 'selected' : ''}`}
            onClick={(e) => clickPart('feet', e)}
          />

          {/* ================================================================================= */}
          {/* BACK FIGURE (Right, centered at X=280) */}
          {/* ================================================================================= */}

          {/* Head & Cranium (Back) */}
          <path
            d="M280 24 C270 24 263 31 263 43 C263 55 270 64 280 64 C290 64 297 55 297 43 C297 31 290 24 280 24 Z"
            className="anatomy-part neutral"
          />

          {/* Large Trapezius Diamond (Back Traps & Upper Neck) - Key focal highlight */}
          <path
            d="M275 64 L285 64 L289 74 L306 82 L289 122 L280 148 L271 122 L254 82 L271 74 Z"
            className={`anatomy-part selectable ${isSel('neck') ? 'selected' : ''}`}
            onClick={(e) => clickPart('neck', e)}
          />

          {/* Left Rear Deltoid (Shoulder) */}
          <path
            d="M252 82 C245 84 238 90 236 102 C234 112 240 119 248 119 C252 119 256 108 258 98 Z"
            className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
            onClick={(e) => clickPart('shoulders', e)}
          />

          {/* Right Rear Deltoid (Shoulder) */}
          <path
            d="M308 82 C315 84 322 90 324 102 C326 112 320 119 312 119 C308 119 304 108 302 98 Z"
            className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
            onClick={(e) => clickPart('shoulders', e)}
          />

          {/* Left Tricep & Arm */}
          <path
            d="M236 104 L230 136 L240 138 L246 120 Z"
            className={`anatomy-part selectable ${isSel('arms') || isSel('triceps') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Right Tricep & Arm */}
          <path
            d="M324 104 L330 136 L320 138 L314 120 Z"
            className={`anatomy-part selectable ${isSel('arms') || isSel('triceps') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Left Rear Forearm */}
          <path
            d="M230 138 L221 178 L231 180 L240 140 Z"
            className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Right Rear Forearm */}
          <path
            d="M330 138 L339 178 L329 180 L320 140 Z"
            className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
            onClick={(e) => clickPart('arms', e)}
          />

          {/* Left Hand (Back) */}
          <path d="M220 180 L213 204 L221 205 L227 182 Z" className="anatomy-part neutral" />
          {/* Right Hand (Back) */}
          <path d="M340 180 L347 204 L339 205 L333 182 Z" className="anatomy-part neutral" />

          {/* Left Latissimus Dorsi (Lats / Upper Back Wing) */}
          <path
            d="M255 106 L270 124 L272 152 L256 142 C252 130 252 118 255 106 Z"
            className={`anatomy-part selectable ${isSel('lats') ? 'selected' : ''}`}
            onClick={(e) => clickPart('lats', e)}
          />

          {/* Right Latissimus Dorsi (Lats / Upper Back Wing) */}
          <path
            d="M305 106 L290 124 L288 152 L304 142 C308 130 308 118 305 106 Z"
            className={`anatomy-part selectable ${isSel('lats') ? 'selected' : ''}`}
            onClick={(e) => clickPart('lats', e)}
          />

          {/* Lower Back (Erector Spinae / Lumbar) */}
          <path
            d="M274 150 L286 150 L288 174 L272 174 Z"
            className={`anatomy-part selectable ${isSel('lowerBack') ? 'selected' : ''}`}
            onClick={(e) => clickPart('lowerBack', e)}
          />

          {/* Left Glute (Gluteus Maximus) */}
          <path
            d="M260 174 C260 196 270 212 279 212 L279 174 Z"
            className={`anatomy-part selectable ${isSel('glutes') ? 'selected' : ''}`}
            onClick={(e) => clickPart('glutes', e)}
          />

          {/* Right Glute (Gluteus Maximus) */}
          <path
            d="M300 174 C300 196 290 212 281 212 L281 174 Z"
            className={`anatomy-part selectable ${isSel('glutes') ? 'selected' : ''}`}
            onClick={(e) => clickPart('glutes', e)}
          />

          {/* Left Hamstring (Back Thigh) */}
          <path
            d="M260 214 C256 228 258 245 264 248 C270 248 276 238 278 214 Z"
            className={`anatomy-part selectable ${isSel('hamstrings') ? 'selected' : ''}`}
            onClick={(e) => clickPart('hamstrings', e)}
          />

          {/* Right Hamstring (Back Thigh) */}
          <path
            d="M300 214 C304 228 302 245 296 248 C290 248 284 238 282 214 Z"
            className={`anatomy-part selectable ${isSel('hamstrings') ? 'selected' : ''}`}
            onClick={(e) => clickPart('hamstrings', e)}
          />

          {/* Left Calf (Gastrocnemius - Dual Heads) */}
          <path
            d="M256 257 C250 274 252 295 256 316 L265 316 C267 295 268 274 266 257 Z"
            className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
            onClick={(e) => clickPart('calves', e)}
          />

          {/* Right Calf (Gastrocnemius - Dual Heads) */}
          <path
            d="M304 257 C310 274 308 295 304 316 L295 316 C293 295 292 274 294 257 Z"
            className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
            onClick={(e) => clickPart('calves', e)}
          />

          {/* Feet (Back / Achilles) */}
          <path
            d="M253 318 L249 332 L265 332 L263 318 Z M307 318 L311 332 L295 332 L297 318 Z"
            className={`anatomy-part selectable ${isSel('feet') ? 'selected' : ''}`}
            onClick={(e) => clickPart('feet', e)}
          />
        </svg>
      </div>
    </div>
  )
}
