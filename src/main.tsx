import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/screens.css'

// Lets CSS :active press states fire on iOS Safari.
document.addEventListener('touchstart', () => {}, { passive: true })

// Disable pinch-to-zoom and double-tap-to-zoom for native app feel
document.addEventListener('gesturestart', (e) => e.preventDefault())
document.addEventListener('gesturechange', (e) => e.preventDefault())
document.addEventListener('gestureend', (e) => e.preventDefault())

let lastTouchEnd = 0
document.addEventListener(
  'touchend',
  (e) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      e.preventDefault()
    }
    lastTouchEnd = now
  },
  false
)

// Mark standalone (Home Screen) launches, e.g. for layout tweaks.
const standalone =
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
if (standalone) document.documentElement.dataset.standalone = 'true'

createRoot(document.getElementById('root')!).render(<App />)

// Offline support: register the generated service worker in production builds only.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        // Immediately query the server to see if a newer sw.js exists
        registration.update().catch(() => {})

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'activated' && navigator.serviceWorker.controller) {
              window.location.reload()
            }
          })
        })
      })
      .catch((error) => console.warn('Kiai: service worker registration failed', error))
  })

  // When user returns to the app from background, check for updates
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.getRegistration().then((reg) => reg?.update().catch(() => {}))
    }
  })
}

