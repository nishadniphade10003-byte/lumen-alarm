import { PageHeader } from '@/components/layout/AppShell'
import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/alarm/EmptyState'
import { HistoryCard } from '@/components/history/HistoryCard'
import { formatRelativeDay, startOfDay } from '@/lib/time'
import type { HistoryEvent, Settings } from '@/types'

interface HistoryScreenProps {
  history: HistoryEvent[]
  settings: Settings
  onClear: () => void
  onGoToAlarms: () => void
}

/** Groups events under the day they fired, newest day first. */
function groupByDay(history: HistoryEvent[]): Array<[string, HistoryEvent[]]> {
  const groups = new Map<number, HistoryEvent[]>()
  for (const event of history) {
    const key = startOfDay(new Date(event.firedAt)).getTime()
    const bucket = groups.get(key)
    if (bucket) bucket.push(event)
    else groups.set(key, [event])
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([day, events]) => [formatRelativeDay(day), events] as [string, HistoryEvent[]])
}

export function HistoryScreen({ history, settings, onClear, onGoToAlarms }: HistoryScreenProps) {
  if (history.length === 0) {
    return (
      <>
        <PageHeader title="History" />
        <EmptyState
          title="Nothing here yet"
          description="Once an alarm rings, how you handled it shows up here — dismissed, snoozed, or missed."
          actionLabel="Go to alarms"
          onAction={onGoToAlarms}
        />
      </>
    )
  }

  const snoozeTotal = history.reduce((sum, event) => sum + event.snoozeCount, 0)
  const dismissed = history.filter((e) => e.outcome === 'dismissed').length

  return (
    <>
      <PageHeader
        title="History"
        description={`${history.length} alarm${history.length === 1 ? '' : 's'} · ${dismissed} dismissed · ${snoozeTotal} snooze${snoozeTotal === 1 ? '' : 's'}`}
        action={
          <Button size="sm" variant="ghost" onClick={onClear}>
            <Icon name="trash" size={16} />
            Clear
          </Button>
        }
      />

      <div className="flex flex-col gap-7">
        {groupByDay(history).map(([day, events]) => (
          <section key={day}>
            <h2 className="type-label mb-3 px-1 text-ink-3">{day}</h2>
            <div className="flex flex-col gap-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="anim-rise"
                  style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
                >
                  <HistoryCard event={event} hourCycle={settings.hourCycle} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
