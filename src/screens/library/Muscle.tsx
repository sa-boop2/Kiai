import { Screen } from '../../components/Screen'
import { BodyPart } from '../../components/BodyDiagram'
import { useAllExercises, useFavoriteExercises } from '../../lib/store'
import { useMemo } from 'react'
import { getExerciseRelevance, matchesBodyPart } from '../../lib/muscleMatch'
import { categoryMeta } from '../../data/meta'
import { BodyRegion } from '../../data/types'
import { SymbolTile, EmptyState } from '../../components/ui'
import { Icon } from '../../components/Icon'
import { nav } from '../../lib/nav'
import { haptic } from '../../lib/haptics'
import { toggleFavoriteExercise } from '../../lib/actions'
import { useI18n } from '../../lib/i18n'

function formatMuscleTitle(part: BodyPart): string {
  const map: Record<BodyPart, string> = {
    neck: 'Neck',
    shoulders: 'Shoulders',
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
  return map[part] || part
}

export function MuscleDetailScreen({ part }: { part: BodyPart }) {
  const { t } = useI18n()
  const allExercises = useAllExercises()
  const favorites = useFavoriteExercises()
  
  const title = formatMuscleTitle(part)

  const exercises = useMemo(() => {
    const list = allExercises.filter(ex => matchesBodyPart(ex, part))
    return list.sort((a, b) => {
      // Favorites first
      const favA = favorites.includes(a.slug)
      const favB = favorites.includes(b.slug)
      if (favA && !favB) return -1
      if (!favA && favB) return 1
      
      const scoreA = getExerciseRelevance(a, part)
      const scoreB = getExerciseRelevance(b, part)
      if (scoreA !== scoreB) return scoreB - scoreA
      return (a.duration || 30) - (b.duration || 30)
    })
  }, [allExercises, part, favorites])

  return (
    <Screen title={title} back>
      <div className="list-stack" style={{ padding: '0 var(--gutter) 24px' }}>
        <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 12px' }}>
          <h2 style={{ fontSize: '18px' }}>{title} Stretches</h2>
          <span className="library-count-badge">
            {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
          </span>
        </div>

        {exercises.length === 0 ? (
          <EmptyState
            icon={<Icon name="figure.mind.and.body" size={48} />}
            title={t('No exercises found')}
            description={t('Try checking another muscle group.')}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {exercises.map((exercise) => {
              const meta = categoryMeta(exercise.category as BodyRegion)
              const isFav = favorites.includes(exercise.slug)
              return (
                <div
                  key={exercise.slug}
                  className="card pressable"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '16px 12px',
                    textAlign: 'center',
                    position: 'relative',
                    gap: '8px'
                  }}
                  onClick={() => {
                    haptic('selection')
                    nav.present({ name: 'exercise', slug: exercise.slug })
                  }}
                >
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isFav ? 'var(--gold, #fbbf24)' : 'var(--text-quaternary)',
                      background: 'transparent',
                      border: 'none',
                      zIndex: 2,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      haptic('light')
                      toggleFavoriteExercise(exercise.slug)
                    }}
                  >
                    <Icon name={isFav ? "star.fill" : "star"} size={18} strokeWidth={isFav ? 0 : 2.5} />
                  </button>
                  <SymbolTile icon={exercise.symbol} size={48} tint={meta.tint} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{exercise.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{exercise.duration}s</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}
