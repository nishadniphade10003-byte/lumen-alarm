import { DEFAULT_SOUND_ID } from '@/data/sounds'
import { MINUTE_MS } from '@/lib/time'
import { uid } from '@/lib/utils'
import type {
  Alarm,
  AlarmDraft,
  AppState,
  HistoryEvent,
  Settings,
  Weekday,
} from '@/types'

export const HISTORY_LIMIT = 60

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  defaultSnoozeMinutes: 10,
  defaultVolume: 0.72,
  defaultVibrate: true,
  defaultGradual: true,
  defaultGradualSeconds: 30,
  defaultSoundId: DEFAULT_SOUND_ID,
  notifications: false,
  upcomingReminder: false,
  hourCycle: 12,
  weekStart: 1,
  haptics: true,
}

export function draftFromSettings(settings: Settings): AlarmDraft {
  return {
    hour: 7,
    minute: 0,
    label: '',
    repeat: [1, 2, 3, 4, 5] as Weekday[],
    enabled: true,
    soundId: settings.defaultSoundId,
    volume: settings.defaultVolume,
    vibrate: settings.defaultVibrate,
    gradual: settings.defaultGradual,
    gradualSeconds: settings.defaultGradualSeconds,
    snoozeMinutes: settings.defaultSnoozeMinutes,
  }
}

/** Alarms shown on a first run so the dashboard has something to say. */
export function seedAlarms(): Alarm[] {
  const now = Date.now()
  const make = (index: number, alarm: Partial<Alarm> & Pick<Alarm, 'hour' | 'minute' | 'label'>): Alarm => ({
    id: uid('alarm'),
    repeat: [],
    enabled: true,
    soundId: DEFAULT_SETTINGS.defaultSoundId,
    volume: DEFAULT_SETTINGS.defaultVolume,
    vibrate: DEFAULT_SETTINGS.defaultVibrate,
    gradual: DEFAULT_SETTINGS.defaultGradual,
    gradualSeconds: DEFAULT_SETTINGS.defaultGradualSeconds,
    snoozeMinutes: DEFAULT_SETTINGS.defaultSnoozeMinutes,
    createdAt: now + index,
    snoozedUntil: null,
    lastFiredAt: null,
    ...alarm,
  })
  return [
    make(0, { hour: 7, minute: 0, label: 'Wake up', repeat: [1, 2, 3, 4, 5], soundId: 'morning-light' }),
    make(1, { hour: 8, minute: 30, label: 'Gym', repeat: [0, 6], soundId: 'pulse', enabled: false }),
    make(2, { hour: 21, minute: 45, label: 'Wind down', repeat: [0, 1, 2, 3, 4, 5, 6], soundId: 'horizon', gradual: true }),
  ]
}

export const initialState: AppState = {
  alarms: [],
  history: [],
  settings: DEFAULT_SETTINGS,
  sessions: {},
  ringQueue: [],
}

export type Action =
  | { type: 'alarm/add'; draft: AlarmDraft }
  | { type: 'alarm/update'; id: string; draft: AlarmDraft }
  | { type: 'alarm/delete'; id: string }
  | { type: 'alarm/toggle'; id: string; enabled: boolean }
  | { type: 'alarm/fire'; id: string; occurrence: number; isTest: boolean }
  | { type: 'alarm/snooze'; id: string }
  | { type: 'alarm/dismiss'; id: string }
  | { type: 'alarm/miss'; id: string }
  | { type: 'settings/update'; patch: Partial<Settings> }
  | { type: 'history/clear' }
  | { type: 'data/reset' }

function replaceAlarm(alarms: Alarm[], id: string, update: (alarm: Alarm) => Alarm): Alarm[] {
  return alarms.map((alarm) => (alarm.id === id ? update(alarm) : alarm))
}

function closeSession(
  state: AppState,
  id: string,
  outcome: HistoryEvent['outcome'],
): { history: HistoryEvent[]; sessions: AppState['sessions'] } {
  const session = state.sessions[id]
  const alarm = state.alarms.find((a) => a.id === id)
  if (!session || !alarm) return { history: state.history, sessions: state.sessions }

  const event: HistoryEvent = {
    id: uid('evt'),
    alarmId: id,
    label: alarm.label,
    hour: alarm.hour,
    minute: alarm.minute,
    firedAt: session.firedAt,
    resolvedAt: Date.now(),
    outcome,
    snoozeCount: session.snoozeCount,
  }
  const sessions = { ...state.sessions }
  delete sessions[id]
  return { history: [event, ...state.history].slice(0, HISTORY_LIMIT), sessions }
}

/** Remove the head of the ring queue for `id`, keeping any stacked alarms. */
function dequeue(state: AppState, id: string): AppState['ringQueue'] {
  const index = state.ringQueue.findIndex((r) => r.alarmId === id)
  if (index === -1) return state.ringQueue
  return state.ringQueue.filter((_, i) => i !== index)
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'alarm/add': {
      const alarm: Alarm = {
        ...action.draft,
        id: uid('alarm'),
        createdAt: Date.now(),
        snoozedUntil: null,
        lastFiredAt: null,
      }
      return { ...state, alarms: [...state.alarms, alarm] }
    }

    case 'alarm/update':
      return {
        ...state,
        alarms: replaceAlarm(state.alarms, action.id, (alarm) => ({
          ...alarm,
          ...action.draft,
          // Editing clears a pending snooze and the re-fire guard: the alarm
          // the user just described is the one that should ring next.
          snoozedUntil: null,
          lastFiredAt: null,
        })),
      }

    case 'alarm/delete': {
      const sessions = { ...state.sessions }
      delete sessions[action.id]
      return {
        ...state,
        alarms: state.alarms.filter((a) => a.id !== action.id),
        ringQueue: state.ringQueue.filter((r) => r.alarmId !== action.id),
        sessions,
      }
    }

    case 'alarm/toggle':
      return {
        ...state,
        alarms: replaceAlarm(state.alarms, action.id, (alarm) => ({
          ...alarm,
          enabled: action.enabled,
          snoozedUntil: action.enabled ? alarm.snoozedUntil : null,
          lastFiredAt: null,
        })),
      }

    case 'alarm/fire': {
      if (state.ringQueue.some((r) => r.alarmId === action.id)) return state
      const alarm = state.alarms.find((a) => a.id === action.id)
      if (!alarm) return state

      return {
        ...state,
        // A test ring never consumes the scheduled occurrence, so the real
        // alarm still goes off at its proper time.
        alarms: action.isTest
          ? state.alarms
          : replaceAlarm(state.alarms, action.id, (a) => ({
              ...a,
              lastFiredAt: action.occurrence,
              snoozedUntil: null,
            })),
        sessions: state.sessions[action.id]
          ? state.sessions
          : {
              ...state.sessions,
              [action.id]: { alarmId: action.id, firedAt: Date.now(), snoozeCount: 0 },
            },
        ringQueue: [
          ...state.ringQueue,
          {
            alarmId: action.id,
            occurrence: action.occurrence,
            startedAt: Date.now(),
            isTest: action.isTest,
          },
        ],
      }
    }

    case 'alarm/snooze': {
      const alarm = state.alarms.find((a) => a.id === action.id)
      if (!alarm) return state
      const session = state.sessions[action.id]
      return {
        ...state,
        alarms: replaceAlarm(state.alarms, action.id, (a) => ({
          ...a,
          // Snoozing re-arms a disabled one-shot alarm so it can ring again.
          enabled: true,
          snoozedUntil: Date.now() + a.snoozeMinutes * MINUTE_MS,
          lastFiredAt: null,
        })),
        sessions: session
          ? { ...state.sessions, [action.id]: { ...session, snoozeCount: session.snoozeCount + 1 } }
          : state.sessions,
        ringQueue: dequeue(state, action.id),
      }
    }

    case 'alarm/dismiss': {
      const ring = state.ringQueue.find((r) => r.alarmId === action.id)
      const alarm = state.alarms.find((a) => a.id === action.id)
      if (!alarm) return state
      const { history, sessions } = closeSession(state, action.id, 'dismissed')
      return {
        ...state,
        alarms: replaceAlarm(state.alarms, action.id, (a) => ({
          ...a,
          snoozedUntil: null,
          // A one-shot alarm has now done its job — unless this was only a test.
          enabled: a.repeat.length === 0 && !ring?.isTest ? false : a.enabled,
        })),
        history,
        sessions,
        ringQueue: dequeue(state, action.id),
      }
    }

    case 'alarm/miss': {
      const { history, sessions } = closeSession(state, action.id, 'missed')
      return {
        ...state,
        alarms: replaceAlarm(state.alarms, action.id, (a) => ({ ...a, snoozedUntil: null })),
        history,
        sessions,
        ringQueue: dequeue(state, action.id),
      }
    }

    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    case 'history/clear':
      return { ...state, history: [] }

    case 'data/reset':
      return { ...initialState, settings: state.settings }

    default:
      return state
  }
}
