import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { SheetHeader } from '../../components/SheetHost'
import { BodyDiagram, type BodyPart } from '../../components/BodyDiagram'
import {
  BulletList,
  DifficultyBadge,
  EmptyState,
  FilterPill,
  NumberedSteps,
  PrimaryButton,
  Segmented,
  SymbolTile,
  TagChip,
} from '../../components/ui'
import { estimatedSeconds } from '../../data/content'
import { categoryMeta, equipmentMeta, tintColor } from '../../data/meta'
import type { BodyRegion, Difficulty, Exercise } from '../../data/types'
import { minutes } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { startKata, usePremadeKatas } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { useAllExercises, useSettings } from '../../lib/store'

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
  const settings = useSettings()
  const allExercises = useAllExercises()
  const premadeKatas = usePremadeKatas()

  const [activeTab, setActiveTab] = useState<'exercises' | 'katas'>('exercises')
  const [query, setQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<BodyPart | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all')

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

  // Filter premade katas
  const filteredKatas = useMemo(() => {
    const q = query.trim().toLowerCase()
    return premadeKatas.filter((kata) => {
      if (q) {
        const matchesQuery =
          kata.name.toLowerCase().includes(q) ||
          kata.subtitle.toLowerCase().includes(q)
        if (!matchesQuery) return false
      }
      if (difficultyFilter !== 'all' && kata.difficulty !== difficultyFilter) {
        return false
      }
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
              { value: 'katas', title: t('Katas') },
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
                placeholder={activeTab === 'exercises' ? t('Search exercises & muscles...') : t("Search Katas...")}
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

          {/* Difficulty Chips for Katas */}
          {activeTab === 'katas' && (
            <div className="library-categories">
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
            {/* Minimalist 3D Interactive Body Diagram */}
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
          /* Katas View */
          <>
            <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
              <h2 style={{ fontSize: '18px' }}>Curated Routines</h2>
              <span className="library-count-badge">
                {filteredKatas.length} {filteredKatas.length === 1 ? 'routine' : 'routines'}
              </span>
            </div>

            {filteredKatas.length === 0 ? (
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
              <div className="library-katas-list">
                {filteredKatas.map((kata) => (
                  <div key={kata.uuid} className="library-kata-card">
                    <button
                      type="button"
                      className="library-kata-top"
                      onClick={() => nav.push({ name: 'kata', id: kata.uuid })}
                    >
                      <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={56} />
                      <div className="library-kata-details">
                        <span className="library-kata-title">{kata.name}</span>
                        <span className="library-kata-sub">{kata.subtitle}</span>
                        <div className="meta-row" style={{ marginTop: 2 }}>
                          <span>
                            <Icon name="clock" size={12} strokeWidth={2.4} />
                            {minutes(estimatedSeconds(kata, settings.restSeconds))}
                          </span>
                          <span>
                            <Icon name="list.bullet" size={12} strokeWidth={2.4} />
                            {kata.items.length} exercises
                          </span>
                          <DifficultyBadge difficulty={kata.difficulty} pill />
                        </div>
                      </div>
                    </button>

                    <div className="library-kata-actions">
                      <button
                        type="button"
                        className="text-btn"
                        onClick={() => nav.push({ name: 'kata', id: kata.uuid })}
                      >
                        View Routine
                      </button>
                      <PrimaryButton
                        full={false}
                        icon="play.fill"
                        tint={tintColor(kata.tint)}
                        onClick={() => startKata(kata)}
                      >
                        Start Kata
                      </PrimaryButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
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
    </>
  )
}
