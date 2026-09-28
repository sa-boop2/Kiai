import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { DifficultyBadge, EmptyState, PrimaryButton, SymbolTile } from '../../components/ui'
import { MARTIAL_ARTS } from '../../data/content'
import {
  dojoRoutineToKata,
  getDojoBenchmarkLevel,
  getDojoProfile,
  setDojoBenchmarkLevel,
  type DojoRoutineGoal,
} from '../../data/martialDojoData'
import { tintColor } from '../../data/meta'
import { saveKata, updateProfile } from '../../lib/actions'
import { minutes } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { startKata, startDojoDrill } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { useProfile, useUserKatas } from '../../lib/store'
import { toast } from '../../components/Toast'

export function MartialArtsScreen() {
  const { t } = useI18n()
  const profile = useProfile()
  const userKatas = useUserKatas()
  const [browseMode, setBrowseMode] = useState(!profile.primaryArt)

  useEffect(() => {
    if (profile.primaryArt) {
      setBrowseMode(false)
      setExpandedArtId(profile.primaryArt)
    }
  }, [profile.primaryArt])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string | null>(null)
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null)
  const [expandedArtId, setExpandedArtId] = useState<string | null>(profile.primaryArt || null)
  const [openSections, setOpenSections] = useState({
    milestone: false,
    routines: false,
    custom: false,
    drills: false,
  })
  const [, setRefreshKey] = useState(0)

  // Current primary art profile (fallback to karate if not chosen)
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

  // Active benchmark in the milestone widget
  const activeBenchmark = useMemo(() => {
    const list = currentDojo.benchmarks
    if (selectedBenchmarkId) {
      const found = list.find((b) => b.id === selectedBenchmarkId)
      if (found) return found
    }
    return list[0]
  }, [currentDojo, selectedBenchmarkId])

  const currentLevel = activeBenchmark ? getDojoBenchmarkLevel(activeBenchmark.id, 2) : 1

  const handleAdvanceLevel = (benchmarkId: string) => {
    haptic('success')
    const next = Math.min(5, currentLevel + 1)
    setDojoBenchmarkLevel(benchmarkId, next)
    setRefreshKey((k) => k + 1)
    toast(`Level Up! Reached Level ${next} in ${activeBenchmark.name}`, { icon: 'crown.fill' })
  }

  const handleResetLevel = (benchmarkId: string) => {
    haptic('medium')
    setDojoBenchmarkLevel(benchmarkId, 1)
    setRefreshKey((k) => k + 1)
    toast(`Reset progress for ${activeBenchmark.name}`, { icon: 'arrow.counterclockwise' })
  }

  const handleActivateArt = (artId: string, artName: string) => {
    haptic('success')
    updateProfile({ primaryArt: artId })
    setBrowseMode(false)
    setExpandedArtId(artId)
    toast(`${artName} is now your active Dojo!`, { icon: 'crown.fill' })
  }

  const handlePlayRoutine = (goal: DojoRoutineGoal) => {
    haptic('success')
    const kata = dojoRoutineToKata(goal, currentDojo.name, currentDojo.artId)
    startKata(kata)
  }

  const handlePlayDrill = (drill: any) => {
    haptic('success')
    startDojoDrill(drill, currentDojo.name, currentDojo.artId)
  }

  const handleCloneRoutine = (goal: DojoRoutineGoal) => {
    haptic('medium')
    const kata = dojoRoutineToKata(goal, currentDojo.name, currentDojo.artId)
    const newId = saveKata({
      name: kata.name,
      subtitle: kata.subtitle,
      symbol: kata.symbol,
      tint: kata.tint,
      art: kata.art,
      restSeconds: kata.restSeconds,
      items: kata.items,
    })
    toast(`Saved "${goal.title}" to your Katas!`, { icon: 'checkmark.circle.fill' })
    nav.push({ name: 'kata', id: newId })
  }

  // Find user's own katas created for this art
  const userArtKatas = useMemo(() => {
    return userKatas.filter(
      (k) => k.art === activeArtId || k.name.toLowerCase().includes(currentDojo.name.toLowerCase())
    )
  }, [userKatas, activeArtId, currentDojo.name])

  return (
    <Screen
      title={browseMode ? t('Martial Arts') : `${currentDojo.flag} ${currentDojo.name}`}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: currentDojo.accent,
                      background: `color-mix(in srgb, ${currentDojo.accent} 14%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${currentDojo.accent} 28%, transparent)`,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentDojo.nativeName}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentDojo.country}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  className="glass pressable"
                  style={{
                    padding: '5px 11px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => {
                    haptic('selection')
                    nav.push({ name: 'art', id: activeArtId })
                  }}
                >
                  <Icon name="sparkles" size={11} /> Explore
                </button>
                <button
                  type="button"
                  className="glass pressable"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: 'var(--text)',
                    border: '1px solid var(--stroke)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                  onClick={() => {
                    haptic('selection')
                    setBrowseMode(true)
                  }}
                >
                  Switch ▾
                </button>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div className="list-stack" style={{ paddingBottom: '36px' }}>
        
        {/* ============================================================ */}
        {/* MODE A: BROWSE ALL DISCIPLINES (FULL-SCREEN ENTRY GRID) */}
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
              Tap a card to reveal details, then choose Explore or Set Dojo.
            </p>

            {filteredArts.length === 0 ? (
              <EmptyState
                icon={<Icon name="figure.martial.arts" size={48} />}
                title={t('No disciplines found')}
                description={t('Try adjusting your search query.')}
              />
            ) : (
              <div className="art-browse-grid">
                {filteredArts.map((art) => {
                  const artProfile = getDojoProfile(art.id)
                  const isActive = profile.primaryArt === art.id
                  const isExpanded = expandedArtId === art.id
                  return (
                    <div
                      key={art.id}
                      className={`art-grid-card art-theme-${art.id} ${isActive ? 'active-dojo' : ''}`}
                    >
                      <span className="art-watermark" aria-hidden="true">
                        {artProfile.nativeName}
                      </span>

                      <button
                        type="button"
                        className="art-card-trigger pressable"
                        aria-expanded={isExpanded}
                        onClick={() => {
                          haptic('selection')
                          setExpandedArtId(isExpanded ? null : art.id)
                        }}
                      >
                        <div className="art-card-top" style={{ position: 'relative', zIndex: 2 }}>
                          <div className="art-pill-flag">
                            <span style={{ fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>{artProfile.flag}</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85 }}>
                              {artProfile.country}
                            </span>
                          </div>
                          {isActive ? (
                            <span className="art-active-badge">
                              <Icon name="crown.fill" size={7} />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="art-inactive-badge">INACTIVE</span>
                          )}
                        </div>
                        <div className="art-card-body" style={{ position: 'relative', zIndex: 2 }}>
                          <strong className="art-card-title">{art.name}</strong>
                        </div>
                        <div className="art-card-footer" style={{ position: 'relative', zIndex: 2 }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </span>
                          <Icon name={isExpanded ? 'chevron.up' : 'chevron.down'} size={12} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="art-card-details">
                          <p>{artProfile.tagline}</p>
                          <div className="art-focus-chips">
                            {(artProfile.mobilityFocus || art.focusAreas).slice(0, 2).map((focus, i) => (
                              <span
                                key={i}
                                className="art-chip"
                                style={{
                                  background: `color-mix(in srgb, ${artProfile.accent} 18%, transparent)`,
                                  color: artProfile.accent,
                                  border: `0.5px solid color-mix(in srgb, ${artProfile.accent} 30%, transparent)`,
                                }}
                              >
                                {focus}
                              </span>
                            ))}
                          </div>
                          <div className="art-card-actions">
                            <button
                              type="button"
                              className="art-card-action art-card-action-secondary"
                              onClick={() => {
                                haptic('selection')
                                nav.push({ name: 'art', id: art.id })
                              }}
                            >
                              Explore
                            </button>
                            {isActive ? (
                              <span className="art-card-active-state">
                                <Icon name="checkmark.circle.fill" size={11} />
                                Your Dojo
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="art-card-action art-card-action-primary"
                                onClick={() => handleActivateArt(art.id, art.name)}
                              >
                                Set Dojo
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* ============================================================ */
          /* MODE B: ACTIVE DOJO HUB (DYNAMIC SYSTEM)                     */
          /* ============================================================ */
          <>
            {/* 1. FLEXIBILITY MILESTONE WIDGET */}
            <details
              className="dojo-disclosure"
              open={openSections.milestone}
              onToggle={(event) => {
                const nextOpen = (event.currentTarget as HTMLDetailsElement).open
                setOpenSections((prev) => ({ ...prev, milestone: nextOpen }))
              }}
            >
              <summary className="dojo-disclosure-summary">
                <span>
                  Milestone Engine
                  <small>{activeBenchmark.name} · Level {currentLevel} of 5</small>
                </span>
                <Icon name={openSections.milestone ? 'chevron.up' : 'chevron.down'} size={12} />
              </summary>
              <div className="dojo-hub-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: currentDojo.accent }}>
                    Milestone Engine
                  </span>
                  <h3 style={{ margin: '1px 0 0', fontSize: '16px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeBenchmark.name}
                  </h3>
                </div>
                
                {/* Level badge */}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: currentDojo.accent,
                    background: `color-mix(in srgb, ${currentDojo.accent} 14%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${currentDojo.accent} 28%, transparent)`,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Level {currentLevel} of 5
                </span>
              </div>

              {/* Responsive 5-Segment Milestone Grid */}
              <div className="dojo-milestone-grid">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const done = lvl <= currentLevel
                  return (
                    <div
                      key={lvl}
                      className={`dojo-milestone-segment ${done ? 'active' : 'inactive'}`}
                      style={{
                        background: done ? currentDojo.accent : undefined,
                        color: done ? '#000' : undefined,
                        boxShadow: done ? `0 0 10px ${currentDojo.accent}` : undefined,
                      }}
                    >
                      {lvl}
                    </div>
                  )
                })}
              </div>

              {/* Benchmark Switcher Tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                {currentDojo.benchmarks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="pressable"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      background: activeBenchmark.id === b.id ? 'color-mix(in srgb, var(--text) 12%, transparent)' : 'color-mix(in srgb, var(--text) 4%, transparent)',
                      border: activeBenchmark.id === b.id ? '1px solid color-mix(in srgb, var(--text) 22%, transparent)' : '1px solid var(--separator)',
                      color: activeBenchmark.id === b.id ? 'var(--text)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      haptic('selection')
                      setSelectedBenchmarkId(b.id)
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>

              {/* Current Level Status Box */}
              <div
                style={{
                  background: 'color-mix(in srgb, var(--text) 4%, transparent)',
                  borderRadius: '14px',
                  padding: '10px 12px',
                  border: '1px solid var(--separator)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Milestone Target
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: currentDojo.accent }}>
                    {Math.round((currentLevel / 5) * 100)}% Complete
                  </span>
                </div>
                <strong style={{ fontSize: '13.5px', color: 'var(--text)', display: 'block', marginBottom: '2px' }}>
                  {activeBenchmark.levels[currentLevel - 1]?.title}
                </strong>
                <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {activeBenchmark.levels[currentLevel - 1]?.target}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <PrimaryButton
                    icon="crown.fill"
                    disabled={currentLevel >= 5}
                    onClick={() => handleAdvanceLevel(activeBenchmark.id)}
                  >
                    {currentLevel >= 5 ? 'Mastery Reached' : `Advance to Level ${currentLevel + 1}`}
                  </PrimaryButton>
                </div>
                {currentLevel > 1 && (
                  <button
                    type="button"
                    className="pressable"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '14px',
                      background: 'color-mix(in srgb, var(--text) 5%, transparent)',
                      border: '1px solid var(--separator)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title="Reset progress to Level 1"
                    onClick={() => handleResetLevel(activeBenchmark.id)}
                  >
                    Reset
                  </button>
                )}
              </div>
              </div>
            </details>

            {/* 2. SCIENCE-BASED ROUTINES PER GOAL */}
            <details
              className="dojo-disclosure"
              open={openSections.routines}
              onToggle={(event) => {
                const nextOpen = (event.currentTarget as HTMLDetailsElement).open
                setOpenSections((prev) => ({ ...prev, routines: nextOpen }))
              }}
            >
              <summary className="dojo-disclosure-summary">
                <span>
                  Dojo Mobility Routines
                  <small>{currentDojo.routineGoals.length} routines</small>
                </span>
                <Icon name={openSections.routines ? 'chevron.up' : 'chevron.down'} size={12} />
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Dojo Mobility Routines</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Science-based stretching protocols built specifically for {currentDojo.name}.
                  </p>
                </div>
              </div>

              {currentDojo.routineGoals.map((goal) => {
                const expanded = expandedRoutineId === goal.id
                return (
                  <div
                    key={goal.id}
                    className="dojo-sub-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <SymbolTile icon={goal.symbol} tint={goal.accent} size={42} />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {goal.title}
                          </strong>
                          <span style={{ fontSize: '12px', color: goal.accent, fontWeight: 600 }}>
                            {goal.subtitle}
                          </span>
                        </div>
                      </div>
                      <DifficultyBadge difficulty={goal.difficulty} pill />
                    </div>

                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      {goal.description}
                    </p>

                    <div
                      style={{
                        background: 'color-mix(in srgb, var(--text) 3%, transparent)',
                        border: '1px solid var(--separator)',
                        borderRadius: '10px',
                        padding: '6px 8px',
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.3,
                        display: 'flex',
                        gap: '6px',
                      }}
                    >
                      <Icon name="sparkles" size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '1px' }} />
                      <span>{goal.scienceRationale}</span>
                    </div>

                    {/* Exercise list toggle */}
                    <button
                      type="button"
                      className="pressable"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '2px 0',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        haptic('light')
                        setExpandedRoutineId(expanded ? null : goal.id)
                      }}
                    >
                      <span>
                        {goal.exercises.length} exercises · {minutes(goal.duration)} total
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
                        {expanded ? 'Hide drills' : 'View drills'}
                        <Icon name={expanded ? 'chevron.up' : 'chevron.down'} size={12} />
                      </span>
                    </button>

                    {expanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {goal.exercises.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 10px',
                              borderRadius: '10px',
                              background: 'color-mix(in srgb, var(--text) 3%, transparent)',
                              fontSize: '12px',
                            }}
                          >
                            <span style={{ color: 'var(--text)' }}>
                              {idx + 1}. {item.slug.replace(/-/g, ' ')}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {item.pnf && (
                                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--ember)', background: 'color-mix(in srgb, var(--ember) 16%, transparent)', padding: '1px 4px', borderRadius: '4px' }}>
                                  PNF
                                </span>
                              )}
                              <span style={{ color: 'var(--text-secondary)' }}>{item.duration}s</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        type="button"
                        className="pressable"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 14px',
                          borderRadius: '12px',
                          background: currentDojo.accent,
                          color: '#000',
                          fontSize: '13px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: `0 4px 12px color-mix(in srgb, ${currentDojo.accent} 30%, transparent)`,
                        }}
                        onClick={() => handlePlayRoutine(goal)}
                      >
                        <Icon name="play.fill" size={11} />
                        Play · {minutes(goal.duration)}
                      </button>
                      <button
                        type="button"
                        className="pressable"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '9px 12px',
                          borderRadius: '12px',
                          background: 'color-mix(in srgb, var(--text) 7%, transparent)',
                          border: '1px solid var(--separator)',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Clone to My Katas"
                        onClick={() => handleCloneRoutine(goal)}
                      >
                        <Icon name="plus" size={13} strokeWidth={2.4} />
                        Save
                      </button>
                    </div>
                  </div>
                )
              })}
              </div>
            </details>

            {/* 3. CREATE YOUR OWN [ART] KATA & USER'S ART KATAS */}
            <details
              className="dojo-disclosure"
              open={openSections.custom}
              onToggle={(event) => {
                const nextOpen = (event.currentTarget as HTMLDetailsElement).open
                setOpenSections((prev) => ({ ...prev, custom: nextOpen }))
              }}
            >
              <summary className="dojo-disclosure-summary">
                <span>
                  Custom {currentDojo.name} Katas
                  <small>{userArtKatas.length} saved</small>
                </span>
                <Icon name={openSections.custom ? 'chevron.up' : 'chevron.down'} size={12} />
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  Custom {currentDojo.name} Katas
                </h3>
                <span className="library-count-badge">
                  {userArtKatas.length} saved
                </span>
              </div>

              {/* Create Custom Kata Pill Button */}
              <button
                type="button"
                className="pressable"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: 'color-mix(in srgb, var(--accent) 8%, var(--surface))',
                  border: '1px dashed color-mix(in srgb, var(--accent) 45%, transparent)',
                  color: 'var(--accent)',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(16px)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  haptic('selection')
                  nav.present({ name: 'editor', mode: { kind: 'create' } })
                }}
              >
                <Icon name="plus" size={16} strokeWidth={2.4} />
                <span>Create Custom {currentDojo.name} Routine</span>
              </button>

              {userArtKatas.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {userArtKatas.map((kata) => (
                    <div
                      key={kata.uuid}
                      className="dojo-sub-card"
                      style={{
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={38} />
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: '14px', color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {kata.name}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {kata.items.length} exercises · {kata.subtitle}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="pressable"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '10px',
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            haptic('success')
                            startKata(kata)
                          }}
                        >
                          Play
                        </button>
                        <button
                          type="button"
                          className="pressable"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '10px',
                            background: 'color-mix(in srgb, var(--text) 8%, transparent)',
                            color: 'var(--text)',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            haptic('selection')
                            nav.push({ name: 'kata', id: kata.uuid })
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </details>

            {/* 4. TECHNICAL MOBILITY DRILLS (PLAYABLE & STARTABLE) */}
            <details
              className="dojo-disclosure"
              open={openSections.drills}
              onToggle={(event) => {
                const nextOpen = (event.currentTarget as HTMLDetailsElement).open
                setOpenSections((prev) => ({ ...prev, drills: nextOpen }))
              }}
            >
              <summary className="dojo-disclosure-summary">
                <span>
                  Technical Movement Drills
                  <small>{currentDojo.drills.length} drills</small>
                </span>
                <Icon name={openSections.drills ? 'chevron.up' : 'chevron.down'} size={12} />
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '0 4px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Technical Movement Drills</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Biomechanically tailored drills for {currentDojo.name}. Start any drill with one tap.
                </p>
              </div>

              {currentDojo.drills.map((drill, idx) => (
                <div
                  key={idx}
                  className="dojo-sub-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <SymbolTile icon={drill.symbol} tint="var(--gold)" size={36} />
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: '14px', color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {drill.name}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>
                          {drill.focus}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>
                      <Icon name="timer" size={12} /> {drill.duration}s
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                    {drill.instructions.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px',
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.35,
                        }}
                      >
                        <span style={{ width: '16px', color: 'var(--text-tertiary)', fontWeight: 700, flexShrink: 0 }}>
                          {sIdx + 1}.
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Playable Drill Button — compact inline */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="pressable"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '7px 14px',
                        borderRadius: '12px',
                        background: currentDojo.accent,
                        color: '#000',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: `0 4px 12px color-mix(in srgb, ${currentDojo.accent} 35%, transparent)`,
                      }}
                      onClick={() => handlePlayDrill(drill)}
                    >
                      <Icon name="play.fill" size={10} />
                      Start · {drill.duration}s
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </details>
          </>
        )}

      </div>
    </Screen>
  )
}
