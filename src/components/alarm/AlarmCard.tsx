import { Icon } from '@/components/icons/Icon'
import { Toggle } from '@/components/ui/Toggle'
import { soundName } from '@/data/sounds'
import { formatRepeat, formatTimeParts, nextOccurrence } from '@/lib/time'
import { useNow } from '@/lib/useNow'
import { cn } from '@/lib/utils'
import type { Alarm } from '@/types'
import { Countdown } from './Countdown'

interface AlarmCardProps {
  alarm: Alarm
  hourCycle: 12 | 24
  weekStart: 0 | 1
  /** Highlights the alarm that will ring soonest. */
  isNext?: boolean
  onEdit: (alarm: Alarm) => void
  onToggle: (alarm: Alarm, enabled: boolean) => void
  onDelete: (alarm: Alarm) => void
}

export function AlarmCard({
  alarm,
  hourCycle,
  weekStart,
  isNext,
  onEdit,
  onToggle,
  onDelete,
}: AlarmCardProps) {
  // A coarse tick keeps the countdown source, the snooze chip and the next
  // occurrence honest without reading the clock during render.
  const now = useNow(30_000)
  const { time, suffix } = formatTimeParts(alarm.hour, alarm.minute, hourCycle)
  const upcoming = nextOccurrence(alarm, now)
  const snoozed = alarm.snoozedUntil !== null && alarm.snoozedUntil > now.getTime()

  return (
    <article
      className={cn(
        'group surface relative flex items-stretch overflow-hidden rounded-[var(--r-lg)] transition-all duration-[var(--dur-normal)]',
        alarm.enabled
          ? 'hover:border-[color:var(--c-border-strong)] hover:bg-[color:var(--c-surface-hover)]'
          : 'opacity-55',
        isNext && alarm.enabled && 'border-[color:var(--c-border-active)]',
      )}
    >
      {/* Accent rail marks the next alarm without adding another colour block */}
      {isNext && alarm.enabled && (
        <span aria-hidden className="grad-primary absolute inset-y-0 left-0 w-[3px]" />
      )}

      <button
        type="button"
        onClick={() => onEdit(alarm)}
        aria-label={`Edit alarm ${time} ${suffix} ${alarm.label || ''}`.trim()}
        className="min-w-0 flex-1 px-4 py-4 text-left sm:px-5"
      >
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'tnum text-[2.125rem] font-light leading-none tracking-[-0.04em] sm:text-[2.375rem]',
              alarm.enabled ? 'text-ink' : 'text-ink-2',
            )}
          >
            {time}
          </span>
          {suffix && <span className="type-label text-ink-3">{suffix}</span>}
          {snoozed && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[color:var(--c-accent-soft)] px-2 py-0.5 text-[0.6875rem] font-semibold text-accent">
              <Icon name="snooze" size={12} />
              Snoozed
            </span>
          )}
        </div>

        <p className="type-title mt-2 truncate">
          {alarm.label || <span className="text-ink-3 font-normal">No label</span>}
        </p>

        <p className="type-caption mt-0.5 text-ink-3">
          {formatRepeat(alarm.repeat, weekStart)}
          {alarm.enabled && upcoming !== null && (
            <>
              {' · '}
              <Countdown to={upcoming} prefix="in" />
            </>
          )}
        </p>

        <div className="type-caption mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="waves" size={14} />
            {soundName(alarm.soundId)}
          </span>
          <span className="inline-flex items-center gap-1.5 tnum">
            <Icon name={alarm.volume === 0 ? 'volume-off' : 'volume'} size={14} />
            {Math.round(alarm.volume * 100)}%
          </span>
          {alarm.vibrate && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="vibrate" size={14} />
              Vibrate
            </span>
          )}
          {alarm.gradual && (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="sparkle" size={14} />
              Gradual
            </span>
          )}
        </div>
      </button>

      <div className="flex flex-col items-center justify-center gap-3 py-4 pr-4 sm:pr-5">
        <Toggle
          checked={alarm.enabled}
          onChange={(next) => onToggle(alarm, next)}
          label={`${alarm.label || 'Alarm'} at ${time} ${suffix}`.trim()}
        />
        <button
          type="button"
          onClick={() => onDelete(alarm)}
          aria-label={`Delete alarm ${time} ${suffix}`.trim()}
          className="press grid size-9 place-items-center rounded-[var(--r-sm)] text-ink-3 opacity-0 transition-opacity hover:bg-[color:var(--c-danger-soft)] hover:text-danger focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
        >
          <Icon name="trash" size={17} />
        </button>
      </div>
    </article>
  )
}
