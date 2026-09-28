import { useState } from 'react'
import { Screen } from '../../components/Screen'
import { Icon } from '../../components/Icon'
import { toast } from '../../components/Toast'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { nav } from '../../lib/nav'
import { setPremium } from '../../lib/actions'
import { useIsPremium } from '../../lib/store'

type PlanType = 'lifetime' | 'monthly'

export function PaywallScreen() {
  const { t } = useI18n()
  const isPremium = useIsPremium()
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('lifetime')

  const purchaseLifetime = () => {
    haptic('success')
    setPremium(true)
    toast(t('Welcome to Kiai+! Lifetime unlocked.'), { icon: 'crown.fill' })
    nav.back()
  }

  const purchaseMonthly = () => {
    haptic('success')
    setPremium(true)
    toast(t('Kiai+ Monthly activated!'), { icon: 'crown.fill' })
    nav.back()
  }

  const restorePurchases = () => {
    haptic('selection')
    setPremium(true)
    toast(t('Purchases restored.'), { icon: 'checkmark.seal.fill' })
  }


  return (
    <Screen title="Kiai+" back>
      <div style={{ position: 'relative', overflow: 'hidden', padding: '8px 16px 48px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>

        {/* Radial gold glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '380px',
            height: '280px',
            background: 'radial-gradient(ellipse, rgba(251, 191, 36, 0.32) 0%, rgba(245, 158, 11, 0.12) 45%, transparent 70%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Hero Crown Badge */}
        <div style={{ position: 'relative', zIndex: 1, margin: '12px auto 18px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 32,
              background: 'linear-gradient(145deg, #fef08a 0%, #fbbf24 50%, #d97706 100%)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 16px 40px rgba(245, 158, 11, 0.45), 0 2px 8px rgba(245, 158, 11, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
            }}
          >
            <Icon name="crown.fill" size={48} style={{ color: '#78350f' }} />
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '24px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#d97706',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'rgba(251, 191, 36, 0.16)',
              padding: '4px 14px',
              borderRadius: 999,
              border: '1px solid rgba(251, 191, 36, 0.4)',
              marginBottom: '10px',
            }}
          >
            <Icon name="crown.fill" size={9} />
            {isPremium ? t('LIFETIME MEMBER') : t('PREMIUM MEMBERSHIP')}
          </span>
          <h1
            style={{
              margin: '0 0 6px',
              fontSize: '38px',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: 'var(--text)',
            }}
          >
            Kiai<span style={{ color: '#f59e0b', marginLeft: '1px' }}>+</span>
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.45, padding: '0 12px' }}>
            {isPremium
              ? t('Thank you for supporting Kiai. All premium features are unlocked.')
              : t('The complete science-based flexibility training system. Unlock everything.')}
          </p>
        </div>

        {/* Feature Rows */}
        {(
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '9px',
              textAlign: 'left',
              marginBottom: '22px',
            }}
          >
            <PaywallRow
              icon="figure.flexibility"
              tint="var(--ember)"
              title={t('Science-Based PNF Routines')}
              desc={t('Proprioceptive Neuromuscular Facilitation — the most effective flexibility protocol.')}
            />
            <PaywallRow
              icon="figure.martial.arts"
              tint="var(--sakura)"
              title={t('Full Martial Arts Dojo System')}
              desc={t('Discipline-specific routines, drills, milestones and progression for all 12 arts.')}
            />
            <PaywallRow
              icon="text.book.closed.fill"
              tint="var(--indigo)"
              title={t('Unlimited Custom Katas')}
              desc={t('Design and organize routines tailored to your art and body.')}
            />
            <PaywallRow
              icon="chart.bar.fill"
              tint="var(--jade)"
              title={t('Full Body Analytics')}
              desc={t('Muscle mapping, benchmark levels, and detailed session history.')}
            />
            <PaywallRow
              icon="speaker.wave.2.fill"
              tint="var(--accent)"
              title={t('Audio Coaching Cues')}
              desc={t('Hands-free audio guidance with chimes and countdowns for every stretch.')}
            />
          </div>
        )}

        {/* Pricing Plans */}
        {(
          <>
            {/* Plan Selector */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                width: '100%',
                marginBottom: '14px',
                boxSizing: 'border-box',
              }}
            >
              {/* Lifetime Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('lifetime')}
                style={{
                  padding: '14px 10px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: selectedPlan === 'lifetime'
                    ? 'linear-gradient(145deg, rgba(251, 191, 36, 0.22), rgba(245, 158, 11, 0.1))'
                    : 'color-mix(in srgb, var(--surface) 80%, transparent)',
                  border: selectedPlan === 'lifetime'
                    ? '2px solid rgba(251, 191, 36, 0.65)'
                    : '1.5px solid var(--separator)',
                  boxShadow: selectedPlan === 'lifetime'
                    ? '0 6px 20px rgba(245, 158, 11, 0.2)'
                    : 'none',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                }}
              >
                {selectedPlan === 'lifetime' && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '9px',
                      fontWeight: 800,
                      color: '#92400e',
                      background: 'linear-gradient(90deg, #fef08a, #fbbf24)',
                      padding: '2px 10px',
                      borderRadius: 999,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Best Value
                  </span>
                )}
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Lifetime
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  €24<span style={{ fontSize: '16px' }}>,99</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  Pay once, own forever
                </div>
              </button>

              {/* Monthly Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                style={{
                  padding: '14px 10px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: selectedPlan === 'monthly'
                    ? 'color-mix(in srgb, var(--accent) 12%, var(--surface))'
                    : 'color-mix(in srgb, var(--surface) 80%, transparent)',
                  border: selectedPlan === 'monthly'
                    ? '2px solid color-mix(in srgb, var(--accent) 65%, transparent)'
                    : '1.5px solid var(--separator)',
                  boxShadow: selectedPlan === 'monthly'
                    ? '0 6px 20px color-mix(in srgb, var(--accent) 20%, transparent)'
                    : 'none',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Monthly
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  €1<span style={{ fontSize: '16px' }}>,99</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  per month
                </div>
              </button>
            </div>

            {/* Action Button */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={selectedPlan === 'lifetime' ? purchaseLifetime : purchaseMonthly}
                style={{
                  width: '100%',
                  padding: '17px',
                  borderRadius: '18px',
                  background: selectedPlan === 'lifetime'
                    ? 'linear-gradient(135deg, #fef08a 0%, #fbbf24 60%, #d97706 100%)'
                    : 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 80%, #000))',
                  color: selectedPlan === 'lifetime' ? '#78350f' : '#fff',
                  fontSize: '17px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: selectedPlan === 'lifetime'
                    ? '0 10px 28px rgba(245, 158, 11, 0.4), inset 0 1px 1px rgba(255,255,255,0.5)'
                    : '0 10px 28px color-mix(in srgb, var(--accent) 40%, transparent)',
                  letterSpacing: '-0.01em',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {selectedPlan === 'lifetime'
                  ? t('Unlock Lifetime for €24,99')
                  : t('Start Monthly for €1,99 / mo')}
              </button>

              <button
                type="button"
                onClick={restorePurchases}
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
                {t('Restore Purchases')}
              </button>

              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                {selectedPlan === 'lifetime'
                  ? t('One-time non-consumable purchase. Managed through your App Store or Play account. Family Sharing supported.')
                  : t('Monthly subscription. Cancel anytime from your App Store or Play account settings.')}
              </p>
            </div>
          </>
        )}

        {isPremium && (
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
            <div
              style={{
                padding: '20px 18px',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.18), rgba(245, 158, 11, 0.08))',
                border: '1.5px solid rgba(251, 191, 36, 0.45)',
                boxShadow: '0 12px 32px -8px rgba(245, 158, 11, 0.25)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #fef08a, #fbbf24)', display: 'grid', placeItems: 'center', color: '#78350f' }}>
                <Icon name="checkmark.seal.fill" size={24} />
              </div>
              <strong style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                {t('Kiai+ Active Member')}
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, maxWidth: '320px' }}>
                {t('All master routines, flexibility benchmarks, and Dojo systems are unlocked.')}
              </p>
            </div>
            <button
              type="button"
              className="pressable"
              onClick={() => nav.back()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('Continue Training')}
            </button>
          </div>
        )}
      </div>
    </Screen>
  )
}

function PaywallRow({ icon, tint, title, desc }: { icon: string; tint: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '13px',
        alignItems: 'flex-start',
        background: 'color-mix(in srgb, var(--surface-raised, var(--surface)) 60%, transparent)',
        border: '1px solid var(--separator)',
        borderRadius: '16px',
        padding: '13px 14px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          background: `color-mix(in srgb, ${tint} 15%, transparent)`,
          color: tint,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          border: `1px solid color-mix(in srgb, ${tint} 25%, transparent)`,
        }}
      >
        <Icon name={icon} size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontSize: '15px', color: 'var(--text)', display: 'block', lineHeight: 1.25 }}>
          {title}
        </strong>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}
