import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { KiaiMark, PrimaryButton, SymbolTile, TextButton } from '../../components/ui'
import { tintColor } from '../../data/meta'
import { completeOnboarding } from '../../lib/actions'
import { randomAvatar } from '../../lib/avatar'
import { haptic } from '../../lib/haptics'
import { randomName } from '../../lib/nameGenerator'
import { useI18n } from '../../lib/i18n'

type Step = 'welcome' | 'name'
const ORDER: Step[] = ['welcome', 'name']

/** First launch: welcome → name. */
export function Onboarding() {
  const { t } = useI18n()
  const [step, setStep] = useState<Step>('welcome')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(randomAvatar)
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

  const advance = () => {
    haptic('medium')
    if (step === 'welcome') {
      go('name')
    } else if (step === 'name') {
      if (!name.trim()) return
      inputRef.current?.blur()
      completeOnboarding(name, avatar)
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
                  ['chart.line.uptrend.xyaxis', 'Streaks and ranks from Initiate to… a god'],
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
        </div>
      </div>

      <div className="onboarding-footer">
        <PrimaryButton onClick={advance} disabled={step === 'name' && !name.trim()}>
          {step === 'welcome' ? t('Begin') : t('Get started')}
        </PrimaryButton>
        {step === 'name' && (
          <TextButton className="muted-btn" onClick={() => go('welcome')}>
            {t('Back')}
          </TextButton>
        )}
      </div>
    </div>
  )
}
