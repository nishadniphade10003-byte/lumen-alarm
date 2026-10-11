import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { uid } from '@/lib/utils'

export type ToastTone = 'default' | 'success' | 'danger'

export interface Toast {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

interface ToastApi {
  toasts: Toast[]
  notify: (title: string, options?: { description?: string; tone?: ToastTone }) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TOAST_MS = 3400

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const notify = useCallback<ToastApi['notify']>(
    (title, options) => {
      const toast: Toast = {
        id: uid('toast'),
        title,
        description: options?.description,
        tone: options?.tone ?? 'default',
      }
      // Keep at most three on screen so feedback never buries the interface.
      setToasts((current) => [...current.slice(-2), toast])
      timers.current.set(
        toast.id,
        window.setTimeout(() => dismiss(toast.id), TOAST_MS),
      )
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss])
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
