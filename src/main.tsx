import { createRoot } from 'react-dom/client'
import App from './App'
import { toast } from './components/Toast'
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
  window.addEventListener('load', () => {
    const hadController = Boolean(navigator.serviceWorker.controller)
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'activated' && hadController) {
              toast('Kiai was updated', { icon: 'sparkles', actionLabel: 'Reload', action: () => window.location.reload(), duration: 8000 })
            }
          })
        })
      })
      .catch((error) => console.warn('Kiai: service worker registration failed', error))
  })
}
