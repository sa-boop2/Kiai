import { useSyncExternalStore } from 'react'
import { Icon } from './Icon'

interface ToastItem {
  id: number
  message: string
  icon?: string
  actionLabel?: string
  action?: () => void
  leaving?: boolean
}

let items: ToastItem[] = []
let counter = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

/** Shows a small glass toast at the top of the screen. */
export function toast(message: string, options: { icon?: string; actionLabel?: string; action?: () => void; duration?: number } = {}) {
  const id = ++counter
  items = [...items.filter((i) => !i.leaving).slice(-1), { id, message, icon: options.icon, actionLabel: options.actionLabel, action: options.action }]
  emit()
  window.setTimeout(() => {
    items = items.map((i) => (i.id === id ? { ...i, leaving: true } : i))
    emit()
    window.setTimeout(() => {
      items = items.filter((i) => i.id !== id)
      emit()
    }, 280)
  }, options.duration ?? 2600)
}

export function ToastHost() {
  const current = useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => items
  )
  const top = current[current.length - 1]
  return (
    <div className="toast-host" aria-live="polite">
      {top && (
        <div key={top.id} className={`toast glass ${top.leaving ? 'leaving' : ''}`}>
          {top.icon && <Icon name={top.icon} size={17} style={{ color: 'var(--ember)' }} />}
          <span>{top.message}</span>
          {top.actionLabel && (
            <button type="button" className="text-btn" onClick={top.action}>
              {top.actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
