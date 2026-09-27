import { type CSSProperties, useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { SheetHeader } from '../../components/SheetHost'
import { BodyDiagram, type BodyPart } from '../../components/BodyDiagram'
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
import { MartialArtEmblem } from '../../components/MartialArtEmblems'
import { addExerciseToKata, toggleFavoriteExercise } from '../../lib/actions'
import { toast } from '../../components/Toast'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { getExerciseRelevance, matchesBodyPart } from '../../lib/muscleMatch'
import { nav } from '../../lib/nav'
import { useAllExercises, useUserKatas, useSettings, useFavoriteExercises } from '../../lib/store'
import { usePremadeKatas } from '../../lib/launch'
import { FilterPill, DifficultyBadge } from '../../components/ui'
import { estimatedSeconds } from '../../data/content'
import { minutes } from '../../lib/format'

export type SubFilterType = 'all' | 'favorites' | 'holds' | 'dynamic' | 'quick'

export function LibraryScreen() {
  const { t } = useI18n()
  const allExercises = useAllExercises()
  const favorites = useFavoriteExercises()

  const userKatas = useUserKatas()
  const premadeKatas = usePremadeKatas()
  const settings = useSettings()
  const [activeTab, setActiveTab] = useState<'exercises' | 'premadeKatas' | 'martialArts'>('exercises')
  const [query, setQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<BodyPart | null>(null)
  const [subFilter, setSubFilter] = useState<SubFilterType>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all')
  const [pickerExercise, setPickerExercise] = useState<Exercise | null>(null)

  // Filter and intelligently order exercises
  const { filteredExercises, allCount } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const baseList = allExercises.filter((ex) => {
      if (q) {
        const matchesQuery =
          (ex.name || "").toLowerCase().includes(q) ||
          (ex.summary || "").toLowerCase().includes(q) ||
          (ex.category || "").toLowerCase().includes(q)
        if (!matchesQuery) return false
      }
      if (selectedMuscle && !matchesBodyPart(ex, selectedMuscle)) {
        return false
      }
      return true
    })

    const count = baseList.length

    // Sub-filter
    const subFiltered = baseList.filter((ex) => {
      if (subFilter === 'all') return true
      if (subFilter === 'favorites') return favorites.includes(ex.slug)
      if (subFilter === 'quick') return (ex.duration || 30) < 45
      if (subFilter === 'holds') {
        const s = (ex.name + ' ' + ex.summary).toLowerCase()
        return (
          (ex.duration || 30) >= 45 ||
          s.includes('hold') ||
          s.includes('stretch') ||
          s.includes('static') ||
          s.includes('pose')
        )
      }
      if (subFilter === 'dynamic') {
        const s = (ex.name + ' ' + ex.summary).toLowerCase()
        return (
          s.includes('dynamic') ||
          s.includes('mobility') ||
          s.includes('pulse') ||
          s.includes('swing') ||
          s.includes('rotation') ||
          s.includes('circle') ||
          s.includes('flow') ||
          (ex.duration || 30) <= 30
        )
      }
      return true
    })

    // Intelligent Sorting:
    // Direct muscle target matches first, then direct name matches, then duration
    const sorted = [...subFiltered].sort((a, b) => {
      const scoreA = getExerciseRelevance(a, selectedMuscle)
      const scoreB = getExerciseRelevance(b, selectedMuscle)
      if (scoreA !== scoreB) return scoreB - scoreA
      return (a.duration || 30) - (b.duration || 30)
    })

    return { filteredExercises: sorted, allCount: count }
  }, [allExercises, query, selectedMuscle, subFilter, favorites])

  // Filter martial arts
  const filteredArts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MARTIAL_ARTS
    return MARTIAL_ARTS.filter(
      (art) =>
        (art.name || "").toLowerCase().includes(q) ||
        (art.origin || "").toLowerCase().includes(q) ||
        (art.tagline || "").toLowerCase().includes(q) ||
        (art.focusAreas || []).some((fa) => (fa || "").toLowerCase().includes(q))
    )
  }, [query])

  // Filter premade katas
  const filteredPremade = useMemo(() => {
    const q = query.trim().toLowerCase()
    return premadeKatas.filter((kata) => {
      if (q && !((kata.name || "").toLowerCase().includes(q)) && !((kata.subtitle || "").toLowerCase().includes(q))) return false
      if (difficultyFilter !== 'all' && kata.difficulty !== difficultyFilter) return false
      return true
    })
  }, [premadeKatas, query, difficultyFilter])

  return (
    <Screen
      title={t('Library')}
      largeTitle
      header={
        <div className="library-header-controls">
          {/* iOS Segmented Control */}
          <Segmented
            value={activeTab}
            options={[
              { value: 'exercises', title: t('Exercises') },
              { value: 'premadeKatas', title: t('Premade Katas') },
              { value: 'martialArts', title: t('Martial Arts') },
            ]}
            onChange={(val) => {
              setActiveTab(val as 'exercises' | 'premadeKatas' | 'martialArts')
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
                placeholder={activeTab === 'exercises' ? t('Search exercises & muscles...') : t('Search Martial Arts...')}
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
              selectedPart={selectedMuscle}
              onSelectPart={(part) => {
                if (part) nav.push({ name: 'muscle', part })
              }}
            />

            {/* Results Header */}
            <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
              <h2 style={{ fontSize: '18px' }}>
                {selectedMuscle ? `${formatMuscleTitle(selectedMuscle)} Stretches` : 'All Exercises'}
              </h2>
              <span className="library-count-badge">
                {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
              </span>
            </div>

            {/* Quick Sub-filters: Deep Holds, Dynamic, Quick */}
            <div className="library-subfilters">
              <button
                type="button"
                className={`library-subfilter-btn ${subFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  haptic('light')
                  setSubFilter('all')
                }}
              >
                All ({allCount})              </button>
              <button
                type="button"
                className={`library-subfilter-btn ${subFilter === 'favorites' ? 'active' : ''}`}
                onClick={() => {
                  haptic('light')
                  setSubFilter('favorites')
                }}
              >
                ⭐ Favorites</button>
              <button
                type="button"
                className={`library-subfilter-btn ${subFilter === 'holds' ? 'active' : ''}`}
                onClick={() => {
                  haptic('light')
                  setSubFilter('holds')
                }}
              >
                🧘 Deep Holds
              </button>
              <button
                type="button"
                className={`library-subfilter-btn ${subFilter === 'dynamic' ? 'active' : ''}`}
                onClick={() => {
                  haptic('light')
                  setSubFilter('dynamic')
                }}
              >
                ⚡ Dynamic
              </button>
              <button
                type="button"
                className={`library-subfilter-btn ${subFilter === 'quick' ? 'active' : ''}`}
                onClick={() => {
                  haptic('light')
                  setSubFilter('quick')
                }}
              >
                ⏱ Quick (&lt;45s)
              </button>
            </div>

            {/* Exercise List */}
            {filteredExercises.length === 0 ? (
              <EmptyState
                icon={<Icon name="figure.mind.and.body" size={48} />}
                title={t('No exercises found')}
                description={t('Try clearing the muscle or category filter.')}
                action={
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedMuscle(null)
                      setSubFilter('all')
                      setQuery('')
                    }}
                  >
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <div className="library-exercise-list">
                {filteredExercises.map((exercise) => {
                  const meta = categoryMeta(exercise.category as BodyRegion)
                  const targetLabel = selectedMuscle ? formatMuscleTitle(selectedMuscle) : null
                  const showTargetBadge = targetLabel !== null && !sameMuscleLabel(targetLabel, meta.title)
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
                          {showTargetBadge && (
                            <span className="library-target-badge">
                              <Icon name="target" size={10} strokeWidth={2.4} /> {targetLabel}
                            </span>
                          )}
                          <TagChip text={meta.title} tint={meta.tint} />
                          <span>
                            <Icon name="clock" size={11} strokeWidth={2.4} /> {exercise.duration}s
                          </span>
                          {exercise.bilateral && (
                            <span>
                              <Icon name="arrow.left.arrow.right" size={11} strokeWidth={2.4} /> Both sides
                            </span>
                          )}
                          <span>{exercise.duration >= 45 ? '🧘 Hold' : '⚡ Dynamic'}</span>
                        </div>
                      </div>

                      {/* Quick Add to Kata Button */}
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

                      <Icon name="chevron.right" size={14} className="muted" />
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : activeTab === 'premadeKatas' ? (
          <>
            <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
              <h2 style={{ fontSize: '18px' }}>Dojo Curated Routines</h2>
              <span className="library-count-badge">
                {filteredPremade.length} {filteredPremade.length === 1 ? 'routine' : 'routines'}
              </span>
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
              <div className="library-katas-list" style={{ marginTop: '12px' }}>
                {filteredPremade.map((kata) => (
                  <div key={kata.uuid} className="library-kata-card" style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      className="library-kata-top"
                      style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%', textAlign: 'left', background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: 'none' }}
                      onClick={() => nav.push({ name: 'kata', id: kata.uuid })}
                    >
                      <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={64} />
                      <div className="library-kata-details" style={{ flex: 1 }}>
                        <span className="library-kata-title" style={{ display: 'block', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{kata.name}</span>
                        <span className="library-kata-sub" style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)' }}>{kata.subtitle}</span>
                        <div className="meta-row" style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="clock" size={12} strokeWidth={2.4} />
                            {minutes(estimatedSeconds(kata, settings.restSeconds))}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="list.bullet" size={12} strokeWidth={2.4} />
                            {kata.items.length} exercises
                          </span>
                          <DifficultyBadge difficulty={kata.difficulty} pill />
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Martial Arts Disciplines View: 2-Column Liquid Glass Grid */
          <>
            <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
              <h2 style={{ fontSize: '18px' }}>Martial Arts Disciplines</h2>
              <span className="library-count-badge">
                {filteredArts.length} {filteredArts.length === 1 ? 'discipline' : 'disciplines'}
              </span>
            </div>
            <p style={{ margin: '0 4px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Explore targeted mobility, foundational stances, and recovery routines designed specifically for your martial art.
            </p>

            {filteredArts.length === 0 ? (
              <EmptyState
                icon={<Icon name="figure.martial.arts" size={48} />}
                title={t('No disciplines found')}
                description={t('Try adjusting your search query.')}
                action={
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setQuery('')}
                  >
                    Clear Search
                  </button>
                }
              />
            ) : (
              <div className="library-arts-grid">
                {filteredArts.map((art) => (
                  <div
                    key={art.id}
                    className="library-art-card pressable"
                    style={{ '--art-tint': tintColor(art.tint) } as CSSProperties}
                    onClick={() => {
                      haptic('selection')
                      nav.present({ name: 'artLearnMore', artId: art.id })
                    }}
                  >
                    <div className="library-art-emblem-wrap">
                      <MartialArtEmblem artId={art.id} size={56} tint={tintColor(art.tint)} />
                    </div>
                    <span className="library-art-name">{art.name}</span>
                    <span className="library-art-origin">{art.origin}</span>
                    <span className="library-art-cta">
                      Explore <Icon name="chevron.right" size={11} strokeWidth={2.6} />
                    </span>
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

/** Loosely compares two muscle display labels so "Hamstring" and "Hamstrings" (etc.) count as the same. */
function sameMuscleLabel(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const irregulars: Record<string, string> = { calf: 'calve', foot: 'feet' }
  const normalize = (s: string) => {
    const word = s.toLowerCase().split(/[&,]/)[0].trim().replace(/s$/, '')
    return irregulars[word] ?? word
  }
  const na = normalize(a)
  const nb = normalize(b)
  return na === nb || na.startsWith(nb) || nb.startsWith(na)
}

function formatMuscleTitle(part: BodyPart): string {
  const map: Record<BodyPart, string> = {
    neck: 'Neck',
    shoulders: 'Shoulder',
    chest: 'Chest',
    arms: 'Arms',
    biceps: 'Biceps',
    triceps: 'Triceps',
    core: 'Core & Abs',
    lowerBack: 'Lower Back',
    lats: 'Lats & Upper Back',
    glutes: 'Glute',
    hipFlexors: 'Hip Flexor',
    adductors: 'Adductor & Groin',
    hamstrings: 'Hamstring',
    quads: 'Quadriceps',
    calves: 'Calf & Shin',
    feet: 'Foot & Ankle',
  }
  return map[part] || part
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
          <MartialArtEmblem artId={art.id} size={88} tint={tint} />
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











