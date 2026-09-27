/** 75 -> "1:15", 3725 -> "1:02:05" */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

/** 45 -> "45s", 90 -> "1m 30s", 3900 -> "1h 5m" */
export function short(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  if (s < 60) return `${s}s`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`
}

/** 610 -> "10 min" */
export function minutes(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const rem = m % 60
    return rem === 0 ? `${h} h` : `${h} h ${rem} min`
  }
  return `${Math.max(m, totalSeconds > 0 ? 1 : 0)} min`
}

export function relativeDay(time: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffDays = Math.round((new Date(time).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  if (diffDays === 0) {
    const diffMinutes = Math.round((time - Date.now()) / 60_000)
    if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute')
    return rtf.format(Math.round(diffMinutes / 60), 'hour')
  }
  return rtf.format(diffDays, 'day')
}

export function timeOfDay(hour: number, minute: number, locale: string): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

export function displayName(name: string): string {
  return name.trim() || 'Fighter'
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max)
}

export function toKanjiTimer(totalSeconds: number): string {
  const KANJI = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?']
  
  const toK = (n: number) => {
    if (n < 10) return KANJI[n]
    if (n === 10) return '?'
    const tens = Math.floor(n / 10)
    const ones = n % 10
    return (tens > 1 ? KANJI[tens] : '') + '?' + (ones > 0 ? KANJI[ones] : '')
  }

  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  
  if (h > 0) {
    return `${toK(h)}:${toK(m)}:${toK(sec)}`
  }
  return `${toK(m)}:${toK(sec)}`
}
