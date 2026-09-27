import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { SheetHeader } from '../../components/SheetHost'
import { toast } from '../../components/Toast'
import { FilterPill, NativeSelect, SymbolTile } from '../../components/ui'
import { CATEGORIES, PHASE, TINTS, categoryMeta, phaseMeta, tintColor, tintTitle } from '../../data/meta'
import { KATA_SYMBOLS, NEW_KATA_ITEMS, estimatedSeconds } from '../../data/content'
import { KATA_REST_CHOICES, restLabel } from '../../data/settings'
import type { BodyRegion, Phase, Tint } from '../../data/types'
import { saveKata } from '../../lib/actions'
import { clock, short } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { findKata } from '../../lib/launch'
import { type EditorMode, nav } from '../../lib/nav'
import { useSettings, useAllExercises } from '../../lib/store'

interface DraftItem {
  id: number
  slug: string
  duration: number
}

let draftCounter = 0
const draft = (slug: string, duration: number): DraftItem => ({ id: ++draftCounter, slug, duration })

/** Create / edit / customise a Kata. Works on a local draft, so Cancel never changes data. */
export function EditorSheet({ mode }: { mode: EditorMode }) {
  const settings = useSettings()
  const { t } = useI18n()
  const allExercises = useAllExercises()

  const initial = useMemo(() => {
    const source =
      mode.kind === 'edit' || mode.kind === 'duplicate' ? findKata(mode.id) : undefined
    const template = mode.kind === 'template' ? mode.template : undefined
    const items = source?.items ?? template?.items ?? NEW_KATA_ITEMS
    const byPhase = (phase: Phase) => items.filter((i) => i.phase === phase).map((i) => draft(i.slug, i.duration))
    return {
      name:
        mode.kind === 'edit' ? (source?.name ?? '')
        : mode.kind === 'duplicate' ? (source ? (source.isPremade ? `My ${source.name}` : `${source.name} Copy`) : '')
        : mode.kind === 'template' ? mode.template.name
        : '',
      subtitle: source?.subtitle ?? '',
      symbol: source?.symbol ?? 'figure.martial.arts',
      tint: (source?.tint ?? 'ember') as Tint,
      art: source?.art ?? template?.art ?? null,
      rest: source ? source.restSeconds : (template?.restSeconds ?? null),
      warmup: byPhase('warmup'),
      main: byPhase('main'),
      cooldown: byPhase('cooldown'),
    }
  }, [mode])

  const [name, setName] = useState(initial.name)
  const [symbol, setSymbol] = useState(initial.symbol)
  const [tint, setTint] = useState<Tint>(initial.tint)
  const [rest, setRest] = useState<number | null>(initial.rest)
  const [items, setItems] = useState<Record<Phase, DraftItem[]>>({ warmup: initial.warmup, main: initial.main, cooldown: initial.cooldown })

  const trimmed = name.trim()
  const validation = !trimmed
    ? 'Give your Kata a name.'
    : items.warmup.length === 0
      ? 'Add at least one warm-up exercise.'
      : items.main.length === 0
        ? 'Add at least one exercise to the main set.'
        : items.cooldown.length === 0
          ? 'Add at least one cool-down exercise.'
          : null

  const allItems = (['warmup', 'main', 'cooldown'] as Phase[]).flatMap((phase) => items[phase].map((i) => ({ slug: i.slug, duration: i.duration, phase })))
  const total = estimatedSeconds({ items: allItems, restSeconds: rest }, settings.restSeconds)

  const update = (phase: Phase, fn: (list: DraftItem[]) => DraftItem[]) => setItems((current) => ({ ...current, [phase]: fn(current[phase]) }))

  const save = () => {
    if (validation) return
    const id = saveKata(
      { name: trimmed, subtitle: initial.subtitle, symbol, tint, art: initial.art, restSeconds: rest, items: allItems },
      mode.kind === 'edit' ? mode.id : undefined
    )
    haptic('success')
    nav.back()
    toast(mode.kind === 'edit' ? 'Kata saved' : "Saved to your Kata's", {
      icon: 'checkmark.circle.fill',
      ...(mode.kind !== 'edit' ? { actionLabel: 'View', action: () => { nav.setTab('home'); nav.push({ name: 'kata', id }) } } : {}),
    })
  }

  return (
    <>
      <SheetHeader
        title={mode.kind === 'edit' ? t('Edit Kata') : t('New Kata')}
        leading={
          <button type="button" className="navbar-action" onClick={() => nav.back()}>
            {t('Cancel')}
          </button>
        }
        trailing={
          <button type="button" className="navbar-action tinted strong" disabled={Boolean(validation)} onClick={save}>
            {t('Save')}
          </button>
        }
      />
      <div className="sheet-scroll form">
        <section className="form-section">
          <h4 className="form-section-title">{t('Details')}</h4>
          <div className="card form-card">
            <input className="text-input title-input" value={name} placeholder="Kata name" onChange={(e) => setName(e.target.value)} maxLength={60} enterKeyHint="done" />
            <div className="divider" />
            <div className="h-scroll symbol-picker no-sheet-drag">
              {KATA_SYMBOLS.map((item) => (
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

        {(['warmup', 'main', 'cooldown'] as Phase[]).map((phase) => (
          <PhaseEditor
            key={phase}
            phase={phase}
            items={items[phase]}
            onChange={(fn) => update(phase, fn)}
            onAdd={() =>
              nav.present({
                name: 'picker',
                phase,
                onAdd: (slugs) => update(phase, (list) => [...list, ...slugs.map((slug) => draft(slug, allExercises.find(e => e.slug === slug)?.duration ?? 60))]),
              })
            }
          />
        ))}

        <section className="form-section">
          <div className="card form-card">
            <div className="form-row">
              <span>Rest between exercises</span>
              <NativeSelect<string>
                label="Rest between exercises"
                value={rest === null ? 'default' : String(rest)}
                options={[
                  { value: 'default', title: `App default (${restLabel(settings.restSeconds)})` },
                  ...KATA_REST_CHOICES.map((s) => ({ value: String(s), title: restLabel(s) })),
                ]}
                onChange={(value) => setRest(value === 'default' ? null : Number(value))}
              />
            </div>
          </div>
          <p className="form-footer">The app default is set in Settings → Rest between sets.</p>
        </section>

        <section className="form-section">
          <div className="card form-card">
            <div className="form-row">
              <span className="with-icon">
                <Icon name="clock" size={17} /> Estimated duration
              </span>
              <strong className="tabular">{clock(total)}</strong>
            </div>
            {validation && (
              <>
                <div className="divider" />
                <p className="validation">
                  <Icon name="exclamationmark.circle" size={16} /> {validation}
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

function PhaseEditor({
  phase, items, onChange, onAdd,
}: { phase: Phase; items: DraftItem[]; onChange: (fn: (list: DraftItem[]) => DraftItem[]) => void; onAdd: () => void }) {
  const meta = PHASE[phase]
  const allExercises = useAllExercises()
  const [reordering, setReordering] = useState(false)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return
    haptic('selection')
    onChange((list) => {
      const next = [...list]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  return (
    <section className="form-section">
      <h4 className="form-section-title phase-title">
        <Icon name={meta.symbol} size={14} style={{ color: meta.tint }} />
        {meta.title}
        <span className="tabular">{short(items.reduce((sum, i) => sum + i.duration, 0))}</span>
        {items.length > 1 && (
          <button
            type="button"
            className={`reorder-toggle no-sheet-drag ${reordering ? 'active' : ''}`}
            onClick={() => {
              haptic('light')
              setReordering((v) => !v)
            }}
          >
            {reordering ? 'Done' : 'Reorder'}
          </button>
        )}
      </h4>
      <div className="card form-card">
        {items.map((item, index) => {
          const exercise = allExercises.find(e => e.slug === item.slug)
          if (!exercise) return null
          return (
            <div key={item.id} className="editor-row">
              {reordering ? (
                <div className="reorder-controls no-sheet-drag">
                  <button
                    type="button"
                    aria-label={`Move ${exercise.name} up`}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <Icon name="chevron.up" size={14} strokeWidth={2.8} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${exercise.name} down`}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <Icon name="chevron.down" size={14} strokeWidth={2.8} />
                  </button>
                </div>
              ) : (
                <SymbolTile icon={exercise.symbol} tint={categoryMeta(exercise.category).tint} size={40} />
              )}
              <button
                type="button"
                className="editor-row-info"
                disabled={reordering}
                onClick={() => nav.present({ name: 'exercise', slug: exercise.slug })}
              >
                <span>
                  <strong>{exercise.name}</strong>
                  <span className="tabular">{clock(item.duration)}</span>
                </span>
              </button>
              {!reordering && (
                <>
                  <div className="duration-edit">
                    <input
                      type="number"
                      aria-label={`${exercise.name} duration in seconds`}
                      value={item.duration || ''}
                      min={1}
                      max={3600}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        onChange((list) => list.map((i) => (i.id === item.id ? { ...i, duration: value } : i)))
                      }}
                    />
                    <span className="duration-unit">sec</span>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    aria-label={`Remove ${exercise.name}`}
                    onClick={() => {
                      haptic('light')
                      onChange((list) => list.filter((i) => i.id !== item.id))
                    }}
                  >
                    <Icon name="xmark.circle.fill" size={20} />
                  </button>
                </>
              )}
            </div>
          )
        })}
        {!reordering && (
          <button type="button" className="add-row" style={{ color: meta.tint }} onClick={onAdd}>
            <Icon name="plus.circle.fill" size={20} style={{ '--icon-knock': 'var(--surface)' } as React.CSSProperties} />
            Add exercise
          </button>
        )}
      </div>
      {phase === 'main' && (
        <p className="form-footer">
          {reordering ? 'Use the arrows to move an exercise · tap Done when finished.' : 'Tap Reorder to change the order · tap an exercise for how-to.'}
        </p>
      )}
    </section>
  )
}

// Picker -----------------------------------------------------------------------------------------

export function PickerSheet({ phase, onAdd }: { phase: Phase; onAdd: (slugs: string[]) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<BodyRegion | null>(null)
  const allExercises = useAllExercises()
  const [selection, setSelection] = useState<string[]>([])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allExercises.filter(
      (e) =>
        (!category || e.category === category) &&
        (!q || e.name.toLowerCase().includes(q) || e.targets.some((target) => target.toLowerCase().includes(q)))
    )
  }, [query, category])

  const toggle = (slug: string) => {
    haptic('selection')
    setSelection((current) => (current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]))
  }

  return (
    <>
      <SheetHeader
        title={`Add to ${phaseMeta(phase).title}`}
        leading={
          <button type="button" className="navbar-action" onClick={() => nav.back()}>
            Cancel
          </button>
        }
        trailing={
          <button
            type="button"
            className="navbar-action tinted strong"
            disabled={selection.length === 0}
            onClick={() => {
              haptic('success')
              nav.back()
              window.setTimeout(() => onAdd(selection), 380)
            }}
          >
            {selection.length ? `Add (${selection.length})` : 'Add'}
          </button>
        }
      />
      <div className="sheet-scroll">
        <div className="picker-filters">
          <label className="search-field">
            <Icon name="magnifyingglass" size={17} strokeWidth={2.4} />
            <input type="search" value={query} placeholder="Search exercises" onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="h-scroll pills no-sheet-drag">
            <FilterPill title="All" selected={category === null} onClick={() => setCategory(null)} />
            {CATEGORIES.map((item) => (
              <FilterPill key={item} title={categoryMeta(item).title} icon={categoryMeta(item).symbol} selected={category === item} onClick={() => setCategory(category === item ? null : item)} />
            ))}
          </div>
          <button
            type="button"
            className="navbar-action tinted"
            onClick={() =>
              nav.present({
                name: 'customExercise',
                onSave: (slug) => {
                  onAdd([slug])
                  nav.back()
                },
              })
            }
          >
            + Create Custom Exercise
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state compact">
            <h3>No matches</h3>
            <p>Try another filter or search term.</p>
          </div>
        ) : (
          <div className="picker-list">
            {filtered.map((exercise) => {
              const selected = selection.includes(exercise.slug)
              return (
                <div key={exercise.slug} className={`picker-row ${selected ? 'selected' : ''}`}>
                  <button type="button" className="picker-row-main" aria-pressed={selected} onClick={() => toggle(exercise.slug)}>
                    <span className={`check ${selected ? 'on' : ''}`}>
                      <Icon name={selected ? 'checkmark.circle.fill' : 'circle'} size={24} style={{ '--icon-knock': 'var(--background)' } as React.CSSProperties} />
                    </span>
                    <SymbolTile icon={exercise.symbol} tint={categoryMeta(exercise.category as BodyRegion).tint} size={44} />
                    <span className="picker-row-text">
                      <strong>{exercise.name}</strong>
                      <span className="muted small tabular">{short(exercise.duration)}</span>
                    </span>
                  </button>
                  <button type="button" className="info-btn" aria-label={`About ${exercise.name}`} onClick={() => nav.present({ name: 'exercise', slug: exercise.slug })}>
                    <Icon name="info.circle" size={21} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
