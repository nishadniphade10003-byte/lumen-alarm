import { dayInitial, dayLong, orderedDays } from '@/lib/time'
import { cn } from '@/lib/utils'
import type { Weekday } from '@/types'

interface DaySelectorProps {
  value: Weekday[]
  onChange: (days: Weekday[]) => void
  weekStart: 0 | 1
}

export function DaySelector({ value, onChange, weekStart }: DaySelectorProps) {
  const selected = new Set(value)

  const toggle = (day: Weekday) => {
    const next = new Set(selected)
    if (next.has(day)) next.delete(day)
    else next.add(day)
    onChange([...next].sort((a, b) => a - b) as Weekday[])
  }

  return (
    <div role="group" aria-label="Repeat on days" className="flex justify-between gap-1.5">
      {orderedDays(weekStart).map((day) => {
        const on = selected.has(day)
        return (
          <button
            key={day}
            type="button"
            aria-pressed={on}
            aria-label={dayLong(day)}
            onClick={() => toggle(day)}
            className={cn(
              'press grid aspect-square flex-1 place-items-center rounded-[var(--r-md)] text-[0.875rem] font-semibold transition-colors',
              on
                ? 'grad-primary edge-light text-white shadow-[0_10px_22px_-14px_var(--g-primary-via)]'
                : 'border border-[color:var(--c-border)] bg-[color:var(--c-surface-input)] text-ink-3 hover:text-ink hover:border-[color:var(--c-border-strong)]',
            )}
          >
            {dayInitial(day)}
          </button>
        )
      })}
    </div>
  )
}
