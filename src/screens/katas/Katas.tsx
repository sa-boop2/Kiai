import { type CSSProperties, useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { NavIconButton, Screen } from '../../components/Screen'
import { MiniMuscleBadge, exerciseTargetLabel } from '../../components/MiniMuscleBadge'
import { confirmAction } from '../../components/ActionSheet'
import { toast } from '../../components/Toast'
import { DifficultyBadge, EmptyState, FilterPill, KiaiMark, PrimaryButton, SecondaryButton, SymbolTile, TagChip } from '../../components/ui'
import { artById, estimatedSeconds, exerciseBySlug } from '../../data/content'
import { PHASES, categoryMeta, difficultyMeta, phaseMeta, tintColor } from '../../data/meta'
import type { Difficulty, Exercise } from '../../data/types'
import { deleteKata, duplicateKata } from '../../lib/actions'
import { minutes, relativeDay, short } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { startKata, useKata, usePremadeKatas } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { useSettings, useUserKatas } from '../../lib/store'

export function KatasScreen() {
  const katas = useUserKatas()
  const settings = useSettings()
  const { t, locale } = useI18n()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...katas].sort((a, b) => b.updatedAt - a.updatedAt)
    return q ? sorted.filter((k) => k.name.toLowerCase().includes(q) || k.subtitle.toLowerCase().includes(q)) : sorted
  }, [katas, query])

  return (
    <Screen
      title={t("Kata's")}
      largeTitle
      trailing={<NavIconButton icon="plus" label="Create Kata" tinted onClick={() => nav.present({ name: 'editor', mode: { kind: 'create' } })} />}
      header={
        <div className="search-wrap">
          <label className="search-field">
            <Icon name="magnifyingglass" size={17} strokeWidth={2.4} />
            <input
              type="search"
              value={query}
              placeholder={t("Search your Kata's")}
              onChange={(e) => setQuery(e.target.value)}
              enterKeyHint="search"
              autoComplete="off"
            />
            {query && (
              <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}>
                <Icon name="xmark.circle.fill" size={17} />
              </button>
            )}
          </label>
        </div>
      }
    >
      {katas.length === 0 ? (
        <EmptyState
          icon={<KiaiMark size={72} />}
          title={t("No Kata's yet")}
          description="A Kata is your own routine: pick exercises, set durations and rests. Warm-up and cool-down included."
          action={
            <PrimaryButton icon="plus" full={false} onClick={() => nav.present({ name: 'editor', mode: { kind: 'create' } })}>
              {t('Create your first Kata')}
            </PrimaryButton>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Icon name="magnifyingglass" size={44} className="empty-icon" />} title="No results" description={`No Kata's match “${query}”.`} />
      ) : (
        <div className="list-stack">
          {filtered.map((kata) => (
            <button key={kata.uuid} type="button" className="card kata-row pressable" onClick={() => nav.push({ name: 'kata', id: kata.uuid })}>
              <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={54} />
              <span className="kata-row-text">
                <strong>{kata.name}</strong>
                <span className="meta-row">
                  <span>
                    <Icon name="clock" size={13} strokeWidth={2.4} />
                    {minutes(estimatedSeconds(kata, settings.restSeconds))}
                  </span>
                  <span>
                    <Icon name="list.bullet" size={13} strokeWidth={2.4} />
                    {kata.items.length} exercises
                  </span>
                </span>
                {kata.lastPerformedAt && <span className="kata-row-last">Last trained {relativeDay(kata.lastPerformedAt, locale)}</span>}
              </span>
              <Icon name="chevron.right" size={14} strokeWidth={2.8} className="row-chevron" />
            </button>
          ))}
        </div>
      )}
    </Screen>
  )
}

// Detail -----------------------------------------------------------------------------------------

export function KataDetailScreen({ id }: { id: string }) {
  const kata = useKata(id)
  const settings = useSettings()
  const { t } = useI18n()
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  if (!kata) {
    return (
      <Screen title="Kata" back>
        <EmptyState icon={<Icon name="questionmark.circle.fill" size={44} className="empty-icon" />} title="Kata not found" description="It may have been deleted." />
      </Screen>
    )
  }

  const tint = tintColor(kata.tint)
  const restSeconds = kata.restSeconds ?? settings.restSeconds
  const hardest = kata.difficulty ?? 'beginner'
  const art = artById(kata.art)

  const duplicate = () => {
    duplicateKata(kata)
    setSaved(true)
    haptic('success')
    toast(kata.isPremade ? "Saved to your Kata's" : 'Kata duplicated', { icon: 'checkmark.circle.fill' })
  }

  return (
    <Screen
      title={kata.name}
      back
      trailing={
        <div className="menu-anchor">
          <NavIconButton icon="ellipsis" label="More" onClick={() => setMenuOpen((open) => !open)} />
          {menuOpen && (
            <>
              <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
              <div className="menu glass" role="menu">
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); duplicate() }}>
                  <span>Duplicate to my Kata's</span>
                  <Icon name="plus.square.on.square" size={18} />
                </button>
                {!kata.isPremade && (
                  <>
                    <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); nav.present({ name: 'editor', mode: { kind: 'edit', id: kata.uuid } }) }}>
                      <span>Edit</span>
                      <Icon name="pencil" size={18} />
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="destructive"
                      onClick={async () => {
                        setMenuOpen(false)
                        const choice = await confirmAction({
                          title: t('Delete this Kata?'),
                          message: 'Your training history is kept.',
                          actions: [{ label: t('Delete Kata'), role: 'destructive' }],
                        })
                        if (choice === 0) {
                          nav.back()
                          window.setTimeout(() => deleteKata(kata.uuid), 450)
                          toast('Kata deleted', { icon: 'trash' })
                        }
                      }}
                    >
                      <span>Delete</span>
                      <Icon name="trash" size={18} />
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      }
    >
      <div className="detail-hero centered" style={{ '--tint': tint } as CSSProperties}>
        <div className="detail-hero-glow" aria-hidden="true" />
        <SymbolTile icon={kata.symbol} tint={tint} size={76} />
        <h1 className="display">{kata.name}</h1>
        {kata.subtitle && <p className="secondary">{kata.subtitle}</p>}
        {(kata.isPremade || art) && (
          <div className="detail-tags">
            {kata.isPremade && <TagChip text="Curated" icon="sparkles" tint={tint} />}
            {art && <TagChip text={art.name} icon={art.symbol} tint={tintColor(art.tint)} />}
          </div>
        )}
        <div className="hero-stats card">
          <HeroStat value={minutes(estimatedSeconds(kata, settings.restSeconds))} label={t('Duration')} />
          <HeroStat value={String(kata.items.length)} label={t('Exercises')} />
          <HeroStat value={difficultyMeta(hardest).title} label="Level" />
        </div>
      </div>

      <div className="detail-actions">
        <PrimaryButton icon="play.fill" tint={tint} onClick={() => startKata(kata)}>
          {t('Start Kata')}
        </PrimaryButton>
        <div className="button-row">
          <SecondaryButton
            icon="slider.horizontal.3"
            tint={tint}
            onClick={() => nav.present({ name: 'editor', mode: kata.isPremade ? { kind: 'duplicate', id: kata.uuid } : { kind: 'edit', id: kata.uuid } })}
          >
            {t('Customize')}
          </SecondaryButton>
          {kata.isPremade && (
            <SecondaryButton icon={saved ? 'checkmark' : 'square.and.arrow.down'} tint={tint} disabled={saved} onClick={duplicate}>
              {saved ? t('Saved') : t('Save')}
            </SecondaryButton>
          )}
        </div>
      </div>

      {PHASES.map((phase) => {
        const items = kata.items.filter((item) => item.phase === phase)
        if (items.length === 0) return null
        const meta = phaseMeta(phase)
        return (
          <section key={phase} className="phase-section">
            <div className="phase-header">
              <Icon name={meta.symbol} size={17} style={{ color: meta.tint }} />
              <h3>{meta.title}</h3>
              <span className="tabular muted">{short(items.reduce((sum, i) => sum + i.duration, 0))}</span>
            </div>
            <div className="card list-card">
              {items.map((item, index) => {
                const exercise = exerciseBySlug(item.slug)
                if (!exercise) return null
                return (
                  <ExerciseRow
                    key={`${item.slug}-${index}`}
                    exercise={exercise}
                    trailing={short(item.duration)}
                    onClick={() => nav.present({ name: 'exercise', slug: exercise.slug })}
                  />
                )
              })}
            </div>
          </section>
        )
      })}

      <p className="footnote-row">
        <Icon name="pause.circle" size={15} />
        {restSeconds === 0 ? 'No rest between exercises' : `${restSeconds}s rest between exercises`}
      </p>
    </Screen>
  )
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="hero-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

/** Shared exercise row: symbol, name, difficulty, both-sides/equipment hints and a trailing value. */
export function ExerciseRow({ exercise, trailing, onClick, children }: { exercise: Exercise; trailing?: string; onClick?: () => void; children?: React.ReactNode }) {
  const category = categoryMeta(exercise.category)
  const targetLabel = exerciseTargetLabel(exercise)
  return (
    <button type="button" className="exercise-row" onClick={onClick}>
      <SymbolTile icon={exercise.symbol} tint={category.tint} size={48} />
      <span className="exercise-row-text">
        <strong>{exercise.name}</strong>
        <span className="exercise-target-sub" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {targetLabel}
        </span>
        <span className="exercise-row-meta">
          {exercise.bilateral && <Icon name="arrow.left.and.right" size={13} strokeWidth={2.6} className="muted-icon" title="Both sides" />}
          {exercise.equipment.length > 0 && <Icon name="shippingbox" size={13} strokeWidth={2.4} className="muted-icon" title="Equipment needed" />}
        </span>
        {children}
      </span>
      {trailing && <span className="exercise-row-trailing tabular">{trailing}</span>}
      <MiniMuscleBadge exercise={exercise} size={36} />
      <Icon name="info.circle" size={19} className="muted-icon" />
    </button>
  )
}

export function PremadeWorkoutsScreen() {
  const premadeKatas = usePremadeKatas()
  const settings = useSettings()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return premadeKatas.filter((kata) => {
      if (q && !kata.name.toLowerCase().includes(q) && !kata.subtitle.toLowerCase().includes(q)) return false
      if (difficultyFilter !== 'all' && kata.difficulty !== difficultyFilter) return false
      return true
    })
  }, [premadeKatas, query, difficultyFilter])

  return (
    <Screen
      title={t('Premade Katas')}
      back
      header={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 var(--gutter) 4px' }}>
          <div className="search-wrap" style={{ padding: 0 }}>
            <label className="search-field">
              <Icon name="magnifyingglass" size={17} strokeWidth={2.4} />
              <input
                type="search"
                value={query}
                placeholder={t('Search Katas...')}
                onChange={(e) => setQuery(e.target.value)}
                enterKeyHint="search"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                >
                  <Icon name="xmark.circle.fill" size={17} />
                </button>
              )}
            </label>
          </div>

          <div className="library-categories" style={{ padding: 0, margin: 0 }}>
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
              <FilterPill
                key={diff}
                title={diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                selected={difficultyFilter === diff}
                onClick={() => setDifficultyFilter(diff)}
              />
            ))}
          </div>
        </div>
      }
    >
      <div className="list-stack" style={{ paddingBottom: '24px' }}>
        <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
          <h2 style={{ fontSize: '18px' }}>Dojo Curated Routines</h2>
          <span className="library-count-badge">
            {filtered.length} {filtered.length === 1 ? 'routine' : 'routines'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Icon name="books.vertical.fill" size={48} />}
            title={t('No Katas found')}
            description={t('Try adjusting your search query or difficulty filter.')}
            action={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setDifficultyFilter('all')
                  setQuery('')
                }}
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="library-katas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {filtered.map((kata) => (
              <div
                key={kata.uuid}
                className="card pressable"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: '18px',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  cursor: 'pointer',
                  minHeight: '160px',
                }}
                onClick={() => {
                  haptic('selection')
                  nav.push({ name: 'kata', id: kata.uuid })
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={42} />
                    <DifficultyBadge difficulty={kata.difficulty} pill />
                  </div>
                  <strong style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {kata.name}
                  </strong>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                    {kata.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="clock" size={11} strokeWidth={2.4} />
                    {minutes(estimatedSeconds(kata, settings.restSeconds))}
                  </span>
                  <span>
                    {kata.items.length} drills
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}


