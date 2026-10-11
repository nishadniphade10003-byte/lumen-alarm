import type { Alarm, Weekday } from '@/types'

export const MINUTE_MS = 60_000
export const HOUR_MS = 3_600_000
export const DAY_MS = 86_400_000

export const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5]
export const WEEKEND: Weekday[] = [0, 6]
export const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6]

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_INITIAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const dayShort = (d: number) => DAY_SHORT[d]
export const dayInitial = (d: number) => DAY_INITIAL[d]
export const dayLong = (d: number) => DAY_LONG[d]

/** Days of the week ordered for display, honouring the week-start preference. */
export function orderedDays(weekStart: 0 | 1): Weekday[] {
  return weekStart === 1
    ? [1, 2, 3, 4, 5, 6, 0]
    : [0, 1, 2, 3, 4, 5, 6]
}

/** Midnight at the start of `date`'s local day. */
export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Build a concrete local timestamp for `hour:minute` on the day `dayOffset`
 * days from `from`. Uses setHours + date arithmetic so DST shifts and month
 * boundaries are handled by the platform rather than by us.
 */
export function timestampFor(from: Date, dayOffset: number, hour: number, minute: number): number {
  const d = startOfDay(from)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(hour, minute, 0, 0)
  return d.getTime()
}

/**
 * The next moment this alarm should ring, or `null` when it never will.
 * A pending snooze always wins over the regular schedule.
 */
export function nextOccurrence(alarm: Alarm, now: Date = new Date()): number | null {
  if (!alarm.enabled) return null

  const nowMs = now.getTime()
  if (alarm.snoozedUntil && alarm.snoozedUntil > nowMs) return alarm.snoozedUntil

  // One-shot alarm: today if still ahead, otherwise tomorrow.
  if (alarm.repeat.length === 0) {
    const today = timestampFor(now, 0, alarm.hour, alarm.minute)
    return today > nowMs ? today : timestampFor(now, 1, alarm.hour, alarm.minute)
  }

  // Recurring: scan the next 8 days so "later today" and "same day next week"
  // both resolve correctly.
  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = timestampFor(now, offset, alarm.hour, alarm.minute)
    const weekday = new Date(candidate).getDay() as Weekday
    if (alarm.repeat.includes(weekday) && candidate > nowMs) return candidate
  }
  return null
}

/**
 * The most recent moment this alarm was due at or before `now`, within
 * `graceMs`. Used by the engine to detect a firing without relying on the tick
 * landing exactly on the target second.
 */
export function dueOccurrence(alarm: Alarm, now: Date, graceMs: number): number | null {
  if (!alarm.enabled) return null
  const nowMs = now.getTime()

  if (alarm.snoozedUntil) {
    const withinGrace = nowMs - alarm.snoozedUntil
    return withinGrace >= 0 && withinGrace <= graceMs ? alarm.snoozedUntil : null
  }

  const scan = alarm.repeat.length === 0 ? 1 : 8
  for (let offset = 0; offset < scan; offset += 1) {
    const candidate = timestampFor(now, -offset, alarm.hour, alarm.minute)
    const elapsed = nowMs - candidate
    if (elapsed < 0 || elapsed > graceMs) continue
    if (alarm.repeat.length === 0) return candidate
    const weekday = new Date(candidate).getDay() as Weekday
    if (alarm.repeat.includes(weekday)) return candidate
  }
  return null
}

/** The enabled alarm that will ring soonest, with its timestamp. */
export function findNextAlarm(
  alarms: Alarm[],
  now: Date = new Date(),
): { alarm: Alarm; at: number } | null {
  let best: { alarm: Alarm; at: number } | null = null
  for (const alarm of alarms) {
    const at = nextOccurrence(alarm, now)
    if (at === null) continue
    // Ties resolve to the alarm created first, so the order stays stable.
    if (!best || at < best.at || (at === best.at && alarm.createdAt < best.alarm.createdAt)) {
      best = { alarm, at }
    }
  }
  return best
}

/* ---------------------------------------------------------------------------
 * Formatting
 * ------------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, '0')

export interface ClockParts {
  hour: string
  minute: string
  second: string
  /** Empty string in 24h mode. */
  suffix: string
}

export function clockParts(date: Date, hourCycle: 12 | 24): ClockParts {
  const h24 = date.getHours()
  const hour =
    hourCycle === 24 ? pad(h24) : String(h24 % 12 === 0 ? 12 : h24 % 12)
  return {
    hour,
    minute: pad(date.getMinutes()),
    second: pad(date.getSeconds()),
    suffix: hourCycle === 24 ? '' : h24 < 12 ? 'AM' : 'PM',
  }
}

/** "7:00 AM" / "07:00" */
export function formatTime(hour: number, minute: number, hourCycle: 12 | 24): string {
  if (hourCycle === 24) return `${pad(hour)}:${pad(minute)}`
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:${pad(minute)} ${hour < 12 ? 'AM' : 'PM'}`
}

/** Splits the time so the suffix can be typeset smaller than the numerals. */
export function formatTimeParts(
  hour: number,
  minute: number,
  hourCycle: 12 | 24,
): { time: string; suffix: string } {
  if (hourCycle === 24) return { time: `${pad(hour)}:${pad(minute)}`, suffix: '' }
  const h = hour % 12 === 0 ? 12 : hour % 12
  return { time: `${h}:${pad(minute)}`, suffix: hour < 12 ? 'AM' : 'PM' }
}

/** "Thursday, September 3" */
export function formatFullDate(date: Date): string {
  return `${DAY_LONG[date.getDay()]}, ${MONTH_LONG[date.getMonth()]} ${date.getDate()}`
}

/** "Sep 3" */
export function formatShortDate(date: Date): string {
  return `${MONTH_LONG[date.getMonth()].slice(0, 3)} ${date.getDate()}`
}

/** "Today" / "Yesterday" / "Monday" / "Sep 3" */
export function formatRelativeDay(ts: number, now: Date = new Date()): string {
  const days = Math.round(
    (startOfDay(now).getTime() - startOfDay(new Date(ts)).getTime()) / DAY_MS,
  )
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days > 1 && days < 7) return DAY_LONG[new Date(ts).getDay()]
  return formatShortDate(new Date(ts))
}

/** Human summary of a repeat pattern: "Weekdays", "Mon · Wed · Fri", "Once". */
export function formatRepeat(repeat: Weekday[], weekStart: 0 | 1 = 1): string {
  if (repeat.length === 0) return 'Once'
  if (repeat.length === 7) return 'Every day'
  const set = new Set(repeat)
  if (set.size === 5 && WEEKDAYS.every((d) => set.has(d))) return 'Weekdays'
  if (set.size === 2 && WEEKEND.every((d) => set.has(d))) return 'Weekends'
  return orderedDays(weekStart)
    .filter((d) => set.has(d))
    .map((d) => DAY_SHORT[d])
    .join(' · ')
}

/** Coarse "in 6h 18m" phrasing for the next-alarm hero. */
export function formatLeadTime(ms: number): string {
  if (ms <= 0) return 'now'
  const totalMinutes = Math.floor(ms / MINUTE_MS)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return 'less than a minute'
}

/** Precise "09:58" / "1:04:22" countdown for snooze and imminent alarms. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`
}

/** Time-of-day greeting used on the dashboard and the ringing screen. */
export function greeting(date: Date): string {
  const h = date.getHours()
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}
