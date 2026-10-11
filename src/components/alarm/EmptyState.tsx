import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/icons/Icon'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * Deliberately not an icon in a circle: a soft light field with concentric
 * rings, drawn from the same gradient system as the rest of the app.
 */
export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="anim-rise flex flex-col items-center px-6 py-14 text-center">
      <div className="relative mb-8 grid size-40 place-items-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, var(--g-ambient-a) 0%, transparent 66%)',
          }}
        />
        <span
          aria-hidden
          className="absolute inset-3 rounded-full border border-[color:var(--c-border)]"
        />
        <span
          aria-hidden
          className="absolute inset-9 rounded-full border border-[color:var(--c-border-strong)]"
        />
        <span className="grad-primary edge-light anim-breathe relative grid size-16 place-items-center rounded-full text-white shadow-[var(--shadow-glow)]">
          <Icon name="alarm" size={26} strokeWidth={1.7} />
        </span>
      </div>

      <h2 className="type-heading">{title}</h2>
      <p className="type-body mt-2 max-w-[34ch] text-ink-2">{description}</p>

      {actionLabel && onAction && (
        <Button variant="primary" size="lg" className="mt-7 px-8" onClick={onAction}>
          <Icon name="plus" size={18} />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
