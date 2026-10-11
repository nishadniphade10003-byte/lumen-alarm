import { Icon } from '@/components/icons/Icon'
import { Button } from '@/components/ui/Button'
import { AlarmList } from '@/components/alarm/AlarmList'
import { EmptyState } from '@/components/alarm/EmptyState'
import { NextAlarmCard } from '@/components/alarm/NextAlarmCard'
import { SnoozeBanner } from '@/components/alarm/SnoozeBanner'
import { TimeDisplay } from '@/components/alarm/TimeDisplay'
import { findNextAlarm, nextOccurrence } from '@/lib/time'
import { useNow } from '@/lib/useNow'
import { sortBy } from '@/lib/utils'
import type { Alarm, Settings } from '@/types'

interface HomeScreenProps {
  alarms: Alarm[]
  settings: Settings
  removingId: string | null
  onCreate: () => void
  onEdit: (alarm: Alarm) => void
  onToggle: (alarm: Alarm, enabled: boolean) => void
  onDelete: (alarm: Alarm) => void
  onDismissSnooze: (alarm: Alarm) => void
  onTest: (alarm: Alarm) => void
  onViewAll: () => void
}

const UPCOMING_LIMIT = 3

export function HomeScreen({
  alarms,
  settings,
  removingId,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
  onDismissSnooze,
  onTest,
  onViewAll,
}: HomeScreenProps) {
  const now = useNow(30_000)
  const next = findNextAlarm(alarms, now)
  const snoozed = alarms.find((a) => a.snoozedUntil !== null && a.snoozedUntil > now.getTime())

  // The soonest few enabled alarms, in the order they will actually ring.
  const upcoming = sortBy(
    alarms.filter((a) => a.enabled && nextOccurrence(a, now) !== null),
    (a) => nextOccurrence(a, now) ?? Number.MAX_SAFE_INTEGER,
  ).slice(0, UPCOMING_LIMIT)

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      {/* --- Clock + next alarm ------------------------------------------ */}
      <div className="anim-rise lg:sticky lg:top-12 lg:self-start">
        <TimeDisplay hourCycle={settings.hourCycle} />

        <div className="mt-8 flex flex-col gap-4">
          {snoozed?.snoozedUntil != null && (
            <SnoozeBanner
              alarm={snoozed}
              until={snoozed.snoozedUntil}
              hourCycle={settings.hourCycle}
              onDismiss={() => onDismissSnooze(snoozed)}
            />
          )}

          {next ? (
            <NextAlarmCard
              alarm={next.alarm}
              at={next.at}
              hourCycle={settings.hourCycle}
              weekStart={settings.weekStart}
              onOpen={() => onEdit(next.alarm)}
            />
          ) : alarms.length > 0 ? (
            // Only when alarms exist but are all switched off. With none at all the
            // empty state below is the single call to action.
            <div className="surface rounded-[var(--r-xl)] p-6">
              <span className="mb-4 grid size-11 place-items-center rounded-[var(--r-md)] bg-[color:var(--c-surface-input)] text-ink-3">
                <Icon name="bell" size={20} />
              </span>
              <p className="type-title">No alarms scheduled</p>
              <p className="type-body mt-1 text-ink-2">
                Every alarm is switched off right now.
              </p>
              <Button variant="primary" className="mt-5" onClick={onCreate}>
                <Icon name="plus" size={17} />
                Add alarm
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* --- Upcoming + tools -------------------------------------------- */}
      <div className="mt-10 lg:mt-0">
        {alarms.length === 0 ? (
          <EmptyState
            title="No alarms yet"
            description="Set your first alarm and start your day your way."
            actionLabel="Create alarm"
            onAction={onCreate}
          />
        ) : (
          <>
            <div className="mb-3.5 flex items-baseline justify-between gap-3 px-1">
              <h2 className="type-label text-ink-3">Upcoming</h2>
              <button
                type="button"
                onClick={onViewAll}
                className="type-caption inline-flex items-center gap-1 font-medium text-ink-2 transition-colors hover:text-ink"
              >
                All alarms
                <Icon name="chevron-right" size={14} />
              </button>
            </div>

            {upcoming.length > 0 ? (
              <AlarmList
                alarms={upcoming}
                hourCycle={settings.hourCycle}
                weekStart={settings.weekStart}
                nextAlarmId={next?.alarm.id}
                removingId={removingId}
                onEdit={onEdit}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ) : (
              <div className="surface rounded-[var(--r-lg)] px-4 py-6 text-center">
                <p className="type-body text-ink-2">
                  Nothing is scheduled. Turn an alarm back on to see it here.
                </p>
              </div>
            )}

            {next && (
              <div className="surface anim-rise mt-6 flex items-center gap-4 rounded-[var(--r-lg)] px-4 py-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-[var(--r-sm)] bg-[color:var(--c-surface-input)] text-ink-2">
                  <Icon name="bolt" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="type-title">Preview the alarm</p>
                  <p className="type-caption mt-0.5 text-ink-3">
                    Ring “{next.alarm.label || 'Alarm'}” now. Your schedule stays as it is.
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onTest(next.alarm)}>
                  Test
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
