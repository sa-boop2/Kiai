import { useRef, useState } from 'react'
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

const MUSCLE_TITLES: Record<BodyPart, string> = {
  shoulders: 'Shoulders',
  neck: 'Traps & Neck',
  chest: 'Chest',
  arms: 'Forearms & Arms',
  biceps: 'Biceps',
  triceps: 'Triceps',
  core: 'Abs & Obliques',
  lowerBack: 'Lower Back',
  lats: 'Lats & Upper Back',
  glutes: 'Glutes',
  hipFlexors: 'Abductors & Hips',
  adductors: 'Adductors & Groin',
  hamstrings: 'Hamstrings',
  quads: 'Quadriceps',
  calves: 'Calves & Shins',
  feet: 'Feet & Ankles',
}

export function BodyDiagram({ selectedPart, onSelectPart }: BodyDiagramProps) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const clickPart = (part: BodyPart) => {
    haptic('selection')
    onSelectPart(selectedPart === part ? null : part)
  }

  const isSel = (part: BodyPart) => selectedPart === part

  // Touch swipe between Front and Back
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const diffX = e.changedTouches[0].clientX - touchStartX.current
    const diffY = e.changedTouches[0].clientY - touchStartY.current

    // Horizontal swipe threshold: 40px and more horizontal than vertical
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0 && view === 'front') {
        haptic('selection')
        setView('back')
      } else if (diffX > 0 && view === 'back') {
        haptic('selection')
        setView('front')
      }
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <div className="card anatomy-card">
      {/* Header: Clean iOS presentation showing Muscle Selection only */}
      <div className="anatomy-header">
        <div className="anatomy-title-row">
          <h3 className="anatomy-title">Target Muscles</h3>
          {selectedPart ? (
            <div
              className="anatomy-selected-badge"
              role="button"
              tabIndex={0}
              onClick={() => {
                haptic('light')
                onSelectPart(null)
              }}
              title="Tap to deselect"
            >
              <span className="anatomy-dot-indicator" />
              <strong>{MUSCLE_TITLES[selectedPart]}</strong>
            </div>
          ) : (
            <span className="anatomy-hint-text">
              Tap muscle · Swipe to flip
            </span>
          )}
        </div>
      </div>

      {/* Swipeable Large Anatomy Stage */}
      <div
        className="anatomy-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`anatomy-figure-container ${view === 'front' ? 'show-front' : 'show-back'}`}>
          {view === 'front' ? (
            /* FRONT VIEW SVG */
            <svg viewBox="0 0 380 560" className="anatomy-svg" aria-label="Interactive Front Body Diagram">
              <defs>
                <filter id="yellow-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#facc15" floodOpacity="0.8" />
                </filter>
                <filter id="accent-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="var(--accent, #facc15)" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* Athletic Silhouette Anatomy Vector Shapes */}
              <g className="anatomy-body-shapes">
                {/* Head & Neck */}
                <path
                  d="M190 28 C176 28 166 38 166 54 C166 70 176 80 190 80 C204 80 214 70 214 54 C214 38 204 28 190 28 Z"
                  className="anatomy-part neutral"
                />
                {/* Sternocleidomastoid & Neck */}
                <path
                  d="M180 80 L200 80 L206 98 L218 106 L162 106 L174 98 Z"
                  className={`anatomy-part selectable ${isSel('neck') ? 'selected' : ''}`}
                  onClick={() => clickPart('neck')}
                />
                <path d="M185 82 L188 102 M195 82 L192 102" className="anatomy-striation" />

                {/* Left Shoulder (Anterior & Lateral Deltoid) */}
                <path
                  d="M160 106 C150 110 134 118 126 136 C122 150 130 160 142 160 C150 160 156 144 160 128 Z"
                  className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
                  onClick={() => clickPart('shoulders')}
                />
                <path d="M152 112 Q140 125 136 145 M144 118 Q134 132 132 148" className="anatomy-striation" />

                {/* Right Shoulder (Anterior & Lateral Deltoid) */}
                <path
                  d="M220 106 C230 110 246 118 254 136 C258 150 250 160 238 160 C230 160 224 144 220 128 Z"
                  className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
                  onClick={() => clickPart('shoulders')}
                />
                <path d="M228 112 Q240 125 244 145 M236 118 Q246 132 248 148" className="anatomy-striation" />

                {/* Left Pectoral (Chest) */}
                <path
                  d="M160 108 L188 112 L188 155 L160 152 C154 138 156 120 160 108 Z"
                  className={`anatomy-part selectable ${isSel('chest') ? 'selected' : ''}`}
                  onClick={() => clickPart('chest')}
                />
                <path d="M164 120 Q176 124 186 126 M162 132 Q174 136 186 138 M164 144 Q174 146 186 148" className="anatomy-striation" />

                {/* Right Pectoral (Chest) */}
                <path
                  d="M220 108 L192 112 L192 155 L220 152 C226 138 224 120 220 108 Z"
                  className={`anatomy-part selectable ${isSel('chest') ? 'selected' : ''}`}
                  onClick={() => clickPart('chest')}
                />
                <path d="M216 120 Q204 124 194 126 M218 132 Q206 136 194 138 M216 144 Q206 146 194 148" className="anatomy-striation" />

                {/* Left Bicep (Long & Short Heads) */}
                <path
                  d="M126 140 L116 186 L130 190 L140 164 Z"
                  className={`anatomy-part selectable ${isSel('biceps') || isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('biceps')}
                />
                <path d="M123 152 L121 178" className="anatomy-striation" />

                {/* Right Bicep (Long & Short Heads) */}
                <path
                  d="M254 140 L264 186 L250 190 L240 164 Z"
                  className={`anatomy-part selectable ${isSel('biceps') || isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('biceps')}
                />
                <path d="M257 152 L259 178" className="anatomy-striation" />

                {/* Forearms */}
                <path
                  d="M116 190 L102 248 L118 252 L132 194 Z"
                  className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('arms')}
                />
                <path d="M112 205 L108 238" className="anatomy-striation" />
                <path
                  d="M264 190 L278 248 L262 252 L248 194 Z"
                  className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('arms')}
                />
                <path d="M268 205 L272 238" className="anatomy-striation" />

                {/* Hands */}
                <path d="M102 252 L92 286 L104 288 L114 256 Z" className="anatomy-part neutral" />
                <path d="M278 252 L288 286 L276 288 L266 256 Z" className="anatomy-part neutral" />

                {/* Abdominals (6-pack with Linea Alba) */}
                <path
                  d="M164 158 L187 158 L187 182 L164 182 Z M193 158 L216 158 L216 182 L193 182 Z M164 185 L187 185 L187 208 L164 208 Z M193 185 L216 185 L216 208 L193 208 Z M167 211 L187 211 L187 232 L167 232 Z M193 211 L213 211 L213 232 L193 232 Z"
                  className={`anatomy-part selectable ${isSel('core') ? 'selected' : ''}`}
                  onClick={() => clickPart('core')}
                />
                {/* Tendinous intersections */}
                <line x1="166" y1="183.5" x2="214" y2="183.5" className="anatomy-striation" />
                <line x1="166" y1="209.5" x2="214" y2="209.5" className="anatomy-striation" />
                <line x1="190" y1="158" x2="190" y2="232" className="anatomy-striation" />

                {/* Obliques & Serratus Anterior */}
                <path
                  d="M154 156 L162 158 L162 228 L154 222 Z M226 156 L218 158 L218 228 L226 222 Z"
                  className={`anatomy-part selectable ${isSel('core') ? 'selected' : ''}`}
                  onClick={() => clickPart('core')}
                />
                <path d="M155 170 L160 174 M154 185 L160 189 M154 200 L160 204" className="anatomy-striation" />
                <path d="M225 170 L220 174 M226 185 L220 189 M226 200 L220 204" className="anatomy-striation" />

                {/* Black Athletic Training Shorts */}
                <path
                  d="M152 232 L228 232 L234 300 L195 304 L190 265 L185 304 L146 300 Z"
                  fill="#0e1017"
                  stroke="#1c202e"
                  strokeWidth="1.5"
                />

                {/* Adductors / Inner Thighs */}
                <path
                  d="M175 298 L190 268 L184 340 L174 340 Z M205 298 L190 268 L196 340 L206 340 Z"
                  className={`anatomy-part selectable ${isSel('adductors') ? 'selected' : ''}`}
                  onClick={() => clickPart('adductors')}
                />

                {/* Abductors / Outer Thighs */}
                <path
                  d="M146 300 C138 325 138 365 146 410 L151 408 C144 365 144 325 151 300 Z M234 300 C242 325 242 365 234 410 L229 408 C236 365 236 325 229 300 Z"
                  className={`anatomy-part selectable ${isSel('hipFlexors') ? 'selected' : ''}`}
                  onClick={() => clickPart('hipFlexors')}
                />

                {/* Quadriceps (Vastus Lateralis, Rectus Femoris, Vastus Medialis Teardrop) */}
                <path
                  d="M150 298 C140 324 135 365 146 410 C154 414 168 414 172 398 C172 368 170 324 164 298 Z"
                  className={`anatomy-part selectable ${isSel('quads') ? 'selected' : ''}`}
                  onClick={() => clickPart('quads')}
                />
                {/* Teardrop Vastus Medialis & central groove */}
                <path d="M162 315 C164 345 166 380 168 402" className="anatomy-striation" />
                <path d="M150 330 C146 360 148 385 152 405" className="anatomy-striation" />

                <path
                  d="M230 298 C240 324 245 365 234 410 C226 414 212 414 208 398 C208 368 210 324 216 298 Z"
                  className={`anatomy-part selectable ${isSel('quads') ? 'selected' : ''}`}
                  onClick={() => clickPart('quads')}
                />
                <path d="M218 315 C216 345 214 380 212 402" className="anatomy-striation" />
                <path d="M230 330 C234 360 232 385 228 405" className="anatomy-striation" />

                {/* Knees */}
                <circle cx="158" cy="418" r="7" className="anatomy-part neutral" />
                <circle cx="222" cy="418" r="7" className="anatomy-part neutral" />

                {/* Calves & Shins */}
                <path
                  d="M150 426 C140 450 144 482 150 512 L164 512 C168 482 170 450 166 426 Z"
                  className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
                  onClick={() => clickPart('calves')}
                />
                <path
                  d="M230 426 C240 450 236 482 230 512 L216 512 C212 482 210 450 214 426 Z"
                  className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
                  onClick={() => clickPart('calves')}
                />

                {/* Feet */}
                <path
                  d="M146 514 L140 538 L165 538 L162 514 Z M234 514 L240 538 L215 538 L218 514 Z"
                  className={`anatomy-part selectable ${isSel('feet') ? 'selected' : ''}`}
                  onClick={() => clickPart('feet')}
                />
              </g>

              {/* ========================================================================= */}
              {/* CALLOUT PINS & DASHED CONNECTIONS (MATCHING FRONT SCREENSHOT) */}
              {/* ========================================================================= */}

              {/* Left 1: Shoulders */}
              <line x1="82" y1="135" x2="135" y2="135" className={`anatomy-dashed ${isSel('shoulders') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('shoulders')}>
                <circle cx="135" cy="135" r="22" fill="transparent" />
                {isSel('shoulders') && <circle cx="135" cy="135" r="14" className="anatomy-pulse-ring" />}
                <circle cx="135" cy="135" r="7" className={`anatomy-pin-dot ${isSel('shoulders') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('shoulders')}>
                <rect x="8" y="115" width="80" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="139" className={`anatomy-callout-text ${isSel('shoulders') ? 'selected' : ''}`}>Shoulders</text>
              </g>

              {/* Left 2: Chest */}
              <line x1="58" y1="175" x2="174" y2="130" className={`anatomy-dashed ${isSel('chest') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('chest')}>
                <circle cx="174" cy="130" r="22" fill="transparent" />
                {isSel('chest') && <circle cx="174" cy="130" r="14" className="anatomy-pulse-ring" />}
                <circle cx="174" cy="130" r="7" className={`anatomy-pin-dot ${isSel('chest') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('chest')}>
                <rect x="8" y="155" width="60" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="179" className={`anatomy-callout-text ${isSel('chest') ? 'selected' : ''}`}>Chest</text>
              </g>

              {/* Left 3: Forearms */}
              <line x1="78" y1="245" x2="110" y2="245" className={`anatomy-dashed ${isSel('arms') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('arms')}>
                <circle cx="110" cy="245" r="22" fill="transparent" />
                {isSel('arms') && <circle cx="110" cy="245" r="14" className="anatomy-pulse-ring" />}
                <circle cx="110" cy="245" r="7" className={`anatomy-pin-dot ${isSel('arms') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('arms')}>
                <rect x="8" y="225" width="76" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="249" className={`anatomy-callout-text ${isSel('arms') ? 'selected' : ''}`}>Forearms</text>
              </g>

              {/* Left 4: Obliques */}
              <line x1="72" y1="290" x2="158" y2="195" className={`anatomy-dashed ${isSel('core') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('core')}>
                <circle cx="158" cy="195" r="22" fill="transparent" />
                {isSel('core') && <circle cx="158" cy="195" r="14" className="anatomy-pulse-ring" />}
                <circle cx="158" cy="195" r="7" className={`anatomy-pin-dot ${isSel('core') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('core')}>
                <rect x="8" y="270" width="72" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="294" className={`anatomy-callout-text ${isSel('core') ? 'selected' : ''}`}>Obliques</text>
              </g>

              {/* Left 4.5: Abductors */}
              <line x1="72" y1="335" x2="142" y2="335" className={`anatomy-dashed ${isSel('hipFlexors') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('hipFlexors')}>
                <circle cx="142" cy="335" r="22" fill="transparent" />
                {isSel('hipFlexors') && <circle cx="142" cy="335" r="14" className="anatomy-pulse-ring" />}
                <circle cx="142" cy="335" r="7" className={`anatomy-pin-dot ${isSel('hipFlexors') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('hipFlexors')}>
                <rect x="8" y="315" width="82" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="339" className={`anatomy-callout-text ${isSel('hipFlexors') ? 'selected' : ''}`}>Abductors</text>
              </g>

              {/* Left 5: Quads */}
              <line x1="56" y1="365" x2="155" y2="365" className={`anatomy-dashed ${isSel('quads') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('quads')}>
                <circle cx="155" cy="365" r="22" fill="transparent" />
                {isSel('quads') && <circle cx="155" cy="365" r="14" className="anatomy-pulse-ring" />}
                <circle cx="155" cy="365" r="7" className={`anatomy-pin-dot ${isSel('quads') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('quads')}>
                <rect x="8" y="345" width="56" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="369" className={`anatomy-callout-text ${isSel('quads') ? 'selected' : ''}`}>Quads</text>
              </g>

              {/* Right 1: Biceps */}
              <line x1="315" y1="180" x2="257" y2="165" className={`anatomy-dashed ${isSel('biceps') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('biceps')}>
                <circle cx="257" cy="165" r="22" fill="transparent" />
                {isSel('biceps') && <circle cx="257" cy="165" r="14" className="anatomy-pulse-ring" />}
                <circle cx="257" cy="165" r="7" className={`anatomy-pin-dot ${isSel('biceps') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('biceps')}>
                <rect x="305" y="175" width="67" height="38" rx="10" className="anatomy-label-plate" />
                <text x="366" y="199" textAnchor="end" className={`anatomy-callout-text ${isSel('biceps') ? 'selected' : ''}`}>Biceps</text>
              </g>

              {/* Right 3: Abs */}
              <line x1="330" y1="245" x2="210" y2="195" className={`anatomy-dashed ${isSel('core') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('core')}>
                <circle cx="210" cy="195" r="22" fill="transparent" />
                {isSel('core') && <circle cx="210" cy="195" r="14" className="anatomy-pulse-ring" />}
                <circle cx="210" cy="195" r="7" className={`anatomy-pin-dot ${isSel('core') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('core')}>
                <rect x="325" y="225" width="47" height="38" rx="10" className="anatomy-label-plate" />
                <text x="366" y="249" textAnchor="end" className={`anatomy-callout-text ${isSel('core') ? 'selected' : ''}`}>Abs</text>
              </g>

              {/* Right 4: Adductors */}
              <line x1="295" y1="390" x2="199" y2="325" className={`anatomy-dashed ${isSel('adductors') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('adductors')}>
                <circle cx="199" cy="325" r="22" fill="transparent" />
                {isSel('adductors') && <circle cx="199" cy="325" r="14" className="anatomy-pulse-ring" />}
                <circle cx="199" cy="325" r="7" className={`anatomy-pin-dot ${isSel('adductors') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('adductors')}>
                <rect x="285" y="370" width="87" height="38" rx="10" className="anatomy-label-plate" />
                <text x="366" y="394" textAnchor="end" className={`anatomy-callout-text ${isSel('adductors') ? 'selected' : ''}`}>Adductors</text>
              </g>
            </svg>
          ) : (
            /* BACK VIEW SVG */
            <svg viewBox="0 0 380 560" className="anatomy-svg" aria-label="Interactive Back Body Diagram">
              <defs>
                <filter id="yellow-glow-back" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#facc15" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Athletic Silhouette Anatomy Vector Shapes (Back) */}
              <g className="anatomy-body-shapes">
                {/* Head (Back) */}
                <path
                  d="M190 28 C176 28 166 38 166 54 C166 70 176 80 190 80 C204 80 214 70 214 54 C214 38 204 28 190 28 Z"
                  className="anatomy-part neutral"
                />

                {/* Trapezius Diamond */}
                <path
                  d="M182 80 L198 80 L204 96 L232 108 L204 165 L190 200 L176 165 L148 108 L176 96 Z"
                  className={`anatomy-part selectable ${isSel('neck') ? 'selected' : ''}`}
                  onClick={() => clickPart('neck')}
                />
                <path d="M190 84 L190 196 M176 102 L190 120 L204 102 M168 125 L190 152 L212 125" className="anatomy-striation" />

                {/* Left Rear Deltoid */}
                <path
                  d="M144 108 C134 112 124 122 122 140 C118 152 128 162 138 162 C146 162 152 146 156 130 Z"
                  className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
                  onClick={() => clickPart('shoulders')}
                />
                <path d="M140 116 Q130 130 128 148" className="anatomy-striation" />

                {/* Right Rear Deltoid */}
                <path
                  d="M236 108 C246 112 256 122 258 140 C262 152 252 162 242 162 C234 162 228 146 224 130 Z"
                  className={`anatomy-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
                  onClick={() => clickPart('shoulders')}
                />
                <path d="M240 116 Q250 130 252 148" className="anatomy-striation" />

                {/* Left Tricep (Lateral & Long Heads) */}
                <path
                  d="M122 142 L112 188 L126 192 L136 166 Z"
                  className={`anatomy-part selectable ${isSel('triceps') || isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('triceps')}
                />
                <path d="M120 155 L118 180" className="anatomy-striation" />

                {/* Right Tricep (Lateral & Long Heads) */}
                <path
                  d="M258 142 L268 188 L254 192 L244 166 Z"
                  className={`anatomy-part selectable ${isSel('triceps') || isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('triceps')}
                />
                <path d="M260 155 L262 180" className="anatomy-striation" />

                {/* Forearms (Back) */}
                <path
                  d="M112 192 L98 250 L114 254 L128 196 Z"
                  className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('arms')}
                />
                <path d="M108 206 L104 240" className="anatomy-striation" />
                <path
                  d="M268 192 L282 250 L266 254 L252 196 Z"
                  className={`anatomy-part selectable ${isSel('arms') ? 'selected' : ''}`}
                  onClick={() => clickPart('arms')}
                />
                <path d="M272 206 L276 240" className="anatomy-striation" />

                {/* Hands (Back) */}
                <path d="M98 254 L88 288 L100 290 L110 258 Z" className="anatomy-part neutral" />
                <path d="M282 254 L292 288 L280 290 L270 258 Z" className="anatomy-part neutral" />

                {/* Lats (Latissimus Dorsi Wings) */}
                <path
                  d="M148 142 L172 168 L175 208 L152 194 C146 176 144 158 148 142 Z"
                  className={`anatomy-part selectable ${isSel('lats') ? 'selected' : ''}`}
                  onClick={() => clickPart('lats')}
                />
                <path d="M152 155 Q164 175 168 198" className="anatomy-striation" />

                <path
                  d="M232 142 L208 168 L205 208 L228 194 C234 176 236 158 232 142 Z"
                  className={`anatomy-part selectable ${isSel('lats') ? 'selected' : ''}`}
                  onClick={() => clickPart('lats')}
                />
                <path d="M228 155 Q216 175 212 198" className="anatomy-striation" />

                {/* Lower Back / Erector Spinae Columns */}
                <path
                  d="M180 202 L200 202 L204 238 L176 238 Z"
                  className={`anatomy-part selectable ${isSel('lowerBack') ? 'selected' : ''}`}
                  onClick={() => clickPart('lowerBack')}
                />
                <line x1="186" y1="205" x2="186" y2="235" className="anatomy-striation" />
                <line x1="194" y1="205" x2="194" y2="235" className="anatomy-striation" />

                {/* Shorts / Pelvis */}
                <path
                  d="M148 238 L232 238 L238 308 L195 312 L190 274 L185 312 L142 308 Z"
                  fill="#0e1017"
                  stroke="#1c202e"
                  strokeWidth="1.5"
                />

                {/* Glutes (Gluteus Maximus & Medius) */}
                <path
                  d="M154 240 C154 274 170 300 185 300 L185 240 Z"
                  className={`anatomy-part selectable ${isSel('glutes') ? 'selected' : ''}`}
                  onClick={() => clickPart('glutes')}
                />
                <path d="M158 255 Q172 275 180 292" className="anatomy-striation" />

                <path
                  d="M226 240 C226 274 210 300 195 300 L195 240 Z"
                  className={`anatomy-part selectable ${isSel('glutes') ? 'selected' : ''}`}
                  onClick={() => clickPart('glutes')}
                />
                <path d="M222 255 Q208 275 200 292" className="anatomy-striation" />

                

                {/* Hamstrings (Biceps Femoris & Semitendinosus) */}
                <path
                  d="M152 310 C146 332 148 358 158 364 C168 364 176 348 180 310 Z"
                  className={`anatomy-part selectable ${isSel('hamstrings') ? 'selected' : ''}`}
                  onClick={() => clickPart('hamstrings')}
                />
                <path d="M164 316 L164 360" className="anatomy-striation" />

                <path
                  d="M228 310 C234 332 232 358 222 364 C212 364 204 348 200 310 Z"
                  className={`anatomy-part selectable ${isSel('hamstrings') ? 'selected' : ''}`}
                  onClick={() => clickPart('hamstrings')}
                />
                <path d="M216 316 L216 360" className="anatomy-striation" />

                {/* Popliteal / Knee Back */}
                <circle cx="158" cy="385" r="7" className="anatomy-part neutral" />
                <circle cx="222" cy="385" r="7" className="anatomy-part neutral" />

                {/* Calves (Gastrocnemius Medial & Lateral Heads) */}
                <path
                  d="M148 395 C138 424 142 460 148 495 L162 495 C166 460 168 424 164 395 Z"
                  className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
                  onClick={() => clickPart('calves')}
                />
                <path d="M155 408 L155 460" className="anatomy-striation" />

                <path
                  d="M232 395 C242 424 238 460 232 495 L218 495 C214 460 212 424 216 395 Z"
                  className={`anatomy-part selectable ${isSel('calves') ? 'selected' : ''}`}
                  onClick={() => clickPart('calves')}
                />
                <path d="M225 408 L225 460" className="anatomy-striation" />

                {/* Feet (Back) */}
                <path
                  d="M144 498 L138 528 L163 528 L160 498 Z M236 498 L242 528 L217 528 L220 498 Z"
                  className={`anatomy-part selectable ${isSel('feet') ? 'selected' : ''}`}
                  onClick={() => clickPart('feet')}
                />
              </g>

              {/* ========================================================================= */}
              {/* CALLOUT PINS & DASHED CONNECTIONS (MATCHING BACK SCREENSHOT) */}
              {/* ========================================================================= */}

              {/* Left 1: Traps & Neck */}
              <line x1="102" y1="120" x2="185" y2="120" className={`anatomy-dashed ${isSel('neck') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('neck')}>
                <circle cx="185" cy="120" r="22" fill="transparent" />
                {isSel('neck') && <circle cx="185" cy="120" r="14" className="anatomy-pulse-ring" />}
                <circle cx="185" cy="120" r="7" className={`anatomy-pin-dot ${isSel('neck') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('neck')}>
                <rect x="8" y="100" width="98" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="124" className={`anatomy-callout-text ${isSel('neck') ? 'selected' : ''}`}>Traps & Neck</text>
              </g>

              {/* Left 2: Triceps */}
              <line x1="68" y1="185" x2="115" y2="185" className={`anatomy-dashed ${isSel('triceps') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('triceps')}>
                <circle cx="115" cy="185" r="22" fill="transparent" />
                {isSel('triceps') && <circle cx="115" cy="185" r="14" className="anatomy-pulse-ring" />}
                <circle cx="115" cy="185" r="7" className={`anatomy-pin-dot ${isSel('triceps') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('triceps')}>
                <rect x="8" y="165" width="68" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="189" className={`anatomy-callout-text ${isSel('triceps') ? 'selected' : ''}`}>Triceps</text>
              </g>

              {/* Left 3: Hamstrings */}
              <line x1="92" y1="365" x2="160" y2="365" className={`anatomy-dashed ${isSel('hamstrings') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('hamstrings')}>
                <circle cx="160" cy="365" r="22" fill="transparent" />
                {isSel('hamstrings') && <circle cx="160" cy="365" r="14" className="anatomy-pulse-ring" />}
                <circle cx="160" cy="365" r="7" className={`anatomy-pin-dot ${isSel('hamstrings') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('hamstrings')}>
                <rect x="8" y="345" width="90" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="369" className={`anatomy-callout-text ${isSel('hamstrings') ? 'selected' : ''}`}>Hamstrings</text>
              </g>

              {/* Left 5: Calves */}
              <line x1="62" y1="460" x2="160" y2="460" className={`anatomy-dashed ${isSel('calves') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('calves')}>
                <circle cx="160" cy="460" r="22" fill="transparent" />
                {isSel('calves') && <circle cx="160" cy="460" r="14" className="anatomy-pulse-ring" />}
                <circle cx="160" cy="460" r="7" className={`anatomy-pin-dot ${isSel('calves') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('calves')}>
                <rect x="8" y="440" width="62" height="38" rx="10" className="anatomy-label-plate" />
                <text x="14" y="464" className={`anatomy-callout-text ${isSel('calves') ? 'selected' : ''}`}>Calves</text>
              </g>

              {/* Right 1: Lats */}
              <line x1="325" y1="185" x2="225" y2="185" className={`anatomy-dashed ${isSel('lats') ? 'active' : ''}`} />
              <g className="anatomy-pin-target" onClick={() => clickPart('lats')}>
                <circle cx="225" cy="185" r="22" fill="transparent" />
                {isSel('lats') && <circle cx="225" cy="185" r="14" className="anatomy-pulse-ring" />}
                <circle cx="225" cy="185" r="7" className={`anatomy-pin-dot ${isSel('lats') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('lats')}>
                <rect x="315" y="165" width="55" height="38" rx="10" className="anatomy-label-plate" />
                <text x="366" y="189" textAnchor="end" className={`anatomy-callout-text ${isSel('lats') ? 'selected' : ''}`}>Lats</text>
              </g>

              {/* Right 3: Lower back (L-shaped line from screenshot) */}
              <path
                d="M366 275 L200 275 L195 219"
                fill="none"
                className={`anatomy-dashed ${isSel('lowerBack') ? 'active' : ''}`}
              />
              <g className="anatomy-pin-target" onClick={() => clickPart('lowerBack')}>
                <circle cx="195" cy="219" r="22" fill="transparent" />
                {isSel('lowerBack') && <circle cx="195" cy="219" r="14" className="anatomy-pulse-ring" />}
                <circle cx="195" cy="219" r="7" className={`anatomy-pin-dot ${isSel('lowerBack') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('lowerBack')}>
                <rect x="275" y="255" width="97" height="38" rx="10" className="anatomy-label-plate" />
                <text x="366" y="272" textAnchor="end" className={`anatomy-callout-text ${isSel('lowerBack') ? 'selected' : ''}`}>Lower back</text>
              </g>

              {/* Right 4: Glutes (L-shaped line from screenshot) */}
              <path
                d="M366 325 L212 325 L212 272"
                fill="none"
                className={`anatomy-dashed ${isSel('glutes') ? 'active' : ''}`}
              />
              <g className="anatomy-pin-target" onClick={() => clickPart('glutes')}>
                <circle cx="212" cy="272" r="22" fill="transparent" />
                {isSel('glutes') && <circle cx="212" cy="272" r="14" className="anatomy-pulse-ring" />}
                <circle cx="212" cy="272" r="7" className={`anatomy-pin-dot ${isSel('glutes') ? 'selected' : ''}`} />
              </g>
              <g className="anatomy-label-target" onClick={() => clickPart('glutes')}>
                <rect x="305" y="305" width="67" height="38" rx="10" className="anatomy-label-plate" />
                <text x="366" y="322" textAnchor="end" className={`anatomy-callout-text ${isSel('glutes') ? 'selected' : ''}`}>Glutes</text>
              </g>
            </svg>
          )}
        </div>

        {/* Subtle Liquid Glass Swipe Dots Indicator */}
        <div
          className="anatomy-swipe-dots"
          onClick={() => {
            haptic('selection')
            setView((v) => (v === 'front' ? 'back' : 'front'))
          }}
          aria-label={`View is ${view}. Swipe or tap to flip.`}
          role="button"
          tabIndex={0}
        >
          <span className={`anatomy-dot ${view === 'front' ? 'active' : ''}`} />
          <span className={`anatomy-dot ${view === 'back' ? 'active' : ''}`} />
          <span className="anatomy-dot-label">{view === 'front' ? 'Front' : 'Back'} · Swipe to flip</span>
        </div>
      </div>
    </div>
  )
}


