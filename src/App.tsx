import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import type { Route } from '@/components/layout/Navigation'
import { Icon } from '@/components/icons/Icon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ToastViewport } from '@/components/ui/ToastViewport'
import { draftFromSettings } from '@/state/reducer'
import { useApp } from '@/state/AppContext'
import { useAlarmActions } from '@/state/useAlarmActions'
import { useAlarmEngine } from '@/state/useAlarmEngine'
import { useToast } from '@/state/ToastContext'
import { ActiveAlarmView } from '@/screens/ActiveAlarmView'
import { AlarmEditor } from '@/screens/AlarmEditor'
import { AlarmsScreen } from '@/screens/AlarmsScreen'
import { HistoryScreen } from '@/screens/HistoryScreen'
import { HomeScreen } from '@/screens/HomeScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import type { Alarm, AlarmDraft } from '@/types'

/** Card removal plays out before the alarm actually leaves state. */
const REMOVE_ANIMATION_MS = 240

const draftOf = (alarm: Alarm): AlarmDraft => ({
  hour: alarm.hour,
  minute: alarm.minute,
  label: alarm.label,
  repeat: alarm.repeat,
  enabled: alarm.enabled,
  soundId: alarm.soundId,
  volume: alarm.volume,
  vibrate: alarm.vibrate,
  gradual: alarm.gradual,
  gradualSeconds: alarm.gradualSeconds,
  snoozeMinutes: alarm.snoozeMinutes,
})

export default function App() {
  const { state, dispatch, persistent } = useApp()
  const actions = useAlarmActions()
  const { notify } = useToast()
  useAlarmEngine()

  const [route, setRoute] = useState<Route>('home')
  const [editor, setEditor] = useState<{ alarm: Alarm | null; draft: AlarmDraft } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Alarm | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmClearHistory, setConfirmClearHistory] = useState(false)

  const { alarms, settings, history, ringQueue } = state
  const ring = ringQueue[0] ?? null
  const ringingAlarm = ring ? alarms.find((a) => a.id === ring.alarmId) ?? null : null

  const openCreate = () => setEditor({ alarm: null, draft: draftFromSettings(settings) })
  const openEdit = (alarm: Alarm) => setEditor({ alarm, draft: draftOf(alarm) })

  /** Let the card collapse before the alarm disappears from state. */
  const removeAlarm = (alarm: Alarm) => {
    setRemovingId(alarm.id)
    window.setTimeout(() => {
      actions.deleteAlarm(alarm)
      setRemovingId(null)
    }, REMOVE_ANIMATION_MS)
  }

  const handleSave = (draft: AlarmDraft) => {
    if (editor?.alarm) actions.updateAlarm(editor.alarm.id, draft)
    else actions.createAlarm(draft)
    setEditor(null)
  }

  const commonListProps = {
    settings,
    removingId,
    onCreate: openCreate,
    onEdit: openEdit,
    onToggle: actions.toggleAlarm,
    onDelete: setPendingDelete,
  }

  return (
    <>
      <AppShell
        route={route}
        onNavigate={setRoute}
        activeCount={alarms.filter((a) => a.enabled).length}
        width={route === 'home' ? 'wide' : 'narrow'}
      >
        {route === 'home' && (
          <HomeScreen
            alarms={alarms}
            {...commonListProps}
            onDismissSnooze={actions.dismissAlarm}
            onTest={actions.testAlarm}
            onViewAll={() => setRoute('alarms')}
          />
        )}

        {route === 'alarms' && <AlarmsScreen alarms={alarms} {...commonListProps} />}

        {route === 'history' && (
          <HistoryScreen
            history={history}
            settings={settings}
            onClear={() => setConfirmClearHistory(true)}
            onGoToAlarms={() => setRoute('alarms')}
          />
        )}

        {route === 'settings' && (
          <SettingsScreen
            settings={settings}
            alarms={alarms}
            historyCount={history.length}
            persistent={persistent}
            onChange={actions.updateSettings}
            onReset={() => {
              dispatch({ type: 'data/reset' })
              notify('All data cleared')
            }}
            onTest={actions.testAlarm}
          />
        )}
      </AppShell>

      {/* Thumb-reachable create action, mobile only — desktop has header buttons */}
      {(route === 'home' || route === 'alarms') && alarms.length > 0 && (
        <button
          type="button"
          onClick={openCreate}
          aria-label="Add alarm"
          className="grad-primary edge-light press fixed bottom-[calc(var(--nav-height)+1.25rem+var(--safe-b))] right-5 z-40 flex h-14 items-center gap-2 rounded-full px-5 font-semibold text-white shadow-[var(--shadow-glow)] sm:hidden"
        >
          <Icon name="plus" size={20} strokeWidth={2.2} />
          Add alarm
        </button>
      )}

      {editor && (
        <AlarmEditor
          open
          alarm={editor.alarm}
          initialDraft={editor.draft}
          settings={settings}
          onClose={() => setEditor(null)}
          onSave={handleSave}
          onDelete={(alarm) => {
            setEditor(null)
            removeAlarm(alarm)
          }}
        />
      )}

      {ring && ringingAlarm && (
        <ActiveAlarmView
          ring={ring}
          alarm={ringingAlarm}
          hourCycle={settings.hourCycle}
          queued={ringQueue.length - 1}
          onSnooze={() => actions.snoozeAlarm(ringingAlarm)}
          onDismiss={() => actions.dismissAlarm(ringingAlarm)}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this alarm?"
        description={
          pendingDelete
            ? `${pendingDelete.label || 'This alarm'} will be removed permanently.`
            : ''
        }
        confirmLabel="Delete"
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeAlarm(pendingDelete)
        }}
      />

      <ConfirmDialog
        open={confirmClearHistory}
        title="Clear history?"
        description="Every recorded alarm event will be removed. Your alarms are not affected."
        confirmLabel="Clear history"
        onClose={() => setConfirmClearHistory(false)}
        onConfirm={() => {
          dispatch({ type: 'history/clear' })
          notify('History cleared')
        }}
      />

      <ToastViewport />
    </>
  )
}
