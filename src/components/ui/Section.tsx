import type { ReactNode } from 'react'
import { Icon } from '@/components/icons/Icon'
import type { IconName } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

/** A grouped card of related rows — the backbone of Settings and the editor. */
export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={cn('mb-6', className)}>
      {title && (
        <div className="mb-2.5 px-1">
          <h2 className="type-label text-ink-3">{title}</h2>
          {description && <p className="type-caption mt-1 text-ink-3">{description}</p>}
        </div>
      )}
      <div className="surface overflow-hidden rounded-[var(--r-lg)]">{children}</div>
    </section>
  )
}

interface SettingRowProps {
  icon?: IconName
  title: string
  description?: string
  /** Right-hand control: a Toggle, a value, a chevron. */
  control?: ReactNode
  /** Renders the row as a button. */
  onClick?: () => void
  /** Content that drops below the row, e.g. a slider or a day picker. */
  children?: ReactNode
  danger?: boolean
}

export function SettingRow({
  icon,
  title,
  description,
  control,
  onClick,
  children,
  danger,
}: SettingRowProps) {
  const body = (
    <>
      {icon && (
        <span
          className={cn(
            'mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--r-sm)]',
            danger
              ? 'bg-[color:var(--c-danger-soft)] text-danger'
              : 'bg-[color:var(--c-surface-input)] text-ink-2',
          )}
        >
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className={cn('type-title block', danger && 'text-danger')}>{title}</span>
        {description && <span className="type-caption mt-0.5 block text-ink-3">{description}</span>}
      </span>
      {control && <span className="flex shrink-0 items-center gap-2 text-ink-3">{control}</span>}
    </>
  )

  return (
    <div className="border-b border-[color:var(--c-border)] last:border-b-0">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="press flex w-full items-center gap-3.5 px-4 py-3.5 text-left hover:bg-[color:var(--c-surface-hover)]"
        >
          {body}
        </button>
      ) : (
        <div className="flex items-center gap-3.5 px-4 py-3.5">{body}</div>
      )}
      {children && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

/** Row that only exists to display a value, e.g. About entries. */
export function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[color:var(--c-border)] px-4 py-3.5 last:border-b-0">
      <span className="type-body text-ink-2">{label}</span>
      <span className="type-body tnum text-ink">{value}</span>
    </div>
  )
}
