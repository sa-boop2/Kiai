import type { Phase, SessionEntry } from '../data/types'
import { audio, type SoundCue } from './audio'
import { haptic, type HapticKind } from './haptics'
import type { PlayerStep, WorkoutPlan } from './plan'

export type PlayerStatus = 'ready' | 'running' | 'paused' | 'switchingSides' | 'awaitingContinue' | 'finished'

const CUE_HAPTICS: Record<SoundCue, HapticKind> = {
  tick: 'light',
  go: 'heavy',
  switchSides: 'medium',
  rest: 'soft',
  finish: 'success',
}

/**
 * Timer engine — a port of the native `WorkoutPlayer`.
 *
 * Time is date-based: a running step stores its end time and the UI derives the remaining time on
 * every animation frame, so the ring stays smooth at the display's refresh rate (60/120 Hz). The
 * 50 ms loop here only handles transitions and cues; it notifies React only when discrete state
 * changes, never per frame.
 */
export class WorkoutPlayer {
  readonly plan: WorkoutPlan
  index = 0
  status: PlayerStatus = 'ready'
  stepEndTime = 0
  frozenRemaining = 0
  hasSwitchedSides = false
  startedAt: number | null = null
  endedAt: number | null = null

  private version = 0
  private listeners = new Set<() => void>()
  private segmentStart: number | null = null
  private elapsedByStep = new Map<number, number>()
  private lastCountdownSecond = Number.POSITIVE_INFINITY
  private loop: number | undefined

  constructor(plan: WorkoutPlan) {
    this.plan = plan
    this.frozenRemaining = plan.steps[0]?.duration ?? 0
  }

  // Subscription (useSyncExternalStore) -------------------------------------------------------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getVersion = () => this.version

  private emitChange() {
    this.version++
    this.listeners.forEach((listener) => listener())
  }

  // Derived state
  getPnfPhase(now = performance.now()): 'passive' | 'contract' | 'deep' | null {
    const step = this.currentStep
    if (!step || !step.pnf || step.kind !== 'work') return null
    if (this.status === 'switchingSides') return null
    
    // Time remaining on CURRENT side
    let rem = this.remaining(now)
    let totalForSide = step.bilateral ? step.duration / 2 : step.duration
    
    // If it's bilateral and we haven't switched sides yet, rem is relative to the total step duration (e.g. 60)
    // but the side's active duration is only 30.
    if (step.bilateral && !this.hasSwitchedSides) {
      rem = rem - totalForSide // E.g. if 60 total, and rem is 50, side rem is 20. Wait.
      // E.g. total 60, halfway is 30. If remaining is 45, it means we have 15s left in the FIRST side.
      // So sideRem = rem - 30.
    }
    
    // So sideRem is the seconds left for the current side.
    const sideRem = step.bilateral && !this.hasSwitchedSides ? rem - totalForSide : rem
    const elapsedOnSide = totalForSide - sideRem

    // PNF Ratios: ~33% passive, ~17% contract, ~50% deep stretch
    const passiveTime = totalForSide * 0.33
    const contractTime = totalForSide * 0.17
    
    if (elapsedOnSide < passiveTime) return 'passive'
    if (elapsedOnSide < passiveTime + contractTime) return 'contract'
    return 'deep'
  } // ------------------------------------------------------------------------------

  get currentStep(): PlayerStep | null {
    return this.plan.steps[this.index] ?? null
  }

  get upcomingWorkStep(): PlayerStep | null {
    return this.plan.steps.slice(this.index + 1).find((s) => s.kind === 'work') ?? null
  }

  get workStepNumber(): number {
    return this.plan.steps.slice(0, this.index + 1).filter((s) => s.kind === 'work').length
  }

  get isLastStep(): boolean {
    return this.index >= this.plan.steps.length - 1
  }

  remaining(now = performance.now()): number {
    if (this.status === 'running' || this.status === 'switchingSides') return Math.max(0, (this.stepEndTime - now) / 1000)
    if (this.status === 'finished') return 0
    return this.frozenRemaining
  }

  stepProgress(now = performance.now()): number {
    const step = this.currentStep
    if (!step || step.duration <= 0) return 1
    if (this.status === 'switchingSides') return 0.5
    return Math.min(Math.max(1 - this.remaining(now) / step.duration, 0), 1)
  }

  overallProgress(now = performance.now()): number {
    const total = this.plan.steps.reduce((sum, s) => sum + s.duration, 0)
    if (total <= 0) return 0
    const done = this.plan.steps.slice(0, this.index).reduce((sum, s) => sum + s.duration, 0)
    const current = (this.currentStep?.duration ?? 0) - (this.status === 'switchingSides' ? this.frozenRemaining : this.remaining(now))
    return Math.min(Math.max((done + current) / total, 0), 1)
  }

  get activeSeconds(): number {
    let total = 0
    this.elapsedByStep.forEach((seconds, stepIndex) => {
      if (this.plan.steps[stepIndex]?.kind === 'work') total += seconds
    })
    return Math.round(total)
  }

  /** Per-exercise totals merged by slug, in first-seen order. */
  entryResults(): SessionEntry[] {
    const order: string[] = []
    const totals = new Map<string, { step: PlayerStep; seconds: number }>()
    for (const step of this.plan.steps) {
      if (step.kind !== 'work' || !step.slug) continue
      const seconds = this.elapsedByStep.get(step.id) ?? 0
      if (seconds < 1) continue
      const existing = totals.get(step.slug)
      if (existing) existing.seconds += seconds
      else {
        order.push(step.slug)
        totals.set(step.slug, { step, seconds })
      }
    }
    return order.map((slug) => {
      const value = totals.get(slug)!
      return { slug, name: value.step.title, seconds: Math.round(value.seconds), phase: value.step.phase as Phase | null }
    })
  }

  // Controls -----------------------------------------------------------------------------------

  start() {
    if (this.status !== 'ready' || this.plan.steps.length === 0) return
    this.startedAt = Date.now()
    this.enter(0, true)
    this.startLoop()
  }

  /** Ensures the tick loop runs (safe to call repeatedly, e.g. when a view re-attaches). */
  startLoop() {
    if (this.loop !== undefined || this.status === 'finished' || this.status === 'ready') return
    this.loop = window.setInterval(() => this.tick(), 50)
  }

  stopLoop() {
    window.clearInterval(this.loop)
    this.loop = undefined
  }

  togglePause() {
    switch (this.status) {
      case 'ready':
        this.start()
        return
      case 'running':
      case 'switchingSides':
        this.frozenRemaining = this.remaining()
        this.commitSegment()
        this.status = 'paused'
        break
      case 'paused':
        this.stepEndTime = performance.now() + this.frozenRemaining * 1000
        this.segmentStart = performance.now()
        this.status = 'running'
        // Note: if paused while switching sides, we resume as running, which effectively skips the rest of the switch pause. This is a fine default for a manual resume.
        break
      case 'awaitingContinue':
        this.continueAfterSet()
        return
      case 'finished':
        return
    }
    this.emitChange()
  }

  pauseIfRunning() {
    if (this.status === 'running' || this.status === 'switchingSides') this.togglePause()
  }

  continueAfterSet() {
    if (this.status !== 'awaitingContinue') return
    if (this.isLastStep) this.finish()
    else this.enter(this.index + 1, true)
  }

  skip() {
    if (this.status === 'finished' || this.status === 'ready') return
    if (this.isLastStep) this.finish()
    else this.enter(this.index + 1, this.status !== 'paused')
  }

  /** Restarts the current step if more than 3 s in; otherwise goes to the previous non-rest step. */
  back() {
    const step = this.currentStep
    if (!step || this.status === 'finished' || this.status === 'ready') return
    const autoplay = this.status !== 'paused'
    const spent = step.duration - (this.status === 'switchingSides' ? this.frozenRemaining : this.remaining())
    if (spent > 3 || this.index === 0) {
      this.enter(this.index, autoplay)
      return
    }
    let target = this.index - 1
    while (target > 0 && this.plan.steps[target].kind === 'rest') target--
    this.enter(target, autoplay)
  }

  finish() {
    if (this.status === 'finished') return
    this.commitSegment()
    this.status = 'finished'
    this.endedAt = Date.now()
    this.stopLoop()
    this.cue('finish')
    this.emitChange()
  }

  /** Ends without the completion cue (user quit). */
  endEarly() {
    if (this.status === 'finished') return
    this.commitSegment()
    this.status = 'finished'
    this.endedAt = Date.now()
    this.stopLoop()
    this.emitChange()
  }

  dispose() {
    this.stopLoop()
  }

  // Engine -------------------------------------------------------------------------------------

  private tick() {
    const step = this.currentStep
    if (!step) return
    
    if (this.status === 'switchingSides') {
      const left = this.remaining()
      if (left <= 0) {
        this.stepEndTime = performance.now() + this.frozenRemaining * 1000
        this.segmentStart = performance.now()
        this.status = 'running'
        this.cue('go')
        this.emitChange()
      }
      return
    }
    
    if (this.status !== 'running') return
    const left = this.remaining()

    // 3-2-1 countdown cues, skipped for very short rests so cues don't pile up.
    const wholeSeconds = Math.ceil(left)
    const wantsCountdown = step.kind === 'prepare' || step.duration >= 8
    if (wantsCountdown && wholeSeconds >= 1 && wholeSeconds <= 3 && wholeSeconds < this.lastCountdownSecond) {
      this.lastCountdownSecond = wholeSeconds
      this.cue('tick')
    }

    // Halfway side switch for bilateral work.
    if (step.kind === 'work' && step.bilateral && !this.hasSwitchedSides && left <= step.duration / 2) {
      this.hasSwitchedSides = true
      this.cue('switchSides')
      
      if (this.plan.switchSidesSeconds > 0) {
        this.frozenRemaining = left
        this.commitSegment()
        this.stepEndTime = performance.now() + this.plan.switchSidesSeconds * 1000
        this.status = 'switchingSides'
      }
      
      this.emitChange()
      return
    }

    if (left <= 0) this.completeCurrentStep()
  }

  private completeCurrentStep() {
    const step = this.currentStep
    if (!step) return
    this.commitSegment()
    if (step.kind === 'work' && this.plan.pauseBetweenSets && !this.isLastStep) {
      this.frozenRemaining = 0
      this.status = 'awaitingContinue'
      this.cue('rest')
      this.emitChange()
      return
    }
    if (this.isLastStep) this.finish()
    else this.enter(this.index + 1, true)
  }

  private enter(newIndex: number, autoplay: boolean) {
    this.commitSegment()
    this.index = newIndex
    this.hasSwitchedSides = false
    this.lastCountdownSecond = Number.POSITIVE_INFINITY
    const step = this.plan.steps[newIndex]
    this.frozenRemaining = step.duration
    if (autoplay) {
      this.stepEndTime = performance.now() + step.duration * 1000
      this.segmentStart = performance.now()
      this.status = 'running'
      if (step.kind === 'work') this.cue('go')
      else if (step.kind === 'rest') this.cue('rest')
    } else {
      this.status = 'paused'
    }
    this.emitChange()
  }

  private commitSegment() {
    const start = this.segmentStart
    this.segmentStart = null
    const step = this.currentStep
    if (start === null || !step) return
    const spent = Math.min((performance.now() - start) / 1000, step.duration)
    this.elapsedByStep.set(this.index, (this.elapsedByStep.get(this.index) ?? 0) + Math.max(0, spent))
  }

  private cue(cue: SoundCue) {
    if (this.plan.soundEnabled) audio.play(cue, this.plan.sound)
    if (this.plan.hapticsEnabled) haptic(CUE_HAPTICS[cue])
  }
}


