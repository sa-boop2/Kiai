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

  return (
    <div className="screen">
      <div className={`screen-scroll ${bottomBar ? 'has-bottom-bar' : ''}`} onScroll={onScroll}>
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
