import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { Dispatch, ReactNode } from 'react'
import { isPersistent, readJSON, writeJSON } from '@/lib/storage'
import type { AppState, ResolvedTheme } from '@/types'
import { initialState, reducer, seedAlarms, DEFAULT_SETTINGS } from './reducer'
import type { Action } from './reducer'
import { useToast } from './ToastContext'

const STORAGE_KEY = 'lumen.alarm.v1'

interface PersistedShape {
  alarms: AppState['alarms']
  history: AppState['history']
  settings: AppState['settings']
  sessions: AppState['sessions']
}

interface AppApi {
  state: AppState
  dispatch: Dispatch<Action>
  theme: ResolvedTheme
  /** False when alarms live only in memory for this session. */
  persistent: boolean
}

const AppContext = createContext<AppApi | null>(null)

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Read persisted state before the first render, so the dashboard never flashes
 * empty and no extra render is spent hydrating it.
 */
function loadInitialState(): AppState {
  const saved = readJSON<PersistedShape | null>(STORAGE_KEY, null)
  // First run: a small, real starter set so the dashboard is not a blank.
  if (!saved) return { ...initialState, alarms: seedAlarms() }
  return {
    ...initialState,
    alarms: saved.alarms ?? [],
    history: saved.history ?? [],
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
    sessions: saved.sessions ?? {},
    // Ring state is deliberately not restored: a reload should never resurrect
    // an alarm the user already walked away from.
    ringQueue: [],
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState)
  const [system, setSystem] = useState<ResolvedTheme>(systemTheme)
  const { notify } = useToast()
  const warnedAboutStorage = useRef(false)

  // --- Save on change -----------------------------------------------------
  // Writes are coalesced: dragging a slider changes state on every frame, and
  // serialising the whole store that often is pure waste. Anything still
  // pending is flushed when the page goes away.
  const pending = useRef<PersistedShape | null>(null)

  const flush = useCallback(() => {
    const payload = pending.current
    if (!payload) return
    pending.current = null
    const ok = writeJSON(STORAGE_KEY, payload)
    if (!ok && !warnedAboutStorage.current) {
      warnedAboutStorage.current = true
      notify('Alarms are not being saved', {
        description: 'Storage is unavailable, so changes will be lost on reload.',
        tone: 'danger',
      })
    }
  }, [notify])

  useEffect(() => {
    pending.current = {
      alarms: state.alarms,
      history: state.history,
      settings: state.settings,
      sessions: state.sessions,
    }
    const timer = window.setTimeout(flush, 200)
    return () => window.clearTimeout(timer)
  }, [state.alarms, state.history, state.settings, state.sessions, flush])

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onHide)
      flush()
    }
  }, [flush])

  // --- Theme --------------------------------------------------------------
  useEffect(() => {
    if (!window.matchMedia) return
    const query = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => setSystem(query.matches ? 'light' : 'dark')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const theme: ResolvedTheme =
    state.settings.theme === 'system' ? system : state.settings.theme

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f8fd' : '#05060d')
  }, [theme])

  const value = useMemo<AppApi>(
    () => ({ state, dispatch, theme, persistent: isPersistent() }),
    [state, theme],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
