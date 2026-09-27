import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { SheetHeader } from '../../components/SheetHost'
import { toast } from '../../components/Toast'
import { NativeSelect, Stepper, SymbolTile, Toggle } from '../../components/ui'
import { CATEGORIES, categoryMeta, TINTS, tintColor, tintTitle } from '../../data/meta'
import type { BodyRegion, Tint } from '../../data/types'
import { saveCustomExercise, uuid } from '../../lib/actions'
import { haptic } from '../../lib/haptics'
import { nav } from '../../lib/nav'

const CUSTOM_ICONS = [
  'figure.flexibility',
  'figure.stand',
  'flame',
  'bolt.fill',
  'heart.fill',
  'leaf.fill',
  'wind',
  'hourglass',
  'timer',
  'trophy.fill',
  'sparkles',
  'circle.circle',
]

export function CustomExerciseSheet({ onSave }: { onSave?: (slug: string, duration?: number) => void }) {
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState<BodyRegion>('fullBody')
  const [bilateral, setBilateral] = useState(false)
  const [duration, setDuration] = useState(30)
  const [symbol, setSymbol] = useState('figure.flexibility')
  const [tint, setTint] = useState<Tint>('ember')

  const save = () => {
    if (!name.trim()) return
    const slug = `custom-${uuid()}`
    const finalDuration = Math.max(5, duration || 30)

    saveCustomExercise({
      slug,
      name: name.trim(),
      summary: summary.trim() || 'Custom stretching exercise.',
      instructions: summary.trim() ? [summary.trim()] : ['Perform with steady control and mindful breathing.'],
      tips: ['Listen to your body and never force a stretch into pain.'],
      category,
      equipment: [],
      arts: [],
      targets: [],
      duration: finalDuration,
      bilateral,
      symbol,
      tint,
    })

    haptic('success')
    nav.back()
    toast('Exercise added to workout', { icon: 'checkmark.circle.fill' })
    onSave?.(slug, finalDuration)
  }

  const valid = name.trim().length > 0

  return (
    <>
      <SheetHeader
        title="Custom Exercise"
        leading={<button type="button" className="navbar-action" onClick={() => nav.back()}>Cancel</button>}
        trailing={
          <button type="button" className="navbar-action tinted strong" disabled={!valid} onClick={save}>
            Save
          </button>
        }
      />
      <div className="sheet-scroll form">
        <section className="form-section">
          <h4 className="form-section-title">Details</h4>
          <div className="card form-card">
            <input
              className="text-input title-input"
              value={name}
              placeholder="Exercise name"
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              enterKeyHint="done"
            />
            <div className="divider" />
            <textarea
              className="text-input"
              value={summary}
              placeholder="Instructions / details (optional)"
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>
        </section>

        <section className="form-section">
          <h4 className="form-section-title">Icon &amp; Accent Color</h4>
          <div className="card form-card">
            <div className="h-scroll symbol-picker no-sheet-drag">
              {CUSTOM_ICONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`symbol-choice pressable ${symbol === item ? 'selected' : ''}`}
                  style={{ '--tint': tintColor(tint) } as React.CSSProperties}
                  aria-label={item}
                  aria-pressed={symbol === item}
                  onClick={() => {
                    haptic('selection')
                    setSymbol(item)
                  }}
                >
                  <SymbolTile icon={item} tint={symbol === item ? tintColor(tint) : 'var(--text-tertiary)'} size={44} />
                </button>
              ))}
            </div>
            <div className="divider" />
            <div className="tint-picker no-sheet-drag">
              {TINTS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`tint-choice pressable ${tint === option ? 'selected' : ''}`}
                  style={{ '--tint': tintColor(option) } as React.CSSProperties}
                  aria-label={tintTitle(option)}
                  aria-pressed={tint === option}
                  onClick={() => {
                    haptic('selection')
                    setTint(option)
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h4 className="form-section-title">Settings</h4>
          <div className="card form-card">
            <div className="form-row">
              <span>Body Region</span>
              <NativeSelect<BodyRegion>
                label="Body Region"
                value={category}
                options={CATEGORIES.map((c) => ({ value: c, title: categoryMeta(c).title }))}
                onChange={setCategory}
              />
            </div>
            <div className="divider" />
            <div className="form-row">
              <span className="with-icon"><Icon name="clock" size={17} /> Standard duration (sec)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  className="duration-number-input"
                  value={duration || ''}
                  min={5}
                  max={600}
                  step={5}
                  onChange={(e) => setDuration(Math.max(5, Number(e.target.value)))}
                  style={{
                    width: '64px',
                    textAlign: 'right',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--separator)',
                    color: 'var(--text)',
                    fontSize: '15px',
                    fontWeight: '600',
                  }}
                />
                <Stepper label="Duration" value={duration} min={5} max={600} step={5} onChange={setDuration} />
              </div>
            </div>
            <div className="divider" />
            <div className="form-row">
              <span>Two-sided (Left/Right)</span>
              <Toggle checked={bilateral} onChange={setBilateral} label="Two-sided exercise" />
            </div>
          </div>
          <p className="form-footer">Two-sided exercises cue you to switch sides halfway through.</p>
        </section>
      </div>
    </>
  )
}
