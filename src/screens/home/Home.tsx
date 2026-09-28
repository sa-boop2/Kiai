import { type CSSProperties, useMemo } from 'react'
import { Icon } from '../../components/Icon'
import { NavIconButton, Screen } from '../../components/Screen'
import { Card, EmberBadge, EmptyState, KiaiLogo, KiaiMark, PrimaryButton, StatTile, SymbolTile } from '../../components/ui'
import { estimatedSeconds, orderedItems } from '../../data/content'
import { tintColor } from '../../data/meta'
import { minutes, relativeDay } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { quickStart, quickStartLabel, resolveQuickStart } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { makeSnapshot } from '../../lib/progression'
import { getState, useProfile, useSessions, useSettings, useUserKatas } from '../../lib/store'

import { reorderKatas, sortUserKatas } from '../../lib/actions'
import { useState } from 'react'
import { confirmAction } from '../../components/ActionSheet'

export function HomeScreen() {
  const katas = useUserKatas()
  const settings = useSettings()
  const profile = useProfile()
  const sessions = useSessions()
  const { t, locale } = useI18n()

  const [reordering, setReordering] = useState(false)

  const snapshot = useMemo(() => makeSnapshot(sessions, profile.createdAt), [sessions, profile.createdAt])
  const quick = useMemo(() => quickStartLabel(getState()), [sessions, katas])
  const target = useMemo(() => resolveQuickStart(getState()), [sessions, katas])

  const displayKatas = katas
  // Guards against a stray "still reordering" state if the list ever drops to one kata.
  const isReordering = reordering && displayKatas.length > 1

  const moveKata = (from: number, to: number) => {
    if (to < 0 || to >= katas.length || from === to) return
    haptic('selection')
    reorderKatas(from, to)
  }

  // Extract rich metadata from the quick-start target
  const heroMeta = useMemo(() => {
    if (!target) return null
    if (target.kind === 'kata') {
      const kata = target.kata
      const ordered = orderedItems(kata.items)
      const hasWarmup = ordered.some(i => i.phase === 'warmup')
      const hasCooldown = ordered.some(i => i.phase === 'cooldown')
      const mainCount = ordered.filter(i => i.phase === 'main').length
      const phases = [
        hasWarmup ? 'Warm-up' : null,
        mainCount > 0 ? `${mainCount} exercises` : null,
        hasCooldown ? 'Cool-down' : null,
      ].filter(Boolean).join(' · ')
      const duration = estimatedSeconds(kata, settings.restSeconds)
      return {
        phases,
        duration,
        exerciseCount: kata.items.length,
        lastPerformedAt: kata.lastPerformedAt,
        restLabel: `${kata.restSeconds ?? settings.restSeconds}s rest`,
      }
    }
    return null
  }, [target, settings.restSeconds])

  return (
    <Screen
      title={t("Home")}
      hideNavBar
      contentClassName="home"
    >
      {/* Header */}
      <div className="home-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <KiaiLogo size={38} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="glass streak-pill pressable"
            aria-label={`Streak: ${snapshot.currentStreak} days. Show quick stats`}
            onClick={() => {
              haptic('light')
              nav.present({ name: 'quickStats' })
            }}
          >
            <EmberBadge lit={snapshot.trainedToday} size={18} />
            <span style={{ fontWeight: 600 }}>{snapshot.currentStreak}</span>
          </button>
          <NavIconButton icon="gearshape.fill" label="Settings" onClick={() => nav.push({ name: 'settings' })} />
        </div>
      </div>

      {/* Hero "Repeat Last Workout" Card */}
      <div className="home-hero-wrap">
        <button
          type="button"
          className="home-hero pressable"
          onClick={quickStart}
          aria-label={`Start workout: ${quick.title}`}
        >
          {/* Background decoration */}
          <span className="home-hero-decoration" aria-hidden="true">
            <Icon name="flame.fill" size={100} />
          </span>

          {/* Top row: eyebrow */}
          <div className="home-hero-top">
            <span className="home-hero-eyebrow">
              <Icon name={quick.isRepeat ? 'arrow.clockwise' : 'sparkles'} size={12} strokeWidth={2.4} />
              {t(quick.isRepeat ? 'Repeat last workout' : 'Recommended')}
            </span>
          </div>

          {/* Title */}
          <strong className="home-hero-title">{quick.title}</strong>

          {/* Phases pill row */}
          {heroMeta?.phases && (
            <p className="home-hero-phases">{heroMeta.phases}</p>
          )}

          {/* Stats row */}
          <div className="home-hero-stats">
            {heroMeta && (
              <>
                <span className="home-hero-badge">
                  <Icon name="clock" size={12} strokeWidth={2.4} />
                  {minutes(heroMeta.duration)}
                </span>
                <span className="home-hero-badge">
                  <Icon name="list.bullet" size={12} strokeWidth={2.4} />
                  {heroMeta.exerciseCount} exercises
                </span>
                <span className="home-hero-badge">
                  <Icon name="timer" size={12} strokeWidth={2.4} />
                  {heroMeta.restLabel}
                </span>
              </>
            )}
          </div>

          {/* Play button */}
          <div className="home-hero-action">
            <span className="home-hero-play">
              <Icon name="play.fill" size={22} />
            </span>
            <span className="home-hero-action-label">{t('Start Workout')}</span>
          </div>
        </button>
      </div>

      {/* Your Kata's section */}
      <div className="home-katas-header" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 0 8px' }}>
        <h2 className="home-section-title" style={{ textAlign: 'center', width: '100%' }}>{t("Your Kata's")}</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {displayKatas.length > 1 && (
              <>
                <button
                  type="button"
                  className="reorder-toggle no-sheet-drag"
                  onClick={async () => {
                    const choice = await confirmAction({
                      title: 'Sort Katas',
                      actions: [
                        { label: 'Name (A-Z)' },
                        { label: 'Duration (Shortest first)' },
                        { label: 'Duration (Longest first)' },
                        { label: 'Last Performed (Recent first)' },
                      ],
                      cancelLabel: 'Cancel',
                    })
                    if (choice === 0) {
                      sortUserKatas((a, b) => a.name.localeCompare(b.name))
                    } else if (choice === 1) {
                      sortUserKatas((a, b) => estimatedSeconds(a, settings.restSeconds) - estimatedSeconds(b, settings.restSeconds))
                    } else if (choice === 2) {
                      sortUserKatas((a, b) => estimatedSeconds(b, settings.restSeconds) - estimatedSeconds(a, settings.restSeconds))
                    } else if (choice === 3) {
                      sortUserKatas((a, b) => (b.lastPerformedAt ?? 0) - (a.lastPerformedAt ?? 0))
                    }
                    if (choice !== null) haptic('success')
                  }}
                >
                  Sort
                </button>
                <button
                  type="button"
                  className={`reorder-toggle no-sheet-drag ${reordering ? 'active' : ''}`}
                  onClick={() => {
                    haptic('light')
                    setReordering((v) => !v)
                  }}
                >
                  {reordering ? 'Done' : 'Reorder'}
                </button>
              </>
            )}
          </div>
          <div>
            <NavIconButton icon="plus" label="Create Kata" tinted onClick={() => nav.present({ name: 'editor', mode: { kind: 'create' } })} />
          </div>
        </div>
      </div>

      <div className="home-katas-list">
        {displayKatas.length === 0 ? (
          <EmptyState
            icon={<KiaiMark size={72} />}
            title={t("No Kata's yet")}
            description="A Kata is your own routine: pick exercises, set durations and rests. Warm-up and cool-down included."
            action={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                <PrimaryButton icon="plus" full={false} onClick={() => nav.present({ name: 'editor', mode: { kind: 'create' } })}>
                  {t('Create your first Kata')}
                </PrimaryButton>
              </div>
            }
          />
        ) : (
          <div className="list-stack">
            {displayKatas.map((kata, index) => (
              <div key={kata.uuid} className="kata-row-wrap">
                <div
                  className="card kata-row pressable"
                  role="button"
                  tabIndex={isReordering ? -1 : 0}
                  aria-disabled={isReordering}
                  style={{ '--tint': tintColor(kata.tint) } as CSSProperties}
                  onClick={() => {
                    if (!isReordering) nav.push({ name: 'kata', id: kata.uuid })
                  }}
                  onKeyDown={(e) => {
                    if (isReordering) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      nav.push({ name: 'kata', id: kata.uuid })
                    }
                  }}
                >
                  {isReordering ? (
                    <div className="reorder-controls no-sheet-drag" style={{ width: '54px', height: '72px', display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="pressable"
                        style={{
                          width: '46px',
                          height: '32px',
                          borderRadius: '10px',
                          display: 'grid',
                          placeItems: 'center',
                          background: 'color-mix(in srgb, var(--accent) 14%, var(--surface-raised))',
                          border: '1px solid color-mix(in srgb, var(--accent) 26%, transparent)',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                        }}
                        aria-label={`Move ${kata.name} up`}
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveKata(index, index - 1)
                        }}
                      >
                        <Icon name="arrow.up" size={20} strokeWidth={2.8} />
                      </button>
                      <button
                        type="button"
                        className="pressable"
                        style={{
                          width: '46px',
                          height: '32px',
                          borderRadius: '10px',
                          display: 'grid',
                          placeItems: 'center',
                          background: 'color-mix(in srgb, var(--accent) 14%, var(--surface-raised))',
                          border: '1px solid color-mix(in srgb, var(--accent) 26%, transparent)',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                        }}
                        aria-label={`Move ${kata.name} down`}
                        disabled={index === displayKatas.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          moveKata(index, index + 1)
                        }}
                      >
                        <Icon name="arrow.down" size={20} strokeWidth={2.8} />
                      </button>
                    </div>
                  ) : (
                    <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={72} />
                  )}
                  <span className="kata-row-text">
                    <strong style={{ fontSize: "20px" }}>{kata.name}</strong>
                    <span className="meta-row" style={{ marginTop: "4px", fontSize: "14px" }}>
                      <span>
                        <Icon name="clock" size={13} strokeWidth={2.4} />
                        {minutes(estimatedSeconds(kata, settings.restSeconds))}
                      </span>
                      <span>
                        <Icon name="list.bullet" size={13} strokeWidth={2.4} />
                        {kata.items.length} exercises
                      </span>
                    </span>
                    {kata.lastPerformedAt && <span className="kata-row-last" style={{ fontSize: "13px" }}>Last trained {relativeDay(kata.lastPerformedAt, locale)}</span>}
                  </span>
                  {!isReordering && <Icon name="chevron.right" size={16} strokeWidth={2.6} className="kata-row-chevron" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clean Bottom Brand & Version Footer */}
      <div className="settings-footer" style={{ marginTop: '32px', paddingBottom: '20px' }}>
        <KiaiMark size={28} />
        <span>Kiai 2.7.5 · Web</span>
      </div>
    </Screen>
  )
}

export function QuickStatsSheet() {
  const profile = useProfile()
  const sessions = useSessions()
  const { t, locale } = useI18n()
  const snapshot = useMemo(() => makeSnapshot(sessions, profile.createdAt), [sessions, profile.createdAt])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const message = snapshot.trainedToday
    ? 'Trained today. The streak gods are pleased.'
    : snapshot.currentStreak > 0
      ? 'Train today to keep the fire alive.'
      : 'Every legend starts at day one.'

  return (
    <div className="sheet-scroll quick-stats">
      <div className="streak-hero">
        <EmberBadge lit={snapshot.currentStreak > 0} size={72} />
        <span className="streak-hero-number">{snapshot.currentStreak}</span>
        <span className="streak-hero-label">{t('day streak')}</span>
        <p>{message}</p>
      </div>

      <Card className="week-strip" padding={14}>
        {days.map((day) => {
          const trained = snapshot.sessionsByDay.has(day.getTime())
          const isToday = day.getTime() === today.getTime()
          return (
            <div key={day.getTime()} className={`week-day ${isToday ? 'today' : ''}`}>
              <span>{day.toLocaleDateString(locale, { weekday: 'narrow' })}</span>
              <span className={`week-dot ${trained ? 'trained' : ''}`}>{trained && <Icon name="checkmark" size={14} strokeWidth={3.2} />}</span>
            </div>
          )
        })}
      </Card>

      <div className="grid-2">
        <StatTile title={t('Longest streak')} value={String(snapshot.longestStreak)} caption="days" icon="trophy.fill" tint="var(--gold)" />
        <StatTile title={t('Sessions')} value={String(snapshot.sessionCount)} caption="all time" icon="checkmark.seal.fill" tint="var(--jade)" />
        <StatTile title={t('Time trained')} value={minutes(snapshot.totalSeconds)} caption="active time" icon="clock.fill" tint="var(--indigo)" />
        <StatTile
          title={t('Consistency')}
          value={`${Math.round(snapshot.consistency * 100)}%`}
          caption="last 28 days"
          icon="gauge.with.needle.fill"
          tint="var(--ember)"
        />
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-full"
        onClick={() => {
          nav.back()
          window.setTimeout(() => nav.setTab('analytics'), 120)
        }}
      >
        <Icon name="chart.bar.xaxis" size={18} />
        <span>{t('Open Stats')}</span>
      </button>
    </div>
  )
}
