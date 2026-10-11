import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { formatTimeParts } from '@/lib/time'
import type { Alarm } from '@/types'
import { Countdown } from './Countdown'

interface SnoozeBannerProps {
  alarm: Alarm
  until: number
  hourCycle: 12 | 24
  onDismiss: () => void
}

/** Persistent, calm confirmation that a snooze is running — with a way out. */
export function SnoozeBanner({ alarm, until, hourCycle, onDismiss }: SnoozeBannerProps) {
  const { time, suffix } = formatTimeParts(alarm.hour, alarm.minute, hourCycle)

  return (
    <div className="anim-rise surface-elevated relative overflow-hidden rounded-[var(--r-lg)] p-4 sm:p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-16 size-44 rounded-full opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, var(--g-ambient-c) 0%, transparent 66%)',
        }}
      />

      <div className="relative flex flex-wrap items-center gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--r-md)] bg-[color:var(--c-accent-soft)] text-accent">
          <Icon name="snooze" size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="type-title">Snoozed</p>
          <p className="type-caption mt-0.5 text-ink-2">
            {alarm.label || 'Alarm'} · {time} {suffix} rings again in{' '}
            <Countdown to={until} mode="precise" className="font-semibold text-ink" />
          </p>
        </div>

        <Button size="sm" variant="secondary" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
