import { useMemo, useState } from 'react'
import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Section, SettingRow } from '@/components/ui/Section'
import { Sheet } from '@/components/ui/Sheet'
import { Slider } from '@/components/ui/Slider'
import { TextField } from '@/components/ui/TextField'
import { Toggle } from '@/components/ui/Toggle'
import { DaySelector } from '@/components/alarm/DaySelector'
import { SoundSelector } from '@/components/alarm/SoundSelector'
import { TimePicker } from '@/components/alarm/TimePicker'
import { soundName } from '@/data/sounds'
import { vibrationSupported } from '@/lib/haptics'
import { ALL_DAYS, formatTime, WEEKDAYS, WEEKEND } from '@/lib/time'
import type { Alarm, AlarmDraft, Settings, Weekday } from '@/types'

type RepeatMode = 'never' | 'daily' | 'weekdays' | 'weekends' | 'custom'

const REPEAT_OPTIONS: Array<{ value: RepeatMode; label: string }> = [
  { value: 'never', label: 'Never' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom', label: 'Custom' },
]

const GRADUAL_OPTIONS = [
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 300, label: '5 min' },
]

const SNOOZE_PRESETS = [5, 10, 15, 20]

const LABEL_SUGGESTIONS = ['Wake up', 'Morning workout', 'Class', 'Meeting', 'Medication', 'Study']

const sameDays = (a: Weekday[], b: Weekday[]) =>
  a.length === b.length && b.every((d) => a.includes(d))

function repeatModeOf(repeat: Weekday[]): RepeatMode {
  if (repeat.length === 0) return 'never'
  if (repeat.length === 7) return 'daily'
  if (sameDays(repeat, WEEKDAYS)) return 'weekdays'
  if (sameDays(repeat, WEEKEND)) return 'weekends'
  return 'custom'
}

interface AlarmEditorProps {
  open: boolean
  /** Present when editing; absent when creating. */
  alarm: Alarm | null
  initialDraft: AlarmDraft
  settings: Settings
  onClose: () => void
  onSave: (draft: AlarmDraft) => void
  onDelete: (alarm: Alarm) => void
}

export function AlarmEditor({
  open,
  alarm,
  initialDraft,
  settings,
  onClose,
  onSave,
  onDelete,
}: AlarmEditorProps) {
  // The editor is mounted fresh for each alarm, so seeding state here is
  // enough — there is nothing to carry over between a create and an edit.
  const [draft, setDraft] = useState<AlarmDraft>(initialDraft)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(repeatModeOf(initialDraft.repeat))
  const [soundOpen, setSoundOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const patch = (changes: Partial<AlarmDraft>) => setDraft((d) => ({ ...d, ...changes }))

  const applyRepeatMode = (mode: RepeatMode) => {
    setRepeatMode(mode)
    setError(null)
    switch (mode) {
      case 'never':
        return patch({ repeat: [] })
      case 'daily':
        return patch({ repeat: [...ALL_DAYS] })
      case 'weekdays':
        return patch({ repeat: [...WEEKDAYS] })
      case 'weekends':
        return patch({ repeat: [...WEEKEND] })
      case 'custom':
        // Keep whatever is already chosen; seed with today when nothing is.
        return patch({
          repeat: draft.repeat.length > 0 ? draft.repeat : [new Date().getDay() as Weekday],
        })
    }
  }

  const snoozeIsCustom = !SNOOZE_PRESETS.includes(draft.snoozeMinutes)

  const timeLabel = useMemo(
    () => formatTime(draft.hour, draft.minute, settings.hourCycle),
    [draft.hour, draft.minute, settings.hourCycle],
  )

  const handleSave = () => {
    if (repeatMode === 'custom' && draft.repeat.length === 0) {
      setError('Choose at least one day, or set the alarm to repeat Never.')
      return
    }
    if (draft.snoozeMinutes < 1 || draft.snoozeMinutes > 60) {
      setError('Snooze must be between 1 and 60 minutes.')
      return
    }
    onSave({ ...draft, label: draft.label.trim().slice(0, 40) })
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        size="tall"
        title={alarm ? 'Edit alarm' : 'New alarm'}
        description={alarm ? `Currently set for ${timeLabel}` : 'Set the time, then shape how it wakes you.'}
        footer={
          <div className="flex flex-col gap-3">
            {error && (
              <p role="alert" className="type-caption flex items-center gap-2 text-danger">
                <Icon name="info" size={15} />
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" block onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" block onClick={handleSave}>
                <Icon name="check" size={17} />
                {alarm ? 'Save changes' : 'Save alarm'}
              </Button>
            </div>
          </div>
        }
      >
        {/* --- Time ------------------------------------------------------- */}
        <div className="surface-elevated relative mb-6 overflow-hidden rounded-[var(--r-xl)] px-3 py-5">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 h-48 opacity-70"
            style={{
              backgroundImage:
                'radial-gradient(60% 100% at 50% 100%, var(--g-ambient-a) 0%, transparent 70%)',
            }}
          />
          <div className="relative">
            <TimePicker
              hour={draft.hour}
              minute={draft.minute}
              hourCycle={settings.hourCycle}
              onChange={(hour, minute) => patch({ hour, minute })}
            />
          </div>
        </div>

        {/* --- Repeat ----------------------------------------------------- */}
        <Section title="Repeat">
          <div className="p-4">
            <SegmentedControl
              wrap
              label="Repeat"
              value={repeatMode}
              options={REPEAT_OPTIONS}
              onChange={applyRepeatMode}
            />
            {repeatMode === 'custom' && (
              <div className="anim-rise mt-3">
                <DaySelector
                  value={draft.repeat}
                  onChange={(days) => {
                    patch({ repeat: days })
                    setError(null)
                  }}
                  weekStart={settings.weekStart}
                />
              </div>
            )}
          </div>
        </Section>

        {/* --- Label ------------------------------------------------------ */}
        <Section title="Label">
          <div className="p-4">
            <TextField
              label="What is this alarm for?"
              placeholder="Wake up"
              maxLength={40}
              value={draft.label}
              onValueChange={(label) => patch({ label })}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {LABEL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => patch({ label: suggestion })}
                  className="press rounded-full border border-[color:var(--c-border)] bg-[color:var(--c-surface-input)] px-3 py-1.5 text-[0.8125rem] text-ink-2 hover:border-[color:var(--c-border-strong)] hover:text-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* --- Sound & feedback ------------------------------------------- */}
        <Section title="Sound & feedback">
          <SettingRow
            icon="waves"
            title="Alarm sound"
            description={soundName(draft.soundId)}
            onClick={() => setSoundOpen(true)}
            control={<Icon name="chevron-right" size={18} />}
          />

          <SettingRow icon="volume" title="Alarm volume">
            <Slider
              label="Alarm volume"
              value={Math.round(draft.volume * 100)}
              valueText={`${Math.round(draft.volume * 100)}%`}
              onChange={(value) => patch({ volume: value / 100 })}
            />
          </SettingRow>

          <SettingRow
            icon="sparkle"
            title="Gradual volume"
            description="Start quiet and rise, instead of full volume at once"
            control={
              <Toggle
                checked={draft.gradual}
                onChange={(gradual) => patch({ gradual })}
                label="Gradual volume"
              />
            }
          >
            {draft.gradual && (
              <div className="anim-rise">
                <p className="type-caption mb-2 text-ink-3">Reach full volume over</p>
                <SegmentedControl
                  wrap
                  label="Gradual volume duration"
                  value={draft.gradualSeconds}
                  options={GRADUAL_OPTIONS}
                  onChange={(gradualSeconds) => patch({ gradualSeconds })}
                />
              </div>
            )}
          </SettingRow>

          <SettingRow
            icon="vibrate"
            title="Vibration"
            description={
              vibrationSupported()
                ? 'Vibrate while the alarm rings'
                : 'Not supported on this device — sound only'
            }
            control={
              <Toggle
                checked={draft.vibrate && vibrationSupported()}
                onChange={(vibrate) => patch({ vibrate })}
                label="Vibration"
                disabled={!vibrationSupported()}
              />
            }
          />
        </Section>

        {/* --- Snooze ----------------------------------------------------- */}
        <Section title="Snooze">
          <div className="p-4">
            <SegmentedControl
              wrap
              label="Snooze duration"
              value={snoozeIsCustom ? -1 : draft.snoozeMinutes}
              options={[
                ...SNOOZE_PRESETS.map((m) => ({ value: m, label: `${m} min` })),
                { value: -1, label: 'Custom' },
              ]}
              onChange={(value) => {
                setError(null)
                patch({ snoozeMinutes: value === -1 ? 12 : value })
              }}
            />
            {snoozeIsCustom && (
              <div className="anim-rise mt-4">
                <Slider
                  label="Custom snooze"
                  min={1}
                  max={60}
                  value={draft.snoozeMinutes}
                  valueText={`${draft.snoozeMinutes} min`}
                  onChange={(snoozeMinutes) => patch({ snoozeMinutes })}
                />
              </div>
            )}
            <p className="type-caption mt-3 text-ink-3">
              Snoozing rings this alarm again in {draft.snoozeMinutes} minutes.
            </p>
          </div>
        </Section>

        {alarm && (
          <Section>
            <SettingRow
              icon="trash"
              danger
              title="Delete alarm"
              description="This cannot be undone"
              onClick={() => setConfirmDelete(true)}
              control={<Icon name="chevron-right" size={18} />}
            />
          </Section>
        )}
      </Sheet>

      <SoundSelector
        open={soundOpen}
        onClose={() => setSoundOpen(false)}
        value={draft.soundId}
        volume={draft.volume}
        onSelect={(soundId) => {
          patch({ soundId })
          setSoundOpen(false)
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this alarm?"
        description={`${timeLabel}${draft.label ? ` · ${draft.label}` : ''} will be removed permanently.`}
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (alarm) onDelete(alarm)
        }}
      />
    </>
  )
}
