import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { KiaiMark, PrimaryButton, SecondaryButton, TextButton } from '../../components/ui'
import { applySignIn, continueAsGuest } from '../../lib/actions'
import { AuthError, createEmailAccount, isAppleConfigured, isGoogleConfigured, signInWithApple, signInWithEmail, signInWithGoogle } from '../../lib/auth'
import { haptic } from '../../lib/haptics'
import { nav } from '../../lib/nav'

/**
 * The very first screen: three real sign-in options plus a guest path, shown once per install.
 * Mirrors the native app's LoginView.swift. Apple/Google are real integrations gated on a config
 * value (see lib/auth.ts) — until one is set, tapping shows why instead of silently failing.
 *
 * `embedded` is used when a guest reopens this from Settings → "Sign in or create an account":
 * it's then a normal pushed screen (with a back button) instead of the full-takeover gate shown
 * before onboarding, and successful sign-in pops back to Settings instead of relying on the
 * top-level app stage switch (which has nothing to switch to — they're a guest already).
 */
export function Login({ embedded = false }: { embedded?: boolean } = {}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [mode, setMode] = useState<'signIn' | 'create'>('signIn')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const finish = () => {
    if (embedded) nav.back()
  }
  const handleApple = () => run(async () => { applySignIn(await signInWithApple()); finish() })
  const handleGoogle = () => run(async () => { applySignIn(await signInWithGoogle()); finish() })
  const handleEmail = () =>
    run(async () => {
      const result = mode === 'create' ? await createEmailAccount(email, password, name) : await signInWithEmail(email, password)
      applySignIn(result)
      finish()
    })

  const body = (
    <div className="welcome login-welcome">
            <KiaiMark size={88} className="welcome-mark" />
            <h1 className="welcome-wordmark login-title">Welcome to Kiai</h1>
            <p className="welcome-lede login-lede">Sign in to keep your progress safe and synced across your devices.</p>

            <div className="login-buttons">
              <button type="button" className="apple-button pressable" disabled={busy} onClick={handleApple}>
                <Icon name="apple.logo" size={18} />
                <span>Continue with Apple</span>
                {!isAppleConfigured() && <span className="setup-needed">Setup needed</span>}
              </button>

              <SecondaryButton icon="g.circle.fill" disabled={busy} onClick={handleGoogle}>
                <span className="login-btn-label">
                  Continue with Google
                  {!isGoogleConfigured() && <span className="setup-needed">Setup needed</span>}
                </span>
              </SecondaryButton>

              <SecondaryButton
                icon="envelope.fill"
                tint="var(--slate)"
                onClick={() => {
                  haptic('selection')
                  setShowEmailForm((v) => !v)
                }}
              >
                Continue with Email
              </SecondaryButton>

              {showEmailForm && (
                <div className="login-email-form">
                  <div className="segmented" style={{ '--count': 2, '--index': mode === 'signIn' ? 0 : 1 } as React.CSSProperties}>
                    <span className="segmented-thumb" />
                    <button type="button" className={mode === 'signIn' ? 'active' : ''} onClick={() => setMode('signIn')}>
                      Sign in
                    </button>
                    <button type="button" className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>
                      Create account
                    </button>
                  </div>
                  {mode === 'create' && (
                    <input className="text-input title-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                  )}
                  <input
                    className="text-input title-input"
                    placeholder="Email"
                    type="email"
                    autoCapitalize="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    className="text-input title-input"
                    placeholder="Password (min. 8 characters)"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PrimaryButton disabled={busy || !email || password.length < 8} onClick={handleEmail}>
                    {mode === 'create' ? 'Create account' : 'Sign in'}
                  </PrimaryButton>
                  <p className="login-email-note">Email accounts are stored only on this device — they don't sync between devices today.</p>
                </div>
              )}
            </div>

            {error && (
              <p className="login-error">
                <Icon name="exclamationmark.circle" size={15} />
                {error}
              </p>
            )}

            {!embedded && (
              <>
                <TextButton
                  className="muted-btn login-guest"
                  onClick={() => {
                    haptic('light')
                    continueAsGuest()
                  }}
                >
                  Continue as guest
                </TextButton>
                <p className="login-guest-note">Guest data stays on this device only. You can add an account later in Settings.</p>
              </>
            )}
    </div>
  )

  if (embedded) {
    return (
      <Screen title="Sign in" back>
        {body}
      </Screen>
    )
  }
  return (
    <div className="onboarding">
      <div className="onboarding-stage">
        <div className="onboarding-step">{body}</div>
      </div>
    </div>
  )
}
