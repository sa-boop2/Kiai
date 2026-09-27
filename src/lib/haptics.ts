import { getState } from './store'

export type HapticKind = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'soft'

const PATTERNS: Record<HapticKind, number | number[]> = {
  selection: 8,
  light: 10,
  soft: 12,
  medium: 18,
  heavy: 28,
  success: [14, 60, 22],
}

let iosSwitch: HTMLLabelElement | null = null

/**
 * Best-effort haptics.
 * - Android/Chrome: Vibration API.
 * - iPhone Safari 18+: toggling a hidden `<input type="checkbox" switch>` produces a system haptic
 *   tick (only inside a user gesture — timer-driven cues fall back to silence on iOS).
 */
export function haptic(kind: HapticKind = 'light') {
  if (!getState().settings.hapticsEnabled) return
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(PATTERNS[kind])
      return
    }
    if (!iosSwitch) {
      iosSwitch = document.createElement('label')
      iosSwitch.setAttribute('aria-hidden', 'true')
      iosSwitch.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none'
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.setAttribute('switch', '')
      input.tabIndex = -1
      iosSwitch.appendChild(input)
      document.body.appendChild(iosSwitch)
    }
    iosSwitch.click()
  } catch {
    /* haptics are optional */
  }
}
