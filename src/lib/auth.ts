import { APPLE_CLIENT_ID, APPLE_REDIRECT_URI, GOOGLE_CLIENT_ID } from '../data/settings'
import type { AuthProvider, StoredCredential } from '../data/types'
import { getState, setState } from './store'

export class AuthError extends Error {}

export interface SignInResult {
  provider: AuthProvider
  email: string | null
  displayName: string | null
}

export const isGoogleConfigured = () => GOOGLE_CLIENT_ID.length > 0
export const isAppleConfigured = () => APPLE_CLIENT_ID.length > 0

// Email / password ---------------------------------------------------------------------------
//
// Real, working, and fully local: there's no backend, so an account made on this device can't be
// used to sign in on another one (Kiai's Settings screen says this explicitly). Passwords are
// never stored — only a random salt and a PBKDF2-SHA256 hash, via the browser's native Web Crypto
// implementation (the same algorithm family the iOS app uses in EmailAccountStore.swift).

const PBKDF2_ITERATIONS = 250_000

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0))
}

async function deriveHash(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return new Uint8Array(bits)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function createEmailAccount(email: string, password: string, displayName: string): Promise<SignInResult> {
  const normalized = normalizeEmail(email)
  if (!normalized.includes('@')) throw new AuthError('Enter a valid email address.')
  if (password.length < 8) throw new AuthError('Choose a password with at least 8 characters.')
  if (getState().accounts[normalized]) throw new AuthError('An account with that email already exists.')

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveHash(password, salt)
  const credential: StoredCredential = { saltB64: toBase64(salt), hashB64: toBase64(hash), displayName }
  setState((s) => ({ ...s, accounts: { ...s.accounts, [normalized]: credential } }))
  return { provider: 'email', email: normalized, displayName }
}

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  const normalized = normalizeEmail(email)
  const credential = getState().accounts[normalized]
  if (!credential) throw new AuthError('Incorrect email or password.')
  const candidate = await deriveHash(password, fromBase64(credential.saltB64))
  if (!constantTimeEquals(candidate, fromBase64(credential.hashB64))) throw new AuthError('Incorrect email or password.')
  return { provider: 'email', email: normalized, displayName: credential.displayName }
}

export function deleteEmailAccount(email: string) {
  const normalized = normalizeEmail(email)
  setState((s) => {
    const accounts = { ...s.accounts }
    delete accounts[normalized]
    return { ...s, accounts }
  })
}

// Google Sign-In ------------------------------------------------------------------------------
//
// Uses Google Identity Services (no backend required for a client-only ID token read). Real,
// working code — it just needs a client ID:
//   1. Create an OAuth client (type "Web application") at
//      https://console.cloud.google.com/apis/credentials
//   2. Add this site's origin (e.g. http://localhost:5173 for dev, and your deployed URL) under
//      "Authorized JavaScript origins".
//   3. Paste the client ID into GOOGLE_CLIENT_ID in src/data/settings.ts.
// Kiai decodes the returned ID token's payload client-side to read the name/email/subject — fine
// for a local-only account system. A backend would additionally verify the token's signature.

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
      prompt: () => void
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}

let googleScriptPromise: Promise<void> | null = null

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise
  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new AuthError('Could not reach Google. Check your connection.'))
    document.head.appendChild(script)
  })
  return googleScriptPromise
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.')
  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(decodeURIComponent(escape(json)))
}

export async function signInWithGoogle(): Promise<SignInResult> {
  if (!isGoogleConfigured()) throw new AuthError('Google Sign-In needs a client ID. See lib/auth.ts for setup steps.')
  await loadGoogleScript()
  return new Promise((resolve, reject) => {
    window.google!.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        try {
          const payload = decodeJwtPayload(response.credential)
          resolve({
            provider: 'google',
            email: typeof payload.email === 'string' ? payload.email : null,
            displayName: typeof payload.name === 'string' ? payload.name : null,
          })
        } catch {
          reject(new AuthError('Google Sign-In returned an unexpected response.'))
        }
      },
    })
    window.google!.accounts.id.prompt()
  })
}

// Sign in with Apple ---------------------------------------------------------------------------
//
// Uses Apple's own JS SDK. Real, working code — it just needs a Services ID:
//   1. In your Apple Developer account, create a Services ID with "Sign in with Apple" enabled.
//   2. Register this site's exact URL (dev and deployed) as a return URL.
//   3. Paste the Services ID into APPLE_CLIENT_ID in src/data/settings.ts.
// Apple only ever sends the name/email on someone's very first authorization — Kiai saves it
// immediately when it sees it (AuthManager equivalent in lib/store.ts).

interface AppleAuthResponse {
  authorization?: { id_token?: string }
  user?: { name?: { firstName?: string; lastName?: string }; email?: string }
}

interface AppleIDAuth {
  auth: {
    init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void
    signIn: () => Promise<AppleAuthResponse>
  }
}

declare global {
  interface Window {
    AppleID?: AppleIDAuth
  }
}

let appleScriptPromise: Promise<void> | null = null

function loadAppleScript(): Promise<void> {
  if (window.AppleID) return Promise.resolve()
  if (appleScriptPromise) return appleScriptPromise
  appleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://appleid.cdn-apple.com/appleauth/one-time-fix/appleid.auth.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new AuthError('Could not reach Apple. Check your connection.'))
    document.head.appendChild(script)
  })
  return appleScriptPromise
}

export async function signInWithApple(): Promise<SignInResult> {
  if (!isAppleConfigured()) throw new AuthError('Sign in with Apple needs a Services ID. See lib/auth.ts for setup steps.')
  await loadAppleScript()
  window.AppleID!.auth.init({ clientId: APPLE_CLIENT_ID, scope: 'name email', redirectURI: APPLE_REDIRECT_URI, usePopup: true })
  const response = await window.AppleID!.auth.signIn()
  const name = [response.user?.name?.firstName, response.user?.name?.lastName].filter(Boolean).join(' ')
  return { provider: 'apple', email: response.user?.email ?? null, displayName: name || null }
}
