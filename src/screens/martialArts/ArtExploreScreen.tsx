import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { DifficultyBadge, PrimaryButton, SymbolTile } from '../../components/ui'
import { dojoRoutineToKata, getDojoProfile, type DojoRoutineGoal, type MartialDojoProfile } from '../../data/martialDojoData'
import { saveKata, updateProfile } from '../../lib/actions'
import { minutes } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { startKata } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { useAllExercises, useProfile } from '../../lib/store'
import { toast } from '../../components/Toast'

export function ArtExploreScreen({ artId }: { artId: string }) {
  const { t } = useI18n()
  const profile = useProfile()
  const allExercises = useAllExercises()
  const dojo: MartialDojoProfile = useMemo(() => getDojoProfile(artId), [artId])
  const [activeSection, setActiveSection] = useState<'routines' | 'science' | 'benchmarks' | 'drills'>('routines')
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null)

  const isCurrentActive = profile.primaryArt === dojo.artId

  const handleSelectAsPrimary = () => {
    haptic('success')
    updateProfile({ primaryArt: dojo.artId })
    toast(`${dojo.name} set as your active Dojo!`, { icon: 'crown.fill' })
  }

  const handlePlayRoutine = (goal: DojoRoutineGoal) => {
    haptic('success')
    const kata = dojoRoutineToKata(goal, dojo.name, dojo.artId)
    startKata(kata)
  }

  const handleCloneRoutine = (goal: DojoRoutineGoal) => {
    haptic('medium')
    const kata = dojoRoutineToKata(goal, dojo.name, dojo.artId)
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

  return (
    <Screen title={dojo.name} back largeTitle={false}>
      <div style={{ padding: '0 16px 40px', maxWidth: '640px', margin: '0 auto' }}>
        
        {/* ============================================================ */}
        {/* HERO BANNER: iOS 26 Liquid Glass Display */}
        {/* ============================================================ */}
        <div
          style={{
            position: 'relative',
            borderRadius: '26px',
            padding: '24px 20px',
            margin: '8px 0 16px',
            background: 'linear-gradient(150deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Ambient art glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: dojo.accent,
              opacity: 0.18,
              filter: 'blur(45px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '42px', lineHeight: 1 }}>{dojo.flag}</span>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.04em', display: 'block' }}>
                  {dojo.nativeName}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {dojo.country}
                </span>
              </div>
            </div>

            {isCurrentActive ? (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--jade)',
                  background: 'color-mix(in srgb, var(--jade) 16%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--jade) 30%, transparent)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Icon name="crown.fill" size={12} /> Active Dojo
              </span>
            ) : (
              <button
                type="button"
                className="pressable"
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                }}
                onClick={handleSelectAsPrimary}
              >
                Set as Active
              </button>
            )}
          </div>

          <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {dojo.name}
          </h1>

          <p style={{ margin: '0 0 14px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {dojo.tagline}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {dojo.mobilityFocus.map((focus, i) => (
              <span
                key={i}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: 'var(--text)',
                }}
              >
                {focus}
              </span>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* NAVIGATION SEGMENTED CONTROLS */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            padding: '4px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '16px',
          }}
        >
          {[
            { id: 'routines', label: t('Routines'), icon: 'figure.martial.arts' },
            { id: 'science', label: t('Science'), icon: 'sparkles' },
            { id: 'benchmarks', label: t('Benchmarks'), icon: 'crown.fill' },
            { id: 'drills', label: t('Drills'), icon: 'timer' },
          ].map((item) => {
            const active = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                className="pressable"
                style={{
                  padding: '8px 4px',
                  borderRadius: '12px',
                  border: active ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid transparent',
                  background: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-tertiary)',
                  fontSize: '12px',
                  fontWeight: active ? 700 : 500,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  transition: 'all 180ms ease',
                }}
                onClick={() => {
                  haptic('selection')
                  setActiveSection(item.id as any)
                }}
              >
                <Icon name={item.icon} size={15} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: ROUTINES (SCIENCE-BASED PROTOCOLS) */}
        {/* ============================================================ */}
        {activeSection === 'routines' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Goal-Specific Routines</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Tailored anatomical stretching protocols built for {dojo.name} fighters.
                </p>
              </div>
            </div>

            {dojo.routineGoals.map((goal) => {
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
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <SymbolTile icon={goal.symbol} tint={goal.accent} size={44} />
                      <div>
                        <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', display: 'block' }}>
                          {goal.title}
                        </strong>
                        <span style={{ fontSize: '12px', color: goal.accent, fontWeight: 600 }}>
                          {goal.subtitle}
                        </span>
                      </div>
                    </div>
                    <DifficultyBadge difficulty={goal.difficulty} pill />
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {goal.description}
                  </p>

                  {/* Scientific Rationale Badge */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '12px',
                      padding: '8px 10px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.35,
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Icon name="sparkles" size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '1px' }} />
                    <span>
                      <strong style={{ color: 'var(--text)' }}>Sports Science: </strong>
                      {goal.scienceRationale}
                    </span>
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
                      padding: '4px 0',
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

                  {/* Expanded exercises breakdown */}
                  {expanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                      {goal.exercises.map((item, idx) => {
                        const ex = allExercises.find((e) => e.slug === item.slug)
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '12px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              fontSize: '13px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', width: '16px' }}>
                                {idx + 1}.
                              </span>
                              <div>
                                <span style={{ fontWeight: 600, color: 'var(--text)', display: 'block' }}>
                                  {ex?.name || item.slug}
                                </span>
                                {item.note && (
                                  <span style={{ fontSize: '11px', color: 'var(--gold)', display: 'block' }}>
                                    {item.note}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {item.pnf && (
                                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ember)', background: 'color-mix(in srgb, var(--ember) 16%, transparent)', padding: '2px 5px', borderRadius: '4px' }}>
                                  PNF
                                </span>
                              )}
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {item.duration}s
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Actions: Start Routine and Save to Katas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', marginTop: '4px' }}>
                    <PrimaryButton
                      icon="play.fill"
                      onClick={() => handlePlayRoutine(goal)}
                    >
                      Start Routine ({minutes(goal.duration)})
                    </PrimaryButton>
                    <button
                      type="button"
                      className="pressable"
                      style={{
                        padding: '0 16px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: 'var(--text)',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                      title="Save and customize in My Katas"
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
        )}

        {/* ============================================================ */}
        {/* SECTION 2: SCIENCE & PHILOSOPHY */}
        {/* ============================================================ */}
        {activeSection === 'science' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                borderRadius: '22px',
                padding: '18px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon name="sparkles" size={18} style={{ color: 'var(--gold)' }} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Biomechanical Demands</h3>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {dojo.biomechanics}
              </p>
            </div>

            <div
              style={{
                borderRadius: '22px',
                padding: '18px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon name="books.vertical.fill" size={18} style={{ color: 'var(--accent)' }} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Origins & History</h3>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {dojo.history}
              </p>
            </div>

            <div
              style={{
                borderRadius: '22px',
                padding: '18px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Icon name="heart.fill" size={18} style={{ color: 'var(--crimson, #ef4444)' }} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Guiding Philosophy</h3>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {dojo.philosophy}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 3: BENCHMARKS & MILESTONES */}
        {/* ============================================================ */}
        {activeSection === 'benchmarks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '0 4px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Flexibility Benchmarks</h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Track your mobility milestones across 5 science-based levels for {dojo.name}.
              </p>
            </div>

            {dojo.benchmarks.map((benchmark) => (
              <div
                key={benchmark.id}
                style={{
                  borderRadius: '22px',
                  padding: '16px',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div>
                  <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', display: 'block' }}>
                    {benchmark.name}
                  </strong>
                  <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {benchmark.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {benchmark.levels.map((lvl) => (
                    <div
                      key={lvl.level}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '8px',
                          background: 'color-mix(in srgb, var(--accent) 18%, transparent)',
                          color: 'var(--accent)',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        L{lvl.level}
                      </span>
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--text)', display: 'block' }}>
                          {lvl.title}
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                          {lvl.target}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 4: TECHNICAL MOBILITY DRILLS */}
        {/* ============================================================ */}
        {activeSection === 'drills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '0 4px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Technical Movement Drills</h3>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Biomechanically isolated movement drills to enhance stance and strike performance.
              </p>
            </div>

            {dojo.drills.map((drill, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: '22px',
                  padding: '16px',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SymbolTile icon={drill.symbol} tint="var(--gold)" size={40} />
                    <div>
                      <strong style={{ fontSize: '15px', color: 'var(--text)', display: 'block' }}>
                        {drill.name}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>
                        {drill.focus}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    <Icon name="timer" size={12} /> {drill.duration}s
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {drill.instructions.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{ width: '18px', color: 'var(--text-tertiary)', fontWeight: 700, flexShrink: 0 }}>
                        {sIdx + 1}.
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </Screen>
  )
}
