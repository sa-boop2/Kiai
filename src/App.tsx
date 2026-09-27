import { useEffect, useState } from 'react'
import { ActionSheetHost } from './components/ActionSheet'
import { SheetHost } from './components/SheetHost'
import { StackView } from './components/StackView'
import { TabBar } from './components/TabBar'
import { ToastHost } from './components/Toast'
import { resolveLanguage } from './lib/i18n'
import { TABS, type Tab, useNav } from './lib/nav'
import { checkAndTriggerReminder } from './lib/reminders'
import { useProfile, useSessions, useSettings } from './lib/store'
import { useAccentColor, useAppearance } from './lib/theme'
import { Login } from './screens/onboarding/Login'
import { Onboarding } from './screens/onboarding/Onboarding'
import { PlayerOverlay } from './screens/player/Player'
import { SplashScreen } from './components/SplashScreen'
import { renderRoot, renderRoute, renderSheet } from './screens/registry'

export default function App() {
  const settings = useSettings()
  const profile = useProfile()
  const navState = useNav()
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('kiai.splashShown')
    } catch {
      return true
    }
  })
  useAppearance(settings.appearance)
  useAccentColor(settings.accentColor)

  const sessions = useSessions()

  useEffect(() => {
    document.documentElement.lang = resolveLanguage(settings.language)
  }, [settings.language])

  useEffect(() => {
    checkAndTriggerReminder(settings, sessions)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndTriggerReminder(settings, sessions)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [settings, sessions])

  const stage = !profile.hasChosenSignInMethod ? 'login' : !profile.onboardingComplete ? 'onboarding' : 'main'

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            try {
              sessionStorage.setItem('kiai.splashShown', '1')
            } catch {}
            setShowSplash(false)
          }}
        />
      )}
      {stage === 'main' ? <MainApp tab={navState.tab} /> : stage === 'onboarding' ? <Onboarding /> : <Login />}
      {navState.plan && <PlayerOverlay key={navState.plan.id} plan={navState.plan} />}
      <ActionSheetHost />
      <ToastHost />
    </>
  )
}

function MainApp({ tab }: { tab: Tab }) {
  // Tabs mount on first visit and stay mounted (scroll positions and stacks are preserved).
  const [visited, setVisited] = useState<Set<Tab>>(() => new Set([tab]))
  useEffect(() => {
    setVisited((current) => (current.has(tab) ? current : new Set(current).add(tab)))
  }, [tab])

  return (
    <div className="app app-enter">
      <main className="tab-pages">
        {TABS.map((item) => (
          <section key={item} className="tab-page" data-active={item === tab} aria-hidden={item !== tab}>
            {(visited.has(item) || item === tab) && <StackView tab={item} root={renderRoot(item)} renderRoute={renderRoute} />}
          </section>
        ))}
      </main>
      <TabBar />
      <SheetHost renderSheet={renderSheet} />
    </div>
  )
}
