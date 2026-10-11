import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  hint?: string
  onValueChange: (value: string) => void
}

export function TextField({ label, hint, onValueChange, className, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <div className="w-full">
      <label htmlFor={id} className="type-caption mb-1.5 block text-ink-2">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          'h-12 w-full rounded-[var(--r-md)] border border-[color:var(--c-border)]',
          'bg-[color:var(--c-surface-input)] px-4 text-[0.9375rem] text-ink',
          'placeholder:text-ink-3 transition-colors',
          'focus:border-[color:var(--c-border-active)] focus:bg-[color:var(--c-surface-hover)]',
          className,
        )}
        onChange={(e) => onValueChange(e.target.value)}
        {...rest}
      />
      {hint && <p className="type-caption mt-1.5 text-ink-3">{hint}</p>}
    </div>
  )
}
