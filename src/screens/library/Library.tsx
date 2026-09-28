import { type CSSProperties, useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { SheetHeader } from '../../components/SheetHost'
import { BodyDiagram } from '../../components/BodyDiagram'
import {
  BulletList,
  EmptyState,
  NumberedSteps,
  PrimaryButton,
  Segmented,
  SymbolTile,
  TagChip,
} from '../../components/ui'
import { MARTIAL_ARTS } from '../../data/content'
import { categoryMeta, equipmentMeta, tintColor } from '../../data/meta'
import type { BodyRegion, Exercise, Difficulty } from '../../data/types'
import { addExerciseToKata, setExerciseNote, toggleFavoriteExercise } from '../../lib/actions'
import { toast } from '../../components/Toast'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { nav } from '../../lib/nav'
import { useAllExercises, useUserKatas, useSettings, useFavoriteExercises, useExerciseNote } from '../../lib/store'
import { MiniMuscleBadge, exerciseTargetLabel } from '../../components/MiniMuscleBadge'
import { usePremadeKatas } from '../../lib/launch'
import { FilterPill, DifficultyBadge, NativeSelect } from '../../components/ui'
import { estimatedSeconds } from '../../data/content'
import { minutes } from '../../lib/format'

export function LibraryScreen() {
  const { t } = useI18n()
  const allExercises = useAllExercises()
  const favorites = useFavoriteExercises()

  const userKatas = useUserKatas()
  const premadeKatas = usePremadeKatas()
  const settings = useSettings()
  const [activeTab, setActiveTab] = useState<'exercises' | 'premadeKatas'>('exercises')
  const [query, setQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all')
  const [premadeSort, setPremadeSort] = useState<'default' | 'duration-asc' | 'duration-desc' | 'difficulty' | 'name'>('default')
  const [pickerExercise, setPickerExercise] = useState<Exercise | null>(null)
  // Filter exercises for active search
  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allExercises
    return allExercises.filter(
      (ex) =>
        (ex.name || '').toLowerCase().includes(q) ||
        (ex.summary || '').toLowerCase().includes(q) ||
        (ex.category || '').toLowerCase().includes(q) ||
        (ex.targets || []).some((t) => (t || '').toLowerCase().includes(q))
    )
  }, [allExercises, query])

  // Filter and sort premade katas
  const filteredPremade = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = premadeKatas.filter((kata) => {
      if (q && !((kata.name || '').toLowerCase().includes(q)) && !((kata.subtitle || '').toLowerCase().includes(q))) return false
      if (difficultyFilter !== 'all' && kata.difficulty !== difficultyFilter) return false
      return true
    })
    const diffRank: Record<Difficulty, number> = { beginner: 1, intermediate: 2, advanced: 3 }
    if (premadeSort === 'duration-asc') {
      return [...list].sort((a, b) => estimatedSeconds(a, settings.restSeconds) - estimatedSeconds(b, settings.restSeconds))
    }
    if (premadeSort === 'duration-desc') {
      return [...list].sort((a, b) => estimatedSeconds(b, settings.restSeconds) - estimatedSeconds(a, settings.restSeconds))
    }
    if (premadeSort === 'difficulty') {
      return [...list].sort((a, b) => (diffRank[a.difficulty ?? 'beginner'] || 1) - (diffRank[b.difficulty ?? 'beginner'] || 1))
    }
    if (premadeSort === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [premadeKatas, query, difficultyFilter, premadeSort, settings.restSeconds])

  return (
    <Screen
      title={t('Library')}
      largeTitle
      titleTrailing={
        <button
          type="button"
          className="pressable"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          onClick={() => {
            haptic('light')
            nav.push({ name: 'martialArts' })
          }}
          aria-label="Martial Arts"
        >
          <div
            className="glass glass-icon-btn"
            style={{ width: 38, height: 38, borderRadius: '50%', color: 'var(--text)' }}
          >
            <Icon name="figure.martial.arts" size={20} strokeWidth={2.3} />
          </div>
          <span style={{ fontSize: '9.5px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {t('Martial Arts')}
          </span>
        </button>
      }
      header={
        <div className="library-header-controls">
          {/* iOS Segmented Control */}
          <Segmented
            value={activeTab}
            options={[
              { value: 'exercises', title: t('Exercises') },
              { value: 'premadeKatas', title: t('Premade Katas') },
            ]}
            onChange={(val) => {
              setActiveTab(val as 'exercises' | 'premadeKatas')
              setQuery('')
            }}
            ariaLabel="Library section"
          />

          {/* Search bar */}
          <div className="search-wrap" style={{ padding: 0 }}>
            <label className="search-field">
              <Icon name="magnifyingglass" size={17} strokeWidth={2.4} />
              <input
                type="search"
                value={query}
                placeholder={activeTab === 'exercises' ? t('Search exercises & muscles...') : t('Search premade Katas...')}
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
          
          {activeTab === 'premadeKatas' && (
            <div className="library-categories" style={{ padding: 0, margin: 0, marginTop: '8px' }}>
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((diff) => (
                <FilterPill
                  key={diff}
                  title={diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  selected={difficultyFilter === diff}
                  onClick={() => setDifficultyFilter(diff)}
                />
              ))}
            </div>
          )}
        </div>
      }
    >
      <div className="library-screen">
        {activeTab === 'exercises' ? (
          <>
            {/* Redesigned Dual Anatomical Body Diagram */}
            <BodyDiagram
              selectedPart={null}
              onSelectPart={(part) => {
                if (part) nav.present({ name: 'muscle', part })
              }}
            />

            {/* If actively searching, show search results */}
            {query.trim() ? (
              <>
                <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
                  <h2 style={{ fontSize: '18px' }}>Search Results</h2>
                  <span className="library-count-badge">
                    {filteredExercises.length} {filteredExercises.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>
                {filteredExercises.length === 0 ? (
                  <EmptyState
                    icon={<Icon name="magnifyingglass" size={44} />}
                    title={t('No exercises found')}
                    description={t('Try adjusting your search query.')}
                  />
                ) : (
                  <div className="library-exercise-list">
                    {filteredExercises.map((exercise) => {
                      const meta = categoryMeta(exercise.category as BodyRegion)
                      return (
                        <div
                          key={exercise.slug}
                          className="library-exercise-card"
                          onClick={() => {
                            haptic('selection')
                            nav.present({ name: 'exercise', slug: exercise.slug })
                          }}
                        >
                          <SymbolTile icon={exercise.symbol} size={48} tint={meta.tint} />
                          <div className="library-exercise-info">
                            <span className="library-exercise-name">{exercise.name}</span>
                            <span className="library-exercise-summary">{exercise.summary}</span>
                            <div className="library-exercise-meta">
                              <TagChip text={meta.title} tint={meta.tint} />
                              <span>
                                <Icon name="clock" size={11} strokeWidth={2.4} /> {exercise.duration}s
                              </span>
                            </div>
                          </div>
                          <MiniMuscleBadge exercise={exercise} size={36} />
                          <button
                            type="button"
                            className="library-quick-add-btn"
                            title="Add to Kata"
                            aria-label={`Add ${exercise.name} to Kata`}
                            onClick={(e) => {
                              e.stopPropagation()
                              haptic('selection')
                              setPickerExercise(exercise)
                            }}
                          >
                            <Icon name="plus" size={15} strokeWidth={2.4} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Normal State: Body Diagram + Redesigned Favorites Shelf */
              <div className="library-favorites-section" style={{ marginTop: '12px' }}>
                <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="star.fill" size={16} style={{ color: '#fbbf24' }} />
                    <h2 style={{ fontSize: '18px', margin: 0 }}>Favorited Exercises</h2>
                  </div>
                  <span className="library-count-badge">
                    {favorites.length} {favorites.length === 1 ? 'saved' : 'saved'}
                  </span>
                </div>

                {favorites.length === 0 ? (
                  <div
                    style={{
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                      border: '1px dashed rgba(255, 255, 255, 0.16)',
                      borderRadius: '18px',
                      padding: '24px 18px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 999,
                        background: 'rgba(251, 191, 36, 0.14)',
                        color: '#fbbf24',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon name="star.fill" size={22} />
                    </div>
                    <strong style={{ fontSize: '15px' }}>No Favorites Yet</strong>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.35 }}>
                      Tap any muscle on the diagram above to explore exercises, or tap the star on any exercise to pin your favorites here.
                    </p>
                  </div>
                ) : (
                  <div className="library-exercise-list">
                    {favorites
                      .map((slug) => allExercises.find((e) => e.slug === slug))
                      .filter((e): e is Exercise => Boolean(e))
                      .map((exercise) => {
                        const ex = exercise
                        const meta = categoryMeta(ex.category as BodyRegion)
                        return (
                          <div
                            key={ex.slug}
                            className="library-exercise-card"
                            onClick={() => {
                              haptic('selection')
                              nav.present({ name: 'exercise', slug: ex.slug })
                            }}
                          >
                            <SymbolTile icon={ex.symbol} size={48} tint={meta.tint} />
                            <div className="library-exercise-info">
                              <span className="library-exercise-name">{ex.name}</span>
                              <span className="library-exercise-summary">{exerciseTargetLabel(ex)}</span>
                              <div className="library-exercise-meta">
                                <TagChip text={meta.title} tint={meta.tint} />
                                <span>
                                  <Icon name="clock" size={11} strokeWidth={2.4} /> {ex.duration}s
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="library-quick-add-btn"
                              style={{ color: '#fbbf24' }}
                              title="Unfavorite"
                              aria-label={`Unfavorite ${ex.name}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                haptic('selection')
                                toggleFavoriteExercise(ex.slug)
                              }}
                            >
                              <Icon name="star.fill" size={16} />
                            </button>
                            <button
                              type="button"
                              className="library-quick-add-btn"
                              title="Add to Kata"
                              aria-label={`Add ${ex.name} to Kata`}
                              onClick={(e) => {
                                e.stopPropagation()
                                haptic('selection')
                                setPickerExercise(ex)
                              }}
                            >
                              <Icon name="plus" size={15} strokeWidth={2.4} />
                            </button>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', margin: '6px 0 2px' }}>
              <span className="library-count-badge">
                {filteredPremade.length} {filteredPremade.length === 1 ? 'routine' : 'routines'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="arrow.up.arrow.down" size={13} style={{ color: 'var(--text-secondary)' }} />
                <NativeSelect<string>
                  label={t('Sort')}
                  value={premadeSort}
                  options={[
                    { value: 'default', title: t('Curated') },
                    { value: 'duration-asc', title: t('Shortest First') },
                    { value: 'duration-desc', title: t('Longest First') },
                    { value: 'difficulty', title: t('By Level') },
                    { value: 'name', title: t('Alphabetical') },
                  ]}
                  onChange={(val) => setPremadeSort(val as any)}
                />
              </div>
            </div>

            {filteredPremade.length === 0 ? (
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
              <div className="library-katas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', marginTop: '12px' }}>
                {filteredPremade.map((kata) => (
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
          </>
        )}
      </div>

      {/* Quick Add to Kata Picker Modal from Library */}
      {pickerExercise && (
        <div className="picker-modal-overlay" onClick={() => setPickerExercise(null)}>
          <div className="picker-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="picker-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Add to Kata</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Choose a routine for {pickerExercise.name}
                </p>
              </div>
              <button
                type="button"
                className="search-clear"
                style={{ width: 28, height: 28 }}
                onClick={() => setPickerExercise(null)}
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </div>

            <div className="picker-modal-list">
              {userKatas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    You don't have any custom katas yet.
                  </p>
                  <PrimaryButton
                    icon="plus"
                    onClick={() => {
                      setPickerExercise(null)
                      nav.present({ name: 'editor', mode: { kind: 'create' } })
                    }}
                  >
                    Create New Kata
                  </PrimaryButton>
                </div>
              ) : (
                userKatas.map((kata) => (
                  <button
                    key={kata.uuid}
                    type="button"
                    className="picker-modal-item"
                    onClick={() => {
                      const ok = addExerciseToKata(kata.uuid, pickerExercise.slug, pickerExercise.duration || 30)
                      if (ok) {
                        haptic('success')
                        toast(`Added ${pickerExercise.name} to ${kata.name}`, { icon: 'checkmark.circle.fill' })
                        setPickerExercise(null)
                      }
                    }}
                  >
                    <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={40} />
                    <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>
                        {kata.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {kata.items.length} exercises
                      </div>
                    </div>
                    <Icon name="plus" size={16} className="muted" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}

export function ArtDetailSheet({ artId }: { artId: string }) {
  const art = MARTIAL_ARTS.find((a) => a.id === artId)
  if (!art) return null
  const tint = tintColor(art.tint)

  return (
    <>
      <SheetHeader
        title={art.name}
        trailing={
          <button type="button" className="navbar-action strong" onClick={() => nav.back()}>
            Done
          </button>
        }
      />
      <div className="sheet-scroll form">
        <div className="detail-hero centered" style={{ '--tint': tint } as CSSProperties}>
          <div className="detail-hero-glow" aria-hidden="true" />
          <div style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              background: 'color-mix(in srgb, var(--tint) 18%, var(--surface-raised))',
              border: '1px solid color-mix(in srgb, var(--tint) 35%, transparent)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '52px',
              margin: '0 auto 14px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            }}>
              <span role="img" aria-label={art.origin}>{art.symbol}</span>
            </div>
          <h2>{art.name}</h2>
          <p>
            {art.origin} · {art.tagline}
          </p>
          <p className="art-detail-future-note">
            More on this discipline is coming in a future update.
          </p>
        </div>
      </div>
    </>
  )
}

export function ExerciseSheet({ slug }: { slug: string }) {
  const allExercises = useAllExercises()
  const favorites = useFavoriteExercises()
  const userKatas = useUserKatas()
  const [showKataPicker, setShowKataPicker] = useState(false)
  const savedNote = useExerciseNote(slug)
  const [noteText, setNoteText] = useState(savedNote)
  const exercise = allExercises.find((e) => e.slug === slug)
  if (!exercise) return null

  const meta = categoryMeta(exercise.category as BodyRegion)

  return (
    <>
              <SheetHeader
          title={exercise.name}
          leading={
            <button type="button" className="navbar-action" style={{ color: favorites.includes(exercise.slug) ? 'var(--gold, #fbbf24)' : 'var(--text-quaternary)' }} onClick={() => { haptic('light'); toggleFavoriteExercise(exercise.slug) }}>
              <Icon name={favorites.includes(exercise.slug) ? "star.fill" : "star"} size={22} strokeWidth={favorites.includes(exercise.slug) ? 0 : 2} />
            </button>
          }
        trailing={
          <button type="button" className="navbar-action strong" onClick={() => nav.back()}>
            Done
          </button>
        }
      />
      <div className="sheet-scroll form">
        <div className="detail-hero centered" style={{ '--tint': meta.tint } as CSSProperties}>
          <div className="detail-hero-glow" aria-hidden="true" />
          <SymbolTile icon={exercise.symbol} size={88} tint={meta.tint} />
          <h2>{exercise.name}</h2>
          <p>{exercise.summary}</p>

          <div className="detail-tags">
            <TagChip text={meta.title} icon={meta.symbol} tint={meta.tint} filled />
            {exercise.equipment.map((e) => {
              const eqMeta = equipmentMeta(e)
              return <TagChip key={e} text={eqMeta.title} icon={eqMeta.symbol} />
            })}
          </div>

          <div className="hero-stats card">
            <div className="hero-stat">
              <strong>{exercise.duration}s</strong>
              <span>Duration</span>
            </div>
            <div className="hero-stat">
              <strong>{exercise.bilateral ? 'Both' : 'One'}</strong>
              <span>Sides</span>
            </div>
            <div className="hero-stat">
              <strong>{exercise.duration >= 45 ? 'Hold' : 'Dynamic'}</strong>
              <span>Style</span>
            </div>
          </div>
        </div>

        <div className="card detail-card">
          <h4>How to perform</h4>
          <NumberedSteps steps={exercise.instructions} />
        </div>

        <div className="card detail-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="pencil" size={14} />
              Personal Note / Cue
            </h4>
            {savedNote && <span style={{ fontSize: '11px', color: 'var(--jade)', fontWeight: 600 }}>Saved</span>}
          </div>
          <textarea
            placeholder="Add personal cues, breathing reminders, or form tips..."
            value={noteText}
            rows={2}
            onChange={(e) => {
              setNoteText(e.target.value)
              setExerciseNote(exercise.slug, e.target.value)
            }}
            style={{
              width: '100%',
              background: 'color-mix(in srgb, var(--surface) 60%, transparent)',
              border: '1px solid var(--stroke)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '13px',
              color: 'var(--text)',
              fontFamily: 'inherit',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {exercise.tips.length > 0 && (
          <div className="card detail-card">
            <h4>Key Tips</h4>
            <BulletList items={exercise.tips} />
          </div>
        )}
      </div>

      <div className="sheet-footer">
        <PrimaryButton
          icon="plus"
          tint={meta.tint}
          onClick={() => {
            haptic('selection')
            setShowKataPicker(true)
          }}
        >
          Add to Kata
        </PrimaryButton>
      </div>

      {/* Add to Kata Picker Modal */}
      {showKataPicker && (
        <div className="picker-modal-overlay" onClick={() => setShowKataPicker(false)}>
          <div className="picker-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="picker-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Add to Kata</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Choose a routine for {exercise.name}
                </p>
              </div>
              <button
                type="button"
                className="search-clear"
                style={{ width: 28, height: 28 }}
                onClick={() => setShowKataPicker(false)}
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </div>

            <div className="picker-modal-list">
              {userKatas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    You don't have any custom katas yet.
                  </p>
                  <PrimaryButton
                    icon="plus"
                    onClick={() => {
                      setShowKataPicker(false)
                      nav.present({ name: 'editor', mode: { kind: 'create' } })
                    }}
                  >
                    Create New Kata
                  </PrimaryButton>
                </div>
              ) : (
                userKatas.map((kata) => (
                  <button
                    key={kata.uuid}
                    type="button"
                    className="picker-modal-item"
                    onClick={() => {
                      const ok = addExerciseToKata(kata.uuid, exercise.slug, exercise.duration || 30)
                      if (ok) {
                        haptic('success')
                        toast(`Added ${exercise.name} to ${kata.name}`, { icon: 'checkmark.circle.fill' })
                        setShowKataPicker(false)
                      }
                    }}
                  >
                    <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={40} />
                    <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)' }}>
                        {kata.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {kata.items.length} exercises
                      </div>
                    </div>
                    <Icon name="plus" size={16} className="muted" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}











