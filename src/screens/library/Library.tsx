import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { SheetHeader } from '../../components/SheetHost'
import { BodyDiagram, type BodyPart } from '../../components/BodyDiagram'
import {
  BulletList,
  EmptyState,
  FilterPill,
  NumberedSteps,
  PrimaryButton,
  Segmented,
  SymbolTile,
  TagChip,
} from '../../components/ui'
import { MARTIAL_ARTS } from '../../data/content'
import { categoryMeta, equipmentMeta, tintColor } from '../../data/meta'
import type { BodyRegion, Exercise, MartialArt } from '../../data/types'
import { addExerciseToKata } from '../../lib/actions'
import { toast } from '../../components/Toast'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { nav } from '../../lib/nav'
import { useAllExercises, useUserKatas } from '../../lib/store'

function matchesBodyPart(exercise: Exercise, part: BodyPart): boolean {
  const cat = (exercise.category || '').toLowerCase()
  const name = exercise.name.toLowerCase()
  const p = part.toLowerCase()

  if (p === 'arms' || p === 'biceps' || p === 'triceps') {
    return (
      cat === 'arms' ||
      cat.includes('arm') ||
      name.includes('arm') ||
      name.includes('bicep') ||
      name.includes('tricep') ||
      name.includes('wrist') ||
      name.includes('forearm')
    )
  }
  if (p === 'neck') return cat === 'neck' || name.includes('neck')
  if (p === 'shoulders') return cat === 'shoulders' || name.includes('shoulder') || name.includes('deltoid')
  if (p === 'chest') return cat === 'chest' || name.includes('chest') || name.includes('pec')
  if (p === 'core') return cat === 'core' || name.includes('core') || name.includes('ab') || name.includes('oblique')
  if (p === 'lowerback') return cat === 'lowerback' || name.includes('lower back') || name.includes('lumbar')
  if (p === 'lats') return cat === 'lats' || name.includes('lat') || name.includes('upper back') || name.includes('rhomboid')
  if (p === 'glutes') return cat === 'glutes' || name.includes('glute') || name.includes('butt') || name.includes('piriformis')
  if (p === 'hipflexors') return cat === 'hipflexors' || name.includes('hip') || name.includes('psoas')
  if (p === 'adductors') return cat === 'adductors' || name.includes('adductor') || name.includes('groin') || name.includes('inner thigh')
  if (p === 'hamstrings') return cat === 'hamstrings' || name.includes('hamstring')
  if (p === 'quads') return cat === 'quads' || name.includes('quad') || name.includes('thigh')
  if (p === 'calves') return cat === 'calves' || cat === 'shins' || name.includes('calf') || name.includes('calves') || name.includes('shin')
  if (p === 'feet') return cat === 'feet' || name.includes('foot') || name.includes('feet') || name.includes('ankle') || name.includes('toe')
  return cat === p || (exercise.targets ? exercise.targets.some((t) => t.toLowerCase().includes(p)) : false)
}

const CATEGORY_CHIPS: { id: string | null; label: string }[] = [
  { id: null, label: 'All' },
  { id: 'neck', label: 'Neck' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'chest', label: 'Chest' },
  { id: 'arms', label: 'Arms' },
  { id: 'core', label: 'Core' },
  { id: 'lowerBack', label: 'Lower Back' },
  { id: 'lats', label: 'Back & Lats' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'hipFlexors', label: 'Hip Flexors' },
  { id: 'adductors', label: 'Adductors' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'quads', label: 'Quads' },
  { id: 'calves', label: 'Calves' },
  { id: 'feet', label: 'Feet & Ankles' },
]

export function LibraryScreen() {
  const { t } = useI18n()
  const allExercises = useAllExercises()

  const [activeTab, setActiveTab] = useState<'exercises' | 'martialArts'>('exercises')
  const [query, setQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<BodyPart | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedArt, setSelectedArt] = useState<MartialArt | null>(null)

  // Filter exercises
  const filteredExercises = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allExercises.filter((ex) => {
      if (q) {
        const matchesQuery =
          ex.name.toLowerCase().includes(q) ||
          ex.summary.toLowerCase().includes(q) ||
          ex.category.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }
      if (selectedMuscle && !matchesBodyPart(ex, selectedMuscle)) {
        return false
      }
      if (selectedCategory && ex.category !== selectedCategory) {
        return false
      }
      return true
    })
  }, [allExercises, query, selectedMuscle, selectedCategory])

  // Filter martial arts
  const filteredArts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MARTIAL_ARTS
    return MARTIAL_ARTS.filter(
      (art) =>
        art.name.toLowerCase().includes(q) ||
        art.origin.toLowerCase().includes(q) ||
        art.tagline.toLowerCase().includes(q) ||
        art.focusAreas.some((fa) => fa.toLowerCase().includes(q))
    )
  }, [query])

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
              { value: 'martialArts', title: t('Martial Arts') },
            ]}
            onChange={(val) => {
              setActiveTab(val)
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

          {/* Category Chips for Exercises */}
          {activeTab === 'exercises' && (
            <div className="library-categories">
              {CATEGORY_CHIPS.map((chip) => (
                <FilterPill
                  key={chip.label}
                  title={chip.label}
                  selected={selectedCategory === chip.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === chip.id ? null : chip.id)
                  }}
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
                setSelectedMuscle(part)
                if (part) setSelectedCategory(null)
              }}
            />

            {/* Results Header */}
            <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
              <h2 style={{ fontSize: '18px' }}>
                {selectedMuscle
                  ? `${formatMuscleTitle(selectedMuscle)} Stretches`
                  : selectedCategory
                  ? `${categoryMeta(selectedCategory as BodyRegion).title} Stretches`
                  : 'All Exercises'}
              </h2>
              <span className="library-count-badge">
                {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'}
              </span>
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
                      setSelectedCategory(null)
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
                  return (
                    <button
                      key={exercise.slug}
                      type="button"
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
                          {exercise.bilateral && (
                            <span>
                              <Icon name="arrow.left.arrow.right" size={11} strokeWidth={2.4} /> Both sides
                            </span>
                          )}
                        </div>
                      </div>
                      <Icon name="chevron.right" size={14} className="muted" />
                    </button>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* Martial Arts Disciplines View */
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
                  <div key={art.id} className="library-art-card">
                    <div className="library-art-header">
                      <SymbolTile icon={art.symbol} tint={tintColor(art.tint)} size={54} />
                      <div className="library-art-title-block">
                        <div className="library-art-name-row">
                          <span className="library-art-name">{art.name}</span>
                          <span className="library-art-origin">{art.origin}</span>
                        </div>
                        <span className="library-art-tagline">{art.tagline}</span>
                      </div>
                    </div>

                    <p className="library-art-about">{art.about}</p>

                    <div className="library-art-focus-row">
                      {art.focusAreas.map((focus) => (
                        <span key={focus} className="library-art-chip">
                          {focus}
                        </span>
                      ))}
                    </div>

                    <div className="library-art-footer">
                      <div className="library-art-meta">
                        <span>
                          <Icon name="figure.walk" size={13} strokeWidth={2.4} /> {art.stretches?.length || 5} Stretches
                        </span>
                        <span>
                          <Icon name="bolt.fill" size={13} strokeWidth={2.4} /> {art.drills?.length || 3} Drills
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary library-art-btn"
                        onClick={() => {
                          haptic('selection')
                          setSelectedArt(art)
                        }}
                      >
                        View Drills & Mobility
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected Martial Art Detail Modal */}
      {selectedArt && (
        <div className="picker-modal-overlay" onClick={() => setSelectedArt(null)}>
          <div className="picker-modal-content" style={{ maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="picker-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SymbolTile icon={selectedArt.symbol} tint={tintColor(selectedArt.tint)} size={44} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{selectedArt.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedArt.origin}</span>
                </div>
              </div>
              <button
                type="button"
                className="search-clear"
                style={{ width: 28, height: 28 }}
                onClick={() => setSelectedArt(null)}
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </div>

            <div className="picker-modal-list" style={{ gap: 14 }}>
              <div style={{ padding: '4px 0' }}>
                <div className="library-art-placeholder-tag" style={{ marginBottom: 8 }}>
                  <Icon name="sparkles" size={12} /> Discipline Hub · Coming in v1.6
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {selectedArt.about}
                </p>
                <div className="library-art-focus-row">
                  {selectedArt.focusAreas.map((focus) => (
                    <span key={focus} className="library-art-chip">
                      {focus}
                    </span>
                  ))}
                </div>
              </div>

              {selectedArt.stretches && selectedArt.stretches.length > 0 && (
                <div>
                  <h4 style={{ margin: '8px 0 8px', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                    Recommended Stretches
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedArt.stretches.map((s) => (
                      <div
                        key={s.slug}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--stroke)',
                          borderRadius: 'var(--radius-medium)',
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>
                            {s.slug.replace(/-/g, ' ')}
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '11.5px', padding: '3px 10px' }}
                            onClick={() => {
                              setSelectedArt(null)
                              nav.present({ name: 'exercise', slug: s.slug })
                            }}
                          >
                            View
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          {s.why}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedArt.drills && selectedArt.drills.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                      Foundational Drills
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Placeholder
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedArt.drills.map((d) => (
                      <div
                        key={d.slug}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--stroke)',
                          borderRadius: 'var(--radius-medium)',
                          padding: '10px 12px',
                          opacity: 0.85,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize' }}>
                            {d.slug.replace(/-/g, ' ')}
                          </span>
                          <span className="library-art-placeholder-tag" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            Drill Preview
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          {d.why}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
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

export function ExerciseSheet({ slug }: { slug: string }) {
  const allExercises = useAllExercises()
  const userKatas = useUserKatas()
  const [showKataPicker, setShowKataPicker] = useState(false)
  const exercise = allExercises.find((e) => e.slug === slug)
  if (!exercise) return null

  return (
    <>
      <SheetHeader
        title={exercise.name}
        trailing={
          <button type="button" className="navbar-action strong" onClick={() => nav.back()}>
            Done
          </button>
        }
      />
      <div className="sheet-scroll form">
        <div className="detail-hero">
          <SymbolTile icon={exercise.symbol} size={88} tint={categoryMeta(exercise.category as BodyRegion).tint} />
          <h2>{exercise.name}</h2>
          <p>{exercise.summary}</p>
        </div>

        <div className="detail-tags">
          <TagChip
            text={categoryMeta(exercise.category as BodyRegion).title}
            icon={categoryMeta(exercise.category as BodyRegion).symbol}
            tint={categoryMeta(exercise.category as BodyRegion).tint}
            filled
          />
          {exercise.equipment.map((e) => {
            const meta = equipmentMeta(e)
            return <TagChip key={e} text={meta.title} icon={meta.symbol} />
          })}
        </div>

        {/* Add to Kata Button */}
        <div style={{ marginTop: '4px', marginBottom: '8px' }}>
          <PrimaryButton
            icon="plus"
            tint={categoryMeta(exercise.category as BodyRegion).tint}
            onClick={() => {
              haptic('selection')
              setShowKataPicker(true)
            }}
          >
            Add to Kata
          </PrimaryButton>
        </div>

        <div className="detail-card">
          <h4>How to perform</h4>
          <NumberedSteps steps={exercise.instructions} />
        </div>

        {exercise.tips.length > 0 && (
          <div className="detail-card">
            <h4>Key Tips</h4>
            <BulletList items={exercise.tips} />
          </div>
        )}
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

