import { useCallback } from 'react'
import { tapFeedback } from '@/lib/haptics'
import { formatLeadTime, formatTime, nextOccurrence } from '@/lib/time'
import type { Alarm, AlarmDraft, Settings } from '@/types'
import { useApp } from './AppContext'
import { useToast } from './ToastContext'

/**
 * Every state change the user can trigger, paired with the feedback that
 * confirms it. Screens call these instead of dispatching directly, so the
 * toasts and haptics stay consistent wherever an action is invoked from.
 */
export function useAlarmActions() {
  const { state, dispatch } = useApp()
  const { notify } = useToast()
  const { settings } = state

  const buzz = useCallback(() => {
    if (settings.haptics) tapFeedback()
  }, [settings.haptics])

  const describeNext = useCallback(
    (alarm: Alarm) => {
      const at = nextOccurrence(alarm)
      return at === null ? undefined : `Rings in ${formatLeadTime(at - Date.now())}`
    },
    [],
  )

  const createAlarm = useCallback(
    (draft: AlarmDraft) => {
      dispatch({ type: 'alarm/add', draft })
      buzz()
      const preview: Alarm = {
        ...draft,
        id: 'preview',
        createdAt: Date.now(),
        snoozedUntil: null,
        lastFiredAt: null,
      }
      notify(`Alarm set for ${formatTime(draft.hour, draft.minute, settings.hourCycle)}`, {
        description: describeNext(preview),
        tone: 'success',
      })
    },
    [dispatch, buzz, notify, settings.hourCycle, describeNext],
  )

  const updateAlarm = useCallback(
    (id: string, draft: AlarmDraft) => {
      dispatch({ type: 'alarm/update', id, draft })
      buzz()
      notify('Alarm updated', {
        description: `Now set for ${formatTime(draft.hour, draft.minute, settings.hourCycle)}`,
        tone: 'success',
      })
    },
    [dispatch, buzz, notify, settings.hourCycle],
  )

  const deleteAlarm = useCallback(
    (alarm: Alarm) => {
      dispatch({ type: 'alarm/delete', id: alarm.id })
      buzz()
      notify('Alarm deleted', {
        description: `${formatTime(alarm.hour, alarm.minute, settings.hourCycle)}${
          alarm.label ? ` · ${alarm.label}` : ''
        }`,
      })
    },
    [dispatch, buzz, notify, settings.hourCycle],
  )

  const toggleAlarm = useCallback(
    (alarm: Alarm, enabled: boolean) => {
      dispatch({ type: 'alarm/toggle', id: alarm.id, enabled })
      buzz()
      notify(enabled ? 'Alarm turned on' : 'Alarm turned off', {
        description: enabled
          ? describeNext({ ...alarm, enabled, snoozedUntil: null })
          : `${formatTime(alarm.hour, alarm.minute, settings.hourCycle)} will not ring`,
      })
    },
    [dispatch, buzz, notify, settings.hourCycle, describeNext],
  )

  const snoozeAlarm = useCallback(
    (alarm: Alarm) => {
      dispatch({ type: 'alarm/snooze', id: alarm.id })
      buzz()
      notify(`Snoozed for ${alarm.snoozeMinutes} minutes`, {
        description: 'It will ring again shortly.',
      })
    },
    [dispatch, buzz, notify],
  )

  const dismissAlarm = useCallback(
    (alarm: Alarm) => {
      dispatch({ type: 'alarm/dismiss', id: alarm.id })
      buzz()
      notify('Alarm dismissed', { tone: 'success' })
    },
    [dispatch, buzz, notify],
  )

  /** Development affordance: ring immediately without touching the schedule. */
  const testAlarm = useCallback(
    (alarm: Alarm) => {
      dispatch({ type: 'alarm/fire', id: alarm.id, occurrence: Date.now(), isTest: true })
    },
    [dispatch],
  )

  /**
   * Pass `message: null` for a silent update. Continuous controls use it
   * while dragging and announce once on release, instead of firing a toast
   * and a haptic tap on every step.
   */
  const updateSettings = useCallback(
    (patch: Partial<Settings>, message: string | null = 'Settings updated') => {
      dispatch({ type: 'settings/update', patch })
      if (message === null) return
      buzz()
      notify(message)
    },
    [dispatch, buzz, notify],
  )

  return {
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    snoozeAlarm,
    dismissAlarm,
    testAlarm,
    updateSettings,
  }
}
