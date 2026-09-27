import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { SheetHeader } from '../../components/SheetHost'
import { Card, EmptyState, PrimaryButton, ProgressBar, StatTile, SymbolTile, TagChip } from '../../components/ui'
import { artById } from '../../data/content'
import { phaseMeta } from '../../data/meta'
import type { FlexibilityBenchmark } from '../../data/types'
import { clock, minutes, short } from '../../lib/format'
import { FLEXIBILITY_BENCHMARKS, currentMilestone, flexibilityMeta } from '../../lib/flexibility'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { logFlexibility } from '../../lib/actions'
import { nav } from '../../lib/nav'
import { consistencyLabel, gaugeColor, makeSnapshot, startOfDay } from '../../lib/progression'
import { computeAchievements } from '../../lib/achievements'
import { getState, useFlexibilityRecords, useProfile, useSessions } from '../../lib/store'

export function AnalyticsScreen() {
  const sessions = useSessions()
  const profile = useProfile()
  const flexibilityRecords = useFlexibilityRecords()
  const { t } = useI18n()
  const snapshot = useMemo(() => makeSnapshot(sessions, profile.createdAt, false), [sessions, profile.createdAt])
  const appState = getState()
  const achievements = useMemo(() => computeAchievements(appState), [appState])
  const unlockedCount = useMemo(() => achievements.filter((a) => a.unlocked).length, [achievements])

  return (
    <Screen title={t('Analytics')} largeTitle contentClassName="list-stack">
      <ConsistencyCard value={snapshot.consistency} />

      <div className="grid-2">
        <StatTile
          title={t('Longest streak')}
          value={String(snapshot.longestStreak)}
          caption={snapshot.longestStreak === 1 ? '1 day · View' : `${snapshot.longestStreak} days · View`}
          icon="flame.fill"
          tint="var(--ember)"
          onClick={() => {
            haptic('selection')
            nav.push({ name: 'streak' })
          }}
        />
        <StatTile
          title={t('Achievements')}
          value={`${unlockedCount} / ${achievements.length}`}
          caption={unlockedCount === achievements.length ? 'All unlocked!' : `${unlockedCount} unlocked · View`}
          icon="trophy.fill"
          tint="var(--gold)"
          onClick={() => {
            haptic('selection')
            nav.push({ name: 'achievements' })
          }}
        />
      </div>

      <button type="button" className="card flexibility-row pressable" onClick={() => nav.push({ name: 'flexibility' })}>
        <div className="flexibility-rings" style={{ flexShrink: 0 }}>
          {FLEXIBILITY_BENCHMARKS.map((benchmark) => {
            const best = Math.max(0, ...flexibilityRecords.filter((r) => r.benchmark === benchmark).map((r) => r.progressPercent))
            const meta = flexibilityMeta(benchmark)
            const circumference = 2 * Math.PI * 15
            return (
              <svg key={benchmark} viewBox="0 0 40 40" className="flexibility-ring" style={{ '--tint': meta.tint } as CSSProperties}>
                <circle cx="20" cy="20" r="15" className="flexibility-ring-track" />
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  className="flexibility-ring-fill"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - best / 100)}
                  transform="rotate(-90 20 20)"
                />
              </svg>
            )
          })}
        </div>
        <span className="art-card-row-text">
          <strong>Flexibility</strong>
          <span>Splits, kicks &amp; pike stretch over time</span>
        </span>
        <Icon name="chevron.right" size={14} strokeWidth={2.8} className="row-chevron" />
      </button>

      <MonthCalendar sessionsByDay={snapshot.sessionsByDay} />

      <div className="totals-footer">
        <span><Icon name="checkmark.seal" size={14} />{snapshot.sessionCount} sessions</span>
        <span><Icon name="clock" size={14} />{minutes(snapshot.totalSeconds)}</span>
        <span><Icon name="calendar" size={14} />{snapshot.activeDays} days</span>
      </div>
    </Screen>
  )
}

// Consistency barometer --------------------------------------------------------------------------

function ConsistencyCard({ value }: { value: number }) {
  const { t } = useI18n()
  const [shown, setShown] = useState(0)
  const numberRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Let the gauge rise on appear/whenever the score changes (CSS springs animate the arc/needle).
    const frame = requestAnimationFrame(() => setShown(value))
    // Count the number up alongside.
    const from = Number(numberRef.current?.dataset.value ?? 0)
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 900)
      const eased = 1 - Math.pow(1 - p, 3)
      const current = Math.round((from + (value - from) * eased) * 100)
      if (numberRef.current) {
        numberRef.current.textContent = `${current}%`
        numberRef.current.dataset.value = String(from + (value - from) * eased)
      }
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(raf)
    }
  }, [value])

  const color = gaugeColor(value)
  const angle = -90 + 180 * Math.min(Math.max(shown, 0), 1)

  return (
    <Card className="consistency-card">
      <div className="consistency-top">
        <div>
          <h3>{t('Consistency score')}</h3>
          <p className="muted small">Last 28 days · recent days count double</p>
        </div>
        <Icon name="gauge.with.needle.fill" size={22} style={{ color, '--icon-knock': 'var(--surface)' } as CSSProperties} />
      </div>
      <svg className="gauge" viewBox="0 0 240 132" role="img" aria-label={`Consistency ${Math.round(value * 100)} percent, ${consistencyLabel(value)}`}>
        <defs>
          <linearGradient id="gauge-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--slate)" />
            <stop offset="40%" stopColor="var(--gold)" />
            <stop offset="72%" stopColor="var(--ember)" />
            <stop offset="100%" stopColor="var(--jade)" />
          </linearGradient>
        </defs>
        <path className="gauge-track" d="M 22 118 A 98 98 0 0 1 218 118" pathLength={100} />
        {Array.from({ length: 11 }, (_, i) => {
          const a = Math.PI - (Math.PI * i) / 10
          const major = i % 5 === 0
          const passed = i / 10 <= shown + 0.001
          const r1 = 76
          const r2 = major ? 65 : passed ? 69 : 71
          return (
            <line
              key={i}
              className={`gauge-tick ${passed ? 'passed' : ''}`}
              style={passed ? { stroke: color } : undefined}
              x1={120 + r1 * Math.cos(a)}
              y1={118 - r1 * Math.sin(a)}
              x2={120 + r2 * Math.cos(a)}
              y2={118 - r2 * Math.sin(a)}
            />
          )
        })}
        <path
          className="gauge-value"
          d="M 22 118 A 98 98 0 0 1 218 118"
          pathLength={100}
          style={{ strokeDasharray: `${Math.max(0.01, shown * 100)} 100`, filter: `drop-shadow(0 1px 4px ${color})` }}
        />
        {/* Tapered needle: a slim kite, not a uniform line — pivots from the hub. */}
        <path className="gauge-needle" d="M116 118 L119 60 L120 54 L121 60 L124 118 Z" style={{ transform: `rotate(${angle}deg)`, transformOrigin: '120px 118px' }} />
        <circle className="gauge-hub" cx="120" cy="118" r="7.5" />
      </svg>
      <div className="consistency-readout">
        <span ref={numberRef} className="consistency-number" data-value="0">
          0%
        </span>
        <span className="consistency-label" style={{ color }}>
          {consistencyLabel(value)}
        </span>
      </div>
    </Card>
  )
}

// Month calendar ---------------------------------------------------------------------------------

function MonthCalendar({ sessionsByDay }: { sessionsByDay: Map<number, import('../../data/types').Session[]> }) {
  const { t, locale } = useI18n()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
  })
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const touch = useRef<{ x: number; y: number } | null>(null)

  const monthDate = new Date(month)
  const now = new Date()
  const isCurrentMonth = monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth()
  const today = startOfDay(now)

  // Week starts on the locale's first day (Monday for nl, Sunday for en-US).
  const firstDay = useMemo(() => {
    try {
      const info = (new Intl.Locale(locale) as Intl.Locale & { weekInfo?: { firstDay: number }; getWeekInfo?: () => { firstDay: number } })
      const week = info.getWeekInfo?.() ?? info.weekInfo
      return week ? week.firstDay % 7 : locale.startsWith('en-US') || locale === 'en' ? 0 : 1
    } catch {
      return 1
    }
  }, [locale])

  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 7 + ((firstDay + i) % 7)) // Jan 7 2024 was a Sunday
    return d.toLocaleDateString(locale, { weekday: 'narrow' })
  })

  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const leading = (monthDate.getDay() - firstDay + 7) % 7
  const slots: Array<number | null> = [...Array(leading).fill(null)]
  for (let day = 1; day <= daysInMonth; day++) slots.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day).getTime())

  const shift = (delta: number) => {
    const target = new Date(monthDate.getFullYear(), monthDate.getMonth() + delta, 1)
    if (delta > 0 && target.getTime() > Date.now()) return
    haptic('selection')
    setDirection(delta > 0 ? 'forward' : 'back')
    setMonth(target.getTime())
  }

  return (
    <Card
      className="calendar-card"
    >
      <div className="calendar-header">
        <h3>{monthDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</h3>
        <div className="calendar-arrows">
          <button type="button" className="round-btn pressable" aria-label="Previous month" onClick={() => shift(-1)}>
            <Icon name="chevron.left" size={16} strokeWidth={2.8} />
          </button>
          <button type="button" className="round-btn pressable" aria-label="Next month" disabled={isCurrentMonth} onClick={() => shift(1)}>
            <Icon name="chevron.right" size={16} strokeWidth={2.8} />
          </button>
        </div>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {weekdayLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div
        key={month}
        className={`calendar-grid ${direction}`}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const start = touch.current
          touch.current = null
          if (!start) return
          const dx = e.changedTouches[0].clientX - start.x
          const dy = e.changedTouches[0].clientY - start.y
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) shift(dx < 0 ? 1 : -1)
        }}
      >
        {slots.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />
          const sessions = sessionsByDay.get(day) ?? []
          const trained = sessions.length > 0
          const complete = sessions.some((s) => s.completed)
          const isToday = day === today
          const future = day > Date.now()
          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${trained ? (complete ? 'trained' : 'partial') : ''} ${isToday ? 'today' : ''}`}
              disabled={future}
              aria-label={`${new Date(day).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}: ${trained ? `${sessions.length} workouts` : 'No workout'}`}
              onClick={() => {
                haptic('selection')
                nav.present({ name: 'day', day })
              }}
            >
              <span className="calendar-day-number">{new Date(day).getDate()}</span>
              <span className="calendar-dots" style={{ opacity: sessions.length > 1 ? 1 : 0 }}>
                {Array.from({ length: Math.min(sessions.length, 3) }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
      <div className="calendar-legend">
        <span><i className="legend-dot" />{t('Completed')}</span>
        <span><i className="legend-dot partial" />{t('Partial')}</span>
        <span className="muted-3 grow-right">{t('Tap a day for details')}</span>
      </div>
    </Card>
  )
}

// Day details sheet ------------------------------------------------------------------------------

export function DaySheet({ day }: { day: number }) {
  const sessions = useSessions()
  const { t, locale } = useI18n()
  const list = sessions.filter((s) => startOfDay(s.startedAt) === day).sort((a, b) => a.startedAt - b.startedAt)
  const total = list.reduce((sum, s) => sum + s.activeSeconds, 0)
  const title = new Date(day).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <SheetHeader title={title} />
      <div className="sheet-scroll day-sheet">
        {list.length === 0 ? (
          <EmptyState icon={<Icon name="moon.zzz.fill" size={48} className="empty-icon" />} title={t('Rest day')} description="No training logged. Recovery is part of the path." />
        ) : (
          <>
            <div className="day-summary">
              <span><Icon name="checkmark.seal.fill" size={16} />{list.length} {list.length === 1 ? 'session' : 'sessions'}</span>
              <span><Icon name="clock.fill" size={16} />{minutes(total)}</span>
            </div>
            {list.map((session) => {
              const art = artById(session.art)
              return (
                <Card key={session.uuid} className="session-card">
                  <div className="session-card-top">
                    <div>
                      <strong>{session.title}</strong>
                      <span className="muted small">
                        {new Date(session.startedAt).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })} · <span className="tabular">{clock(session.activeSeconds)}</span>
                        {art ? ` · ${art.name}` : ''}
                      </span>
                    </div>
                    <TagChip
                      text={session.completed ? 'Completed' : 'Ended early'}
                      icon={session.completed ? 'checkmark' : 'stop.fill'}
                      tint={session.completed ? 'var(--jade)' : 'var(--gold)'}
                    />
                  </div>
                  {session.entries.length > 0 && (
                    <ul className="session-entries">
                      {session.entries.map((entry, index) => (
                        <li key={`${entry.slug}-${index}`}>
                          <i style={{ background: phaseMeta(entry.phase).tint }} />
                          <span>{entry.name}</span>
                          <span className="tabular muted">{short(entry.seconds)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              )
            })}
          </>
        )}
      </div>
    </>
  )
}

// Flexibility --------------------------------------------------------------------------------------

export function FlexibilityScreen() {
  const records = useFlexibilityRecords()

  return (
    <Screen title="Flexibility" back>
      <div className="list-stack">
        {FLEXIBILITY_BENCHMARKS.map((benchmark) => (
          <BenchmarkCard
            key={benchmark}
            benchmark={benchmark}
            records={records.filter((r) => r.benchmark === benchmark)}
            onLog={() => nav.present({ name: 'logFlexibility', benchmark })}
          />
        ))}
      </div>
    </Screen>
  )
}

function BenchmarkCard({
  benchmark, records, onLog,
}: { benchmark: FlexibilityBenchmark; records: { progressPercent: number; recordedAt: number }[]; onLog: () => void }) {
  const meta = flexibilityMeta(benchmark)
  const sorted = useMemo(() => [...records].sort((a, b) => a.recordedAt - b.recordedAt), [records])
  const best = sorted.reduce((max, r) => Math.max(max, r.progressPercent), 0)
  const milestone = currentMilestone(benchmark, best)

  return (
    <Card className="benchmark-card" style={{ '--tint': meta.tint } as CSSProperties}>
      <div className="benchmark-header">
        <SymbolTile icon={milestone.symbol || meta.symbol} tint={meta.tint} size={46} />
        <div className="benchmark-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: 'color-mix(in srgb, var(--tint) 20%, transparent)', color: meta.tint, fontWeight: 700, fontSize: '11px', padding: '2px 7px', borderRadius: '6px' }}>
              Level {milestone.level}
            </span>
            <strong style={{ fontSize: '16px' }}>{milestone.title}</strong>
          </div>
          <span className="secondary small">{milestone.subtitle} — {milestone.description}</span>
        </div>
      </div>

      {/* 6-step progress milestone strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', margin: '8px 0' }}>
        {meta.milestones.map((m) => {
          const reached = best >= m.percent
          return (
            <div
              key={m.level}
              style={{
                height: '6px',
                borderRadius: '3px',
                background: reached ? meta.tint : 'var(--stroke)',
                transition: 'background 300ms ease',
              }}
              title={`Level ${m.level}: ${m.title}`}
            />
          )
        })}
      </div>

      {sorted.length >= 2 ? (
        <FlexibilityChart records={sorted} tint={meta.tint} />
      ) : sorted.length === 1 ? (
        <p className="secondary small">First check-in: Level {milestone.level} ({milestone.title}) on {new Date(sorted[0].recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
      ) : (
        <p className="secondary small">No check-ins yet. Tap below to log your current milestone.</p>
      )}

      <button type="button" className="benchmark-log-btn" onClick={onLog}>
        <Icon name="plus.circle.fill" size={18} />
        Advance Milestone
      </button>
    </Card>
  )
}

function FlexibilityChart({ records, tint }: { records: { progressPercent: number; recordedAt: number }[]; tint: string }) {
  const w = 300
  const h = 100
  const pad = 8
  const minT = records[0].recordedAt
  const maxT = records[records.length - 1].recordedAt
  const span = Math.max(1, maxT - minT)
  const points = records.map((r) => {
    const x = pad + ((r.recordedAt - minT) / span) * (w - pad * 2)
    const y = pad + (1 - r.progressPercent / 100) * (h - pad * 2)
    return { x, y }
  })
  const line = points.map((p) => `${p.x},${p.y}`).join(' ')
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="flexibility-chart" style={{ '--tint': tint } as CSSProperties}>
      <polygon points={area} className="flexibility-chart-area" />
      <polyline points={line} className="flexibility-chart-line" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" className="flexibility-chart-dot" />
      ))}
    </svg>
  )
}

export function LogFlexibilitySheet({ benchmark }: { benchmark: FlexibilityBenchmark }) {
  const meta = flexibilityMeta(benchmark)
  const records = useFlexibilityRecords().filter((r) => r.benchmark === benchmark)
  const best = records.reduce((max, r) => Math.max(max, r.progressPercent), 0)
  const initial = currentMilestone(benchmark, best)
  const [selectedLevel, setSelectedLevel] = useState(initial.level)
  const activeMilestone = meta.milestones.find((m) => m.level === selectedLevel) ?? meta.milestones[0]

  return (
    <>
      <SheetHeader title={`${meta.title} Milestones`} leading={<button type="button" className="navbar-action" onClick={() => nav.back()}>Cancel</button>} />
      <div className="sheet-scroll form" style={{ padding: '0 20px 24px' }}>
        <div style={{ textAlign: 'center', margin: '12px 0 16px' }}>
          <div style={{ display: 'inline-flex', margin: '0 auto 8px' }}>
            <SymbolTile icon={activeMilestone.symbol} tint={meta.tint} size={64} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: meta.tint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Level {activeMilestone.level} of 6
          </span>
          <h2 style={{ margin: '2px 0 4px', fontSize: '24px' }}>{activeMilestone.title}</h2>
          <p className="secondary small">{activeMilestone.subtitle}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {meta.milestones.map((m) => {
            const isSelected = m.level === selectedLevel
            return (
              <button
                key={m.level}
                type="button"
                className="card pressable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  textAlign: 'left',
                  border: isSelected ? `2px solid ${meta.tint}` : '1px solid var(--stroke)',
                  background: isSelected ? `color-mix(in srgb, ${meta.tint} 12%, var(--card-bg))` : 'var(--card-bg)',
                }}
                onClick={() => {
                  haptic('selection')
                  setSelectedLevel(m.level)
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '999px',
                    background: isSelected ? meta.tint : 'var(--surface-raised)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  {m.level}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '15px' }}>{m.title}</strong>
                    <span className="muted small">{m.subtitle}</span>
                  </div>
                  <p className="secondary small" style={{ margin: 0, marginTop: '2px', fontSize: '12px' }}>{m.description}</p>
                </div>
                {isSelected && <Icon name="checkmark.circle.fill" size={20} style={{ color: meta.tint }} />}
              </button>
            )
          })}
        </div>

        <PrimaryButton
          onClick={() => {
            haptic('success')
            logFlexibility(benchmark, activeMilestone.percent)
            nav.back()
          }}
        >
          Confirm Level {activeMilestone.level}: {activeMilestone.title}
        </PrimaryButton>
      </div>
    </>
  )
}

export function AchievementsScreen() {
  const appState = getState()
  const achievements = useMemo(() => computeAchievements(appState), [appState])
  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <Screen title="Achievements" back contentClassName="list-stack">
      <Card style={{ padding: '22px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '999px',
            background: 'color-mix(in srgb, var(--gold) 15%, var(--surface))',
            color: 'var(--gold)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: '4px',
            border: '1px solid color-mix(in srgb, var(--gold) 35%, transparent)',
          }}
        >
          <Icon name="trophy.fill" size={30} />
        </div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Martial Milestones</h2>
        <p className="secondary small" style={{ margin: 0, maxWidth: '290px' }}>
          Honor your training consistency, flexibility breakthroughs, and dedication to the dojo.
        </p>
        <span
          style={{
            background: 'color-mix(in srgb, var(--gold) 20%, transparent)',
            color: 'var(--gold)',
            fontWeight: 700,
            fontSize: '13px',
            padding: '4px 12px',
            borderRadius: '999px',
            marginTop: '4px',
          }}
        >
          {unlockedCount} of {achievements.length} Unlocked
        </span>
        <div style={{ width: '100%', maxWidth: '240px', marginTop: '6px' }}>
          <ProgressBar value={unlockedCount / achievements.length} tint="var(--gold)" height={7} />
        </div>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {achievements.map((item) => (
          <Card
            key={item.id}
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              opacity: item.unlocked ? 1 : 0.65,
              border: item.unlocked ? `1px solid color-mix(in srgb, ${item.tint} 40%, transparent)` : '1px dashed var(--stroke)',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '999px',
                background: item.unlocked ? item.tint : 'var(--surface-raised)',
                color: item.unlocked ? '#fff' : 'var(--text-tertiary)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name={item.icon} size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <strong style={{ fontSize: '15px' }}>{item.title}</strong>
                {item.unlocked ? (
                  <span style={{ fontSize: '11px', color: 'var(--jade)', fontWeight: 700 }}>
                    ✓ Completed
                  </span>
                ) : item.max > 1 ? (
                  <span className="muted small" style={{ fontSize: '11px' }}>
                    {item.current} / {item.max}
                  </span>
                ) : null}
              </div>
              <p className="secondary small" style={{ margin: 0, fontSize: '13px', lineHeight: 1.3 }}>
                {item.description}
              </p>
              {!item.unlocked && item.max > 1 && (
                <div style={{ width: '100%', marginTop: '6px' }}>
                  <ProgressBar value={item.current / item.max} tint={item.tint} height={4} />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  )
}

export function StreakDetailScreen() {
  const sessions = useSessions()
  const profile = useProfile()
  const { locale } = useI18n()
  const snapshot = useMemo(() => makeSnapshot(sessions, profile.createdAt, false), [sessions, profile.createdAt])

  const streakMilestones = [
    { target: 3, title: '3-Day Spark', desc: 'Complete 3 consecutive active days', icon: 'flame.fill' },
    { target: 7, title: '7-Day Warrior', desc: 'A full unbroken week of daily practice', icon: 'flame.fill' },
    { target: 14, title: '14-Day Iron Will', desc: 'Two solid weeks of consistency', icon: 'bolt.fill' },
    { target: 30, title: '30-Day Master', desc: 'A full calendar month on the mat', icon: 'trophy.fill' },
    { target: 100, title: '100-Day Legend', desc: 'Centurion level martial discipline', icon: 'crown.fill' },
  ]

  // Calculate past 7 days active status
  const weekDays = useMemo(() => {
    const days: { label: string; date: string; active: boolean }[] = []
    const today = new Date()
    const sessionDays = new Set(sessions.map((s) => startOfDay(s.startedAt)))
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dayStart = startOfDay(d.getTime())
      const label = d.toLocaleDateString(locale, { weekday: 'narrow' })
      days.push({ label, date: d.toLocaleDateString(locale, { month: 'short', day: 'numeric' }), active: sessionDays.has(dayStart) })
    }
    return days
  }, [sessions, locale])

  return (
    <Screen title="Streak & Consistency" back contentClassName="list-stack">
      {/* Hero Streak Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '24px 20px',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--ember) 25%, var(--surface)) 0%, var(--surface) 100%)',
          border: '1px solid color-mix(in srgb, var(--ember) 35%, var(--stroke))',
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 999,
            background: 'color-mix(in srgb, var(--ember) 18%, transparent)',
            color: 'var(--ember)',
            display: 'grid',
            placeItems: 'center',
            marginBottom: '10px',
          }}
        >
          <Icon name="flame.fill" size={34} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Current Streak
        </span>
        <div style={{ fontFamily: 'var(--font-rounded)', fontSize: '46px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, margin: '2px 0 4px' }}>
          {snapshot.currentStreak} {snapshot.currentStreak === 1 ? 'Day' : 'Days'}
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          All-time longest record: <strong style={{ color: 'var(--ember)' }}>{snapshot.longestStreak} days</strong>
        </p>
      </div>

      {/* 7-Day Activity Tracker */}
      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600 }}>Past 7 Days</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {weekDays.map((w, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{w.label}</span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  background: w.active ? 'var(--ember)' : 'var(--surface-raised)',
                  color: w.active ? '#fff' : 'var(--text-tertiary)',
                  border: w.active ? 'none' : '1px solid var(--stroke)',
                }}
              >
                {w.active ? <Icon name="checkmark" size={14} strokeWidth={2.8} /> : <span style={{ fontSize: '10px' }}>•</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid-2">
        <StatTile
          title="Total Sessions"
          value={String(snapshot.sessionCount)}
          caption="workouts logged"
          icon="checkmark.seal.fill"
          tint="var(--jade)"
        />
        <StatTile
          title="Total Time"
          value={minutes(snapshot.totalSeconds)}
          caption={`${snapshot.activeDays} active days`}
          icon="clock.fill"
          tint="var(--accent)"
        />
      </div>

      {/* Streak Milestones */}
      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600 }}>Streak Milestones</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {streakMilestones.map((m) => {
            const unlocked = snapshot.longestStreak >= m.target
            return (
              <div
                key={m.target}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-medium)',
                  background: unlocked ? 'color-mix(in srgb, var(--ember) 8%, var(--surface))' : 'var(--surface-raised)',
                  border: `1px solid ${unlocked ? 'color-mix(in srgb, var(--ember) 25%, var(--stroke))' : 'var(--stroke)'}`,
                  opacity: unlocked ? 1 : 0.65,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: unlocked ? 'var(--ember)' : 'color-mix(in srgb, var(--text) 8%, transparent)',
                    color: unlocked ? '#fff' : 'var(--text-secondary)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={m.icon} size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{m.title}</strong>
                    {unlocked ? (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ember)', textTransform: 'uppercase' }}>
                        Unlocked
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {snapshot.longestStreak} / {m.target}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{m.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Screen>
  )
}

