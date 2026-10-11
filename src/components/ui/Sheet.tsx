import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icons/Icon'
import { useOverlay } from './overlay'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** Full-height presentation for the alarm editor. */
  size?: 'auto' | 'tall'
}

/**
 * Bottom sheet on small screens, centred panel from a tablet up — the same
 * component in both cases so state and focus behave identically.
 */
export function Sheet({ open, onClose, title, description, children, footer, size = 'auto' }: SheetProps) {
  const panelRef = useOverlay(open, onClose)
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="anim-fade absolute inset-0 cursor-default bg-[color:var(--c-bg-veil)] backdrop-blur-md"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'anim-sheet surface-modal relative flex w-full flex-col outline-none',
          'rounded-t-[var(--r-2xl)] sm:rounded-[var(--r-2xl)]',
          'sm:max-w-[520px] sm:m-6',
          size === 'tall'
            ? 'max-h-[94dvh] h-[94dvh] sm:h-auto sm:max-h-[88dvh]'
            : 'max-h-[86dvh]',
        )}
      >
        <div className="flex items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          {/* Grab handle reads as "draggable" on touch, hidden from AT */}
          <span
            aria-hidden
            className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-[color:var(--c-border-strong)] sm:hidden"
          />
          <div className="min-w-0 flex-1 pt-1">
            <h2 className="type-heading">{title}</h2>
            {description && <p className="type-caption mt-1 text-ink-3">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press -mr-1 -mt-1 grid size-10 place-items-center rounded-[var(--r-sm)] text-ink-3 hover:bg-[color:var(--c-surface-hover)] hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>

        {footer && (
          <div className="border-t border-[color:var(--c-border)] px-5 py-4 pb-[calc(1rem+var(--safe-b))] sm:px-6 sm:pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
