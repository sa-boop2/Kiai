import { MartialArtsScreen } from './martialArts/MartialArtsScreen'
import { ArtExploreScreen } from './martialArts/ArtExploreScreen'
import type { ReactNode } from 'react'
import { SheetHeader } from '../components/SheetHost'
import type { Route, SheetRoute, Tab } from '../lib/nav'
import { AnalyticsScreen, AchievementsScreen, DaySheet, FlexibilityScreen, LogFlexibilitySheet, StreakDetailScreen } from './analytics/Analytics'
import { HomeScreen, QuickStatsSheet } from './home/Home'
import { EditorSheet, PickerSheet } from './katas/Editor'
import { KataDetailScreen, PremadeWorkoutsScreen } from './katas/Katas'
import { ArtDetailSheet, ExerciseSheet, LibraryScreen } from './library/Library'
import { MuscleDetailScreen } from './library/Muscle'
import { Login } from './onboarding/Login'
import {
  AppearanceScreen, AudioSettingsScreen, FaqScreen, PrivacyScreen, RemindersScreen, SettingsScreen,
  TermsScreen, WorkoutSettingsScreen,
} from './settings/Settings'
import { CustomExerciseSheet } from './katas/CustomExercise'
import { PaywallScreen } from './paywall/Paywall'
import { nav } from '../lib/nav'

export function renderRoot(tab: Tab): ReactNode {
  switch (tab) {
    case 'home':
      return <HomeScreen />
    case 'library':
      return <LibraryScreen />
    case 'analytics':
      return <AnalyticsScreen />
    case 'settings':
      return <SettingsScreen />
  }
}

export function renderRoute(route: Route): ReactNode {
  switch (route.name) {

    case 'kata':
      return <KataDetailScreen id={route.id} />
    case 'martialArts':
      return <MartialArtsScreen back />
    case 'art':
      return <ArtExploreScreen artId={route.id} />
    case 'workoutSettings':
      return <WorkoutSettingsScreen />
    case 'audioSettings':
      return <AudioSettingsScreen />
    case 'reminders':
      return <RemindersScreen />
    case 'premadeWorkouts':
      return <PremadeWorkoutsScreen />
    case 'appearance':
      return <AppearanceScreen />
    case 'login':
      return <Login embedded />
    case 'flexibility':
      return <FlexibilityScreen />
    case 'privacy':
      return <PrivacyScreen />
    case 'terms':
      return <TermsScreen />
    case 'faq':
      return <FaqScreen />
    case 'achievements':
      return <AchievementsScreen />
    case 'paywall':
      return <PaywallScreen />
    case 'streak':
      return <StreakDetailScreen />
    default:
      return <div>Not found</div>
  }
}

export function renderSheet(route: SheetRoute): { content: ReactNode; size?: 'large' | 'medium' | 'tall' } {
  switch (route.name) {
    case 'exercise':
      return { content: <ExerciseSheet slug={route.slug} /> }
    case 'artLearnMore':
      return { content: <ArtDetailSheet artId={route.artId} />, size: 'large' }
    case 'howTo':
      return {
        content: (
          <>
            <SheetHeader title={route.howTo.title} trailing={<button type="button" className="navbar-action strong" onClick={() => nav.back()}>Done</button>} />
            <div className="sheet-scroll form">
              <p>{route.howTo.summary}</p>
            </div>
          </>
        ),
      }
    case 'editor':
      return { content: <EditorSheet mode={route.mode} /> }
    case 'picker':
      return { content: <PickerSheet phase={route.phase} onAdd={route.onAdd} />, size: 'large' }
    case 'quickStats':
      return { content: <QuickStatsSheet />, size: 'medium' }
    case 'day':
      return { content: <DaySheet day={route.day} />, size: 'medium' }
    case 'logFlexibility':
      return { content: <LogFlexibilitySheet benchmark={route.benchmark} />, size: 'medium' }
    case 'customExercise':
      return { content: <CustomExerciseSheet onSave={route.onSave} /> }
    case 'muscle':
      return { content: <MuscleDetailScreen part={(route as any).part as any} />, size: 'tall' }
    default:
      return { content: <div>Not found</div> }
  }
}




