import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Ambient } from './Ambient'
import { BottomNav, SideRail } from './Navigation'
import type { Route } from './Navigation'

interface AppShellProps {
  route: Route
  onNavigate: (route: Route) => void
  activeCount: number
  /** Narrow keeps reading-length content comfortable on wide screens. */
  width?: 'narrow' | 'wide'
  children: ReactNode
}

export function AppShell({
  route,
  onNavigate,
  activeCount,
  width = 'narrow',
  children,
}: AppShellProps) {
  return (
    <div className="min-h-dvh">
      <Ambient />
      <SideRail route={route} onNavigate={onNavigate} activeCount={activeCount} />

      <main className="lg:pl-[248px]">
        <div
          className={cn(
            'mx-auto w-full px-5 pt-[calc(1.5rem+var(--safe-t))] sm:px-7 lg:px-10 lg:pt-12',
            'pb-[calc(var(--nav-height)+3.5rem+var(--safe-b))] lg:pb-16',
            width === 'wide' ? 'max-w-[560px] lg:max-w-[1100px]' : 'max-w-[560px] lg:max-w-[760px]',
          )}
        >
          {children}
        </div>
      </main>

      <BottomNav route={route} onNavigate={onNavigate} activeCount={activeCount} />
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="anim-rise mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="type-heading text-[1.625rem]">{title}</h1>
        {description && <p className="type-body mt-1 text-ink-2">{description}</p>}
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </header>
  )
}
