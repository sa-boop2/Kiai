import { useEffect, useState } from 'react'
import { KiaiLogo } from './ui'

/**
 * Smooth 60fps startup splash animation.
 * Features an elegant ensō mark pulse, soft brand glow, and seamless dissolve.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Hold splash for 900ms then trigger smooth 300ms exit dissolve
    const timer = window.setTimeout(() => setLeaving(true), 900)
    const doneTimer = window.setTimeout(() => onComplete(), 1250)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`splash-overlay ${leaving ? 'splash-leaving' : ''}`}
      onClick={() => {
        setLeaving(true)
        window.setTimeout(onComplete, 320)
      }}
      aria-hidden="true"
    >
      <div className="splash-content">
        <div className="splash-logo-wrap">
          <div className="splash-halo" />
          <KiaiLogo size={72} />
        </div>
        <p className="splash-subtitle">Martial Mobility</p>
      </div>
    </div>
  )
}
