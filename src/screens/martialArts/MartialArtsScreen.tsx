import { useMemo, useState } from 'react'
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
import { saveKata } from '../../lib/actions'
import { minutes } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { startKata } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { useProfile, useUserKatas } from '../../lib/store'
import { toast } from '../../components/Toast'

export function MartialArtsScreen() {
  const { t } = useI18n()
  const profile = useProfile()
  const userKatas = useUserKatas()
  const [browseMode, setBrowseMode] = useState(!profile.primaryArt)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string | null>(null)
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null)
  const [, setRefreshKey] = useState(0)

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

  const handlePlayRoutine = (goal: DojoRoutineGoal) => {
    haptic('success')
    const kata = dojoRoutineToKata(goal, currentDojo.name, currentDojo.artId)
    startKata(kata)
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="glass pressable"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
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
                  <Icon name="sparkles" size={12} /> Explore
                </button>
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
              Select any discipline to explore its sports science, routines, and benchmarks, or set it as your active Dojo.
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
                  return (
                    <div
                      key={art.id}
                      className={`art-grid-card art-theme-${art.id} pressable ${isActive ? 'active-dojo' : ''}`}
                      onClick={() => {
                        haptic('selection')
                        nav.push({ name: 'art', id: art.id })
                      }}
                    >
                      {/* Stylized native script watermark */}
                      <span className="art-watermark" aria-hidden="true">
                        {artProfile.nativeName}
                      </span>

                      <div>
                        {/* Top Flag Capsule & Active/Origin Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', position: 'relative', zIndex: 1 }}>
                          <div
                            className="art-pill-flag"
                            style={{
                              background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
                              border: '1px solid var(--separator)',
                            }}
                          >
                            <span style={{ fontSize: '15px', lineHeight: 1 }}>{artProfile.flag}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {artProfile.country}
                            </span>
                          </div>

                          {isActive ? (
                            <span
                              style={{
                                fontSize: '9.5px',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                color: artProfile.accent,
                                background: `color-mix(in srgb, ${artProfile.accent} 16%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${artProfile.accent} 35%, transparent)`,
                                padding: '2px 6px',
                                borderRadius: '999px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Icon name="crown.fill" size={9} /> DOJO
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: 'var(--text-tertiary)',
                                letterSpacing: '0.02em',
                              }}
                            >
                              {artProfile.nativeName}
                            </span>
                          )}
                        </div>

                        {/* Title and Tagline */}
                        <div style={{ marginTop: '10px', position: 'relative', zIndex: 1 }}>
                          <strong
                            style={{
                              fontSize: '15.5px',
                              fontWeight: 800,
                              color: 'var(--text)',
                              display: 'block',
                              lineHeight: 1.2,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {art.name}
                          </strong>
                          <p
                            style={{
                              margin: '3px 0 0',
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.35,
                            }}
                          >
                            {artProfile.tagline}
                          </p>
                        </div>

                        {/* Focus Chips */}
                        <div className="art-focus-chips" style={{ position: 'relative', zIndex: 1 }}>
                          {(artProfile.mobilityFocus || art.focusAreas).slice(0, 2).map((focus, i) => (
                            <span
                              key={i}
                              className="art-chip"
                              style={{
                                background: `color-mix(in srgb, ${artProfile.accent} 12%, var(--surface))`,
                                color: 'var(--text)',
                                border: `0.5px solid color-mix(in srgb, ${artProfile.accent} 25%, transparent)`,
                              }}
                            >
                              {focus}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="art-card-footer" style={{ position: 'relative', zIndex: 1 }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: artProfile.accent,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          Explore <Icon name="chevron.right" size={11} strokeWidth={2.4} />
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                          {artProfile.routineGoals.length} routines
                        </span>
                      </div>
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
            <div className="dojo-hub-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: currentDojo.accent }}>
                    {currentDojo.name} Milestone Engine
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 800 }}>
                    {activeBenchmark.name}
                  </h3>
                </div>
                
                {/* 5-Level Progress Rings */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const done = lvl <= currentLevel
                    return (
                      <div
                        key={lvl}
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: done ? currentDojo.accent : 'rgba(255, 255, 255, 0.08)',
                          border: done ? `1px solid ${currentDojo.accent}` : '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: done ? '#000' : 'var(--text-tertiary)',
                          boxShadow: done ? `0 0 8px ${currentDojo.accent}` : 'none',
                          transition: 'all 240ms ease',
                        }}
                      >
                        {lvl}
                      </div>
                    )
                  })}
                </div>
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
                      background: activeBenchmark.id === b.id ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      border: activeBenchmark.id === b.id ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(255, 255, 255, 0.06)',
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

              {/* Current Level Status Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Current Milestone (Level {currentLevel} of 5)
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: currentDojo.accent }}>
                    {Math.round((currentLevel / 5) * 100)}% Complete
                  </span>
                </div>
                <strong style={{ fontSize: '14px', color: 'var(--text)', display: 'block', marginBottom: '2px' }}>
                  {activeBenchmark.levels[currentLevel - 1]?.title}
                </strong>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {activeBenchmark.levels[currentLevel - 1]?.target}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <PrimaryButton
                  icon="crown.fill"
                  disabled={currentLevel >= 5}
                  onClick={() => handleAdvanceLevel(activeBenchmark.id)}
                >
                  {currentLevel >= 5 ? 'Mastery Reached' : `Advance to Level ${currentLevel + 1}`}
                </PrimaryButton>
                {currentLevel > 1 && (
                  <button
                    type="button"
                    className="pressable"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      color: 'var(--text-tertiary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Reset progress to Level 1"
                    onClick={() => handleResetLevel(activeBenchmark.id)}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* 2. SCIENCE-BASED ROUTINES PER GOAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
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
                    style={{
                      borderRadius: '22px',
                      padding: '16px',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02))',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SymbolTile icon={goal.symbol} tint={goal.accent} size={42} />
                        <div>
                          <strong style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', display: 'block' }}>
                            {goal.title}
                          </strong>
                          <span style={{ fontSize: '12px', color: goal.accent, fontWeight: 600 }}>
                            {goal.subtitle}
                          </span>
                        </div>
                      </div>
                      <DifficultyBadge difficulty={goal.difficulty} pill />
                    </div>

                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                      {goal.description}
                    </p>

                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
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
                              background: 'rgba(255, 255, 255, 0.03)',
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '2px' }}>
                      <PrimaryButton
                        icon="play.fill"
                        onClick={() => handlePlayRoutine(goal)}
                      >
                        Play ({minutes(goal.duration)})
                      </PrimaryButton>
                      <button
                        type="button"
                        className="pressable"
                        style={{
                          padding: '0 14px',
                          borderRadius: '14px',
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'var(--text)',
                          fontSize: '13px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                        title="Clone to My Katas"
                        onClick={() => handleCloneRoutine(goal)}
                      >
                        <Icon name="plus" size={15} strokeWidth={2.4} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 3. CREATE YOUR OWN [ART] KATA & USER'S ART KATAS */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                      style={{
                        padding: '12px 14px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={38} />
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--text)', display: 'block' }}>
                            {kata.name}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {kata.items.length} exercises · {kata.subtitle}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
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
                            background: 'rgba(255, 255, 255, 0.08)',
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

            {/* 4. TECHNICAL MOBILITY DRILLS */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '0 4px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Technical Movement Drills</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Biomechanically tailored movement drills for {currentDojo.name}.
                </p>
              </div>

              {currentDojo.drills.map((drill, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: '20px',
                    padding: '14px 16px',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SymbolTile icon={drill.symbol} tint="var(--gold)" size={36} />
                      <div>
                        <strong style={{ fontSize: '14px', color: 'var(--text)', display: 'block' }}>
                          {drill.name}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>
                          {drill.focus}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
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
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </Screen>
  )
}
