import type { Session, Settings as AppSettings } from '../data/types'
import { toast } from '../components/Toast'

/**
 * Smart reminder time: median start time of recent sessions minus 30 minutes, rounded to a quarter
 * hour (never before 06:00). Falls back to the fixed time until there are 3 sessions.
 * Identical to `ReminderService.smartTime` in the native app.
 */
export function smartTime(sessions: Session[], fallbackHour: number, fallbackMinute: number): { hour: number; minute: number } {
  const recent = [...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 20)
  const minutes = recent
    .map((s) => {
      const d = new Date(s.startedAt)
      return d.getHours() * 60 + d.getMinutes()
    })
    .sort((a, b) => a - b)
  if (minutes.length < 3) return { hour: fallbackHour, minute: fallbackMinute }
  const median = minutes[Math.floor(minutes.length / 2)]
  const reminder = Math.max(6 * 60, median - 30)
  const rounded = Math.floor(reminder / 15) * 15
  return { hour: Math.floor(rounded / 60), minute: rounded % 60 }
}

export const MESSAGES: Array<[string, string]> = [
  ['Your mat misses you', 'A few minutes of Kiai keeps the splits dream alive.'],
  ['Osu! Time to stretch', 'Your hamstrings asked us to send this. Politely.'],
  ['Streak check', 'Keep the fire going — one Kata is enough today.'],
  ['Stance up', "Deep stances aren't built on the couch."],
  ['Kick height loading…', 'Ten minutes now, higher kicks later.'],
  ['The dojo is open', 'Warm-up, stretch, breathe. You know the drill.'],
  ['Future you says thanks', 'Mobility today = fewer creaks tomorrow.'],
]

export function getTodayReminderMessage(): [string, string] {
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  return MESSAGES[dayIndex % MESSAGES.length]
}

/** Requests browser/PWA notification permission. */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/** Sends a system notification if permission is granted. */
export async function sendSystemNotification(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false
  }
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(`🥋 Kiai — ${title}`, {
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'kiai-reminder',
        })
        return true
      }
    }
    new Notification(`🥋 Kiai — ${title}`, {
      body,
      icon: '/icons/icon-192.png',
    })
    return true
  } catch (err) {
    console.warn('Kiai: notification failed', err)
    return false
  }
}

/**
 * Checks if a reminder should fire today.
 * Triggers a system notification or in-app toast banner.
 */
export async function checkAndTriggerReminder(settings: AppSettings, sessions: Session[]) {
  if (!settings.remindersEnabled) return

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  const lastReminded = localStorage.getItem('kiai.lastReminderDay')
  if (lastReminded === todayStr) return

  // Check if already trained today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const trainedToday = sessions.some((s) => s.startedAt >= startOfToday)
  if (trainedToday) return

  // Check if reminder time has arrived
  const effective = settings.reminderMode === 'smart'
    ? smartTime(sessions, settings.reminderHour, settings.reminderMinute)
    : { hour: settings.reminderHour, minute: settings.reminderMinute }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const reminderMinutes = effective.hour * 60 + effective.minute

  // If we are within or past the reminder window for today (after reminderMinutes and before 23:59)
  if (currentMinutes >= reminderMinutes) {
    const [title, body] = getTodayReminderMessage()
    localStorage.setItem('kiai.lastReminderDay', todayStr)

    // Try system notification first
    const sent = await sendSystemNotification(title, body)
    if (!sent) {
      // In-app banner fallback
      toast(`${title}: ${body}`, { icon: 'bell.fill', duration: 7000 })
    }
  }
}

/**
 * iOS native fallback: downloads a recurring .ics calendar event with alert.
 * On iPhone, opening this file prompts "Add to Calendar" / "Add to Reminders".
 */
export function downloadReminderEvent(hour: number, minute: number, appUrl: string) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const start = new Date()
  start.setHours(hour, minute, 0, 0)
  if (start.getTime() < Date.now()) start.setDate(start.getDate() + 1)
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const local = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(hour)}${pad(minute)}00`
  const endDate = new Date(start.getTime() + 15 * 60_000)
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`
  const [rawTitle, rawBody] = getTodayReminderMessage()
  const esc = (text: string) => text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  const title = esc(rawTitle)
  const body = esc(rawBody)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kiai//Training Reminder//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:kiai-daily-reminder-${stamp}@kiai.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${local}`,
    `DTEND:${end}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:🥋 Kiai — ${title}`,
    `DESCRIPTION:${body}\\n\\nOpen Kiai: ${appUrl}`,
    `URL:${appUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:🥋 Kiai — ${title}`,
    'TRIGGER:-PT0M',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:🥋 Kiai — ${title}`,
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'kiai-daily-reminder.ics'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
