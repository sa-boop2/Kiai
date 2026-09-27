import { useEffect, useSyncExternalStore } from 'react'
import { haptic } from '../lib/haptics'

export interface ActionOption {
  label: string
  role?: 'destructive' | 'default'
}

interface Request {
  id: number
  title: string
  message?: string
  actions: ActionOption[]
  cancelLabel: string
  resolve: (index: number | null) => void
  closing?: boolean
}

let current: Request | null = null
let counter = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** iOS-style confirmation dialog. Resolves with the chosen action index, or null for cancel. */
export function confirmAction(options: { title: string; message?: string; actions: ActionOption[]; cancelLabel?: string }): Promise<number | null> {
  current?.resolve(null)
  haptic('medium')
  return new Promise((resolve) => {
    current = { id: ++counter, cancelLabel: 'Cancel', ...options, resolve }
    emit()
  })
}

function close(index: number | null) {
  const request = current
  if (!request || request.closing) return
  current = { ...request, closing: true }
  emit()
  window.setTimeout(() => {
    if (current?.id === request.id) current = null
    emit()
    request.resolve(index)
  }, 220)
}

export function ActionSheetHost() {
  const request = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current
  )

  useEffect(() => {
    if (!request) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [request])

  if (!request) return null
  return (
    <div className={`action-sheet-layer ${request.closing ? 'closing' : ''}`} role="alertdialog" aria-modal="true" aria-label={request.title}>
      <div className="action-sheet-backdrop" onClick={() => close(null)} />
      <div className="action-sheet">
        <div className="action-sheet-group glass">
          <div className="action-sheet-header">
            <strong>{request.title}</strong>
            {request.message && <p>{request.message}</p>}
          </div>
          {request.actions.map((action, index) => (
            <button key={action.label} type="button" className={action.role === 'destructive' ? 'destructive' : ''} onClick={() => close(index)}>
              {action.label}
            </button>
          ))}
        </div>
        <button type="button" className="action-sheet-cancel glass" onClick={() => close(null)}>
          {request.cancelLabel}
        </button>
      </div>
    </div>
  )
}
