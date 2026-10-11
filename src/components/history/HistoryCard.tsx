import { Icon } from '@/components/icons/Icon'
import type { IconName } from '@/components/icons/Icon'
import { formatRelativeDay, formatTimeParts } from '@/lib/time'
import { cn } from '@/lib/utils'
import type { HistoryEvent, HistoryOutcome } from '@/types'

const OUTCOME: Record<HistoryOutcome, { label: string; icon: IconName; className: string }> = {
  dismissed: {
    label: 'Dismissed',
    icon: 'check',
    className: 'bg-[color:color-mix(in_srgb,var(--c-success)_16%,transparent)] text-success',
  },
  snoozed: {
    label: 'Snoozed',
    icon: 'snooze',
    className: 'bg-[color:var(--c-accent-soft)] text-accent',
  },
  missed: {
    label: 'Missed',
    icon: 'info',
    className: 'bg-[color:var(--c-danger-soft)] text-danger',
  },
}

export function HistoryCard({ event, hourCycle }: { event: HistoryEvent; hourCycle: 12 | 24 }) {
  const { time, suffix } = formatTimeParts(event.hour, event.minute, hourCycle)
  const outcome = OUTCOME[event.outcome]

  return (
    <article className="surface flex items-center gap-4 rounded-[var(--r-lg)] px-4 py-3.5">
      <div className="min-w-[5.5rem] shrink-0">
        <p className="tnum text-[1.5rem] font-light leading-none tracking-[-0.035em]">{time}</p>
        {suffix && <p className="type-label mt-1 text-ink-3">{suffix}</p>}
      </div>

      <div className="min-w-0 flex-1">
        <p className="type-title truncate">
          {event.label || <span className="font-normal text-ink-3">No label</span>}
        </p>
        <p className="type-caption mt-0.5 text-ink-3">
          {formatRelativeDay(event.firedAt)}
          {event.snoozeCount > 0 && ` · Snoozed ×${event.snoozeCount}`}
        </p>
      </div>

      <span
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold',
          outcome.className,
        )}
      >
        <Icon name={outcome.icon} size={13} strokeWidth={2.2} />
        {outcome.label}
      </span>
    </article>
  )
}
