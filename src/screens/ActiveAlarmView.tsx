import { createPortal } from 'react-dom'
import { Ambient } from '@/components/layout/Ambient'
import { Icon } from '@/components/icons/Icon'
import { TimeDisplay } from '@/components/alarm/TimeDisplay'
import { soundName } from '@/data/sounds'
import { formatTime, greeting } from '@/lib/time'
import { useNow } from '@/lib/useNow'
import { cn } from '@/lib/utils'
import type { Alarm, Ringing } from '@/types'

interface ActiveAlarmViewProps {
  ring: Ringing
  alarm: Alarm
  hourCycle: 12 | 24
  /** Alarms waiting behind this one. */
  queued: number
  onSnooze: () => void
  onDismiss: () => void
}

/**
 * Full-screen takeover. Everything here is oversized on purpose: it has to work
 * for someone who is barely awake, so the two actions are unmissable and the
 * decoration stays behind them.
 */
export function ActiveAlarmView({
  ring,
  alarm,
  hourCycle,
  queued,
  onSnooze,
  onDismiss,
}: ActiveAlarmViewProps) {
  const now = useNow(30_000)

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Alarm ringing: ${alarm.label || 'Alarm'}`}
      className="anim-fade fixed inset-0 z-[80] flex flex-col overflow-hidden"
    >
      <Ambient mood="active" className="!fixed" />

      {/* Pulsing light behind the content — the visual stand-in for the sound */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="relative grid size-[min(78vw,420px)] place-items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute inset-0 rounded-full border border-white/20"
              style={{
                animation: `pulse-ring 3.4s var(--ease-out) ${i * 1.1}s infinite`,
              }}
            />
          ))}
          <span
            className="grad-active grad-animate anim-breathe absolute inset-[22%] rounded-full opacity-70 blur-2xl"
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-6 pb-[calc(1.5rem+var(--safe-b))] pt-[calc(2rem+var(--safe-t))]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.09em] text-white backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            {ring.isTest ? 'Test alarm' : 'Alarm'}
          </span>

          {queued > 0 && (
            <span className="type-caption rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white backdrop-blur">
              +{queued} more waiting
            </span>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-8 text-center text-white">
          <TimeDisplay hourCycle={hourCycle} showGreeting={false} className="items-center" />

          <p className="type-heading mt-6 font-light">{greeting(now)}</p>
          <p className="mt-2 max-w-[22ch] text-[1.75rem] font-semibold leading-tight tracking-[-0.02em]">
            {alarm.label || 'Time to get up'}
          </p>

          <div className="mt-5 flex items-center gap-4 text-white/85">
            <span className="type-caption inline-flex items-center gap-1.5">
              <Icon name="alarm" size={14} />
              {formatTime(alarm.hour, alarm.minute, hourCycle)}
            </span>
            <span className="type-caption inline-flex items-center gap-1.5">
              <Icon name="waves" size={14} />
              {soundName(alarm.soundId)}
            </span>
          </div>

          {/* Sound rhythm made visible */}
          <div aria-hidden className="mt-7 flex h-8 items-end gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <span
                key={i}
                className="w-1 origin-bottom rounded-full bg-white/70"
                style={{
                  height: 32,
                  animation: `bar-wave ${900 + ((i * 137) % 520)}ms var(--ease-in-out) ${i * 90}ms infinite`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-3">
          <button
            type="button"
            onClick={onSnooze}
            className={cn(
              'press flex h-16 w-full items-center justify-center gap-2.5 rounded-[var(--r-xl)]',
              'border border-white/25 bg-white/12 text-lg font-semibold text-white backdrop-blur-xl',
              'hover:bg-white/20',
            )}
          >
            <Icon name="snooze" size={22} />
            Snooze · {alarm.snoozeMinutes} min
          </button>

          <button
            type="button"
            onClick={onDismiss}
            data-autofocus
            className="press flex h-[4.5rem] w-full items-center justify-center gap-2.5 rounded-[var(--r-xl)] bg-white text-xl font-bold text-[color:#0d1128] shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)] hover:brightness-95"
          >
            <Icon name="check" size={24} strokeWidth={2.4} />
            Dismiss
          </button>

          <p className="type-caption mt-1 text-center text-white/75">
            {ring.isTest
              ? 'This is a test — your real schedule is untouched.'
              : 'Alarm stops automatically after 5 minutes.'}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
