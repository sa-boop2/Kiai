import { useSyncExternalStore } from 'react'
import type { FlexibilityBenchmark, HowTo, Phase, WorkoutTemplate } from '../data/types'
import type { WorkoutPlan } from './plan'

export type Tab = 'home' | 'library' | 'analytics' | 'settings'
export const TABS: Tab[] = ['home', 'library', 'analytics', 'settings']

/** Screens pushed onto a tab's navigation stack. */
export type Route =
  | { name: 'kata'; id: string }
  | { name: 'art'; id: string }
  | { name: 'technique'; slug: string }
  | { name: 'workoutSettings' }
  | { name: 'audioSettings' }
  | { name: 'reminders' }
  | { name: 'appearance' }
  | { name: 'premadeWorkouts' }
  | { name: 'login' }
  | { name: 'flexibility' }
  | { name: 'privacy' }
  | { name: 'terms' }
  | { name: 'faq' }
  | { name: 'achievements' }
  | { name: 'streak' }

export type EditorMode =
  | { kind: 'create' }
  | { kind: 'edit'; id: string }
  | { kind: 'duplicate'; id: string }
  | { kind: 'template'; template: WorkoutTemplate }

/** Modal sheets (stackable). */
export type SheetRoute =
  | { name: 'exercise'; slug: string }
  | { name: 'howTo'; howTo: HowTo; tint?: string }
  | { name: 'editor'; mode: EditorMode }
  | { name: 'picker'; phase: Phase; onAdd: (slugs: string[]) => void }
  | { name: 'quickStats' }
  | { name: 'day'; day: number }
  | { name: 'artLearnMore'; artId: string }
  | { name: 'logFlexibility'; benchmark: FlexibilityBenchmark }
  | { name: 'customExercise'; onSave?: (slug: string, duration?: number) => void }

export interface Entry<R> {
  key: number
  route: R
}

export interface NavState {
  tab: Tab
  stacks: Record<Tab, Entry<Route>[]>
  sheets: Entry<SheetRoute>[]
  plan: WorkoutPlan | null
}

/**
 * App navigation: tab selection, a stack per tab, a sheet stack and the full-screen player.
 * Pushes and presentations add browser history entries, so the browser/Android back button and
 * `history.back()` pop the top layer just like the iOS back gesture.
 */
class NavStore {
  state: NavState = {
    tab: 'home',
    stacks: { home: [], library: [], analytics: [], settings: [] },
    sheets: [],
    plan: null,
  }
  private listeners = new Set<() => void>()
  private nextKey = 1
  private depth = 0

  constructor() {
    if (typeof window === 'undefined') return
    window.addEventListener('popstate', this.onPopState)
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.state.sheets.length > 0) this.back()
    })
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getState = () => this.state

  private set(patch: Partial<NavState>) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((listener) => listener())
  }

  tabHistory: Tab[] = []

  private pushHistory() {
    this.depth++
    history.pushState({ kiai: this.depth }, '')
  }

  // Tabs -----------------------------------------------------------------------------------------

  setTab(tab: Tab, recordHistory = true) {
    if (tab === this.state.tab) {
      // Re-tapping the active tab pops to its root, as on iOS.
      if (this.state.stacks[tab].length > 0) this.set({ stacks: { ...this.state.stacks, [tab]: [] } })
      return
    }
    if (recordHistory) {
      this.tabHistory.push(this.state.tab)
      this.pushHistory()
    }
    this.set({ tab })
  }

  hasTabHistory(): boolean {
    return this.tabHistory.length > 0
  }

  // Stack ----------------------------------------------------------------------------------------

  push(route: Route) {
    const tab = this.state.tab
    const entry = { key: this.nextKey++, route }
    this.set({ stacks: { ...this.state.stacks, [tab]: [...this.state.stacks[tab], entry] } })
    this.pushHistory()
  }

  // Sheets ---------------------------------------------------------------------------------------

  present(route: SheetRoute) {
    this.set({ sheets: [...this.state.sheets, { key: this.nextKey++, route }] })
    this.pushHistory()
  }

  private isHandlingBack = false

  /** Pops the top-most sheet or pushed screen synchronously to prevent transition glitching. */
  back() {
    // A workout in progress is locked in — every exit path (gesture, hardware back, sheet close)
    // routes through the player's own confirm-and-pause flow instead of silently popping underneath it.
    if (this.state.plan) {
      window.dispatchEvent(new CustomEvent('kiai:request-quit'))
      return
    }
    this.popLayer()
    if (this.depth > 0) {
      this.depth--
      this.isHandlingBack = true
      history.back()
    }
  }

  private onPopState = () => {
    if (this.isHandlingBack) {
      this.isHandlingBack = false
      return
    }
    if (this.depth > 0) this.depth--
    if (this.state.plan) {
      // Never silently leave a workout: ask the player to confirm instead.
      this.pushHistory()
      window.dispatchEvent(new CustomEvent('kiai:request-quit'))
      return
    }
    this.popLayer()
  }

  private popLayer() {
    if (this.state.sheets.length > 0) {
      this.set({ sheets: this.state.sheets.slice(0, -1) })
      return
    }
    const tab = this.state.tab
    const stack = this.state.stacks[tab]
    if (stack.length > 0) {
      this.set({ stacks: { ...this.state.stacks, [tab]: stack.slice(0, -1) } })
      return
    }
    // If at root of tab and previous tab history exists, smoothly return to it
    if (this.tabHistory.length > 0) {
      const prevTab = this.tabHistory.pop()!
      this.set({ tab: prevTab })
    }
  }

  /** Closes every sheet (e.g. before starting a workout). */
  dismissAllSheets() {
    if (this.state.sheets.length === 0) return
    this.set({ sheets: [] })
  }

  // Player ---------------------------------------------------------------------------------------

  startPlan(plan: WorkoutPlan) {
    if (plan.steps.length === 0) return
    this.set({ plan, sheets: [] })
  }

  closePlan() {
    this.set({ plan: null })
  }
}

export const nav = new NavStore()

export function useNav(): NavState {
  return useSyncExternalStore(nav.subscribe, nav.getState, nav.getState)
}
