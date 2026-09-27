import { PrimaryButton, SymbolTile } from '../../components/ui'
import { Screen } from '../../components/Screen'
import { Icon } from '../../components/Icon'
import { haptic } from '../../lib/haptics'
import { nav } from '../../lib/nav'


export function PaywallScreen() {
  const purchaseLifetime = async () => {
    haptic('success')
    // Placeholder mock payment integration
    // In the future: use StoreKit / RevenueCat here.
    
    // For now, immediately unlock.
    
    // A real implementation would trigger a reducer action to set isPremium = true.
    nav.back()
    alert('Mock Purchase Successful! In a real environment, this would call StoreKit and unlock Kiai Pro.')
  }

  return (
    <Screen title="Kiai Pro" back>
      <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <SymbolTile icon="crown.fill" tint="var(--gold)" size={88} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800 }}>Master Your Mobility</h1>
          <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary)' }}>
            Unlock science-based PNF progression, unlimited custom Katas, and full analytics.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--separator)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Icon name="brain" size={24} style={{ color: 'var(--ember)' }} />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Science-Based Progression</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Icon name="text.book.closed.fill" size={24} style={{ color: 'var(--sakura)' }} />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Unlimited Custom Katas</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Icon name="chart.bar.fill" size={24} style={{ color: 'var(--indigo)' }} />
            <span style={{ fontSize: '15px', fontWeight: 600 }}>Advanced Muscle Analytics</span>
          </div>
        </div>

        <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PrimaryButton onClick={purchaseLifetime} tint="var(--gold)">
            Unlock Lifetime ?" €9,99
          </PrimaryButton>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            One-time purchase. No subscriptions.
          </span>
        </div>
      </div>
    </Screen>
  )
}



