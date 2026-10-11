import { PageHeader } from '@/components/layout/AppShell'
import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { AlarmList } from '@/components/alarm/AlarmList'
import { EmptyState } from '@/components/alarm/EmptyState'
import { findNextAlarm, nextOccurrence } from '@/lib/time'
import { useNow } from '@/lib/useNow'
import { sortBy } from '@/lib/utils'
import type { Alarm, Settings } from '@/types'

interface AlarmsScreenProps {
  alarms: Alarm[]
  settings: Settings
  removingId: string | null
  onCreate: () => void
  onEdit: (alarm: Alarm) => void
  onToggle: (alarm: Alarm, enabled: boolean) => void
  onDelete: (alarm: Alarm) => void
}

/** Time-of-day ordering, so a disabled 6am alarm still sits above a 9am one. */
const byClock = (alarm: Alarm) => alarm.hour * 60 + alarm.minute

export function AlarmsScreen({
  alarms,
  settings,
  removingId,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}: AlarmsScreenProps) {
  const now = useNow(30_000)
  const next = findNextAlarm(alarms, now)
  const active = sortBy(
    alarms.filter((a) => a.enabled),
    (a) => nextOccurrence(a, now) ?? Number.MAX_SAFE_INTEGER,
  )
  const off = sortBy(alarms.filter((a) => !a.enabled), byClock)

  if (alarms.length === 0) {
    return (
      <>
        <PageHeader title="Alarms" />
        <EmptyState
          title="No alarms yet"
          description="Set your first alarm and start your day your way."
          actionLabel="Create alarm"
          onAction={onCreate}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Alarms"
        description={`${active.length} on · ${off.length} off`}
        action={
          <Button variant="primary" onClick={onCreate} className="max-sm:hidden">
            <Icon name="plus" size={17} />
            Add alarm
          </Button>
        }
      />

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="type-label mb-3 px-1 text-ink-3">Scheduled</h2>
          <AlarmList
            alarms={active}
            hourCycle={settings.hourCycle}
            weekStart={settings.weekStart}
            nextAlarmId={next?.alarm.id}
            removingId={removingId}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        </section>
      )}

      {off.length > 0 && (
        <section className="mb-8">
          <h2 className="type-label mb-3 px-1 text-ink-3">Turned off</h2>
          <AlarmList
            alarms={off}
            hourCycle={settings.hourCycle}
            weekStart={settings.weekStart}
            removingId={removingId}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        </section>
      )}
    </>
  )
}
