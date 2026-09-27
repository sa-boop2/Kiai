import { useCallback } from 'react'
import { TRANSLATIONS } from '../data/generated/translations'
import type { AppLanguage } from '../data/types'
import { useSettings } from './store'

const SUPPORTED = Object.keys(TRANSLATIONS) as string[]
const LOCALE_TAGS: Record<string, string> = { nl: 'nl-NL', ru: 'ru-RU', es: 'es-ES', en: 'en-US' }

/** Resolves the effective language. `system` follows the browser/iPhone language. */
export function resolveLanguage(language: AppLanguage): string {
  if (language !== 'system') return language
  const preferred = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase().slice(0, 2)
  return SUPPORTED.includes(preferred) ? preferred : 'en'
}

/**
 * Translates using the same String Catalog keys as the native app (`%@` for strings, `%lld` for
 * numbers, `%%` for a literal percent). Untranslated keys fall back to English.
 */
export function translate(lang: string, key: string, ...args: Array<string | number>): string {
  const template = TRANSLATIONS[lang]?.[key] ?? key
  let index = 0
  return template.replace(/%(lld|@|%)/g, (match: string) => {
    if (match === '%%') return '%'
    const value = args[index++]
    return value === undefined ? '' : String(value)
  })
}

export function useI18n() {
  const settings = useSettings()
  const lang = resolveLanguage(settings.language)
  const t = useCallback((key: string, ...args: Array<string | number>) => translate(lang, key, ...args), [lang])
  const locale = LOCALE_TAGS[lang] ?? (typeof navigator !== 'undefined' ? navigator.language : 'en')
  return { t, lang, locale }
}
