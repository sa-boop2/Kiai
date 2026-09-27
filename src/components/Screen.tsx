import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { haptic } from '../lib/haptics'
import { nav } from '../lib/nav'
import { Icon } from './Icon'

/** Tab bar stays static and stable to eliminate scroll animation glitching. */
export function resetTabbar() {
  delete document.body.dataset.tabbar
}

interface ScreenProps {
  title: string
  children: ReactNode
  /** Root screens show an iOS large title that collapses into the nav bar. */
  largeTitle?: boolean
  /** Pushed screens show a glass back button. */
  back?: boolean
  leading?: ReactNode
  trailing?: ReactNode
  /** Content rendered directly under the large title (e.g. a search field). */
  header?: ReactNode
  /** Sticky bottom call-to-action. */
  bottomBar?: ReactNode
  /** Hide the whole nav bar (Home draws its own header). */
  hideNavBar?: boolean
  contentClassName?: string
}

export function Screen({ title, children, largeTitle, back, leading, trailing, header, bottomBar, hideNavBar, contentClassName }: ScreenProps) {
  const navbarRef = useRef<HTMLElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const onScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const top = event.currentTarget.scrollTop
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const threshold = largeTitle ? 44 : 12
        navbarRef.current?.style.setProperty('--collapse', String(Math.min(Math.max(top / threshold, 0), 1)))
      })
    },
    [largeTitle]
  )

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // Interactive iOS swipe-down to dismiss for pushed screens
  useEffect(() => {
    if (!back) return
    const screen = screenRef.current
    const scrollEl = scrollRef.current
    if (!screen || !scrollEl) return

    let startY = 0
    let startX = 0
    let lastY = 0
    let lastT = 0
    let velocity = 0
    let dragging = false
    let tracking = false
    let fromGrabber = false

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null
      fromGrabber = Boolean(target?.closest('.screen-grabber-zone, .navbar'))
      if (target?.closest('input, textarea, select, button, [role="switch"], .no-sheet-drag') && !fromGrabber) return

      const atTop = scrollEl.scrollTop <= 0
      if (!fromGrabber && !atTop) return

      tracking = true
      startY = lastY = e.touches[0].clientY
      startX = e.touches[0].clientX
      lastT = performance.now()
      velocity = 0
      dragging = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return
      const y = e.touches[0].clientY
      const x = e.touches[0].clientX
      const dy = y - startY
      const dx = x - startX

      if (!dragging) {
        if (dy < 6) {
          if (dy < -4 || Math.abs(dx) > Math.abs(dy)) tracking = false
          return
        }
        if (Math.abs(dx) > dy) {
          tracking = false
          return
        }
        dragging = true
        screen.classList.add('screen-dragging')
      }

      if (e.cancelable) e.preventDefault()
      const now = performance.now()
      velocity = (y - lastY) / Math.max(1, now - lastT)
      lastY = y
      lastT = now

      const offset = Math.max(0, dy)
      const scale = Math.max(0.92, 1 - offset * 0.0002)
      screen.style.transform = `translate3d(0, ${offset}px, 0) scale(${scale})`
      screen.style.borderRadius = `${Math.min(24, offset * 0.2)}px`
    }

    const onTouchEnd = () => {
      if (!tracking) return
      tracking = false
      if (!dragging) return
      dragging = false
      screen.classList.remove('screen-dragging')

      const offset = lastY - startY
      if (offset > 120 || velocity > 0.5) {
        haptic('light')
        screen.style.transition = 'transform 260ms cubic-bezier(0.2, 0.8, 0.25, 1), border-radius 260ms ease, opacity 260ms ease'
        screen.style.transform = 'translate3d(0, 105%, 0) scale(0.9)'
        screen.style.opacity = '0.5'
        window.setTimeout(() => {
          resetTabbar()
          nav.back()
        }, 260)
      } else {
        screen.style.transition = 'transform 240ms cubic-bezier(0.25, 1, 0.5, 1), border-radius 240ms ease, opacity 240ms ease'
        screen.style.transform = ''
        screen.style.borderRadius = ''
        screen.style.opacity = ''
        window.setTimeout(() => {
          if (screen) screen.style.transition = ''
        }, 250)
      }
    }

    screen.addEventListener('touchstart', onTouchStart, { passive: true })
    screen.addEventListener('touchmove', onTouchMove, { passive: false })
    screen.addEventListener('touchend', onTouchEnd)
    screen.addEventListener('touchcancel', onTouchEnd)

    return () => {
      screen.removeEventListener('touchstart', onTouchStart)
      screen.removeEventListener('touchmove', onTouchMove)
      screen.removeEventListener('touchend', onTouchEnd)
      screen.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [back])

  return (
    <div className={`screen ${back ? 'pushed-screen' : ''}`} ref={screenRef}>
      {back && (
        <div className="screen-grabber-zone" aria-hidden="true">
          <span className="screen-grabber" />
        </div>
      )}
      <div className={`screen-scroll ${bottomBar ? 'has-bottom-bar' : ''}`} ref={scrollRef} onScroll={onScroll}>
        {largeTitle && !hideNavBar && <h1 className="large-title">{title}</h1>}
        {header}
        <div className={`screen-content ${contentClassName ?? ''}`}>{children}</div>
      </div>
      {!hideNavBar && (
        <header className="navbar" ref={navbarRef} data-inline={!largeTitle}>
          <div className="navbar-bg" />
          <div className="navbar-inner">
            <div className="navbar-leading">
              {back ? (
                <button
                  type="button"
                  className="glass glass-icon-btn pressable nav-back"
                  style={{ width: 40, height: 40 }}
                  aria-label="Back"
                  onClick={() => {
                    haptic('light')
                    resetTabbar()
                    nav.back()
                  }}
                >
                  <Icon name="chevron.left" size={19} strokeWidth={2.6} />
                </button>
              ) : (
                leading
              )}
            </div>
            <div className="navbar-title">{title}</div>
            <div className="navbar-trailing">{trailing}</div>
          </div>
        </header>
      )}
      {bottomBar && <div className="screen-bottom-bar">{bottomBar}</div>}
    </div>
  )
}

/** Glass circular nav-bar button. */
export function NavIconButton({ icon, label, onClick, tinted }: { icon: string; label: string; onClick: () => void; tinted?: boolean }) {
  return (
    <button
      type="button"
      className={`glass navbar-action icon-only pressable ${tinted ? 'tinted' : ''}`}
      aria-label={label}
      title={label}
      onClick={() => {
        haptic('light')
        onClick()
      }}
    >
      <Icon name={icon} size={19} strokeWidth={2.4} />
    </button>
  )
}
