import { useEffect, useRef } from 'react'
import { audioEngine, describeAudioFailure } from '@/lib/audio'
import { ALARM_VIBRATION, stopVibration, vibrate } from '@/lib/haptics'
import { showNotification } from '@/lib/notifications'
import { dueOccurrence, findNextAlarm, formatTime, MINUTE_MS } from '@/lib/time'
import { useApp } from './AppContext'
import { useToast } from './ToastContext'

/** How late a tick may be and still count as "this alarm is due now". */
const GRACE_MS = 60_000
/** An unattended alarm gives up after this long and is logged as missed. */
const AUTO_STOP_MS = 5 * 60_000
/** Lead time for the optional "coming up" notification. */
const REMINDER_LEAD_MS = 10 * 60_000
const TICK_MS = 1000

/**
 * Drives the whole alarm lifecycle: detects due alarms, starts and stops sound
 * and vibration, posts notifications, and gives up on an unattended alarm.
 * Mounted once, near the root.
 */
export function useAlarmEngine(): void {
  const { state, dispatch } = useApp()
  const { notify } = useToast()

  // The tick reads live state through a ref so the interval is never rebuilt.
  // Refs are written after commit, never during render.
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  const remindedRef = useRef(new Set<number>())
  const vibrationTimer = useRef<number | null>(null)

  /* --- Detect due alarms ------------------------------------------------ */
  useEffect(() => {
    const check = () => {
      const current = stateRef.current
      const now = new Date()

      for (const alarm of current.alarms) {
        if (current.ringQueue.some((r) => r.alarmId === alarm.id)) continue
        const due = dueOccurrence(alarm, now, GRACE_MS)
        if (due === null || alarm.lastFiredAt === due) continue
        dispatch({ type: 'alarm/fire', id: alarm.id, occurrence: due, isTest: false })
      }

      // Abandon a ring nobody answered.
      const head = current.ringQueue[0]
      if (head && Date.now() - head.startedAt > AUTO_STOP_MS) {
        dispatch({ type: 'alarm/miss', id: head.alarmId })
      }

      // Optional heads-up before the next alarm.
      if (current.settings.notifications && current.settings.upcomingReminder) {
        const next = findNextAlarm(current.alarms, now)
        if (next) {
          const lead = next.at - now.getTime()
          if (lead > 0 && lead <= REMINDER_LEAD_MS && !remindedRef.current.has(next.at)) {
            remindedRef.current.add(next.at)
            showNotification(
              'Alarm coming up',
              `${next.alarm.label || 'Alarm'} at ${formatTime(
                next.alarm.hour,
                next.alarm.minute,
                current.settings.hourCycle,
              )}`,
              `upcoming-${next.at}`,
            )
          }
        }
      }
    }

    check()
    const interval = window.setInterval(check, TICK_MS)
    // A backgrounded tab throttles timers; re-check the moment it returns.
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [dispatch])

  /* --- Sound, vibration and notification for the alarm on screen -------- */
  const head = state.ringQueue[0] ?? null
  const ringingAlarm = head ? state.alarms.find((a) => a.id === head.alarmId) ?? null : null
  const ringKey = head ? `${head.alarmId}:${head.startedAt}` : null

  // Latest values for the ring effect, which must not re-run when they change
  // — restarting it would restart the sound.
  const notifyRef = useRef(notify)
  const alarmRef = useRef(ringingAlarm)
  const settingsRef = useRef(state.settings)
  useEffect(() => {
    notifyRef.current = notify
    alarmRef.current = ringingAlarm
    settingsRef.current = state.settings
  })

  useEffect(() => {
    if (!ringKey) return
    const alarm = alarmRef.current
    if (!alarm) return
    let cancelled = false

    void audioEngine
      .play(alarm.soundId, {
        volume: alarm.volume,
        gradual: alarm.gradual,
        gradualSeconds: alarm.gradualSeconds,
      })
      .then((result) => {
        if (cancelled || result === true) return
        notifyRef.current(describeAudioFailure(result), { tone: 'danger' })
      })

    if (alarm.vibrate) {
      const period = ALARM_VIBRATION.reduce((sum, n) => sum + n, 0)
      if (vibrate(ALARM_VIBRATION)) {
        vibrationTimer.current = window.setInterval(() => vibrate(ALARM_VIBRATION), period)
      }
    }

    if (settingsRef.current.notifications) {
      showNotification(
        alarm.label || 'Alarm',
        `${formatTime(alarm.hour, alarm.minute, settingsRef.current.hourCycle)} · tap to open`,
        `alarm-${alarm.id}`,
      )
    }

    return () => {
      cancelled = true
      audioEngine.stop()
      if (vibrationTimer.current !== null) {
        window.clearInterval(vibrationTimer.current)
        vibrationTimer.current = null
      }
      stopVibration()
    }
  }, [ringKey])

  /* --- Unlock audio on the first gesture -------------------------------- */
  useEffect(() => {
    const unlock = () => {
      void audioEngine.unlock()
    }
    const options = { once: true, passive: true } as const
    window.addEventListener('pointerdown', unlock, options)
    window.addEventListener('keydown', unlock, options)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  /* --- Forget stale reminder markers ------------------------------------ */
  useEffect(() => {
    const prune = window.setInterval(() => {
      const cutoff = Date.now() - MINUTE_MS
      for (const ts of remindedRef.current) {
        if (ts < cutoff) remindedRef.current.delete(ts)
      }
    }, 5 * MINUTE_MS)
    return () => window.clearInterval(prune)
  }, [])
}
