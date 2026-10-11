import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const ITEM_H = 52
const VISIBLE = 5
const TRACK_H = ITEM_H * VISIBLE
const PAD = (TRACK_H - ITEM_H) / 2

interface WheelColumnProps {
  values: number[]
  value: number
  onChange: (value: number) => void
  label: string
  format: (value: number) => string
}

/**
 * One drum of the picker. Real scrolling with CSS scroll-snap does the physics;
 * a debounced scroll handler commits whichever value settled in the centre
 * band. Exposed as a spinbutton so arrow keys work without touching the mouse.
 */
function WheelColumn({ values, value, onChange, label, format }: WheelColumnProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const settleTimer = useRef<number | null>(null)
  const index = Math.max(0, values.indexOf(value))

  // Keep the drum aligned when the value changes from outside (keys, presets,
  // opening the editor on an existing alarm).
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const target = index * ITEM_H
    if (Math.abs(el.scrollTop - target) < 2) return
    // Instant, not animated: the drum must never report one value while
    // showing another, and an animation in flight is exactly how that happens.
    el.scrollTop = target
  }, [index])

  const handleScroll = () => {
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => {
      const el = trackRef.current
      if (!el) return
      // Runs 90ms after scrolling stops, so this always reads a settled,
      // snapped position — whether the user dragged or we repositioned.
      const settled = Math.round(el.scrollTop / ITEM_H)
      const next = values[Math.min(values.length - 1, Math.max(0, settled))]
      if (next !== value) onChange(next)
    }, 90)
  }

  const step = (delta: number) => {
    const next = values[Math.min(values.length - 1, Math.max(0, index + delta))]
    if (next !== value) onChange(next)
  }

  return (
    <div
      ref={trackRef}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={values[0]}
      aria-valuemax={values[values.length - 1]}
      aria-valuetext={format(value)}
      onScroll={handleScroll}
      onKeyDown={(event) => {
        const map: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 }
        if (event.key in map) {
          event.preventDefault()
          step(map[event.key])
        } else if (event.key === 'Home') {
          event.preventDefault()
          onChange(values[0])
        } else if (event.key === 'End') {
          event.preventDefault()
          onChange(values[values.length - 1])
        }
      }}
      className="wheel w-[3.4rem] rounded-[var(--r-md)] outline-offset-4 sm:w-16"
      style={{ height: TRACK_H, paddingBlock: PAD }}
    >
      {values.map((item, i) => {
        const distance = Math.abs(i - index)
        return (
          <div
            key={item}
            className={cn(
              'wheel-item grid place-items-center tnum transition-all duration-[var(--dur-normal)]',
              distance === 0
                ? 'text-[2.5rem] font-light text-ink sm:text-[2.75rem]'
                : distance === 1
                  ? 'text-[1.6rem] font-light text-ink-2'
                  : 'text-[1.35rem] font-light text-ink-3',
            )}
            style={{ height: ITEM_H, letterSpacing: '-0.03em' }}
          >
            {format(item)}
          </div>
        )
      })}
    </div>
  )
}

interface TimePickerProps {
  /** 0–23 */
  hour: number
  minute: number
  hourCycle: 12 | 24
  onChange: (hour: number, minute: number) => void
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i)
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const pad2 = (n: number) => String(n).padStart(2, '0')

export function TimePicker({ hour, minute, hourCycle, onChange }: TimePickerProps) {
  const isPm = hour >= 12
  const displayHour = hourCycle === 24 ? hour : hour % 12 === 0 ? 12 : hour % 12

  const setDisplayHour = (next: number) => {
    if (hourCycle === 24) return onChange(next, minute)
    const base = next % 12
    onChange(isPm ? base + 12 : base, minute)
  }

  const setPeriod = (pm: boolean) => {
    if (pm === isPm) return
    onChange(pm ? (hour % 12) + 12 : hour % 12, minute)
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {/* The drums and the band they settle into, kept as one unit so the
          AM/PM control never overlaps the selection highlight. */}
      <div className="relative flex items-center gap-1 sm:gap-2">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-2 top-1/2 -translate-y-1/2 rounded-[var(--r-md)] border border-[color:var(--c-border-active)] bg-[color:var(--c-surface-active)]"
          style={{ height: ITEM_H }}
        />

        <WheelColumn
          values={hourCycle === 24 ? HOURS_24 : HOURS_12}
          value={displayHour}
          onChange={setDisplayHour}
          label="Hour"
          format={hourCycle === 24 ? pad2 : String}
        />

        <span
          aria-hidden
          className="relative -mt-1 text-[2rem] font-light text-ink-3 sm:text-[2.25rem]"
        >
          :
        </span>

        <WheelColumn
          values={MINUTES}
          value={minute}
          onChange={(next) => onChange(hour, next)}
          label="Minute"
          format={pad2}
        />
      </div>

      {hourCycle === 12 && (
        <div
          role="radiogroup"
          aria-label="AM or PM"
          className="flex flex-col gap-1.5"
        >
          {[false, true].map((pm) => (
            <button
              key={pm ? 'pm' : 'am'}
              type="button"
              role="radio"
              aria-checked={pm === isPm}
              onClick={() => setPeriod(pm)}
              className={cn(
                'press h-11 w-14 rounded-[var(--r-sm)] text-[0.8125rem] font-semibold tracking-wide transition-colors',
                pm === isPm
                  ? 'grad-primary edge-light text-white shadow-[0_10px_22px_-14px_var(--g-primary-via)]'
                  : 'border border-[color:var(--c-border)] bg-[color:var(--c-surface-input)] text-ink-3 hover:text-ink',
              )}
            >
              {pm ? 'PM' : 'AM'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
