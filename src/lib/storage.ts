/**
 * localStorage with graceful degradation. Private-mode Safari, disabled site
 * data and quota exhaustion all throw; none of those should break the app, so
 * failures fall back to in-memory state and are reported to the caller.
 */

const memoryFallback = new Map<string, string>()
let storageAvailable: boolean | null = null

function probe(): boolean {
  if (storageAvailable !== null) return storageAvailable
  try {
    const key = '__lumen_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    storageAvailable = true
  } catch {
    storageAvailable = false
  }
  return storageAvailable
}

export function isPersistent(): boolean {
  return probe()
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = probe() ? window.localStorage.getItem(key) : memoryFallback.get(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Returns false when the value could not be persisted to disk. */
export function writeJSON(key: string, value: unknown): boolean {
  const raw = JSON.stringify(value)
  memoryFallback.set(key, raw)
  if (!probe()) return false
  try {
    window.localStorage.setItem(key, raw)
    return true
  } catch {
    storageAvailable = false
    return false
  }
}
