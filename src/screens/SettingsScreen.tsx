import { useState } from 'react'
import { PageHeader } from '@/components/layout/AppShell'
import { Icon } from '@/components/icons/Icon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Section, SettingRow, ValueRow } from '@/components/ui/Section'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Sheet } from '@/components/ui/Sheet'
import { Slider } from '@/components/ui/Slider'
import { Toggle } from '@/components/ui/Toggle'
import { SoundSelector } from '@/components/alarm/SoundSelector'
import { soundName } from '@/data/sounds'
import { vibrationSupported } from '@/lib/haptics'
import { notificationSupport, requestNotificationPermission } from '@/lib/notifications'
import type { Alarm, Settings, ThemePreference } from '@/types'
import { useToast } from '@/state/ToastContext'

const APP_VERSION = '1.0.0'

const LEGAL = {
  privacy: {
    title: 'Privacy',
    body: [
      'Lumen keeps everything on your device. Your alarms, history and preferences are stored in this browser’s local storage and are never uploaded anywhere.',
      'There is no account, no analytics and no third-party tracking. Alarm tones are generated on your device rather than downloaded.',
      'Clearing your browser data, or using “Clear all data” in Settings, removes everything permanently.',
    ],
  },
  terms: {
    title: 'Terms',
    body: [
      'Lumen is provided as-is, without warranty of any kind.',
      'Because it runs in a browser tab, it can only ring while the tab is open. Do not rely on it alone for anything critical — keep a device alarm as a backup for flights, medication and exams.',
      'You are responsible for how you use the app and for any alarm you choose to rely on.',
    ],
  },
  credits: {
    title: 'Credits',
    body: [
      'Design and engineering: built as a single-page React application with a token-driven design system.',
      'Typeface: Inter by Rasmus Andersson.',
      'Alarm tones: synthesised in real time with the Web Audio API — no sampled audio.',
      'Interface vocabulary informed by contemporary React and Tailwind component patterns.',
    ],
  },
} as const

type LegalKey = keyof typeof LEGAL

interface SettingsScreenProps {
  settings: Settings
  alarms: Alarm[]
  historyCount: number
  persistent: boolean
  onChange: (patch: Partial<Settings>, message?: string | null) => void
  onReset: () => void
  onTest: (alarm: Alarm) => void
}

export function SettingsScreen({
  settings,
  alarms,
  historyCount,
  persistent,
  onChange,
  onReset,
  onTest,
}: SettingsScreenProps) {
  const [soundOpen, setSoundOpen] = useState(false)
  const [legal, setLegal] = useState<LegalKey | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const { notify } = useToast()

  const testTarget = alarms.find((a) => a.enabled) ?? alarms[0] ?? null

  const handleNotifications = async (enabled: boolean) => {
    if (!enabled) {
      onChange({ notifications: false, upcomingReminder: false })
      return
    }
    const result = await requestNotificationPermission()
    if (result === 'granted') {
      onChange({ notifications: true }, 'Notifications enabled')
    } else if (result === 'unsupported') {
      notify('Notifications are not supported in this browser', { tone: 'danger' })
    } else {
      notify('Notification permission was denied', {
        description: 'Allow notifications in your browser settings to turn this on.',
        tone: 'danger',
      })
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Defaults for new alarms and how Lumen behaves." />

      {!persistent && (
        <div className="surface mb-6 flex items-start gap-3 rounded-[var(--r-lg)] border-[color:var(--c-danger-soft)] px-4 py-3.5">
          <span className="mt-0.5 text-danger">
            <Icon name="info" size={18} />
          </span>
          <p className="type-caption text-ink-2">
            Storage is unavailable in this browser, so alarms will not survive a reload.
          </p>
        </div>
      )}

      {/* --- Appearance --------------------------------------------------- */}
      <Section title="Appearance">
        <div className="p-4">
          <SegmentedControl
            label="Theme"
            value={settings.theme}
            options={[
              { value: 'dark' as ThemePreference, label: 'Dark' },
              { value: 'light' as ThemePreference, label: 'Light' },
              { value: 'system' as ThemePreference, label: 'System' },
            ]}
            onChange={(theme) => onChange({ theme }, `Theme set to ${theme}`)}
          />
          <p className="type-caption mt-3 flex items-center gap-2 text-ink-3">
            <Icon name={settings.theme === 'light' ? 'sun' : settings.theme === 'dark' ? 'moon' : 'monitor'} size={14} />
            {settings.theme === 'system'
              ? 'Follows your device appearance.'
              : `Always ${settings.theme}.`}
          </p>
        </div>
      </Section>

      {/* --- Alarm behaviour ---------------------------------------------- */}
      <Section title="Alarm behaviour" description="Applied to alarms you create from now on.">
        <SettingRow icon="snooze" title="Default snooze">
          <SegmentedControl
            wrap
            label="Default snooze duration"
            value={settings.defaultSnoozeMinutes}
            options={[5, 10, 15, 20].map((m) => ({ value: m, label: `${m} min` }))}
            onChange={(defaultSnoozeMinutes) => onChange({ defaultSnoozeMinutes })}
          />
        </SettingRow>

        <SettingRow icon="volume" title="Default volume">
          <Slider
            label="Default alarm volume"
            value={Math.round(settings.defaultVolume * 100)}
            valueText={`${Math.round(settings.defaultVolume * 100)}%`}
            onChange={(value) => onChange({ defaultVolume: value / 100 }, null)}
            onCommit={(value) => onChange({ defaultVolume: value / 100 }, 'Default volume updated')}
          />
        </SettingRow>

        <SettingRow
          icon="vibrate"
          title="Vibration"
          description={vibrationSupported() ? 'On by default for new alarms' : 'Not supported on this device'}
          control={
            <Toggle
              checked={settings.defaultVibrate && vibrationSupported()}
              disabled={!vibrationSupported()}
              onChange={(defaultVibrate) => onChange({ defaultVibrate })}
              label="Default vibration"
            />
          }
        />

        <SettingRow
          icon="sparkle"
          title="Gradual volume"
          description="New alarms start quiet and rise"
          control={
            <Toggle
              checked={settings.defaultGradual}
              onChange={(defaultGradual) => onChange({ defaultGradual })}
              label="Default gradual volume"
            />
          }
        >
          {settings.defaultGradual && (
            <SegmentedControl
              wrap
              label="Default gradual duration"
              value={settings.defaultGradualSeconds}
              options={[
                { value: 10, label: '10s' },
                { value: 30, label: '30s' },
                { value: 60, label: '1 min' },
                { value: 120, label: '2 min' },
                { value: 300, label: '5 min' },
              ]}
              onChange={(defaultGradualSeconds) => onChange({ defaultGradualSeconds })}
            />
          )}
        </SettingRow>
      </Section>

      {/* --- Notifications ------------------------------------------------ */}
      <Section title="Notifications">
        <SettingRow
          icon="bell"
          title="Alarm notifications"
          description={
            notificationSupport() === 'unsupported'
              ? 'Not supported in this browser'
              : notificationSupport() === 'denied'
                ? 'Blocked — allow notifications in your browser settings'
                : 'Show a system notification when an alarm rings'
          }
          control={
            <Toggle
              checked={settings.notifications}
              disabled={notificationSupport() === 'unsupported'}
              onChange={(enabled) => void handleNotifications(enabled)}
              label="Alarm notifications"
            />
          }
        />
        <SettingRow
          icon="clock"
          title="Upcoming alarm reminder"
          description="A heads-up ten minutes before the next alarm"
          control={
            <Toggle
              checked={settings.upcomingReminder}
              disabled={!settings.notifications}
              onChange={(upcomingReminder) => onChange({ upcomingReminder })}
              label="Upcoming alarm reminder"
            />
          }
        />
      </Section>

      {/* --- Sound -------------------------------------------------------- */}
      <Section title="Sound">
        <SettingRow
          icon="waves"
          title="Default alarm sound"
          description={soundName(settings.defaultSoundId)}
          onClick={() => setSoundOpen(true)}
          control={<Icon name="chevron-right" size={18} />}
        />
      </Section>

      {/* --- General ------------------------------------------------------ */}
      <Section title="General">
        <SettingRow icon="clock" title="Time format">
          <SegmentedControl
            label="Time format"
            value={settings.hourCycle}
            options={[
              { value: 12 as const, label: '12-hour' },
              { value: 24 as const, label: '24-hour' },
            ]}
            onChange={(hourCycle) => onChange({ hourCycle }, `Using ${hourCycle}-hour time`)}
          />
        </SettingRow>

        <SettingRow icon="calendar" title="Week starts on">
          <SegmentedControl
            label="Week starts on"
            value={settings.weekStart}
            options={[
              { value: 0 as const, label: 'Sunday' },
              { value: 1 as const, label: 'Monday' },
            ]}
            onChange={(weekStart) => onChange({ weekStart })}
          />
        </SettingRow>

        <SettingRow
          icon="vibrate"
          title="Haptic feedback"
          description={
            vibrationSupported()
              ? 'A short tap when you change something'
              : 'Not supported on this device'
          }
          control={
            <Toggle
              checked={settings.haptics && vibrationSupported()}
              disabled={!vibrationSupported()}
              onChange={(haptics) => onChange({ haptics })}
              label="Haptic feedback"
            />
          }
        />
      </Section>

      {/* --- Developer ---------------------------------------------------- */}
      <Section
        title="Developer"
        description="Tools for trying the app out — they never change your schedule."
      >
        <SettingRow
          icon="bolt"
          title="Test alarm"
          description={
            testTarget
              ? `Ring “${testTarget.label || 'Alarm'}” right now`
              : 'Create an alarm first'
          }
          onClick={testTarget ? () => onTest(testTarget) : undefined}
          control={testTarget ? <Icon name="chevron-right" size={18} /> : undefined}
        />
        <SettingRow
          icon="trash"
          danger
          title="Clear all data"
          description={`${alarms.length} alarm${alarms.length === 1 ? '' : 's'} and ${historyCount} history entr${historyCount === 1 ? 'y' : 'ies'}`}
          onClick={() => setConfirmReset(true)}
          control={<Icon name="chevron-right" size={18} />}
        />
      </Section>

      {/* --- About -------------------------------------------------------- */}
      <Section title="About">
        <ValueRow label="App version" value={APP_VERSION} />
        <SettingRow
          icon="sparkle"
          title="Credits"
          onClick={() => setLegal('credits')}
          control={<Icon name="chevron-right" size={18} />}
        />
        <SettingRow
          icon="shield"
          title="Privacy"
          onClick={() => setLegal('privacy')}
          control={<Icon name="chevron-right" size={18} />}
        />
        <SettingRow
          icon="doc"
          title="Terms"
          onClick={() => setLegal('terms')}
          control={<Icon name="chevron-right" size={18} />}
        />
      </Section>

      <p className="type-caption px-1 pb-2 text-center text-ink-3">
        Lumen · Designed for calm mornings
      </p>

      <SoundSelector
        open={soundOpen}
        onClose={() => setSoundOpen(false)}
        value={settings.defaultSoundId}
        volume={settings.defaultVolume}
        onSelect={(defaultSoundId) => {
          onChange({ defaultSoundId }, `Default sound set to ${soundName(defaultSoundId)}`)
          setSoundOpen(false)
        }}
      />

      <Sheet
        open={legal !== null}
        onClose={() => setLegal(null)}
        title={legal ? LEGAL[legal].title : ''}
      >
        <div className="flex flex-col gap-3.5">
          {legal &&
            LEGAL[legal].body.map((paragraph) => (
              <p key={paragraph} className="type-body text-ink-2">
                {paragraph}
              </p>
            ))}
        </div>
      </Sheet>

      <ConfirmDialog
        open={confirmReset}
        title="Clear all data?"
        description="Every alarm and history entry will be deleted. Your preferences are kept."
        confirmLabel="Clear everything"
        onClose={() => setConfirmReset(false)}
        onConfirm={onReset}
      />
    </>
  )
}
