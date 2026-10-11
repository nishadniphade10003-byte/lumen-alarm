import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'active'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'grad-primary edge-light text-white shadow-[var(--shadow-glow)] hover:brightness-110',
  active: 'grad-active edge-light text-white shadow-[var(--shadow-glow)] hover:brightness-110',
  secondary:
    'surface text-ink hover:bg-[color:var(--c-surface-hover)] hover:border-[color:var(--c-border-strong)]',
  ghost: 'text-ink-2 hover:text-ink hover:bg-[color:var(--c-surface-hover)]',
  danger:
    'bg-[color:var(--c-danger-soft)] text-danger border border-[color:var(--c-danger-soft)] hover:border-danger',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[0.8125rem] rounded-[var(--r-sm)] gap-1.5 font-medium',
  md: 'h-12 px-5 text-[0.9375rem] rounded-[var(--r-md)] gap-2 font-semibold',
  lg: 'h-14 px-6 text-base rounded-[var(--r-lg)] gap-2.5 font-semibold',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Stretch to the full width of the parent. */
  block?: boolean
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  block,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'press relative inline-flex items-center justify-center whitespace-nowrap',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    />
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only controls carry no visible text. */
  label: string
  tone?: 'default' | 'danger'
  children: ReactNode
}

export function IconButton({ label, tone = 'default', className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'press inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--r-md)]',
        'border border-[color:var(--c-border)] bg-[color:var(--c-surface)]',
        'hover:bg-[color:var(--c-surface-hover)] hover:border-[color:var(--c-border-strong)]',
        tone === 'danger' ? 'text-danger' : 'text-ink-2 hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
