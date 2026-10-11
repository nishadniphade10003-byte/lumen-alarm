import { createPortal } from 'react-dom'
import { Icon } from '@/components/icons/Icon'
import { useToast } from '@/state/ToastContext'
import type { ToastTone } from '@/state/ToastContext'
import { cn } from '@/lib/utils'

const TONE: Record<ToastTone, { icon: 'check' | 'info' | 'bell'; accent: string }> = {
  default: { icon: 'bell', accent: 'text-accent' },
  success: { icon: 'check', accent: 'text-success' },
  danger: { icon: 'info', accent: 'text-danger' },
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()
  if (toasts.length === 0) return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav-height)+1rem+var(--safe-b))] z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:right-6 lg:left-auto lg:items-end"
    >
      {toasts.map((toast) => {
        const tone = TONE[toast.tone]
        return (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            className={cn(
              'anim-toast surface-modal pointer-events-auto flex w-full max-w-[420px] items-start gap-3',
              'rounded-[var(--r-lg)] px-4 py-3 text-left',
            )}
          >
            <span className={cn('mt-0.5 shrink-0', tone.accent)}>
              <Icon name={tone.icon} size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="type-title block truncate">{toast.title}</span>
              {toast.description && (
                <span className="type-caption mt-0.5 block text-ink-2">{toast.description}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>,
    document.body,
  )
}
