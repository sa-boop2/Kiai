import { type ReactNode, useMemo, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Screen } from '../../components/Screen'
import { toast } from '../../components/Toast'
import { confirmAction } from '../../components/ActionSheet'
import {
  Avatar, Card, KiaiMark, NativeSelect, ProgressBar, RankEmblem, SecondaryButton, Segmented, SettingsRow,
  SymbolTile, Toggle,
} from '../../components/ui'
import { MARTIAL_ARTS, artById } from '../../data/content'
import { nextRank } from '../../data/levels'
import { TINTS, tintColor, tintTitle } from '../../data/meta'
import {
  APPEARANCE_OPTIONS, LANGUAGE_OPTIONS, PREPARE_OPTIONS, REMINDER_MODES, SOUND_OPTIONS, prepareLabel, restLabel,
} from '../../data/settings'
import type { CountdownSound } from '../../data/types'
import { updateProfile, updateSettings } from '../../lib/actions'
import { audio } from '../../lib/audio'
import { AVATAR_SYMBOLS } from '../../lib/avatar'
import { exportData, importData, type ImportMode } from '../../lib/backup'
import { displayName, timeOfDay } from '../../lib/format'
import { haptic } from '../../lib/haptics'
import { useI18n } from '../../lib/i18n'
import { resizeAvatar } from '../../lib/image'
import { nav } from '../../lib/nav'
import { makeSnapshot } from '../../lib/progression'
import { downloadReminderEvent, requestNotificationPermission, sendSystemNotification, smartTime } from '../../lib/reminders'
import { useIsPremium, useProfile, useSessions, useSettings } from '../../lib/store'

const VERSION = '2.5.2'

export function SettingsScreen() {
  const settings = useSettings()
  const isPremium = useIsPremium()
  const { t, locale } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const reminderSummary = !settings.remindersEnabled
    ? 'Off'
    : settings.reminderMode === 'smart'
      ? t('Smart')
      : timeOfDay(settings.reminderHour, settings.reminderMinute, locale)

  const handleExport = () => {
    haptic('light')
    try {
      exportData()
      toast('Backup exported — saved as a .json file.', { icon: 'checkmark.circle.fill' })
    } catch {
      toast('Export failed. Could not create backup file.', { icon: 'xmark.circle.fill' })
    }
  }

  const handleImportFile = async (file: File, mode: ImportMode) => {
    setImporting(true)
    try {
      const summary = await importData(file, mode)
      toast(summary, { icon: 'checkmark.circle.fill' })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Import failed.', { icon: 'xmark.circle.fill' })
    } finally {
      setImporting(false)
    }
  }

  const handleImportClick = () => {
    haptic('light')
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const index = await confirmAction({
      title: 'Import Backup',
      message: 'How do you want to import this backup?',
      actions: [
        { label: 'Merge with current data', role: 'default' },
        { label: 'Replace all data', role: 'destructive' },
      ],
      cancelLabel: 'Cancel',
    })
    if (index === null) return
    const mode: ImportMode = index === 1 ? 'replace' : 'merge'
    await handleImportFile(file, mode)
  }

  return (
    <Screen title={t('Settings')} largeTitle>
            <ProfileCard />

      <Group>
        <SettingsRow
          icon="crown.fill"
          tint="var(--gold)"
          title="Kiai+"
          trailing={
            isPremium ? (
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--jade)', background: 'color-mix(in srgb, var(--jade) 16%, transparent)', padding: '2px 8px', borderRadius: '6px' }}>
                Active Member
              </span>
            ) : (
              <span className="muted" style={{ fontWeight: 600 }}>€9,99</span>
            )
          }
          chevron
          onClick={() => nav.push({ name: 'paywall' })}
        />
      </Group>

      <Group title={t('Preferences')}>
        <SettingsRow
          icon="timer"
          tint="var(--ember)"
          title={t('Workout & Timer')}
          trailing={<span className="muted">{restLabel(settings.restSeconds)} rest</span>}
          chevron
          onClick={() => nav.push({ name: 'workoutSettings' })}
        />
        <SettingsRow
          icon="speaker.wave.2.fill"
          tint="var(--gold)"
          title={t('Audio & Cues')}
          trailing={<span className="muted">{settings.soundEnabled ? t('On') : t('Off')}</span>}
          chevron
          onClick={() => nav.push({ name: 'audioSettings' })}
        />
        <SettingsRow
          icon="bell.badge.fill"
          tint="var(--ember)"
          title={t('Reminders')}
          trailing={<span className="muted">{reminderSummary}</span>}
          chevron
          onClick={() => nav.push({ name: 'reminders' })}
        />
        <SettingsRow
          icon="circle.lefthalf.filled"
          tint="var(--slate)"
          title={t('Appearance & Language')}
          chevron
          onClick={() => nav.push({ name: 'appearance' })}
        />
      </Group>

      <Group title={t('Data & Backup')}>
        <SettingsRow
          icon="square.and.arrow.up"
          tint="var(--jade)"
          title={t('Export Data')}
          trailing={<span className="muted">Backup to file</span>}
          onClick={handleExport}
        />
        <SettingsRow
          icon="square.and.arrow.down"
          tint="var(--indigo)"
          title={importing ? t('Importing…') : t('Import Data')}
          trailing={<span className="muted">Restore or merge</span>}
          onClick={handleImportClick}
        />
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
      </Group>

      <Group title={t('Information')}>
        <SettingsRow
          icon="lock.shield.fill"
          tint="var(--jade)"
          title={t('Privacy & Security')}
          trailing={<span className="muted">100% on-device</span>}
          chevron
          onClick={() => nav.push({ name: 'privacy' })}
        />
        <SettingsRow
          icon="shield.checkered"
          tint="var(--indigo)"
          title={t('Terms & Dojo Safety')}
          chevron
          onClick={() => nav.push({ name: 'terms' })}
        />
        <SettingsRow
          icon="questionmark.circle.fill"
          tint="var(--gold)"
          title={t('Help & FAQs')}
          chevron
          onClick={() => nav.push({ name: 'faq' })}
        />
                <SettingsRow
          icon="arrow.triangle.2.circlepath"
          tint="var(--jade)"
          title="Check for Updates"
          trailing={<span className="muted">Reload</span>}
          onClick={async () => {
            haptic('selection')
            toast('Checking for updates...', { icon: 'sparkles' })
            try {
              if ('serviceWorker' in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations()
                for (const r of regs) await r.update()
                if ('caches' in window) {
                  const keys = await caches.keys()
                  await Promise.all(keys.map((k) => caches.delete(k)))
                }
              }
            } catch {}
            window.location.reload()
          }}
        />
        <SettingsRow
          icon="square.and.arrow.up"
          tint="var(--ember)"
          title={t('Share Kiai')}
          trailing={<span className="muted">Tell a friend</span>}
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Kiai — Stretching for Martial Arts', url: window.location.origin }).catch(() => {})
            } else {
              navigator.clipboard?.writeText(window.location.origin)
              toast('Link copied to clipboard', { icon: 'link' })
            }
          }}
        />
      </Group>

      <div className="settings-footer">
        <KiaiMark size={28} />
        <span>Kiai {VERSION} · Web</span>
      </div>
    </Screen>
  )
}

function Group({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  return (
    <section className="group">
      {title && <h4 className="group-title">{title}</h4>}
      <div className="card group-card">{children}</div>
      {footer && <p className="group-footer">{footer}</p>}
    </section>
  )
}

// Workout & Timer Sub-screen ---------------------------------------------------------------------

export function WorkoutSettingsScreen() {
  const settings = useSettings()
  const { t } = useI18n()

  return (
    <Screen title={t('Workout & Timer')} back>
      <Group title={t('Timing')}>
        <SettingsRow
          icon="timer"
          tint="var(--ember)"
          title={t('Rest between exercises')}
          trailing={
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="number"
                min={0}
                max={300}
                value={settings.restSeconds}
                onChange={(e) => updateSettings({ restSeconds: parseInt(e.target.value) || 0 })}
                style={{ width: '50px', textAlign: 'right', background: 'color-mix(in srgb, var(--text) 10%, transparent)', border: 'none', color: 'var(--text)', fontSize: '16px', borderRadius: '6px', padding: '4px 8px' }}
              />
              <span className="muted">s</span>
            </div>
          }
        />
        <SettingsRow
          icon="arrow.left.and.right"
          tint="var(--jade)"
          title={t('Switch sides pause')}
          trailing={
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="number"
                min={0}
                max={60}
                value={settings.switchSidesSeconds ?? 5}
                onChange={(e) => updateSettings({ switchSidesSeconds: parseInt(e.target.value) || 0 })}
                style={{ width: '50px', textAlign: 'right', background: 'color-mix(in srgb, var(--text) 10%, transparent)', border: 'none', color: 'var(--text)', fontSize: '16px', borderRadius: '6px', padding: '4px 8px' }}
              />
              <span className="muted">s</span>
            </div>
          }
        />
        <SettingsRow
          icon="hourglass"
          tint="var(--gold)"
          title={t('Preparation countdown')}
          trailing={
            <NativeSelect
              label={t('Preparation countdown')}
              value={settings.prepareSeconds}
              options={PREPARE_OPTIONS.map((o) => ({ value: o, title: prepareLabel(o) }))}
              onChange={(prepareSeconds) => updateSettings({ prepareSeconds })}
            />
          }
        />
        <SettingsRow
          icon="pause.circle.fill"
          tint="var(--indigo)"
          title={t('Pause between exercises')}
          trailing={
            <Toggle
              label={t('Pause between exercises')}
              checked={settings.pauseBetweenSets}
              onChange={(pauseBetweenSets) => updateSettings({ pauseBetweenSets })}
            />
          }
        />
      </Group>

      <Group title={t('Flow & Display')}>
        <SettingsRow
          icon="play.circle.fill"
          tint="var(--ember)"
          title={t('Auto-advance to next stretch')}
          trailing={
            <Toggle
              label={t('Auto-advance to next stretch')}
              checked={settings.autoAdvance ?? true}
              onChange={(autoAdvance) => updateSettings({ autoAdvance })}
            />
          }
        />
        <SettingsRow
          icon="sun.max.fill"
          tint="var(--gold)"
          title={t('Keep screen awake')}
          trailing={
            <Toggle
              label={t('Keep screen awake')}
              checked={settings.keepScreenAwake ?? true}
              onChange={(keepScreenAwake) => updateSettings({ keepScreenAwake })}
            />
          }
        />
        <SettingsRow
          icon="bell.badge.fill"
          tint="var(--sakura)"
          title={t('Halfway stretch chime')}
          trailing={
            <Toggle
              label={t('Halfway stretch chime')}
              checked={settings.halfwayChime ?? false}
              onChange={(halfwayChime) => updateSettings({ halfwayChime })}
            />
          }
        />
              </Group>

      <Group title={t('Structure')} footer={t('Warm-up and cool-down phases remain in your routine, but are skipped during play.')}>
        <SettingsRow
          icon="forward.end.fill"
          tint="var(--jade)"
          title={t('Skip warm-up & cool-down')}
          trailing={
            <Toggle
              label={t('Skip warm-up & cool-down')}
              checked={settings.disableWarmupCooldown}
              onChange={(disableWarmupCooldown) => updateSettings({ disableWarmupCooldown })}
            />
          }
        />
      </Group>
    </Screen>
  )
}

// Audio & Cues Sub-screen -------------------------------------------------------------------------

export function AudioSettingsScreen() {
  const settings = useSettings()
  const { t } = useI18n()

  return (
    <Screen title={t('Audio & Cues')} back>
      <Group title={t('Sound cues')}>
        <SettingsRow
          icon="speaker.wave.2.fill"
          tint="var(--gold)"
          title={t('Sound cues')}
          trailing={
            <Toggle
              label={t('Sound cues')}
              checked={settings.soundEnabled}
              onChange={(soundEnabled) => updateSettings({ soundEnabled })}
            />
          }
        />
        <SettingsRow
          icon="bell.fill"
          tint="var(--gold)"
          title={t('Countdown sound')}
          trailing={
            <NativeSelect<CountdownSound>
              label={t('Countdown sound')}
              value={settings.sound}
              options={SOUND_OPTIONS.map((o) => ({ value: o.value, title: t(o.title) }))}
              onChange={(sound) => {
                updateSettings({ sound })
                audio.play('go', sound)
              }}
            />
          }
        />
      </Group>

      <Group title={t('Haptics')} footer={t('Vibrations on interval transitions and countdown ticks.')}>
        <SettingsRow
          icon="iphone.radiowaves.left.and.right"
          tint="var(--indigo)"
          title={t('Haptic feedback')}
          trailing={
            <Toggle
              label={t('Haptic feedback')}
              checked={settings.hapticsEnabled}
              onChange={(hapticsEnabled) => updateSettings({ hapticsEnabled })}
            />
          }
        />
      </Group>
    </Screen>
  )
}

// Profile Card -----------------------------------------------------------------------------------

function ProfileCard() {
  const profile = useProfile()
  const sessions = useSessions()
  const snapshot = useMemo(() => makeSnapshot(sessions, profile.createdAt), [sessions, profile.createdAt])
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(profile.name)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { t } = useI18n()
  const next = nextRank(snapshot.rank)

  const pick = async (file: File | undefined) => {
    if (!file) return
    try {
      const avatar = await resizeAvatar(file)
      updateProfile({ avatar })
      haptic('success')
    } catch {
      toast('That image could not be read', { icon: 'exclamationmark.circle' })
    }
  }

  return (
    <Card className="profile-card">
      <div className="profile-top">
        <button
          type="button"
          className="avatar-button pressable"
          aria-label="Change profile picture"
          onClick={() => {
            haptic('light')
            setPickerOpen(true)
          }}
        >
          <Avatar name={profile.name} src={profile.avatar} symbol={profile.avatarSymbol} tint={profile.avatarTint} size={46} />
          <span className="avatar-camera" style={{ width: 19, height: 19, bottom: -1, right: -1 }}>
            <Icon name="camera.fill" size={10} style={{ '--icon-knock': 'var(--ember)' } as React.CSSProperties} />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); setPickerOpen(false) }} />

        <div className="profile-text">
          {editing ? (
            <form
              className="name-edit"
              onSubmit={(e) => {
                e.preventDefault()
                if (draftName.trim()) updateProfile({ name: draftName.trim() })
                setEditing(false)
              }}
            >
              <input
                className="text-input"
                value={draftName}
                autoFocus
                maxLength={40}
                style={{ fontSize: '18px', padding: '2px 8px' }}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  if (draftName.trim()) updateProfile({ name: draftName.trim() })
                  setEditing(false)
                }}
              />
            </form>
          ) : (
            <button
              type="button"
              className="name-display pressable"
              style={{ fontSize: '18px', gap: '6px' }}
              onClick={() => {
                setDraftName(profile.name)
                setEditing(true)
              }}
            >
              <span style={{ fontWeight: 700 }}>{displayName(profile.name)}</span>
              <Icon name="pencil" size={13} strokeWidth={2.4} />
            </button>
          )}
          <NativeSelect<string>
            label="Primary martial art"
            value={profile.primaryArt ?? ''}
            options={[{ value: '', title: 'Choose your art' }, ...MARTIAL_ARTS.map((a) => ({ value: a.id, title: a.name }))]}
            onChange={(id) => updateProfile({ primaryArt: id || null })}
          />
        </div>
      </div>

      {/* iOS 26 Integrated Minimalist Subelements */}
      <div
        style={{
          background: 'color-mix(in srgb, var(--text) 4%, transparent)',
          borderRadius: '12px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          margin: '1px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <RankEmblem rank={snapshot.rank} size={20} />
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', display: 'block', lineHeight: 1.15 }}>
              {t('Level %lld', snapshot.rank.level)}
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
              {snapshot.rank.title}
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '18px', background: 'var(--separator)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: 'rgba(239, 68, 68, 0.16)',
              color: 'var(--ember)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="flame.fill" size={13} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', display: 'block', lineHeight: 1.15 }}>
              {snapshot.currentStreak} {snapshot.currentStreak === 1 ? 'day' : 'days'}
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--ember)', fontWeight: 600 }}>
              Streak
            </span>
          </div>
        </div>
      </div>

      <div style={{ margin: '1px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', fontSize: '10.5px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Rank progress</span>
          <span style={{ color: 'var(--text-tertiary)' }}>{Math.round(snapshot.rankProgress * 100)}%</span>
        </div>
        <ProgressBar value={snapshot.rankProgress} tint={next?.color ?? snapshot.rank.color} height={4} label="Rank progress" />
      </div>
      {artById(profile.primaryArt) === undefined && <span className="sr-only">No primary art</span>}

      {pickerOpen && (
        <div className="picker-modal-overlay" onClick={() => setPickerOpen(false)}>
          <div className="picker-modal-content avatar-picker" onClick={(e) => e.stopPropagation()}>
            <div className="picker-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Profile picture</h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Choose a photo or an icon
                </p>
              </div>
              <button
                type="button"
                className="search-clear"
                style={{ width: 28, height: 28 }}
                onClick={() => setPickerOpen(false)}
                aria-label="Close"
              >
                <Icon name="xmark" size={16} />
              </button>
            </div>

            <div className="avatar-picker-body">
              <button type="button" className="picker-modal-item" onClick={() => fileRef.current?.click()}>
                <span className="avatar-picker-photo-icon">
                  <Icon name="photo.fill" size={20} />
                </span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>Choose a photo</div>
                </div>
                <Icon name="chevron.right" size={14} className="muted" />
              </button>

              <div className="divider" />

              <div className="tint-picker no-sheet-drag" style={{ padding: '2px 0 14px' }}>
                {TINTS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`tint-choice pressable ${profile.avatarTint === option ? 'selected' : ''}`}
                    style={{ '--tint': tintColor(option) } as React.CSSProperties}
                    aria-label={tintTitle(option)}
                    aria-pressed={profile.avatarTint === option}
                    onClick={() => {
                      haptic('selection')
                      updateProfile({ avatar: null, avatarTint: option, avatarSymbol: profile.avatarSymbol ?? AVATAR_SYMBOLS[0] })
                    }}
                  />
                ))}
              </div>

              <div className="avatar-symbol-grid">
                {AVATAR_SYMBOLS.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    className={`avatar-symbol-choice pressable ${profile.avatarSymbol === symbol && !profile.avatar ? 'selected' : ''}`}
                    style={{ '--tint': tintColor(profile.avatarTint ?? 'ember') } as React.CSSProperties}
                    aria-label={symbol}
                    onClick={() => {
                      haptic('selection')
                      updateProfile({ avatar: null, avatarSymbol: symbol, avatarTint: profile.avatarTint ?? 'ember' })
                    }}
                  >
                    <Icon name={symbol} size={22} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// Appearance & Language ---------------------------------------------------------------------------

export function AppearanceScreen() {
  const settings = useSettings()
  const { t } = useI18n()

  return (
    <Screen title={t('Appearance & Language')} back>
      <Group title={t('Theme')}>
        <div className="settings-row">
          <Segmented
            ariaLabel={t('Appearance')}
            value={settings.appearance}
            options={APPEARANCE_OPTIONS.map((o) => ({ value: o.value, title: t(o.title) }))}
            onChange={(appearance) => updateSettings({ appearance })}
          />
        </div>
      </Group>

      <Group title={t('Accent color')} footer={t('Used for buttons, progress bars and highlights throughout Kiai.')}>
        <div className="accent-grid">
          {TINTS.map((tint) => {
            const selected = settings.accentColor === tint
            return (
              <button
                key={tint}
                type="button"
                className="accent-swatch pressable"
                aria-pressed={selected}
                onClick={() => {
                  haptic('selection')
                  updateSettings({ accentColor: tint })
                }}
              >
                <span className="accent-swatch-circle" style={{ '--tint': tintColor(tint) } as React.CSSProperties}>
                  {selected && <Icon name="checkmark" size={16} strokeWidth={3} style={{ color: '#fff' }} />}
                </span>
                <span className="muted small">{tintTitle(tint)}</span>
              </button>
            )
          })}
        </div>
      </Group>

      <Group title={t('Language & Numerals')} footer={t('Switches workout timer digits between Western (1, 2, 3) and Eastern Arabic (١, ٢, ٣).')}>
        <SettingsRow
          icon="globe"
          tint="var(--indigo)"
          title={t('Language')}
          trailing={
            <NativeSelect
              label={t('Language')}
              value={settings.language}
              options={LANGUAGE_OPTIONS.map((o) => ({ value: o.value, title: o.nativeName }))}
              onChange={(language) => updateSettings({ language })}
            />
          }
        />
        <SettingsRow
          icon="textformat.123"
          tint="var(--amber, #f59e0b)"
          title={t('Eastern Arabic Numerals (١, ٢, ٣)')}
          trailing={
            <Toggle
              label={t('Eastern Arabic Numerals')}
              checked={settings.arabicTimer ?? false}
              onChange={(arabicTimer) => updateSettings({ arabicTimer })}
            />
          }
        />
      </Group>
    </Screen>
  )
}

// Reminders --------------------------------------------------------------------------------------

export function RemindersScreen() {
  const settings = useSettings()
  const sessions = useSessions()
  const { t, locale } = useI18n()
  const smart = smartTime(sessions, settings.reminderHour, settings.reminderMinute)
  const effective = settings.reminderMode === 'smart' ? smart : { hour: settings.reminderHour, minute: settings.reminderMinute }
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <Screen title={t('Reminders')} back>
      <Group footer={t('A gentle nudge to keep your streak alive. Never more than one a day.')}>
        <SettingsRow
          icon="bell.fill"
          tint="var(--ember)"
          title={t('Training reminders')}
          trailing={
            <Toggle
              label={t('Training reminders')}
              checked={settings.remindersEnabled}
              onChange={async (remindersEnabled) => {
                if (remindersEnabled) {
                  const perm = await requestNotificationPermission()
                  if (perm === 'granted') {
                    toast('Notifications enabled', { icon: 'checkmark.circle.fill' })
                    sendSystemNotification('Notifications active', 'You will be gently reminded when it is time to stretch.')
                  }
                }
                updateSettings({ remindersEnabled })
              }}
            />
          }
        />
      </Group>

      {settings.remindersEnabled && (
        <div className="fade-swap">
          <Segmented
            ariaLabel="Schedule"
            value={settings.reminderMode}
            options={REMINDER_MODES.map((m) => ({ value: m.value, title: t(m.title) }))}
            onChange={(reminderMode) => updateSettings({ reminderMode })}
          />

          {settings.reminderMode === 'smart' && (
            <Card className="smart-card">
              <SymbolTile icon="sparkles" tint="var(--indigo)" size={44} />
              <div>
                <strong>Next reminder around {timeOfDay(smart.hour, smart.minute, locale)}</strong>
                <p className="muted small">
                  {sessions.length >= 3
                    ? "Learned from when you usually train — we remind you 30 minutes before, and skip days you've already trained."
                    : 'Train a few times and Kiai learns your rhythm. Until then we use the time below.'}
                </p>
              </div>
            </Card>
          )}

          {(settings.reminderMode === 'fixed' || sessions.length < 3) && (
            <Group title={settings.reminderMode === 'fixed' ? 'Remind me daily at' : 'Fallback time'}>
              <label className="time-row">
                <span>Time</span>
                <input
                  type="time"
                  value={`${pad(settings.reminderHour)}:${pad(settings.reminderMinute)}`}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number)
                    if (!Number.isNaN(h) && !Number.isNaN(m)) updateSettings({ reminderHour: h, reminderMinute: m })
                  }}
                />
              </label>
            </Group>
          )}

          <Card className="calendar-reminder">
            <p className="small-body">
              <strong>Native iOS Calendar &amp; Reminders integration:</strong> Add a recurring daily event with alarms — on iPhone it opens straight into your Apple Calendar and fires notifications reliably every day.
            </p>
            <SecondaryButton
              icon="calendar"
              onClick={() => {
                downloadReminderEvent(effective.hour, effective.minute, window.location.href.split('#')[0])
                toast('Daily reminder event created', { icon: 'calendar' })
              }}
            >
              Add daily reminder at {timeOfDay(effective.hour, effective.minute, locale)}
            </SecondaryButton>
          </Card>
        </div>
      )}
    </Screen>
  )
}

// Information Sub-screens -------------------------------------------------------------------------

export function PrivacyScreen() {
  const { t } = useI18n()
  return (
    <Screen title={t('Privacy & Security')} back>
      <div className="card" style={{ padding: '20px', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <SymbolTile icon="lock.shield.fill" tint="var(--jade)" size={48} />
          <div>
            <strong style={{ fontSize: '18px', display: 'block' }}>100% On-Device</strong>
            <span className="muted small">Your martial arts journey is yours alone.</span>
          </div>
        </div>
        <p style={{ marginBottom: '12px' }}>
          Kiai has <strong>no tracking servers, no external analytics, and zero profiling</strong>. All your Katas, completed sessions, personal streaks, flexibility milestones, and custom exercises are stored completely on your device in local storage.
        </p>
        <p style={{ marginBottom: '12px' }}>
          When you export your data, a clean JSON backup file is generated locally without ever passing through any cloud server.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          You remain in full control of your training data at all times.
        </p>
      </div>
    </Screen>
  )
}

export function TermsScreen() {
  const { t } = useI18n()
  return (
    <Screen title={t('Terms & Dojo Safety')} back>
      <div className="card" style={{ padding: '20px', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <SymbolTile icon="shield.checkered" tint="var(--indigo)" size={48} />
          <div>
            <strong style={{ fontSize: '18px', display: 'block' }}>Dojo Safety &amp; Etiquette</strong>
            <span className="muted small">Patience over force.</span>
          </div>
        </div>
        <p style={{ marginBottom: '12px' }}>
          Martial arts mobility and flexibility require patient, progressive conditioning. Never force a stretch to the point of sharp joint pain or nerve pinching.
        </p>
        <p style={{ marginBottom: '12px' }}>
          Always perform dynamic warm-up movements before engaging in deep static stretches. If you have pre-existing spinal, hip, knee, or joint injuries, consult a qualified healthcare professional before attempting advanced milestone positions.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Kiai is designed as a daily mobility guide. Listen to your body and honor your limits.
        </p>
      </div>
    </Screen>
  )
}

export function FaqScreen() {
  const { t } = useI18n()
  const faqs = [
    {
      q: 'How often should I stretch?',
      a: 'Consistency beats intensity. 10 to 15 minutes of daily mobility after training or in the evening yields vastly superior flexibility and hip looseness compared to one long session per week.',
    },
    {
      q: 'How do I unlock higher head kicks?',
      a: 'High kicks require a combination of hamstring flexibility, adductor (groin) length, and hip flexor active strength. Focus on the Kick Range Unlock routine and dynamic leg swings before workouts.',
    },
    {
      q: 'What is a Kata in Kiai?',
      a: 'A Kata is your custom stretching routine. It groups warm-up movements, targeted mobility stretches, and cool-down breathing exercises with customizable timers and rest periods.',
    },
    {
      q: 'How do I transfer my routines to another device?',
      a: 'Go to Settings → Data & Backup → Export Data. You can import this JSON file on any other phone, tablet, or browser to restore all your routines, sessions, and streaks.',
    },
  ]

  return (
    <Screen title={t('Help & FAQs')} back>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((item, i) => (
          <Card key={i} style={{ padding: '18px', lineHeight: 1.5 }}>
            <strong style={{ display: 'block', fontSize: '16px', marginBottom: '8px', color: 'var(--accent)' }}>
              {item.q}
            </strong>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.a}</p>
          </Card>
        ))}
      </div>
    </Screen>
  )
}








