import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { KiaiMark, PrimaryButton, SymbolTile, TextButton } from '../../components/ui'
import { TINTS, tintColor, tintTitle } from '../../data/meta'
import type { Tint } from '../../data/types'
import { completeOnboarding, setPremium, updateSettings } from '../../lib/actions'
import { randomAvatar } from '../../lib/avatar'
import { haptic } from '../../lib/haptics'
import { randomName } from '../../lib/nameGenerator'
import { useI18n } from '../../lib/i18n'
import { useSettings } from '../../lib/store'

type Step = 'welcome' | 'name' | 'accent' | 'paywall'
const ORDER: Step[] = ['welcome', 'name', 'accent', 'paywall']

export function Onboarding() {
  const { t } = useI18n()
  const currentSettings = useSettings()
  const [step, setStep] = useState<Step>('welcome')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(randomAvatar)
  const [selectedAccent, setSelectedAccent] = useState<Tint>(currentSettings.accentColor || 'ember')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step !== 'name') return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 450)
    return () => window.clearTimeout(timer)
  }, [step])

  const go = (next: Step) => {
    setDirection(ORDER.indexOf(next) > ORDER.indexOf(step) ? 'forward' : 'back')
    setStep(next)
  }

  const handleFinish = (withPremium = false) => {
    haptic('success')
    if (withPremium) setPremium(true)
    updateSettings({ accentColor: selectedAccent })
    completeOnboarding(name, avatar)
  }

  const advance = () => {
    haptic('medium')
    if (step === 'welcome') {
      go('name')
    } else if (step === 'name') {
      if (!name.trim()) return
      inputRef.current?.blur()
      go('accent')
    } else if (step === 'accent') {
      updateSettings({ accentColor: selectedAccent })
      go('paywall')
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding-stage">
        <div key={step} className={`onboarding-step ${direction}`}>
          {step === 'welcome' && (
            <div className="welcome">
              <KiaiMark size={132} className="welcome-mark" />
              <h1 className="welcome-wordmark">KIAI</h1>
              <p className="welcome-lede">
                Daily stretching and mobility,
                <br />
                built for martial artists.
              </p>
              <ul className="welcome-features">
                {[
                  ['figure.flexibility', 'Deeper stances and higher kicks'],
                  ['timer', 'Guided timers that play over your music'],
                  ['chart.line.uptrend.xyaxis', 'Streaks and ranks from Initiate to Master'],
                ].map(([icon, text], i) => (
                  <li key={icon} style={{ animationDelay: `${260 + i * 90}ms` }}>
                    <SymbolTile icon={icon} size={38} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 'name' && (
            <div className="name-step">
              <div className="name-step-header">
                <button
                  type="button"
                  className="onboarding-avatar pressable"
                  style={{ '--tint': tintColor(avatar.tint) } as CSSProperties}
                  aria-label="Your avatar. Tap to shuffle."
                  onClick={() => {
                    haptic('selection')
                    setAvatar(randomAvatar())
                  }}
                >
                  <Icon name={avatar.symbol} size={26} />
                  <span className="onboarding-avatar-shuffle">
                    <Icon name="arrow.triangle.2.circlepath" size={11} strokeWidth={3} />
                  </span>
                </button>
                <div>
                  <h1 className="display">{t('What should we call you?')}</h1>
                  <p className="secondary">Your name stays on this device.</p>
                </div>
              </div>
              <div className="name-input-row">
                <input
                  ref={inputRef}
                  className="name-input"
                  value={name}
                  placeholder="Your name"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  enterKeyHint="done"
                  maxLength={40}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && advance()}
                />
                <button
                  type="button"
                  className="name-dice pressable"
                  aria-label="Suggest a name"
                  onClick={() => {
                    haptic('selection')
                    inputRef.current?.blur()
                    setName(randomName())
                  }}
                >
                  <Icon name="dice.fill" size={22} />
                </button>
              </div>
            </div>
          )}

          {step === 'accent' && (
            <div style={{ textAlign: 'center', padding: '10px 14px' }}>
              <h1 className="display" style={{ margin: '0 0 6px', fontSize: '26px' }}>{t('Choose Your Dojo Accent')}</h1>
              <p className="secondary" style={{ margin: '0 0 20px', fontSize: '14px' }}>
                {t('Personalize highlights, timer rings and progress indicators across Kiai.')}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  maxWidth: '360px',
                  margin: '0 auto 24px',
                }}
              >
                {TINTS.map((tint) => {
                  const selected = selectedAccent === tint
                  return (
                    <button
                      key={tint}
                      type="button"
                      className="pressable"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        background: selected ? 'color-mix(in srgb, var(--surface) 80%, transparent)' : 'transparent',
                        padding: '10px 4px',
                        borderRadius: '16px',
                        border: selected ? `2px solid ${tintColor(tint)}` : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 160ms ease',
                      }}
                      onClick={() => {
                        haptic('selection')
                        setSelectedAccent(tint)
                        updateSettings({ accentColor: tint })
                      }}
                    >
                      <span
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '999px',
                          background: tintColor(tint),
                          display: 'grid',
                          placeItems: 'center',
                          color: '#ffffff',
                          boxShadow: `0 4px 14px color-mix(in srgb, ${tintColor(tint)} 40%, transparent)`,
                        }}
                      >
                        {selected && <Icon name="checkmark" size={18} strokeWidth={3} />}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                        {tintTitle(tint)}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Accent Preview Box */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                  border: `1px solid color-mix(in srgb, ${tintColor(selectedAccent)} 30%, transparent)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  maxWidth: '360px',
                  margin: '0 auto',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <SymbolTile icon="sparkles" tint={tintColor(selectedAccent)} size={40} />
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{tintTitle(selectedAccent)} Active</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Previewing active glow</span>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: `color-mix(in srgb, ${tintColor(selectedAccent)} 20%, transparent)`,
                    color: tintColor(selectedAccent),
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  Selected
                </span>
              </div>
            </div>
          )}

          {step === 'paywall' && (
            <div style={{ textAlign: 'center', padding: '0 8px', maxWidth: '420px', margin: '0 auto' }}>
              <div style={{ margin: '8px auto 12px', display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: 24,
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.75))',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 10px 28px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <Icon name="crown.fill" size={38} style={{ color: '#000' }} />
                </div>
              </div>

              <span
                style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--gold)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: 'rgba(251, 191, 36, 0.12)',
                  padding: '4px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  marginBottom: '6px',
                }}
              >
                ONE-TIME LIFETIME PASS
              </span>

              <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: 800, color: 'var(--text)' }}>
                Elevate Your Dojo with Kiai+
              </h1>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                Master higher kicks, bulletproof joint mobility, and science-backed PNF stretching.
              </p>

              {/* Mini Features List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'left',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="checkmark.circle.fill" size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>Science-Based PNF Progression</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="checkmark.circle.fill" size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>Unlimited Custom Kata Routines</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="checkmark.circle.fill" size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>Full Anatomical Biomechanics & Mapping</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon name="checkmark.circle.fill" size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>Hands-Free Audio Guidance & Chimes</span>
                </div>
              </div>

              {/* Price Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.16), rgba(245, 158, 11, 0.06))',
                  border: '1.5px solid rgba(251, 191, 36, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ fontSize: '15px', color: 'var(--text)' }}>Lifetime Membership</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>One payment · Own forever</span>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gold)' }}>€9,99</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="onboarding-footer">
        {step !== 'paywall' ? (
          <>
            <PrimaryButton onClick={advance} disabled={step === 'name' && !name.trim()} tint={tintColor(selectedAccent)}>
              {step === 'welcome' ? t('Begin') : t('Continue')}
            </PrimaryButton>
            {step !== 'welcome' && (
              <TextButton className="muted-btn" onClick={() => go(ORDER[ORDER.indexOf(step) - 1])}>
                {t('Back')}
              </TextButton>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            <button
              type="button"
              onClick={() => handleFinish(true)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #fef08a, var(--gold))',
                color: '#000',
                fontSize: '17px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
              }}
            >
              {t('Unlock Lifetime Access · €9,99')}
            </button>
            <button
              type="button"
              onClick={() => handleFinish(false)}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('Continue with Free Dojo Pass')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
