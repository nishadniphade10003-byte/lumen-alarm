import { Icon } from '@/components/icons/Icon'
import type { IconName } from '@/components/icons/Icon'
import { cn } from '@/lib/utils'

export type Route = 'home' | 'alarms' | 'history' | 'settings'

const TABS: Array<{ id: Route; label: string; icon: IconName }> = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'alarms', label: 'Alarms', icon: 'alarm' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

interface NavigationProps {
  route: Route
  onNavigate: (route: Route) => void
  /** Count shown on the Alarms tab. */
  activeCount: number
}

/** Thumb-reachable tab bar. Mobile and tablet only — desktop uses the rail. */
export function BottomNav({ route, onNavigate, activeCount }: NavigationProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 lg:hidden"
      style={{ paddingBottom: 'var(--safe-b)' }}
    >
      <div className="mx-3 mb-3 rounded-[var(--r-xl)] border border-[color:var(--c-border)] bg-[color:var(--c-surface-modal)] px-1.5 py-1.5 shadow-[var(--shadow-raised)] backdrop-blur-2xl">
        <ul className="grid grid-cols-4">
          {TABS.map((tab) => {
            const active = tab.id === route
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'press relative flex w-full flex-col items-center gap-1 rounded-[var(--r-md)] py-2',
                    active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-[var(--r-md)] bg-[color:var(--c-surface-active)]"
                    />
                  )}
                  <span className="relative">
                    <Icon name={tab.icon} size={21} strokeWidth={active ? 1.9 : 1.6} />
                    {tab.id === 'alarms' && activeCount > 0 && (
                      <span className="grad-primary absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white tnum">
                        {activeCount}
                      </span>
                    )}
                  </span>
                  <span className="relative text-[0.6875rem] font-medium">{tab.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

/** Desktop rail: a persistent, more spacious navigation with room to breathe. */
export function SideRail({ route, onNavigate, activeCount }: NavigationProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[color:var(--c-border)] px-4 py-7 lg:flex"
    >
      <div className="mb-9 flex items-center gap-2.5 px-3">
        <span className="grad-primary edge-light grid size-9 place-items-center rounded-[var(--r-sm)] text-white">
          <Icon name="clock" size={19} strokeWidth={1.9} />
        </span>
        <span className="type-title tracking-tight">Lumen</span>
      </div>

      <ul className="flex flex-col gap-1">
        {TABS.map((tab) => {
          const active = tab.id === route
          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onNavigate(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'press flex w-full items-center gap-3 rounded-[var(--r-md)] px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'bg-[color:var(--c-surface-active)] text-ink'
                    : 'text-ink-2 hover:bg-[color:var(--c-surface-hover)] hover:text-ink',
                )}
              >
                <Icon name={tab.icon} size={20} strokeWidth={active ? 1.9 : 1.6} />
                <span className="type-body flex-1 font-medium">{tab.label}</span>
                {tab.id === 'alarms' && activeCount > 0 && (
                  <span className="tnum rounded-full bg-[color:var(--c-surface-input)] px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-2">
                    {activeCount}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="type-caption mt-auto px-3 text-ink-3">
        Lumen · v1.0
        <br />
        Designed for calm mornings.
      </p>
    </nav>
  )
}
