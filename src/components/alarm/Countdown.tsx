import { formatCountdown, formatLeadTime } from '@/lib/time'
import { useNow } from '@/lib/useNow'

interface CountdownProps {
  /** Target timestamp. */
  to: number
  /** `lead` reads "6h 18m"; `precise` counts down "09:58". */
  mode?: 'lead' | 'precise'
  prefix?: string
  className?: string
}

/**
 * Isolated so its per-second re-render never reaches the surrounding screen.
 * Switches to precise seconds inside the final hour, where they start to matter.
 */
export function Countdown({ to, mode = 'lead', prefix, className }: CountdownProps) {
  const now = useNow(1000)
  const remaining = to - now.getTime()
  const precise = mode === 'precise' || remaining < 60 * 60 * 1000
  const text = precise ? formatCountdown(remaining) : formatLeadTime(remaining)

  return (
    <span className={className}>
      {/* Inherits colour: this renders both on plain surfaces and on the
          gradient hero, where a fixed ink token would be unreadable. */}
      {prefix && <span>{prefix} </span>}
      <span className="tnum">{text}</span>
    </span>
  )
}
