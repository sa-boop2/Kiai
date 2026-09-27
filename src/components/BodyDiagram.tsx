import { useState, useRef } from 'react'
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

export function BodyDiagram({ selectedPart, onSelectPart }: BodyDiagramProps) {
  const [view, setView] = useState<'front' | 'back'>('front')
  const touch = useRef<{ startX: number; startY: number; moved: boolean } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleView = (next: 'front' | 'back') => {
    if (next !== view) {
      haptic('light')
      setView(next)
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    touch.current = { startX: e.clientX, startY: e.clientY, moved: false }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!touch.current) return
    const dx = e.clientX - touch.current.startX
    const dy = e.clientY - touch.current.startY
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      touch.current.moved = true
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touch.current) return
    const dx = e.clientX - touch.current.startX
    const dy = e.clientY - touch.current.startY
    touch.current = null

    // Horizontal swipe threshold: 40px
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0 && view === 'front') {
        toggleView('back')
      } else if (dx > 0 && view === 'back') {
        toggleView('front')
      }
    }
  }

  const clickPart = (part: BodyPart, e: React.MouseEvent) => {
    e.stopPropagation()
    haptic('selection')
    onSelectPart(selectedPart === part ? null : part)
  }

  const isSel = (part: BodyPart) => selectedPart === part

  return (
    <div className="body-diagram-card card">
      {/* Top bar with View Flip pill and active filter readout */}
      <div className="body-diagram-header">
        <span className="body-diagram-title">
          {selectedPart ? (
            <span className="selected-tag">
              Target: <strong>{formatPartName(selectedPart)}</strong>
              <button
                type="button"
                className="clear-filter-btn"
                onClick={() => onSelectPart(null)}
                aria-label="Clear muscle filter"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className="hint-text">Swipe to flip · Tap a muscle to filter</span>
          )}
        </span>

        {/* Front / Back Toggle Pill */}
        <div className="body-view-toggle">
          <button
            type="button"
            className={`body-view-btn ${view === 'front' ? 'active' : ''}`}
            onClick={() => toggleView('front')}
          >
            Front
          </button>
          <button
            type="button"
            className={`body-view-btn ${view === 'back' ? 'active' : ''}`}
            onClick={() => toggleView('back')}
          >
            Back
          </button>
        </div>
      </div>

      {/* Swipeable 3D diagram stage */}
      <div
        ref={containerRef}
        className={`body-diagram-stage ${view === 'back' ? 'flipped' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* FRONT VIEW */}
        <div className="body-view-face front-face">
          <svg viewBox="0 0 200 380" className="body-svg">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--accent)" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Head & Cranium */}
            <path
              d="M100 24 C90 24 82 32 82 45 C82 58 90 68 100 68 C110 68 118 58 118 45 C118 32 110 24 100 24 Z"
              className="body-part neutral"
            />

            {/* Neck */}
            <path
              d="M93 68 L107 68 L109 82 L91 82 Z"
              className={`body-part selectable ${isSel('neck') ? 'selected' : ''}`}
              onClick={(e) => clickPart('neck', e)}
            />

            {/* Traps / Upper Neck base */}
            <path
              d="M87 82 L91 82 L109 82 L113 82 L122 89 L78 89 Z"
              className={`body-part selectable ${isSel('neck') ? 'selected' : ''}`}
              onClick={(e) => clickPart('neck', e)}
            />

            {/* Left Shoulder (Deltoid) */}
            <path
              d="M76 89 L62 97 L58 118 L70 119 L76 102 Z"
              className={`body-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
              onClick={(e) => clickPart('shoulders', e)}
            />

            {/* Right Shoulder (Deltoid) */}
            <path
              d="M124 89 L138 97 L142 118 L130 119 L124 102 Z"
              className={`body-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
              onClick={(e) => clickPart('shoulders', e)}
            />

            {/* Chest (Pectorals) */}
            <path
              d="M77 91 L100 93 L100 128 L78 126 C75 116 75 102 77 91 Z"
              className={`body-part selectable ${isSel('chest') ? 'selected' : ''}`}
              onClick={(e) => clickPart('chest', e)}
            />
            <path
              d="M123 91 L100 93 L100 128 L122 126 C125 116 125 102 123 91 Z"
              className={`body-part selectable ${isSel('chest') ? 'selected' : ''}`}
              onClick={(e) => clickPart('chest', e)}
            />

            {/* Left Bicep */}
            <path
              d="M58 120 L70 121 L68 152 L54 148 Z"
              className={`body-part selectable ${isSel('biceps') || isSel('arms') ? 'selected' : ''}`}
              onClick={(e) => clickPart('biceps', e)}
            />

            {/* Right Bicep */}
            <path
              d="M142 120 L130 121 L132 152 L146 148 Z"
              className={`body-part selectable ${isSel('biceps') || isSel('arms') ? 'selected' : ''}`}
              onClick={(e) => clickPart('biceps', e)}
            />

            {/* Left Forearm */}
            <path
              d="M54 152 L68 155 L63 195 L49 190 Z"
              className={`body-part selectable ${isSel('arms') ? 'selected' : ''}`}
              onClick={(e) => clickPart('arms', e)}
            />

            {/* Right Forearm */}
            <path
              d="M146 152 L132 155 L137 195 L151 190 Z"
              className={`body-part selectable ${isSel('arms') ? 'selected' : ''}`}
              onClick={(e) => clickPart('arms', e)}
            />

            {/* Hands */}
            <path d="M47 192 L62 197 L57 215 L43 205 Z" className="body-part neutral" />
            <path d="M153 192 L138 197 L143 215 L157 205 Z" className="body-part neutral" />

            {/* Abs / Core */}
            <path
              d="M80 130 L100 130 L100 180 L84 176 L78 145 Z"
              className={`body-part selectable ${isSel('core') ? 'selected' : ''}`}
              onClick={(e) => clickPart('core', e)}
            />
            <path
              d="M120 130 L100 130 L100 180 L116 176 L122 145 Z"
              className={`body-part selectable ${isSel('core') ? 'selected' : ''}`}
              onClick={(e) => clickPart('core', e)}
            />

            {/* Hip Flexors / Pelvis */}
            <path
              d="M83 178 L100 182 L100 205 L80 200 Z"
              className={`body-part selectable ${isSel('hipFlexors') || isSel('adductors') ? 'selected' : ''}`}
              onClick={(e) => clickPart('hipFlexors', e)}
            />
            <path
              d="M117 178 L100 182 L100 205 L120 200 Z"
              className={`body-part selectable ${isSel('hipFlexors') || isSel('adductors') ? 'selected' : ''}`}
              onClick={(e) => clickPart('hipFlexors', e)}
            />

            {/* Left Quad */}
            <path
              d="M78 202 L98 207 L94 270 L72 265 C70 240 73 218 78 202 Z"
              className={`body-part selectable ${isSel('quads') ? 'selected' : ''}`}
              onClick={(e) => clickPart('quads', e)}
            />

            {/* Right Quad */}
            <path
              d="M122 202 L102 207 L106 270 L128 265 C130 240 127 218 122 202 Z"
              className={`body-part selectable ${isSel('quads') ? 'selected' : ''}`}
              onClick={(e) => clickPart('quads', e)}
            />

            {/* Knees */}
            <circle cx="83" cy="274" r="7" className="body-part neutral" />
            <circle cx="117" cy="274" r="7" className="body-part neutral" />

            {/* Left Shin / Calf (Front) */}
            <path
              d="M76 283 L90 283 L86 345 L74 345 Z"
              className={`body-part selectable ${isSel('calves') ? 'selected' : ''}`}
              onClick={(e) => clickPart('calves', e)}
            />

            {/* Right Shin / Calf (Front) */}
            <path
              d="M124 283 L110 283 L114 345 L126 345 Z"
              className={`body-part selectable ${isSel('calves') ? 'selected' : ''}`}
              onClick={(e) => clickPart('calves', e)}
            />

            {/* Feet */}
            <path
              d="M72 347 L87 347 L88 368 L68 368 Z"
              className={`body-part selectable ${isSel('feet') ? 'selected' : ''}`}
              onClick={(e) => clickPart('feet', e)}
            />
            <path
              d="M128 347 L113 347 L112 368 L132 368 Z"
              className={`body-part selectable ${isSel('feet') ? 'selected' : ''}`}
              onClick={(e) => clickPart('feet', e)}
            />
          </svg>
        </div>

        {/* BACK VIEW */}
        <div className="body-view-face back-face">
          <svg viewBox="0 0 200 380" className="body-svg">
            {/* Head back */}
            <path
              d="M100 24 C90 24 82 32 82 45 C82 58 90 68 100 68 C110 68 118 58 118 45 C118 32 110 24 100 24 Z"
              className="body-part neutral"
            />

            {/* Traps / Upper Back */}
            <path
              d="M92 68 L108 68 L122 89 L100 115 L78 89 Z"
              className={`body-part selectable ${isSel('neck') || isSel('lats') ? 'selected' : ''}`}
              onClick={(e) => clickPart('neck', e)}
            />

            {/* Left Rear Delt */}
            <path
              d="M76 89 L62 97 L58 118 L70 119 L76 102 Z"
              className={`body-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
              onClick={(e) => clickPart('shoulders', e)}
            />

            {/* Right Rear Delt */}
            <path
              d="M124 89 L138 97 L142 118 L130 119 L124 102 Z"
              className={`body-part selectable ${isSel('shoulders') ? 'selected' : ''}`}
              onClick={(e) => clickPart('shoulders', e)}
            />

            {/* Left Lats */}
            <path
              d="M76 96 L98 118 L98 152 L78 148 C74 135 74 115 76 96 Z"
              className={`body-part selectable ${isSel('lats') ? 'selected' : ''}`}
              onClick={(e) => clickPart('lats', e)}
            />

            {/* Right Lats */}
            <path
              d="M124 96 L102 118 L102 152 L122 148 C126 135 126 115 124 96 Z"
              className={`body-part selectable ${isSel('lats') ? 'selected' : ''}`}
              onClick={(e) => clickPart('lats', e)}
            />

            {/* Left Tricep */}
            <path
              d="M58 120 L70 121 L68 152 L54 148 Z"
              className={`body-part selectable ${isSel('triceps') || isSel('arms') ? 'selected' : ''}`}
              onClick={(e) => clickPart('triceps', e)}
            />

            {/* Right Tricep */}
            <path
              d="M142 120 L130 121 L132 152 L146 148 Z"
              className={`body-part selectable ${isSel('triceps') || isSel('arms') ? 'selected' : ''}`}
              onClick={(e) => clickPart('triceps', e)}
            />

            {/* Lower Back (Erectors) */}
            <path
              d="M80 152 L100 152 L100 182 L82 180 Z"
              className={`body-part selectable ${isSel('lowerBack') ? 'selected' : ''}`}
              onClick={(e) => clickPart('lowerBack', e)}
            />
            <path
              d="M120 152 L100 152 L100 182 L118 180 Z"
              className={`body-part selectable ${isSel('lowerBack') ? 'selected' : ''}`}
              onClick={(e) => clickPart('lowerBack', e)}
            />

            {/* Left Glute */}
            <path
              d="M78 184 L100 184 L100 220 L76 216 Z"
              className={`body-part selectable ${isSel('glutes') ? 'selected' : ''}`}
              onClick={(e) => clickPart('glutes', e)}
            />

            {/* Right Glute */}
            <path
              d="M122 184 L100 184 L100 220 L124 216 Z"
              className={`body-part selectable ${isSel('glutes') ? 'selected' : ''}`}
              onClick={(e) => clickPart('glutes', e)}
            />

            {/* Left Hamstring */}
            <path
              d="M76 222 L98 222 L94 270 L72 268 Z"
              className={`body-part selectable ${isSel('hamstrings') ? 'selected' : ''}`}
              onClick={(e) => clickPart('hamstrings', e)}
            />

            {/* Right Hamstring */}
            <path
              d="M124 222 L102 222 L106 270 L128 268 Z"
              className={`body-part selectable ${isSel('hamstrings') ? 'selected' : ''}`}
              onClick={(e) => clickPart('hamstrings', e)}
            />

            {/* Knee backs */}
            <circle cx="83" cy="274" r="6" className="body-part neutral" />
            <circle cx="117" cy="274" r="6" className="body-part neutral" />

            {/* Left Calf (Gastrocnemius & Soleus) */}
            <path
              d="M74 282 L92 282 L88 342 L72 342 Z"
              className={`body-part selectable ${isSel('calves') ? 'selected' : ''}`}
              onClick={(e) => clickPart('calves', e)}
            />

            {/* Right Calf (Gastrocnemius & Soleus) */}
            <path
              d="M126 282 L108 282 L112 342 L128 342 Z"
              className={`body-part selectable ${isSel('calves') ? 'selected' : ''}`}
              onClick={(e) => clickPart('calves', e)}
            />

            {/* Left Foot / Achilles */}
            <path
              d="M74 345 L86 345 L84 366 L72 366 Z"
              className={`body-part selectable ${isSel('feet') ? 'selected' : ''}`}
              onClick={(e) => clickPart('feet', e)}
            />

            {/* Right Foot / Achilles */}
            <path
              d="M126 345 L114 345 L116 366 L128 366 Z"
              className={`body-part selectable ${isSel('feet') ? 'selected' : ''}`}
              onClick={(e) => clickPart('feet', e)}
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

function formatPartName(part: BodyPart): string {
  switch (part) {
    case 'neck': return 'Neck & Traps'
    case 'shoulders': return 'Shoulders & Deltoids'
    case 'chest': return 'Chest & Pectorals'
    case 'arms': return 'Arms & Forearms'
    case 'biceps': return 'Biceps'
    case 'triceps': return 'Triceps'
    case 'core': return 'Core & Abs'
    case 'lowerBack': return 'Lower Back'
    case 'lats': return 'Lats & Back'
    case 'glutes': return 'Glutes'
    case 'hipFlexors': return 'Hip Flexors'
    case 'adductors': return 'Groin & Adductors'
    case 'hamstrings': return 'Hamstrings'
    case 'quads': return 'Quadriceps'
    case 'calves': return 'Calves & Shins'
    case 'feet': return 'Ankles & Feet'
  }
}
