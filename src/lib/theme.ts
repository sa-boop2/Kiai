import { useEffect } from 'react'
import { TINT_VAR } from '../data/meta'
import type { AppearanceMode, Tint } from '../data/types'

const COLORS = { light: '#F6F4F1', dark: '#0A0A0B' }

function apply(dark: boolean, animate: boolean) {
  const root = document.documentElement
  const next = dark ? 'dark' : 'light'
  if (root.dataset.theme === next) return
  const commit = () => {
    root.dataset.theme = next
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? COLORS.dark : COLORS.light)
  }
  // Cross-fade the whole UI where the View Transitions API exists (Chrome, Safari 18+).
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (animate && doc.startViewTransition && !reduceMotion) doc.startViewTransition(commit)
  else commit()
}

/** Applies Light / Dark / Automatic to the document and keeps Automatic in sync with the OS. */
export function useAppearance(mode: AppearanceMode) {
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const update = (animate: boolean) => apply(mode === 'dark' || (mode === 'system' && query.matches), animate)
    update(true)
    if (mode !== 'system') return
    const listener = () => update(true)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [mode])
}

/** 1.15: applies Settings → Appearance's accent colour choice. Mirrors `AccentColorStore` on iOS
 * (see RootView.swift's `syncAccentColor`) — `--accent` is what every "accent" CSS usage now
 * reads (see the `var(--ember)` → `var(--accent)` pass across styles/*.css). */
export function useAccentColor(tint: Tint) {
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', TINT_VAR[tint])
  }, [tint])
}
