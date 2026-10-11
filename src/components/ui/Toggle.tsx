import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

/**
 * A real `role="switch"` so keyboard and screen readers work without extra
 * wiring. The knob and track animate independently for a tactile flip.
 */
export function Toggle({ checked, onChange, label, disabled, size = 'md' }: ToggleProps) {
  const track = size === 'sm' ? 'h-6 w-11' : 'h-7 w-[52px]'
  const knob = size === 'sm' ? 'size-[18px]' : 'size-[22px]'
  const travel = size === 'sm' ? 'translate-x-[20px]' : 'translate-x-[24px]'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'press relative shrink-0 rounded-full border p-[3px] transition-colors',
        track,
        checked
          ? 'grad-primary border-transparent shadow-[0_6px_18px_-8px_var(--g-primary-via)]'
          : 'border-[color:var(--c-border)] bg-[color:var(--c-surface-input)]',
        disabled && 'opacity-40',
      )}
    >
      <span
        className={cn(
          'block rounded-full bg-white transition-transform duration-[var(--dur-normal)] ease-[var(--ease-spring)]',
          knob,
          checked ? travel : 'translate-x-0',
          !checked && 'opacity-70',
        )}
      />
    </button>
  )
}
