import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { haptic } from '../lib/haptics'
import { type Entry, type Route, type Tab, nav, useNav } from '../lib/nav'

type Phase = 'enter' | 'idle' | 'exit'
interface Rendered {
  key: number
  route: Route
  phase: Phase
}

/** Keys whose pop was completed by the swipe gesture — they skip the exit animation. */
const instantExits = new Set<number>()

function reconcile(previous: Rendered[], stack: Entry<Route>[]): Rendered[] {
  const live = new Set(stack.map((e) => e.key))
  const known = new Set(previous.map((e) => e.key))
  const next: Rendered[] = []
  for (const item of previous) {
    if (live.has(item.key)) next.push(item.phase === 'exit' ? { ...item, phase: 'idle' } : item)
    else if (!instantExits.has(item.key)) next.push(item.phase === 'exit' ? item : { ...item, phase: 'exit' })
    else instantExits.delete(item.key)
  }
  for (const entry of stack) if (!known.has(entry.key)) next.push({ key: entry.key, route: entry.route, phase: 'enter' })
  return next.sort((a, b) => a.key - b.key)
}

/**
 * A tab's navigation stack with iOS push/pop transitions and an interactive edge swipe-back.
 * Transitions run entirely on CSS transform so they are compositor-accelerated.
 *
 * Glitch-free swipe-back design:
 * - During a gesture, BOTH top and below layers get explicit inline transforms (no CSS rules apply).
 * - On commit, the top slides off and nav.back() fires synchronously.
 * - The `below` layer keeps its explicit `transform: translate3d(0,0,0)` via a `data-pinned` attribute
 *   and a matching CSS rule — this prevents the covered CSS rule (-28%) from snapping in between
 *   React reconciliation and the next animation frame.
 * - After the animation duration, we clear the pin from the now-uncovered layer.
 */
export function StackView({ tab, root, renderRoute }: { tab: Tab; root: ReactNode; renderRoute: (route: Route) => ReactNode }) {
  const stack = useNav().stacks[tab]
  const [rendered, setRendered] = useState<Rendered[]>(() => stack.map((e) => ({ key: e.key, route: e.route, phase: 'idle' })))
  const containerRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef(new Map<number, HTMLDivElement>())
  // Keys for layers that are temporarily pinned at 0 to avoid the -28% flash
  const pinnedKeys = useRef(new Set<number>())

  useLayoutEffect(() => {
    setRendered((previous) => reconcile(previous, stack))
  }, [stack])

  // Safety net: if animationend never fires (tab backgrounded mid-transition), settle anyway.
  useEffect(() => {
    if (!rendered.some((item) => item.phase !== 'idle')) return
    const timer = window.setTimeout(() => {
      setRendered((previous) => previous.filter((item) => item.phase !== 'exit').map((item) => (item.phase === 'enter' ? { ...item, phase: 'idle' } : item)))
    }, 900)
    return () => window.clearTimeout(timer)
  }, [rendered])

  const settle = (key: number, phase: Phase) => {
    setRendered((previous) =>
      phase === 'exit' ? previous.filter((item) => item.key !== key) : previous.map((item) => (item.key === key ? { ...item, phase: 'idle' } : item))
    )
  }

  // Layers that are still "on" the stack (not exiting); the root counts as index -1.
  const liveKeys = rendered.filter((r) => r.phase !== 'exit').map((r) => r.key)
  const topLiveKey = liveKeys[liveKeys.length - 1]

  // Swipe back ------------------------------------------------------------------------------------
  const gesture = useRef<{ id: number; startX: number; startY: number; lastX: number; lastT: number; velocity: number; active: boolean; width: number; belowKey: number } | null>(null)

  const layerElements = () => {
    const top = topLiveKey !== undefined ? layerRefs.current.get(topLiveKey) : undefined
    const belowKey = liveKeys.length >= 2 ? liveKeys[liveKeys.length - 2] : -1
    const below = layerRefs.current.get(belowKey)
    return { top, below, belowKey }
  }

  const onPointerDown = (event: React.PointerEvent) => {
    if (topLiveKey === undefined || event.button !== 0) return
    // Only respond to touches starting within 28px of the left edge
    const rect = containerRef.current!.getBoundingClientRect()
    if (event.clientX - rect.left > 28) return
    const { belowKey } = layerElements()
    gesture.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
      active: false,
      width: rect.width,
      belowKey,
    }
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const g = gesture.current
    if (!g || g.id !== event.pointerId) return
    const dx = event.clientX - g.startX
    const dy = event.clientY - g.startY

    if (!g.active) {
      // Cancel if predominantly vertical
      if (Math.abs(dy) > 8 || Math.abs(dy) > Math.abs(dx)) {
        gesture.current = null
        return
      }
      if (dx < 10) return
      g.active = true
      containerRef.current!.setPointerCapture(event.pointerId)
      containerRef.current!.classList.add('dragging')

      // Before moving, set explicit inline transforms so NO CSS rules fire during the gesture
      const { top, below } = layerElements()
      if (top) { top.style.transition = 'none'; top.style.transform = 'translate3d(0,0,0)' }
      if (below) { below.style.transition = 'none'; below.style.transform = `translate3d(${-g.width * 0.28}px,0,0)` }
    }

    const now = performance.now()
    g.velocity = (event.clientX - g.lastX) / Math.max(1, now - g.lastT)
    g.lastX = event.clientX
    g.lastT = now

    const x = Math.max(0, dx)
    const { top, below } = layerElements()
    if (top) top.style.transform = `translate3d(${x}px,0,0)`
    if (below) below.style.transform = `translate3d(${-g.width * 0.28 + x * 0.28}px,0,0)`
  }

  const onPointerUp = (event: React.PointerEvent) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.id !== event.pointerId) return
    const container = containerRef.current
    if (container) container.classList.remove('dragging')
    if (!g.active) return

    const dx = Math.max(0, event.clientX - g.startX)
    const commit = dx > g.width * 0.35 || (g.velocity > 0.45 && dx > 20)
    const { top, below } = layerElements()
    const duration = commit ? 300 : 380
    const easing = commit ? 'cubic-bezier(0.2, 0.8, 0.25, 1)' : 'var(--ease-snappy)'

    if (top) top.style.transition = `transform ${duration}ms ${easing}`
    if (below) below.style.transition = `transform ${duration}ms ${easing}`

    if (commit) {
      if (top) top.style.transform = `translate3d(${g.width}px,0,0)`
      // Pin the below layer at 0 before calling nav.back() so reconciliation
      // doesn't snap it to -28% between React render and next paint.
      if (below && g.belowKey !== undefined) {
        pinnedKeys.current.add(g.belowKey)
        below.dataset.pinned = 'true'
        below.style.transform = 'translate3d(0,0,0)'
      }
    } else {
      if (top) top.style.transform = 'translate3d(0,0,0)'
      if (below) below.style.transform = `translate3d(${-g.width * 0.28}px,0,0)`
    }

    window.setTimeout(() => {
      if (commit && topLiveKey !== undefined) {
        instantExits.add(topLiveKey)
        haptic('light')
        nav.back()
      }
      // Clear inline transforms so CSS takes over — but only after the animation completes
      requestAnimationFrame(() => {
        if (top) { top.style.transition = ''; top.style.transform = '' }
        if (below) {
          below.style.transition = ''
          // Only clear the below layer's inline transform if we're NOT committing
          // (on commit, nav.back() has fired and the layer is no longer covered,
          // so CSS will correctly render it at 0% rather than -28%)
          if (!commit) {
            below.style.transform = ''
          } else {
            // Keep the explicit 0 for one more frame, then let CSS take over
            // by that point React has removed data-covered="true"
            requestAnimationFrame(() => {
              if (below) {
                delete below.dataset.pinned
                pinnedKeys.current.delete(g.belowKey)
                below.style.transform = ''
              }
            })
          }
        }
      })
    }, duration)
  }

  const onPointerCancel = (event: React.PointerEvent) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.id !== event.pointerId) return
    const container = containerRef.current
    if (container) container.classList.remove('dragging')
    if (!g.active) return

    const { top, below } = layerElements()
    const duration = 280
    if (top) {
      top.style.transition = `transform ${duration}ms var(--ease-snappy)`
      top.style.transform = 'translate3d(0,0,0)'
    }
    if (below) {
      below.style.transition = `transform ${duration}ms var(--ease-snappy)`
      below.style.transform = `translate3d(${-g.width * 0.28}px,0,0)`
    }
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        if (top) { top.style.transition = ''; top.style.transform = '' }
        if (below) { below.style.transition = ''; below.style.transform = '' }
      })
    }, duration)
  }

  const setLayerRef = (key: number) => (element: HTMLDivElement | null) => {
    if (element) layerRefs.current.set(key, element)
    else layerRefs.current.delete(key)
  }

  return (
    <div
      className="stack"
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {(() => {
        const rootPinned = pinnedKeys.current.has(-1)
        return (
          <div
            className="stack-layer"
            ref={setLayerRef(-1)}
            data-covered={liveKeys.length > 0 && !rootPinned}
            data-pinned={rootPinned ? 'true' : undefined}
            data-hidden={liveKeys.length > 1 && !rootPinned}
            aria-hidden={liveKeys.length > 0}
          >
            {root}
          </div>
        )
      })()}
      {rendered.map((item) => {
        const liveIndex = liveKeys.indexOf(item.key)
        const covered = item.phase !== 'exit' && liveIndex < liveKeys.length - 1
        const pinned = pinnedKeys.current.has(item.key)
        return (
          <div
            key={item.key}
            className="stack-layer"
            ref={setLayerRef(item.key)}
            data-phase={item.phase}
            data-covered={covered && !pinned}
            data-pinned={pinned ? 'true' : undefined}
            data-hidden={covered && !pinned && liveIndex < liveKeys.length - 2}
            aria-hidden={covered}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && item.phase !== 'idle') settle(item.key, item.phase)
            }}
          >
            {renderRoute(item.route)}
          </div>
        )
      })}
    </div>
  )
}
