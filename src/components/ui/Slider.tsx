import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  onCommit?: (value: number) => void
  label: string
  /** Rendered to the right of the label, e.g. "72%". */
  valueText?: string
  className?: string
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onCommit,
  label,
  valueText,
  className,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="type-caption text-ink-2">{label}</span>
        {valueText && <span className="type-caption tnum text-ink font-semibold">{valueText}</span>}
      </div>
      <input
        type="range"
        className="slider"
        style={{ '--fill': `${pct}%` } as CSSProperties}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={() => onCommit?.(value)}
        onKeyUp={() => onCommit?.(value)}
      />
    </div>
  )
}
