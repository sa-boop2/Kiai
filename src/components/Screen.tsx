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

  // Native iOS edge swipe-right to go back for pushed screens
  useEffect(() => {
    if (!back) return
    const screen = screenRef.current
    if (!screen) return

    let startX = 0
    let startY = 0
    let lastX = 0
    let lastT = 0
    let velocity = 0
    let dragging = false
    let tracking = false

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      // Only track if gesture begins near left edge (< 40px), authentic to iOS navigation
      if (touch.clientX > 40) return
      tracking = true
      startX = lastX = touch.clientX
      startY = touch.clientY
      lastT = performance.now()
      velocity = 0
      dragging = false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return
      const touch = e.touches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (!dragging) {
        if (dx < 6) return
        // Ignore if gesture is mostly vertical scroll
        if (Math.abs(dy) > dx * 0.75) {
          tracking = false
          return
        }
        dragging = true
        screen.classList.add('screen-dragging')
      }

      if (e.cancelable) e.preventDefault()
      const now = performance.now()
      velocity = (touch.clientX - lastX) / Math.max(1, now - lastT)
      lastX = touch.clientX
      lastT = now

      const offset = Math.max(0, dx)
      screen.style.transform = `translate3d(${offset}px, 0, 0)`
      screen.style.boxShadow = '-10px 0 30px rgba(0, 0, 0, 0.35)'
    }

    const onTouchEnd = () => {
      if (!tracking) return
      tracking = false
      if (!dragging) return
      dragging = false
      screen.classList.remove('screen-dragging')

      const offset = lastX - startX
      const shouldDismiss = offset > 100 || (offset > 30 && velocity > 0.35)
      if (shouldDismiss) {
        haptic('light')
        screen.style.transition = 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1)'
        screen.style.transform = 'translate3d(100%, 0, 0)'
        window.setTimeout(() => {
          resetTabbar()
          nav.back()
          screen.style.transform = ''
          screen.style.boxShadow = ''
          screen.style.transition = ''
        }, 240)
      } else {
        screen.style.transition = 'transform 220ms cubic-bezier(0.32, 0.72, 0, 1)'
        screen.style.transform = ''
        screen.style.boxShadow = ''
        window.setTimeout(() => {
          if (screen) screen.style.transition = ''
        }, 220)
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


