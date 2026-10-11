import { clockParts, formatFullDate, greeting } from '@/lib/time'
import { useNow } from '@/lib/useNow'
import { cn } from '@/lib/utils'

interface TimeDisplayProps {
  hourCycle: 12 | 24
  /** Compact form for the ringing screen, which has its own hierarchy. */
  variant?: 'hero' | 'plain'
  showGreeting?: boolean
  className?: string
}

/**
 * The dashboard's anchor: the current time, at the largest size in the app.
 * Ticks every second so the minute flips exactly when the real one does, but
 * only the minute is shown — a seconds readout adds noise, not information.
 */
export function TimeDisplay({
  hourCycle,
  variant = 'hero',
  showGreeting = true,
  className,
}: TimeDisplayProps) {
  const now = useNow(1000)
  const { hour, minute, suffix } = clockParts(now, hourCycle)

  return (
    <div className={cn('flex flex-col', className)}>
      {showGreeting && <p className="type-label mb-3 text-ink-3">{greeting(now)}</p>}

      <div className="flex items-end gap-3">
        <h1
          className={cn(variant === 'hero' ? 'type-display' : 'type-display-sm', 'text-ink')}
          aria-label={`Current time ${hour}:${minute}${suffix ? ` ${suffix}` : ''}`}
        >
          {hour}
          <span className="text-ink-3">:</span>
          {minute}
        </h1>
        {suffix && <span className="type-label mb-[1.1em] text-ink-2">{suffix}</span>}
      </div>

      <p className="type-body mt-2.5 text-ink-2">{formatFullDate(now)}</p>
    </div>
  )
}

