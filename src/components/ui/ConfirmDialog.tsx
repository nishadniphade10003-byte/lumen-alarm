import { createPortal } from 'react-dom'
import { Icon } from '@/components/icons/Icon'
import type { IconName } from '@/components/icons/Icon'
import { Button } from './Button'
import { useOverlay } from './overlay'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  icon?: IconName
  destructive?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  icon = 'trash',
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const panelRef = useOverlay(open, onClose)
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-5">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onClose}
        className="anim-fade absolute inset-0 cursor-default bg-[color:var(--c-bg-veil)] backdrop-blur-md"
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        tabIndex={-1}
        className="anim-scale surface-modal relative w-full max-w-[380px] rounded-[var(--r-xl)] p-6 outline-none"
      >
        <span
          className={
            destructive
              ? 'mb-4 grid size-12 place-items-center rounded-[var(--r-md)] bg-[color:var(--c-danger-soft)] text-danger'
              : 'mb-4 grid size-12 place-items-center rounded-[var(--r-md)] bg-[color:var(--c-accent-soft)] text-accent'
          }
        >
          <Icon name={icon} size={22} />
        </span>
        <h2 id="confirm-title" className="type-heading">
          {title}
        </h2>
        <p id="confirm-body" className="type-body mt-2 text-ink-2">
          {description}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" block onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            block
            data-autofocus
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
