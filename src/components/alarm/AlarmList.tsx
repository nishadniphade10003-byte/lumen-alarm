import type { Alarm } from '@/types'
import { cn } from '@/lib/utils'
import { AlarmCard } from './AlarmCard'

interface AlarmListProps {
  alarms: Alarm[]
  hourCycle: 12 | 24
  weekStart: 0 | 1
  nextAlarmId?: string | null
  /** Card currently animating out ahead of its removal from state. */
  removingId?: string | null
  onEdit: (alarm: Alarm) => void
  onToggle: (alarm: Alarm, enabled: boolean) => void
  onDelete: (alarm: Alarm) => void
  className?: string
}

export function AlarmList({
  alarms,
  hourCycle,
  weekStart,
  nextAlarmId,
  removingId,
  onEdit,
  onToggle,
  onDelete,
  className,
}: AlarmListProps) {
  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {alarms.map((alarm, index) => (
        <li
          key={alarm.id}
          className={cn(removingId === alarm.id ? 'anim-collapse' : 'anim-rise')}
          style={
            removingId === alarm.id
              ? undefined
              : { animationDelay: `${Math.min(index, 6) * 45}ms` }
          }
        >
          <AlarmCard
            alarm={alarm}
            hourCycle={hourCycle}
            weekStart={weekStart}
            isNext={alarm.id === nextAlarmId}
            onEdit={onEdit}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}
