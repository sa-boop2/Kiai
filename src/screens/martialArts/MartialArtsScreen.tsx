import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { EmptyState, SymbolTile } from '../../components/ui'
import { MARTIAL_ARTS } from '../../data/content'
import { getDojoProfile, type MartialDojoProfile } from '../../data/martialDojoData'
import { tintColor } from '../../data/meta'
import { updateProfile } from '../../lib/actions'
import { minutes } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { startKata, usePremadeKatas } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { useProfile } from '../../lib/store'
import { toast } from '../../components/Toast'

export function MartialArtsScreen() {
  const { t } = useI18n()
  const profile = useProfile()
  const premadeKatas = usePremadeKatas()
  const [browseMode, setBrowseMode] = useState(!profile.primaryArt)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string | null>(null)
  const [activeBenchmarkLevel, setActiveBenchmarkLevel] = useState<Record<string, number>>({})
  const [selectedArtDetail, setSelectedArtDetail] = useState<MartialDojoProfile | null>(null)

  // Current primary art profile
  const activeArtId = profile.primaryArt || 'karate'
  const currentDojo = useMemo(() => getDojoProfile(activeArtId), [activeArtId])

  // Filter martial arts in browse mode
  const filteredArts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return MARTIAL_ARTS
    return MARTIAL_ARTS.filter(
      (art) =>
        art.name.toLowerCase().includes(q) ||
        art.origin.toLowerCase().includes(q) ||
        art.tagline.toLowerCase().includes(q) ||
        art.focusAreas.some((fa) => fa.toLowerCase().includes(q))
    )
  }, [searchQuery])

  // Active benchmark in the widget
  const activeBenchmark = useMemo(() => {
    const list = currentDojo.benchmarks
    if (selectedBenchmarkId) {
      const found = list.find((b) => b.id === selectedBenchmarkId)
      if (found) return found
    }
    return list[0]
  }, [currentDojo, selectedBenchmarkId])

  const currentLevel = activeBenchmark ? (activeBenchmarkLevel[activeBenchmark.id] ?? 2) : 1

  const handleAdvanceLevel = (benchmarkId: string) => {
    haptic('success')
    setActiveBenchmarkLevel((prev) => {
      const cur = prev[benchmarkId] ?? 2
      const next = Math.min(5, cur + 1)
      toast(`Level Up! Reached Level ${next} in ${activeBenchmark.name}`, { icon: 'crown.fill' })
      return { ...prev, [benchmarkId]: next }
    })
  }

  const handleSelectDiscipline = (artId: string) => {
    haptic('success')
    updateProfile({ primaryArt: artId })
    setBrowseMode(false)
    setSelectedArtDetail(null)
    toast(`Dojo updated to ${getDojoProfile(artId).nativeName} (${artId.toUpperCase()})`, { icon: 'sparkles' })
  }

  // Find katas related to this art
  const relatedKatas = useMemo(() => {
    return premadeKatas.filter((k) => k.art === activeArtId || k.uuid.includes(activeArtId) || k.name.toLowerCase().includes(activeArtId)).slice(0, 3)
  }, [premadeKatas, activeArtId])

  return (
    <Screen
      title={browseMode ? t('Martial Arts') : `${currentDojo.flag} ${currentDojo.nativeName}`}
      largeTitle
      header={
        <div style={{ padding: '0 var(--gutter) 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {browseMode ? (
            <div className="search-wrap" style={{ padding: 0 }}>
              <label className="search-field">
                <Icon name="magnifyingglass" size={17} strokeWidth={2.4} />
                <input
                  type="search"
                  value={searchQuery}
                  placeholder={t('Search disciplines, origins & styles...')}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  enterKeyHint="search"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setSearchQuery('')}>
                    <Icon name="xmark.circle.fill" size={17} />
                  </button>
                )}
              </label>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: currentDojo.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Active Dojo Discipline
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {currentDojo.country} · {currentDojo.tagline}
                </p>
              </div>
              <button
                type="button"
                className="glass pressable"
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  border: '1px solid var(--stroke)',
                }}
                onClick={() => {
                  haptic('selection')
                  setBrowseMode(true)
                }}
              >
                Switch
              </button>
            </div>
          )}
        </div>
      }
    >
      <div className="list-stack" style={{ paddingBottom: '32px' }}>
        {/* ============================================================ */}
        {/* MODE A: BROWSE ALL DISCIPLINES (2 PER ROW BIG AESTHETIC CARDS) */}
        {/* ============================================================ */}
        {browseMode ? (
          <>
            <div className="section-header" style={{ padding: '0 4px', margin: '4px 0 0' }}>
              <h2 style={{ fontSize: '18px' }}>Martial Disciplines</h2>
              <span className="library-count-badge">
                {filteredArts.length} {filteredArts.length === 1 ? 'discipline' : 'disciplines'}
              </span>
            </div>
            <p style={{ margin: '0 4px 10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Choose a discipline to transform this section into your dedicated mobility hub with specialized benchmarks, routines, and lore.
            </p>

            {filteredArts.length === 0 ? (
              <EmptyState
                icon={<Icon name="figure.martial.arts" size={48} />}
                title={t('No disciplines found')}
                description={t('Try adjusting your search query.')}
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '12px',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {filteredArts.map((art) => {
                  const dojo = getDojoProfile(art.id)
                  const isSelected = profile.primaryArt === art.id
                  return (
                    <div
                      key={art.id}
                      className="card pressable"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '16px 14px',
                        borderRadius: '22px',
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        border: isSelected ? `2px solid ${tintColor(art.tint)}` : '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        cursor: 'pointer',
                        minHeight: '210px',
                        minWidth: 0,
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                      }}
                      onClick={() => {
                        haptic('selection')
                        setSelectedArtDetail(dojo)
                      }}
                    >
                      <div>
                        {/* Top Medallion & Native Script */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: '16px',
                              background: `color-mix(in srgb, ${tintColor(art.tint)} 18%, var(--surface-raised))`,
                              border: `1px solid color-mix(in srgb, ${tintColor(art.tint)} 35%, transparent)`,
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '26px',
                              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                            }}
                          >
                            <span role="img" aria-label={art.origin}>{art.symbol}</span>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                            {dojo.nativeName}
                          </span>
                        </div>

                        {/* Name & Origin */}
                        <strong style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', display: 'block', lineHeight: 1.2 }}>
                          {art.name}
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                          {art.origin}
                        </span>

                        {/* Tagline */}
                        <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-tertiary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.35 }}>
                          {art.tagline}
                        </p>
                      </div>

                      {/* Action Pill */}
                      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: tintColor(art.tint) }}>
                          {isSelected ? 'Active Dojo' : 'Explore'}
                        </span>
                        <Icon name="chevron.right" size={13} strokeWidth={2.6} style={{ color: tintColor(art.tint) }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* ============================================================ */
          /* MODE B: DEDICATED MARTIAL DOJO HUB                           */
          /* ============================================================ */
          <>
            {/* 1. UNIQUE DISCIPLINE FLEXIBILITY & PROGRESSION WIDGET */}
            <div
              style={{
                borderRadius: '24px',
                padding: '20px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03))',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: currentDojo.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {currentDojo.nativeName} · Milestones & Biomechanics
                  </span>
                  <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--text)' }}>
                    Flexibility Progression
                  </h2>
                </div>

                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    background: `color-mix(in srgb, ${currentDojo.accent} 20%, transparent)`,
                    color: currentDojo.accent,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '22px',
                  }}
                >
                  <Icon name="figure.flexibility" size={24} />
                </div>
              </div>

              {/* Benchmark Selector Tabs */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {currentDojo.benchmarks.map((bench) => {
                  const isSelected = (activeBenchmark?.id === bench.id)
                  const lvl = activeBenchmarkLevel[bench.id] ?? 2
                  return (
                    <button
                      key={bench.id}
                      type="button"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        background: isSelected ? currentDojo.accent : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 160ms ease',
                      }}
                      onClick={() => {
                        haptic('selection')
                        setSelectedBenchmarkId(bench.id)
                      }}
                    >
                      {bench.name} (Lvl {lvl})
                    </button>
                  )
                })}
              </div>

              {/* Active Benchmark Level Card */}
              {activeBenchmark && (
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '18px',
                    padding: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '16px', color: 'var(--text)' }}>{activeBenchmark.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>
                        {activeBenchmark.description}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: currentDojo.accent }}>
                        Level {currentLevel}/5
                      </span>
                    </div>
                  </div>

                  {/* Level Target Box */}
                  <div
                    style={{
                      margin: '10px 0 14px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: `color-mix(in srgb, ${currentDojo.accent} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${currentDojo.accent} 25%, transparent)`,
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: currentDojo.accent, textTransform: 'uppercase' }}>
                      Current Goal: {activeBenchmark.levels[currentLevel - 1]?.title}
                    </span>
                    <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text)', lineHeight: 1.35 }}>
                      {activeBenchmark.levels[currentLevel - 1]?.target}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        background: currentDojo.accent,
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleAdvanceLevel(activeBenchmark.id)}
                    >
                      {currentLevel >= 5 ? 'Mastery Level 5 Max' : `Check In & Advance to Lvl ${currentLevel + 1}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. ROUTINES PER GOAL */}
            <div>
              <div className="section-header" style={{ padding: '0 4px', margin: '8px 0 10px' }}>
                <h2 style={{ fontSize: '18px' }}>Routines Per Goal</h2>
                <span className="library-count-badge">Curated Katas</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentDojo.routineGoals.map((goal, idx) => {
                  const matchingKata = relatedKatas[idx] || premadeKatas[idx]
                  return (
                    <div
                      key={goal.title}
                      className="card pressable"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '20px',
                        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(20px)',
                      }}
                      onClick={() => {
                        haptic('selection')
                        if (matchingKata) startKata(matchingKata)
                        else nav.push({ name: 'premadeWorkouts' })
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                        <SymbolTile icon={goal.symbol} tint={goal.accent} size={48} />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '16px', color: 'var(--text)', display: 'block' }}>{goal.title}</strong>
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {goal.description}
                          </p>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon name="clock" size={11} /> {minutes(goal.duration)} · {goal.exercisesCount} exercises
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-primary"
                        style={{
                          padding: '8px 14px',
                          borderRadius: '12px',
                          background: goal.accent,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                          marginLeft: '10px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          haptic('medium')
                          if (matchingKata) startKata(matchingKata)
                          else nav.push({ name: 'premadeWorkouts' })
                        }}
                      >
                        Start
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. SIGNATURE MARTIAL DRILLS */}
            <div>
              <div className="section-header" style={{ padding: '0 4px', margin: '8px 0 10px' }}>
                <h2 style={{ fontSize: '18px' }}>Technical Mobility Drills</h2>
                <span className="library-count-badge">{currentDojo.drills.length} drills</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentDojo.drills.map((drill) => (
                  <div
                    key={drill.name}
                    className="card"
                    style={{
                      padding: '16px',
                      borderRadius: '20px',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02))',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <SymbolTile icon={drill.symbol} tint={currentDojo.accent} size={42} />
                      <div>
                        <strong style={{ fontSize: '15px', color: 'var(--text)', display: 'block' }}>{drill.name}</strong>
                        <span style={{ fontSize: '12px', color: currentDojo.accent, fontWeight: 600 }}>{drill.focus}</span>
                      </div>
                    </div>

                    <ol style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {drill.instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. LINEAGE, PHILOSOPHY & LORE CARD */}
            <div
              className="card"
              style={{
                padding: '18px',
                borderRadius: '22px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>{currentDojo.flag}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Lineage & Philosophy</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Origin: {currentDojo.country}</span>
                </div>
              </div>
              <p style={{ margin: '6px 0', fontSize: '13px', color: 'var(--text)', lineHeight: 1.45 }}>
                {currentDojo.history}
              </p>
              <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.04)', borderLeft: `3px solid ${currentDojo.accent}` }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{currentDojo.philosophy}"
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* DISCIPLINE DETAIL & SELECTION MODAL                          */}
      {/* ============================================================ */}
      {selectedArtDetail && (
        <div className="picker-modal-overlay" onClick={() => setSelectedArtDetail(null)}>
          <div className="picker-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '88vh' }}>
            <div className="picker-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '28px' }}>{selectedArtDetail.flag}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                    {selectedArtDetail.nativeName} ({selectedArtDetail.artId.toUpperCase()})
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedArtDetail.country}</span>
                </div>
              </div>
              <button
                type="button"
                className="search-clear"
                style={{ width: 28, height: 28 }}
                onClick={() => setSelectedArtDetail(null)}
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </div>

            <div className="sheet-scroll form" style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: selectedArtDetail.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Tagline
                </span>
                <p style={{ margin: '2px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                  {selectedArtDetail.tagline}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  History & Lineage
                </span>
                <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {selectedArtDetail.history}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Key Biomechanical Demands
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {selectedArtDetail.mobilityFocus.map((focus) => (
                    <span
                      key={focus}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        fontSize: '12px',
                        color: 'var(--text)',
                      }}
                    >
                      {focus}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    background: selectedArtDetail.accent,
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: `0 8px 24px color-mix(in srgb, ${selectedArtDetail.accent} 40%, transparent)`,
                  }}
                  onClick={() => handleSelectDiscipline(selectedArtDetail.artId)}
                >
                  Set as Active Dojo Discipline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}
