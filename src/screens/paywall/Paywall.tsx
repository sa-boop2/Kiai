import { PrimaryButton, SecondaryButton, SymbolTile } from '../../components/ui'
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
      <div style={{ textAlign: 'center', padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '480px', margin: '0 auto' }}>
        
        {/* Glow Hero Badge */}
        <div style={{ position: 'relative', marginTop: '8px' }}>
          <div
            style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '999px',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />
          <SymbolTile icon="crown.fill" tint="var(--gold)" size={80} />
        </div>

        {/* Title & Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--gold)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'rgba(251, 191, 36, 0.12)',
              padding: '4px 12px',
              borderRadius: '999px',
              alignSelf: 'center',
              border: '1px solid rgba(251, 191, 36, 0.3)',
            }}
          >
            {isPremium ? t('LIFETIME MEMBER') : t('ONE-TIME LIFETIME PASS')}
          </span>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            {isPremium ? t('You Have Kiai+') : t('Master Your Martial Mobility')}
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {isPremium
              ? t('Thank you for supporting Kiai. All evidence-based progressions and custom routines are unlocked.')
              : t('Unlock science-based PNF progression, unlimited custom Katas, and complete anatomical analytics.')}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'left',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02))',
            padding: '18px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
          }}
        >
          <FeatureItem
            icon="brain"
            tint="var(--ember)"
            title={t('Science-Based PNF Progression')}
            desc={t('Proprioceptive Neuromuscular Facilitation routines scientifically proven to expand active mobility.')}
          />
          <FeatureItem
            icon="text.book.closed.fill"
            tint="var(--sakura)"
            title={t('Unlimited Custom Katas')}
            desc={t('Design and organize routines tailored specifically to your martial art and body constraints.')}
          />
          <FeatureItem
            icon="chart.bar.fill"
            tint="var(--indigo)"
            title={t('Full Biomechanics & Analytics')}
            desc={t('Full body muscle mapping, benchmark progression levels, and consistency scoring.')}
          />
          <FeatureItem
            icon="speaker.wave.2.fill"
            tint="var(--jade)"
            title={t('Audio Cues & Halfway Chimes')}
            desc={t('Stay immersed in your stretch without checking the screen, with customizable audio guidance.')}
          />
        </div>

        {/* Lifetime Pricing Card */}
        <div
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.14) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1.5px solid rgba(251, 191, 36, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <strong style={{ fontSize: '16px', color: 'var(--text)', display: 'block' }}>
              {t('Lifetime Access')}
            </strong>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {t('Pay once, own forever · No subscriptions')}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gold)' }}>
              €9,99
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          {isPremium ? (
            <PrimaryButton tint="var(--jade)" onClick={() => nav.back()}>
              {t('Membership Active · Done')}
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={purchaseLifetime} tint="var(--gold)">
              {t('Unlock Kiai+ · €9,99')}
            </PrimaryButton>
          )}

          {!isPremium && (
            <SecondaryButton onClick={restorePurchases}>
              {t('Restore Purchases')}
            </SecondaryButton>
          )}

          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
            {t('One-time non-consumable purchase. Managed securely through your App Store or Play account. Family Sharing supported.')}
          </p>
        </div>
      </div>
    </Screen>
  )
}

function FeatureItem({ icon, tint, title, desc }: { icon: string; tint: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `color-mix(in srgb, ${tint} 16%, transparent)`,
          color: tint,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div>
        <strong style={{ fontSize: '14px', color: 'var(--text)', display: 'block', lineHeight: 1.25 }}>
          {title}
        </strong>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}
