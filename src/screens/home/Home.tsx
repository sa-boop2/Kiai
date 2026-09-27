import { useMemo } from 'react'
import { Icon } from '../../components/Icon'
import { NavIconButton, Screen } from '../../components/Screen'
import { Card, EmberBadge, EmptyState, KiaiLogo, KiaiMark, PrimaryButton, StatTile, SymbolTile } from '../../components/ui'
import { estimatedSeconds, orderedItems } from '../../data/content'
import { tintColor } from '../../data/meta'
import { displayName, minutes, relativeDay } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { quickStart, quickStartLabel, resolveQuickStart } from '../../lib/launch'
import { nav } from '../../lib/nav'
import { makeSnapshot } from '../../lib/progression'
import { getState, useProfile, useSessions, useSettings, useUserKatas } from '../../lib/store'

import { reorderKatas } from '../../lib/actions'
import { useRef, useState } from 'react'

export function HomeScreen() {
  const katas = useUserKatas()
  const settings = useSettings()
  const profile = useProfile()
  const sessions = useSessions()
  const { t, locale } = useI18n()

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const katasRef = useRef(katas)
  katasRef.current = katas

  const snapshot = useMemo(() => makeSnapshot(sessions, profile.createdAt), [sessions, profile.createdAt])
  const quick = useMemo(() => quickStartLabel(getState()), [sessions, katas])
  const target = useMemo(() => resolveQuickStart(getState()), [sessions, katas])

  const displayKatas = katas

  const startDrag = (event: React.PointerEvent, initialIndex: number) => {
    event.preventDefault()
    event.stopPropagation()
    const targetUuid = katasRef.current[initialIndex]?.uuid
    if (!targetUuid) return

    setDraggingId(targetUuid)
    haptic('medium')

    let currentIndex = initialIndex
    let lastSwap = 0

    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      if (!listRef.current) return
      const now = performance.now()
      if (now - lastSwap < 70) return

      const rows = Array.from(listRef.current.querySelectorAll<HTMLElement>('.kata-row-wrap'))
      for (let i = 0; i < rows.length; i++) {
        if (i === currentIndex) continue
        const rect = rows[i].getBoundingClientRect()
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          reorderKatas(currentIndex, i)
          currentIndex = i
          lastSwap = now
          haptic('selection')
          break
        }
      }
    }

    const onUp = () => {
      setDraggingId(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      haptic('light')
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KiaiLogo size={28} />
          <span style={{ fontWeight: 600, fontSize: '20px' }}>{displayName(profile.name)}</span>
        </div>
        <button
          type="button"
          className="glass streak-pill pressable"
          aria-label={`Streak: ${snapshot.currentStreak} days. Show quick stats`}
          onClick={() => {
            haptic('light')
            nav.present({ name: 'quickStats' })
          }}
        >
          <EmberBadge lit={snapshot.currentStreak > 0} size={18} />
          <span style={{ fontWeight: 600 }}>{snapshot.currentStreak}</span>
        </button>
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

          {/* Top row: eyebrow + last trained */}
          <div className="home-hero-top">
            <span className="home-hero-eyebrow">
              <Icon name={quick.isRepeat ? 'arrow.clockwise' : 'sparkles'} size={12} strokeWidth={2.4} />
              {t(quick.isRepeat ? 'Repeat last workout' : 'Recommended')}
            </span>
            {heroMeta?.lastPerformedAt && (
              <span className="home-hero-last">
                {relativeDay(heroMeta.lastPerformedAt, locale)}
              </span>
            )}
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
      <div className="home-katas-header">
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{t("Your Kata's")}</h2>
        <NavIconButton icon="plus" label="Create Kata" tinted onClick={() => nav.present({ name: 'editor', mode: { kind: 'create' } })} />
      </div>

      <div className="home-katas-list">
        {displayKatas.length === 0 ? (
          <EmptyState
            icon={<KiaiMark size={72} />}
            title={t("No Kata's yet")}
            description="A Kata is your own routine: pick exercises, set durations and rests. Warm-up and cool-down included."
            action={
              <PrimaryButton icon="plus" full={false} onClick={() => nav.present({ name: 'editor', mode: { kind: 'create' } })}>
                {t('Create your first Kata')}
              </PrimaryButton>
            }
          />
        ) : (
          <div className="list-stack" ref={listRef}>
            {displayKatas.map((kata, index) => {
              const isDragging = draggingId === kata.uuid
              return (
                <div key={kata.uuid} className={`kata-row-wrap ${isDragging ? 'dragging' : ''}`}>
                  <button
                    type="button"
                    className="card kata-row pressable"
                    onClick={() => nav.push({ name: 'kata', id: kata.uuid })}
                  >
                    <SymbolTile icon={kata.symbol} tint={tintColor(kata.tint)} size={54} />
                    <span className="kata-row-text">
                      <strong>{kata.name}</strong>
                      <span className="meta-row">
                        <span>
                          <Icon name="clock" size={13} strokeWidth={2.4} />
                          {minutes(estimatedSeconds(kata, settings.restSeconds))}
                        </span>
                        <span>
                          <Icon name="list.bullet" size={13} strokeWidth={2.4} />
                          {kata.items.length} exercises
                        </span>
                      </span>
                      {kata.lastPerformedAt && <span className="kata-row-last">Last trained {relativeDay(kata.lastPerformedAt, locale)}</span>}
                    </span>
                    <button
                      type="button"
                      className="drag-handle no-sheet-drag"
                      aria-label={`Reorder ${kata.name}`}
                      onPointerDown={(e) => startDrag(e, index)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg viewBox="0 0 24 24" className="icon" width="18" height="18" aria-hidden="true">
                        <path d="M5 8h14M5 12h14M5 16h14" />
                      </svg>
                    </button>
                  </button>
                </div>
              )
            })}
          </div>
        )}
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
        <EmberBadge lit={snapshot.currentStreak > 0} size={60} />
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
