import { cn } from '@/lib/utils'

export interface Segment<T extends string | number> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string | number> {
  value: T
  options: Segment<T>[]
  onChange: (value: T) => void
  label: string
  /** Wraps onto multiple rows instead of sharing one row equally. */
  wrap?: boolean
  className?: string
}

/**
 * A radio group styled as a pill track. Arrow-key navigation comes free from
 * the native radio semantics of `role="radiogroup"` + focusable buttons.
 */
export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  label,
  wrap,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'gap-1 rounded-[var(--r-md)] border border-[color:var(--c-border)] bg-[color:var(--c-surface-input)] p-1',
        wrap ? 'flex flex-wrap' : 'grid',
        className,
      )}
      style={wrap ? undefined : { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'press h-10 rounded-[var(--r-sm)] px-3 text-[0.8125rem] font-medium transition-colors',
              wrap && 'flex-1 min-w-[84px]',
              selected
                ? 'grad-primary edge-light text-white shadow-[0_8px_20px_-12px_var(--g-primary-via)]'
                : 'text-ink-2 hover:bg-[color:var(--c-surface-hover)] hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
