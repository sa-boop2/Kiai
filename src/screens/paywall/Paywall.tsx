import { PrimaryButton } from '../../components/ui'
import { Screen } from '../../components/Screen'
import { Icon } from '../../components/Icon'
import { toast } from '../../components/Toast'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { nav } from '../../lib/nav'
import { setPremium } from '../../lib/actions'
import { useIsPremium } from '../../lib/store'

export function PaywallScreen() {
  const { t } = useI18n()
  const isPremium = useIsPremium()

  const purchaseLifetime = () => {
    haptic('success')
    setPremium(true)
    toast(t('Welcome to Kiai+! Lifetime unlocked.'), { icon: 'crown.fill' })
    nav.back()
  }

  const restorePurchases = () => {
    haptic('selection')
    setPremium(true)
    toast(t('Purchases restored.'), { icon: 'checkmark.seal.fill' })
  }

  return (
    <Screen title="Kiai+" back>
      <div style={{ position: 'relative', overflow: 'hidden', padding: '16px 16px 40px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Apple-style background radial gold glow */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '320px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.28) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Hero Crown Crest */}
        <div style={{ position: 'relative', zIndex: 1, margin: '16px auto 14px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.75))',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 12px 32px rgba(245, 158, 11, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
          >
            <Icon name="crown.fill" size={44} style={{ color: '#000' }} />
          </div>
        </div>

        {/* Shimmering Headline */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '22px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--gold)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              background: 'rgba(251, 191, 36, 0.14)',
              padding: '4px 12px',
              borderRadius: 999,
              border: '1px solid rgba(251, 191, 36, 0.35)',
              marginBottom: '8px',
            }}
          >
            {isPremium ? t('LIFETIME MEMBER') : t('ONE-TIME LIFETIME PASS')}
          </span>
          <h1
            style={{
              margin: '0 0 6px',
              fontSize: '34px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Kiai<span style={{ color: 'var(--gold)', marginLeft: '2px' }}>+</span>
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.4, padding: '0 8px' }}>
            {isPremium
              ? t('Thank you for supporting Kiai. All evidence-based progressions and custom routines are unlocked.')
              : t('Unlock science-based PNF progression, unlimited custom Katas, and complete anatomical analytics.')}
          </p>
        </div>

        {/* iOS 26 Liquid Glass Feature Stack */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'left',
            marginBottom: '20px',
          }}
        >
          <PaywallRow
            icon="brain"
            tint="var(--ember)"
            title={t('Science-Based PNF Progression')}
            desc={t('Proprioceptive Neuromuscular Facilitation routines scientifically proven to expand active mobility.')}
          />
          <PaywallRow
            icon="text.book.closed.fill"
            tint="var(--sakura)"
            title={t('Unlimited Custom Katas')}
            desc={t('Design and organize routines tailored specifically to your martial art and body constraints.')}
          />
          <PaywallRow
            icon="chart.bar.fill"
            tint="var(--indigo)"
            title={t('Full Biomechanics & Analytics')}
            desc={t('Full body muscle mapping, benchmark progression levels, and consistency scoring.')}
          />
          <PaywallRow
            icon="speaker.wave.2.fill"
            tint="var(--jade)"
            title={t('Audio Guidance & Cues')}
            desc={t('Hands-free audio coaching with halfway chimes and countdown beats for every stretch.')}
          />
        </div>

        {/* Pricing Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            padding: '16px 18px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.05))',
            border: '1.5px solid rgba(251, 191, 36, 0.45)',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            marginBottom: '16px',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Special Launch Offer
            </span>
            <strong style={{ fontSize: '17px', color: 'var(--text)', display: 'block', marginTop: '2px' }}>
              {t('Lifetime Access')}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {t('Pay once, own forever · No subscriptions')}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--gold)' }}>
              €9,99
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isPremium ? (
            <PrimaryButton tint="var(--jade)" onClick={() => nav.back()}>
              {t('Membership Active · Done')}
            </PrimaryButton>
          ) : (
            <button
              type="button"
              onClick={purchaseLifetime}
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
              {t('Unlock Lifetime for €9,99')}
            </button>
          )}

          {!isPremium && (
            <button
              type="button"
              onClick={restorePurchases}
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 600,
                padding: '10px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('Restore Purchases')}
            </button>
          )}

          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
            {t('One-time non-consumable purchase. Managed securely through your App Store or Play account. Family Sharing supported.')}
          </p>
        </div>
      </div>
    </Screen>
  )
}

function PaywallRow({ icon, tint, title, desc }: { icon: string; tint: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02))',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '14px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: `color-mix(in srgb, ${tint} 18%, transparent)`,
          color: tint,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={20} />
      </div>
      <div>
        <strong style={{ fontSize: '15px', color: 'var(--text)', display: 'block', lineHeight: 1.25 }}>
          {title}
        </strong>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}
