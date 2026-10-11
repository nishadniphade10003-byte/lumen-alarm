/** Day indexes follow `Date.prototype.getDay()`: 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ThemePreference = 'dark' | 'light' | 'system'

export type ResolvedTheme = 'dark' | 'light'

export interface Alarm {
  id: string
  /** 0–23. Stored in 24h form; the 12/24h split is a presentation concern. */
  hour: number
  /** 0–59 */
  minute: number
  label: string
  /** Empty array = fires once, then disables itself. */
  repeat: Weekday[]
  enabled: boolean
  soundId: string
  /** 0–1 */
  volume: number
  vibrate: boolean
  gradual: boolean
  /** Ramp-up length in seconds. */
  gradualSeconds: number
  snoozeMinutes: number
  createdAt: number
  /**
   * Absolute timestamp of a pending snooze. Takes priority over the regular
   * schedule until it fires or the alarm is dismissed.
   */
  snoozedUntil: number | null
  /** Occurrence timestamp of the most recent firing; guards against re-firing. */
  lastFiredAt: number | null
}

export type AlarmDraft = Omit<Alarm, 'id' | 'createdAt' | 'snoozedUntil' | 'lastFiredAt'>

export type HistoryOutcome = 'dismissed' | 'snoozed' | 'missed'

export interface HistoryEvent {
  id: string
  alarmId: string
  label: string
  hour: number
  minute: number
  /** When the alarm first rang for this session. */
  firedAt: number
  /** When the user (or the auto-stop) resolved it. */
  resolvedAt: number
  outcome: HistoryOutcome
  snoozeCount: number
}

/** A ring session survives across snoozes so the history keeps one row. */
export interface RingSession {
  alarmId: string
  firedAt: number
  snoozeCount: number
}

export interface Ringing {
  alarmId: string
  /** Occurrence timestamp that triggered this ring. */
  occurrence: number
  startedAt: number
  /** Test rings never touch schedules or history. */
  isTest: boolean
}

export interface Settings {
  theme: ThemePreference
  /** Defaults applied to newly created alarms. */
  defaultSnoozeMinutes: number
  defaultVolume: number
  defaultVibrate: boolean
  defaultGradual: boolean
  defaultGradualSeconds: number
  defaultSoundId: string
  notifications: boolean
  upcomingReminder: boolean
  hourCycle: 12 | 24
  weekStart: 0 | 1
  haptics: boolean
}

export interface AlarmSound {
  id: string
  name: string
  description: string
  /** Character of the generated patch; drives both audio and the UI motif. */
  family: 'ambient' | 'rhythmic' | 'melodic' | 'bell'
}

export interface AppState {
  alarms: Alarm[]
  history: HistoryEvent[]
  settings: Settings
  sessions: Record<string, RingSession>
  /** Head of the queue is on screen; extras stack up when alarms collide. */
  ringQueue: Ringing[]
}
