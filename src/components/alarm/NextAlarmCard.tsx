import { Icon } from '@/components/icons/Icon'
import { soundName } from '@/data/sounds'
import { formatRepeat, formatTimeParts, formatRelativeDay } from '@/lib/time'
import { useNow } from '@/lib/useNow'
import type { Alarm } from '@/types'
import { Countdown } from './Countdown'

interface NextAlarmCardProps {
  alarm: Alarm
  at: number
  hourCycle: 12 | 24
  weekStart: 0 | 1
  onOpen: () => void
}

/**
 * The dashboard's second focal point. The only place in the app that combines
 * a full gradient field with drifting animation — which is what makes it read
 * as the primary object on the screen.
 */
export function NextAlarmCard({ alarm, at, hourCycle, weekStart, onOpen }: NextAlarmCardProps) {
  const now = useNow(30_000)
  const snoozed = alarm.snoozedUntil !== null && alarm.snoozedUntil > now.getTime()
  // While snoozed the card must show when it will actually ring, not the
  // time the alarm is configured for.
  const target = new Date(at)
  const { time, suffix } = snoozed
    ? formatTimeParts(target.getHours(), target.getMinutes(), hourCycle)
    : formatTimeParts(alarm.hour, alarm.minute, hourCycle)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grad-primary grad-animate edge-light press group relative w-full overflow-hidden rounded-[var(--r-xl)] p-5 text-left text-white shadow-[var(--shadow-glow)] sm:p-6"
    >
      {/* Inner light field lifts the centre of the card away from its edges */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 0%, transparent 62%)',
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="type-label text-white/85">
            {snoozed ? 'Snoozed until' : 'Next alarm'}
          </p>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="tnum text-[3rem] font-extralight leading-none tracking-[-0.045em] sm:text-[3.5rem]">
              {time}
            </span>
            {suffix && <span className="text-base font-semibold text-white/90">{suffix}</span>}
          </div>

          <p className="type-body mt-3 font-medium">
            {alarm.label || 'Alarm'}
            <span className="text-white/80"> · {formatRepeat(alarm.repeat, weekStart)}</span>
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-transform duration-[var(--dur-normal)] group-hover:translate-x-0.5">
          <Icon name="chevron-right" size={18} />
        </span>
      </div>

      <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/25 pt-4 text-white">
        <span className="type-caption inline-flex items-center gap-1.5 font-semibold text-white">
          <Icon name="clock" size={14} />
          <Countdown to={at} prefix="Rings in" />
        </span>
        <span className="type-caption inline-flex items-center gap-1.5">
          <Icon name="calendar" size={14} />
          {formatRelativeDay(at)}
        </span>
        <span className="type-caption inline-flex items-center gap-1.5">
          <Icon name="waves" size={14} />
          {soundName(alarm.soundId)}
        </span>
      </div>
    </button>
  )
}
