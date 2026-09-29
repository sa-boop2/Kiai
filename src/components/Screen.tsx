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
  titleTrailing?: ReactNode
  /** Content rendered directly under the large title (e.g. a search field). */
  header?: ReactNode
  /** Sticky bottom call-to-action. */
  bottomBar?: ReactNode
  /** Hide the whole nav bar (Home draws its own header). */
  hideNavBar?: boolean
  contentClassName?: string
}

export function Screen({ title, children, largeTitle, back, leading, trailing, titleTrailing, header, bottomBar, hideNavBar, contentClassName }: ScreenProps) {
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

  // iOS-style 60fps edge-swipe-right to go back for pushed screens.
  // Uses requestAnimationFrame-batched rAF transform writes — never misses a frame.
  useEffect(() => {
    if (!back) return
    const screen = screenRef.current
    if (!screen) return

    // State — all primitives, zero allocations in the hot path
    let startX = 0
    let startY = 0
    let curX = 0
    let lastX = 0
    let lastT = 0
    let velocityX = 0        // px/ms, exponentially smoothed
    let tracking = false
    let dragging = false
    let rafId = 0
    let dismissed = false

    // Commit transform on the compositor thread via rAF — this is the key to 60fps
    const commitTransform = () => {
      if (!dragging) return
      const offset = Math.max(0, curX - startX)
      screen.style.transform = `translate3d(${offset}px, 0, 0)`
    }

    const scheduleRaf = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(commitTransform)
    }

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch.clientX > 44) return   // only from left edge
      tracking = true
      dragging = false
      dismissed = false
      startX = lastX = curX = touch.clientX
      startY = touch.clientY
      lastT = performance.now()
      velocityX = 0
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || dismissed) return
      const touch = e.touches[0]
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY

      if (!dragging) {
        if (Math.abs(dx) < 4) return
        // Bail if gesture is more vertical than horizontal
        if (Math.abs(dy) > Math.abs(dx) * 0.9) {
          tracking = false
          return
        }
        dragging = true
        screen.classList.add('screen-dragging')
        // Stamp initial shadow once — cheap, not per-frame
        screen.style.boxShadow = '-8px 0 24px rgba(0,0,0,0.28)'
      }

      if (e.cancelable) e.preventDefault()

      // Exponentially-smoothed velocity (α=0.25) for reliable flick detection
      const now = performance.now()
      const dt = Math.max(1, now - lastT)
      const rawV = (touch.clientX - lastX) / dt
      velocityX = velocityX * 0.75 + rawV * 0.25
      lastX = touch.clientX
      lastT = now
      curX = touch.clientX

      scheduleRaf()
    }

    const dismiss = () => {
      dismissed = true
      dragging = false
      tracking = false
      screen.classList.remove('screen-dragging')
      cancelAnimationFrame(rafId)
      haptic('light')
      // Spring-out: fast deceleration matching iOS interruptible spring
      screen.style.transition = 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 320ms ease'
      screen.style.transform = 'translate3d(100%, 0, 0)'
      screen.style.boxShadow = ''
      window.setTimeout(() => {
        resetTabbar()
        nav.back()
        // Clean up inline styles after navigation
        screen.style.transform = ''
        screen.style.transition = ''
      }, 320)
    }

    const snapBack = () => {
      dragging = false
      tracking = false
      screen.classList.remove('screen-dragging')
      cancelAnimationFrame(rafId)
      screen.style.transition = 'transform 280ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 280ms ease'
      screen.style.transform = 'translate3d(0, 0, 0)'
      screen.style.boxShadow = ''
      window.setTimeout(() => {
        if (!dismissed) {
          screen.style.transition = ''
          screen.style.transform = ''
        }
      }, 280)
    }

    const onTouchEnd = () => {
      if (!tracking) return
      if (!dragging) {
        tracking = false
        return
      }
      tracking = false
      const offset = curX - startX
      // Dismiss threshold: dragged > 35% screen width OR fast flick (>0.4 px/ms)
      const shouldDismiss = offset > window.innerWidth * 0.35 || (offset > 20 && velocityX > 0.4)
      shouldDismiss ? dismiss() : snapBack()
    }

    screen.addEventListener('touchstart', onTouchStart, { passive: true })
    screen.addEventListener('touchmove', onTouchMove, { passive: false })
    screen.addEventListener('touchend', onTouchEnd)
    screen.addEventListener('touchcancel', onTouchEnd)
    return () => {
      cancelAnimationFrame(rafId)
      screen.removeEventListener('touchstart', onTouchStart)
      screen.removeEventListener('touchmove', onTouchMove)
      screen.removeEventListener('touchend', onTouchEnd)
      screen.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [back])

  return (
    <div className={`screen ${back ? 'pushed-screen' : ''}`} ref={screenRef}>

      <div className={`screen-scroll ${largeTitle ? 'has-large-title' : ''} ${bottomBar ? 'has-bottom-bar' : ''}`} ref={scrollRef} onScroll={onScroll}>
        {largeTitle && !hideNavBar && (
          <div className="large-title-row">
            <h1 className="large-title">{title}</h1>
            {titleTrailing && <div className="large-title-trailing">{titleTrailing}</div>}
          </div>
        )}
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


