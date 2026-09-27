import { type CSSProperties, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { confirmAction } from '../../components/ActionSheet'
import { Icon } from '../../components/Icon'
import { Eyebrow, GlassIconButton, PrimaryButton, ProgressBar, RankEmblem, StatTile, SymbolTile } from '../../components/ui'
import { artById } from '../../data/content'
import { nextRank } from '../../data/levels'
import { phaseMeta } from '../../data/meta'
import type { Phase, Session } from '../../data/types'
import { recordSession } from '../../lib/actions'
import { audio } from '../../lib/audio'
import { clock, minutes, short } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { nav } from '../../lib/nav'
import { planWorkSteps, planTotalSeconds, stepEyebrow, stepTint, type WorkoutPlan } from '../../lib/plan'
import { WorkoutPlayer } from '../../lib/player'
import { makeSnapshot } from '../../lib/progression'
import { useProfile, useSessions } from '../../lib/store'

type WakeLockSentinelLike = { release: () => Promise<void> }

/** Full-screen workout player. */
export function PlayerOverlay({ plan }: { plan: WorkoutPlan }) {
  const player = useMemo(() => new WorkoutPlayer(plan), [plan])
  useSyncExternalStore(player.subscribe, player.getVersion)
  const { t } = useI18n()
  const [closing, setClosing] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [discarding, setDiscarding] = useState(false)
  const recorded = useRef(false)
  const [howTo, setHowTo] = useState<null | { title: string; summary: string; steps: string[]; tips: string[]; symbol: string }>(null)

  const close = () => {
    setClosing(true)
    window.setTimeout(() => nav.closePlan(), 360)
  }

  const requestQuit = async () => {
    if (player.status === 'finished') {
      close()
      return
    }
    const wasRunning = player.status === 'running'
    player.pauseIfRunning()
    const choice = await confirmAction({
      title: t('End workout?'),
      message: "Time you've trained so far can still count toward your streak and rank.",
      actions: [{ label: t('End & save progress') }, { label: t('Discard workout'), role: 'destructive' }],
      cancelLabel: t('Keep training'),
    })
    if (choice === null) {
      if (wasRunning) player.togglePause()
      return
    }
    recorded.current = true
    const save = choice === 0
    player.endEarly()
    const saved = save ? recordSession(sessionFrom(player, false)) : null
    if (saved) {
      setSession(saved)
    } else {
      setDiscarding(true)
      close()
    }
  }

  // Start, keep the screen awake, duck other audio, and tidy up on close.
  useEffect(() => {
    let wakeLock: WakeLockSentinelLike | null = null
    const requestWakeLock = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> } }
        wakeLock = (await nav.wakeLock?.request('screen')) ?? null
      } catch {
        wakeLock = null
      }
    }
    audio.setWorkoutSession(true)
    // 1.1: no longer auto-starts — lands on ReadyView first (see the render below). `startLoop`
    // is a safe no-op while `status === 'ready'`.
    player.startLoop()
    void requestWakeLock()

    const onVisibility = () => {
      // Auto-pause when the app goes to the background; timers can't cue reliably there.
      if (document.visibilityState === 'hidden') player.pauseIfRunning()
      else void requestWakeLock()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      void wakeLock?.release().catch(() => undefined)
      audio.setWorkoutSession(false)
      player.dispose()
    }
  }, [player])

  // Browser/Android back button asks before quitting.
  useEffect(() => {
    const onRequest = () => void requestQuit()
    window.addEventListener('kiai:request-quit', onRequest)
    return () => window.removeEventListener('kiai:request-quit', onRequest)
  })

  // Record a completed session exactly once.
  useEffect(() => {
    if (player.status === 'finished' && !recorded.current) {
      recorded.current = true
      setSession(recordSession(sessionFrom(player, true)))
    }
  }, [player, player.status])

  const step = player.currentStep
  const finished = player.status === 'finished' && !discarding
  const ready = player.status === 'ready'
  const tint = step ? stepTint(step) : 'var(--ember)'

  return (
    <div className={`player-layer ${closing ? 'closing' : ''}`} style={{ '--tint': tint } as CSSProperties} role="dialog" aria-modal="true" aria-label={plan.title}>
      <div className="player-bg" />
      {finished ? (
        <CompleteView player={player} session={session} onDone={close} />
      ) : ready ? (
        <ReadyView plan={plan} onStart={() => player.start()} onCancel={close} />
      ) : (
        step && (
          <div className="player">
            <div className="player-top">
              <GlassIconButton icon="xmark" label="End workout" onClick={() => void requestQuit()} />
              <div className="player-title">
                <span>{plan.title}</span>
                <OverallProgress player={player} />
              </div>
              <GlassIconButton
                icon="questionmark"
                label="How to"
                disabled={!step.howTo && !player.upcomingWorkStep?.howTo}
                onClick={() => {
                  const target = step.howTo ?? player.upcomingWorkStep?.howTo
                  if (!target) return
                  player.pauseIfRunning()
                  setHowTo(target)
                }}
              />
            </div>

            <div className="player-header" key={step.id}>
              <span className="phase-pill">
                <Icon name={step.phase ? (step.phase === 'warmup' ? 'flame.fill' : step.phase === 'cooldown' ? 'leaf.fill' : 'bolt.fill') : step.kind === 'rest' ? 'pause.fill' : 'figure.stand'} size={12} />
                {stepEyebrow(step)}
              </span>
              <h1>{step.title}</h1>
              <p className={step.kind === 'work' && step.bilateral && player.hasSwitchedSides ? 'switched' : ''}>
                {step.kind === 'work' && step.bilateral
                  ? player.hasSwitchedSides
                    ? '⇄ Switch — second side'
                    : '⇄ First side'
                  : step.kind === 'work'
                    ? `Exercise ${player.workStepNumber} of ${planWorkSteps(plan).length}`
                    : step.detail}
              </p>
            </div>

            <TimerRing player={player} />

            <div className="player-next">
              {player.status === 'awaitingContinue' ? (
                <p className="player-next-note">Set complete. Take your time — tap Continue when ready.</p>
              ) : player.upcomingWorkStep ? (
                <div className="glass up-next">
                  <SymbolTile icon={player.upcomingWorkStep.symbol} tint={stepTint(player.upcomingWorkStep)} size={40} />
                  <span>
                    <small>{t('Up next')}</small>
                    <strong>{player.upcomingWorkStep.title}</strong>
                  </span>
                  <span className="tabular">{clock(player.upcomingWorkStep.duration)}</span>
                </div>
              ) : (
                <p className="player-next-note">
                  <Icon name="flag.checkered" size={16} /> Final stretch — finish strong
                </p>
              )}
            </div>

            <div className="player-controls">
              <GlassIconButton icon="backward.end.fill" label="Previous" size={64} iconSize={22} onClick={() => player.back()} />
              <button
                type="button"
                className={`play-button pressable ${player.status === 'awaitingContinue' ? 'continue' : ''}`}
                aria-label={player.status === 'running' ? 'Pause' : player.status === 'awaitingContinue' ? 'Continue' : 'Play'}
                onClick={() => {
                  haptic('medium')
                  audio.unlock()
                  player.togglePause()
                }}
              >
                {player.status === 'awaitingContinue' ? (
                  <span>Continue</span>
                ) : (
                  <Icon name={player.status === 'running' ? 'pause.fill' : 'play.fill'} size={34} />
                )}
              </button>
              <GlassIconButton icon="forward.end.fill" label="Skip" size={64} iconSize={22} onClick={() => player.skip()} />
            </div>
          </div>
        )
      )}

      {howTo && (
        <div className="player-howto" role="dialog" aria-label={howTo.title}>
          <div className="sheet-backdrop" onClick={() => setHowTo(null)} />
          <div className="player-howto-card">
            <div className="player-howto-head">
              <SymbolTile icon={howTo.symbol} tint={tint} size={48} />
              <h2>{howTo.title}</h2>
              <GlassIconButton icon="xmark" label="Close" size={36} iconSize={15} onClick={() => setHowTo(null)} />
            </div>
            <div className="player-howto-body">
              <p className="secondary">{howTo.summary}</p>
              <ol className="numbered-steps" style={{ '--tint': tint } as CSSProperties}>
                {howTo.steps.map((s, i) => (
                  <li key={i}>
                    <span className="step-number">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {howTo.tips.length > 0 && (
                <ul className="bullet-list" style={{ '--tint': 'var(--gold)' } as CSSProperties}>
                  {howTo.tips.map((tip) => (
                    <li key={tip}>
                      <Icon name="lightbulb.fill" size={16} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Ready screen -------------------------------------------------------------------------------------

/**
 * Lands here before anything starts (1.1): the Kata's name, stats and a phase-by-phase preview,
 * with a single explicit Start button — Quick Start (and every other launch point) no longer
 * jumps straight into a moving countdown.
 */
function ReadyView({ plan, onStart, onCancel }: { plan: WorkoutPlan; onStart: () => void; onCancel: () => void }) {
  const art = artById(plan.art)
  const tint = plan.steps[0] ? stepTint(plan.steps[0]) : 'var(--ember)'
  const heroSymbol = plan.steps.find((s) => s.kind === 'work')?.symbol ?? 'figure.stand'
  const phases: Phase[] = ['warmup', 'main', 'cooldown']
  const summaries = phases
    .map((phase) => {
      const steps = plan.steps.filter((s) => s.kind === 'work' && s.phase === phase)
      return { phase, count: steps.length, seconds: steps.reduce((sum, s) => sum + s.duration, 0) }
    })
    .filter((s) => s.count > 0)

  return (
    <div className="ready-view" style={{ '--tint': tint } as CSSProperties}>
      <div className="ready-top">
        <GlassIconButton icon="xmark" label="Cancel" onClick={onCancel} />
      </div>
      <div className="ready-scroll">
        <SymbolTile icon={heroSymbol} tint={tint} size={84} />
        <Eyebrow tint={tint}>{plan.kind === 'technique' ? 'Ready to drill' : 'Ready when you are'}</Eyebrow>
        <h1>{plan.title}</h1>
        {art && <p className="ready-art">{art.name}</p>}

        <div className="ready-stats">
          <ReadyStat value={minutes(planTotalSeconds(plan))} label="Duration" />
          <span className="ready-divider" />
          <ReadyStat value={String(planWorkSteps(plan).length)} label="Exercises" />
          <span className="ready-divider" />
          <ReadyStat value={String(summaries.length)} label="Phases" />
        </div>

        <div className="ready-phases">
          {summaries.map((entry) => {
            const meta = phaseMeta(entry.phase)
            return (
              <div key={entry.phase} className="ready-phase-row">
                <Icon name={meta.symbol} size={15} style={{ color: meta.tint }} />
                <span>{meta.title}</span>
                <span className="tabular muted">
                  {entry.count} · {short(entry.seconds)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="ready-footer">
        <PrimaryButton icon="play.fill" tint={tint} onClick={onStart}>
          Start
        </PrimaryButton>
      </div>
    </div>
  )
}

function ReadyStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="ready-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function sessionFrom(player: WorkoutPlayer, completed: boolean): Omit<Session, 'uuid'> {
  return {
    startedAt: player.startedAt ?? Date.now(),
    endedAt: player.endedAt ?? Date.now(),
    title: player.plan.title,
    workoutUUID: player.plan.workoutUUID,
    kind: player.plan.kind,
    art: player.plan.art,
    activeSeconds: player.activeSeconds,
    completed,
    entries: player.entryResults(),
  }
}

/**
 * Countdown ring driven by requestAnimationFrame, writing straight to the SVG — no React renders per
 * frame — so it animates at the display's native refresh rate (120 Hz on ProMotion iPhones).
 */
function TimerRing({ player }: { player: WorkoutPlayer }) {
  const arcRef = useRef<SVGCircleElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const R = 128
  const C = 2 * Math.PI * R

  useEffect(() => {
    let frame = 0
    let lastText = ''
    const draw = () => {
      const now = performance.now()
      const progress = player.stepProgress(now)
      if (arcRef.current) arcRef.current.style.strokeDashoffset = String(C * progress)
      const text = clock(Math.ceil(player.remaining(now) - 0.0001))
      if (text !== lastText && timeRef.current) {
        timeRef.current.textContent = text
        lastText = text
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [player, C])

  const label = player.status === 'paused' ? 'Paused' : player.status === 'awaitingContinue' ? 'Set done' : ''

  return (
    <button
      type="button"
      className={`timer-ring ${player.status}`}
      aria-label={`Time remaining. Tap to ${player.status === 'running' ? 'pause' : 'resume'}`}
      onClick={() => {
        haptic('light')
        audio.unlock()
        player.togglePause()
      }}
    >
      <svg viewBox="0 0 300 300" aria-hidden="true">
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--tint)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--tint)" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx="150" cy="150" r={R} />
        <circle
          ref={arcRef}
          className="ring-arc"
          cx="150"
          cy="150"
          r={R}
          strokeDasharray={C}
          strokeDashoffset={0}
          transform="rotate(-90 150 150)"
        />
      </svg>
      <span className="ring-center">
        <span ref={timeRef} className="ring-time tabular">
          {clock(player.remaining())}
        </span>
        <span className="ring-status">{label}</span>
      </span>
    </button>
  )
}

function OverallProgress({ player }: { player: WorkoutPlayer }) {
  const fillRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const draw = () => {
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${player.overallProgress()})`
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [player])
  return (
    <div className="progress overall" style={{ height: 5, '--tint': 'var(--text)' } as CSSProperties}>
      <div ref={fillRef} className="progress-fill no-transition" />
    </div>
  )
}

// Completion -------------------------------------------------------------------------------------

function CompleteView({ player, session, onDone }: { player: WorkoutPlayer; session: Session | null; onDone: () => void }) {
  const sessions = useSessions()
  const profile = useProfile()
  const { t } = useI18n()
  const after = useMemo(() => makeSnapshot(sessions, profile.createdAt), [sessions, profile.createdAt])
  const before = useMemo(() => makeSnapshot(sessions.filter((s) => s.uuid !== session?.uuid), profile.createdAt), [sessions, session, profile.createdAt])
  const rankedUp = session !== null && after.rank.index > before.rank.index
  const kiGained = Math.max(0, after.ki - before.ki)
  const [progress, setProgress] = useState(rankedUp ? 0 : before.rankProgress)
  const next = nextRank(after.rank)

  useEffect(() => {
    haptic('success')
    const timer = window.setTimeout(() => setProgress(after.rankProgress), 450)
    return () => window.clearTimeout(timer)
  }, [after.rankProgress])

  return (
    <div className="complete">
      <div className="complete-scroll">
        <div className="complete-hero">
          <div className="complete-badge" style={rankedUp ? ({ '--tint': after.rank.color } as CSSProperties) : undefined}>
            {rankedUp ? <RankEmblem rank={after.rank} size={96} /> : <Icon name="checkmark.seal.fill" size={84} style={{ '--icon-knock': 'var(--background)' } as CSSProperties} />}
          </div>
          <h1>{rankedUp ? t('Rank up!') : t('Otsukaresama!')}</h1>
          <p>{rankedUp ? `You are now ${after.rank.title}. ${after.rank.blurb}` : `Good work. ${player.plan.title} complete.`}</p>
          {!session && <p className="muted small">That one was a bit short to count toward your streak. Next time!</p>}
        </div>
        <div className="grid-2 complete-stats">
          <StatTile title={t('Active time')} value={clock(player.activeSeconds)} icon="timer" tint="var(--ember)" />
          <StatTile title={t('Exercises')} value={String(player.entryResults().length)} icon="list.bullet" tint="var(--indigo)" />
          <StatTile title={t('Streak')} value={String(after.currentStreak)} caption={after.currentStreak === 1 ? 'day' : 'days'} icon="flame.fill" tint="var(--gold)" />
          <StatTile title={t('Ki earned')} value={`+${kiGained}`} caption={`${after.ki.toLocaleString()} total`} icon="sparkles" tint="var(--jade)" />
        </div>
        <div className="card complete-rank">
          <div className="complete-rank-top">
            <RankEmblem rank={after.rank} size={40} />
            <div>
              <span className="eyebrow" style={{ color: after.rank.color }}>
                {t('Level %lld', after.rank.level)}
              </span>
              <strong>{after.rank.title}</strong>
            </div>
            {next && <span className="muted small">Next: {next.title}</span>}
          </div>
          <ProgressBar value={progress} tint={next?.color ?? after.rank.color} height={10} label="Rank progress" />
        </div>
      </div>
      <div className="complete-footer">
        <PrimaryButton onClick={onDone}>{t('Done')}</PrimaryButton>
      </div>
    </div>
  )
}
