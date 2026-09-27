import { type ReactNode, useEffect, useLayoutEffect, useState } from 'react'
import { type Entry, type Route, type Tab, useNav } from '../lib/nav'

type Phase = 'enter' | 'idle' | 'exit'
interface Rendered {
  key: number
  route: Route
  phase: Phase
}

function reconcile(previous: Rendered[], stack: Entry<Route>[]): Rendered[] {
  const live = new Set(stack.map((e) => e.key))
  const known = new Set(previous.map((e) => e.key))
  const next: Rendered[] = []
  for (const item of previous) {
    if (live.has(item.key)) next.push(item.phase === 'exit' ? { ...item, phase: 'idle' } : item)
    else next.push(item.phase === 'exit' ? item : { ...item, phase: 'exit' })
  }
  for (const entry of stack) if (!known.has(entry.key)) next.push({ key: entry.key, route: entry.route, phase: 'enter' })
  return next.sort((a, b) => a.key - b.key)
}

/**
 * A tab's navigation stack with iOS push/pop transitions, driven entirely by CSS keyframes
 * (see `push-in`/`pop-out` in base.css). Screens are only dismissed via an explicit back
 * button or the sheet/screen swipe-DOWN-to-dismiss gesture — there is no edge swipe-back,
 * so a screen can never be left half-transitioned by an interrupted horizontal drag.
 */
export function StackView({ tab, root, renderRoute }: { tab: Tab; root: ReactNode; renderRoute: (route: Route) => ReactNode }) {
  const stack = useNav().stacks[tab]
  const [rendered, setRendered] = useState<Rendered[]>(() => stack.map((e) => ({ key: e.key, route: e.route, phase: 'idle' })))

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

  return (
    <div className="stack">
      <div
        className="stack-layer"
        data-covered={liveKeys.length > 0}
        data-hidden={liveKeys.length > 1}
        aria-hidden={liveKeys.length > 0}
      >
        {root}
      </div>
      {rendered.map((item) => {
        const liveIndex = liveKeys.indexOf(item.key)
        const covered = item.phase !== 'exit' && liveIndex < liveKeys.length - 1
        return (
          <div
            key={item.key}
            className="stack-layer"
            data-phase={item.phase}
            data-covered={covered}
            data-hidden={covered && liveIndex < liveKeys.length - 2}
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
