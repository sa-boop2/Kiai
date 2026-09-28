import { type CSSProperties, useRef } from 'react'
import { haptic } from '../lib/haptics'
import { useI18n } from '../lib/i18n'
import { TABS, type Tab, nav, useNav } from '../lib/nav'
import { Icon } from './Icon'
import { resetTabbar } from './Screen'
import { KiaiLogo } from './ui'

const ITEMS: Record<Tab, { icon: string; label: string }> = {
  home: { icon: 'house.fill', label: 'Home' },
  martialArts: { icon: 'figure.martial.arts', label: 'Martial Arts' },
  library: { icon: 'books.vertical.fill', label: 'Library' },
  analytics: { icon: 'chart.bar.xaxis', label: 'Stats' },
  settings: { icon: 'gearshape.fill', label: 'Settings' },
}

/**
 * iOS 26-style floating Liquid Glass tab bar. Press and drag across it and the glass lens follows
 * your finger, snapping to the tab you release on. On wide screens it becomes a sidebar.
 */
export function TabBar() {
  const { tab } = useNav()
  const { t } = useI18n()
  const barRef = useRef<HTMLElement>(null)
  const lensRef = useRef<HTMLSpanElement>(null)
  const drag = useRef<{ id: number; moved: boolean; startX: number; startY: number; index: number } | null>(null)
  const index = TABS.indexOf(tab)

  const select = (next: Tab) => {
    if (next !== tab) haptic('selection')
    resetTabbar()
    nav.setTab(next)
  }

  const vertical = () => window.matchMedia('(min-width: 900px)').matches

  const indexAt = (event: React.PointerEvent) => {
    const bar = barRef.current!
    const items = bar.querySelectorAll<HTMLElement>('.tabbar-item')
    let best = 0
    let bestDistance = Number.POSITIVE_INFINITY
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect()
      const center = vertical() ? rect.top + rect.height / 2 : rect.left + rect.width / 2
      const distance = Math.abs((vertical() ? event.clientY : event.clientX) - center)
      if (distance < bestDistance) {
        bestDistance = distance
        best = i
      }
    })
    return best
  }

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return
    drag.current = { id: event.pointerId, moved: false, startX: event.clientX, startY: event.clientY, index }
    barRef.current!.classList.add('pressing')
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== event.pointerId) return
    const distance = vertical() ? event.clientY - d.startY : event.clientX - d.startX
    if (!d.moved && Math.abs(distance) < 8) return
    if (!d.moved) {
      d.moved = true
      barRef.current!.setPointerCapture(event.pointerId)
      barRef.current!.classList.add('dragging')
    }
    const bar = barRef.current!.getBoundingClientRect()
    const lens = lensRef.current!
    const lensRect = lens.getBoundingClientRect()
    if (vertical()) {
      const pad = 5
      const maxOffset = bar.height - 84 - 2 * pad - lensRect.height
      const offset = Math.min(Math.max(event.clientY - bar.top - 84 - pad - lensRect.height / 2, 0), maxOffset)
      lens.style.transform = `translate3d(0,${offset}px,0)`
    } else {
      const pad = 5
      const maxOffset = bar.width - 2 * pad - lensRect.width
      const offset = Math.min(Math.max(event.clientX - bar.left - pad - lensRect.width / 2, 0), maxOffset)
      lens.style.transform = `translate3d(${offset}px,0,0)`
    }
    const hovered = indexAt(event)
    if (hovered !== d.index) {
      d.index = hovered
      haptic('selection')
    }
  }

  const finish = (event: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    const bar = barRef.current!
    bar.classList.remove('pressing', 'dragging')
    if (!d || d.id !== event.pointerId) return
    if (d.moved) {
      lensRef.current!.style.transform = ''
      select(TABS[indexAt(event)])
    }
  }

  return (
    <div className="tabbar-wrap">
      <nav
        ref={barRef}
        className="tabbar glass"
        aria-label="Main"
        style={{ '--index': index, '--count': TABS.length } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        <div className="tabbar-brand desktop-only">
          <KiaiLogo size={26} />
        </div>
        <span ref={lensRef} className="tabbar-lens" aria-hidden="true" />
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            className={`tabbar-item ${item === tab ? 'active' : ''}`}
            aria-current={item === tab ? 'page' : undefined}
            onClick={() => {
              // Pointer drags select in `finish`; plain taps and keyboard land here.
              select(item)
            }}
          >
            <Icon name={ITEMS[item].icon} size={24} strokeWidth={2.1} />
            <span className="tabbar-label">{t(ITEMS[item].label)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
