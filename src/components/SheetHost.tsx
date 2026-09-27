import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { haptic } from '../lib/haptics'
import { type Entry, type SheetRoute, nav, useNav } from '../lib/nav'
import { Icon } from './Icon'

type Phase = 'enter' | 'idle' | 'exit'
interface Rendered {
  key: number
  route: SheetRoute
  phase: Phase
}

const instantExits = new Set<number>()

/** Renders the sheet stack with enter/exit animations. */
export function SheetHost({ renderSheet }: { renderSheet: (route: SheetRoute) => { content: ReactNode; size?: 'large' | 'medium' } }) {
  const { sheets } = useNav()
  const [rendered, setRendered] = useState<Rendered[]>([])

  useLayoutEffect(() => {
    setRendered((previous) => {
      const live = new Set(sheets.map((s: Entry<SheetRoute>) => s.key))
      const known = new Set(previous.map((s) => s.key))
      const next: Rendered[] = []
      for (const item of previous) {
        if (live.has(item.key)) next.push(item)
        else if (instantExits.has(item.key)) instantExits.delete(item.key)
        else next.push({ ...item, phase: 'exit' })
      }
      for (const sheet of sheets) if (!known.has(sheet.key)) next.push({ key: sheet.key, route: sheet.route, phase: 'enter' })
      return next.sort((a, b) => a.key - b.key)
    })
  }, [sheets])

  // Safety net: if animationend never fires (tab backgrounded mid-dismiss), remove exited sheets anyway.
  useEffect(() => {
    if (!rendered.some((item) => item.phase === 'exit')) return
    const timer = window.setTimeout(() => setRendered((previous) => previous.filter((item) => item.phase !== 'exit')), 700)
    return () => window.clearTimeout(timer)
  }, [rendered])

  const liveKeys = rendered.filter((r) => r.phase !== 'exit').map((r) => r.key)

  return (
    <>
      {rendered.map((item) => {
        const { content, size = 'large' } = renderSheet(item.route)
        return (
          <SheetFrame
            key={item.key}
            entryKey={item.key}
            phase={item.phase}
            size={size}
            under={item.phase !== 'exit' && liveKeys.indexOf(item.key) < liveKeys.length - 1}
            onExited={() => setRendered((previous) => previous.filter((r) => r.key !== item.key))}
          >
            {content}
          </SheetFrame>
        )
      })}
    </>
  )
}

function SheetFrame({
  entryKey, phase, size, under, children, onExited,
}: { entryKey: number; phase: Phase; size: 'large' | 'medium'; under: boolean; children: ReactNode; onExited: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Drag to dismiss: from the grabber (mouse/touch) or from content that is scrolled to the top (touch).
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    let startY = 0
    let lastY = 0
    let lastT = 0
    let velocity = 0
    let dragging = false
    let startX = 0
    let tracking = false
    let fromGrabber = false

    const scrollerAtTop = (target: EventTarget | null) => {
      const scroller = (target as HTMLElement | null)?.closest?.('.sheet-scroll') as HTMLElement | null
      return !scroller || scroller.scrollTop <= 0
    }

    const begin = (x: number, y: number, target: EventTarget | null) => {
      fromGrabber = Boolean((target as HTMLElement | null)?.closest?.('.sheet-grabber-zone, .sheet-header'))
      if ((target as HTMLElement | null)?.closest?.('input, textarea, select, button, [role="switch"], .no-sheet-drag') && !fromGrabber) return
      tracking = fromGrabber || scrollerAtTop(target)
      startY = lastY = y
      startX = x
      lastT = performance.now()
      velocity = 0
      dragging = false
    }

    const move = (x: number, y: number, event: Event) => {
      if (!tracking) return
      const dy = y - startY
      const dx = x - startX
      if (!dragging) {
        if (dy < 6) {
          if (dy < -6 || Math.abs(dx) > Math.abs(dy)) tracking = false
          return
        }
        if (Math.abs(dx) > dy) {
          tracking = false
          return
        }
        dragging = true
        sheet.classList.add('dragging')
      }
      if (event.cancelable) event.preventDefault()
      const now = performance.now()
      velocity = (y - lastY) / Math.max(1, now - lastT)
      lastY = y
      lastT = now
      // Downward offset or subtle upward rubber-banding
      const offset = dy >= 0 ? dy : dy * 0.2
      const desktop = window.matchMedia('(min-width: 900px)').matches
      sheet.style.transform = desktop ? `translate3d(-50%, calc(-50% + ${offset}px), 0)` : `translate3d(0, ${offset}px, 0)`
      if (backdropRef.current) backdropRef.current.style.opacity = String(Math.max(0, 1 - Math.max(0, offset) / (sheet.offsetHeight * 0.85)))
    }

    const end = () => {
      if (!tracking) return
      tracking = false
      if (!dragging) return
      dragging = false
      sheet.classList.remove('dragging')
      const offset = lastY - startY
      if (offset > Math.min(120, sheet.offsetHeight * 0.25) || velocity > 0.45) {
        haptic('light')
        const desktop = window.matchMedia('(min-width: 900px)').matches
        sheet.style.transition = 'transform 250ms cubic-bezier(0.2, 0.8, 0.25, 1)'
        sheet.style.transform = desktop ? 'translate3d(-50%, 65vh, 0)' : 'translate3d(0, 105%, 0)'
        if (backdropRef.current) {
          backdropRef.current.style.transition = 'opacity 240ms ease'
          backdropRef.current.style.opacity = '0'
        }
        window.setTimeout(() => {
          instantExits.add(entryKey)
          nav.back()
        }, 240)
      } else {
        sheet.style.transition = 'transform 220ms cubic-bezier(0.25, 1, 0.5, 1)'
        sheet.style.transform = ''
        if (backdropRef.current) backdropRef.current.style.opacity = ''
        window.setTimeout(() => {
          if (sheet) sheet.style.transition = ''
        }, 230)
      }
    }

    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientX, e.touches[0].clientY, e.target)
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY, e)
    const onMouseDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.sheet-grabber-zone, .sheet-header')) return
      begin(e.clientX, e.clientY, e.target)
      const onMove = (ev: MouseEvent) => move(ev.clientX, ev.clientY, ev)
      const onUp = () => {
        end()
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    sheet.addEventListener('touchstart', onTouchStart, { passive: true })
    sheet.addEventListener('touchmove', onTouchMove, { passive: false })
    sheet.addEventListener('touchend', end)
    sheet.addEventListener('touchcancel', end)
    sheet.addEventListener('mousedown', onMouseDown)
    return () => {
      sheet.removeEventListener('touchstart', onTouchStart)
      sheet.removeEventListener('touchmove', onTouchMove)
      sheet.removeEventListener('touchend', end)
      sheet.removeEventListener('touchcancel', end)
      sheet.removeEventListener('mousedown', onMouseDown)
    }
  }, [entryKey])

  return (
    <div className="sheet-layer" data-phase={phase} data-under={under}>
      <div ref={backdropRef} className="sheet-backdrop" onClick={() => phase !== 'exit' && nav.back()} />
      <div
        ref={sheetRef}
        className="sheet"
        data-size={size}
        role="dialog"
        aria-modal="true"
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && phase === 'exit') onExited()
        }}
      >
        <div className="sheet-grabber-zone" aria-hidden="true">
          <span className="sheet-grabber" />
        </div>
        {children}
      </div>
    </div>
  )
}

/** Standard sheet header: optional leading/trailing actions and a centred title. */
export function SheetHeader({ title, leading, trailing, close = true }: { title?: string; leading?: ReactNode; trailing?: ReactNode; close?: boolean }) {
  return (
    <div className="sheet-header">
      <div className="navbar-leading">{leading}</div>
      <div className="navbar-title">{title}</div>
      <div className="navbar-trailing">
        {trailing}
        {close && !trailing && (
          <button
            type="button"
            className="glass glass-icon-btn pressable"
            style={{ width: 36, height: 36 }}
            aria-label="Close"
            onClick={() => {
              haptic('light')
              nav.back()
            }}
          >
            <Icon name="xmark" size={16} strokeWidth={2.8} />
          </button>
        )}
      </div>
    </div>
  )
}
