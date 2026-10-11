/** Vibration is unavailable on desktop and on iOS Safari; degrade quietly. */
export function vibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

export function vibrate(pattern: number | number[]): boolean {
  if (!vibrationSupported()) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}

export function stopVibration(): void {
  if (vibrationSupported()) {
    try {
      navigator.vibrate(0)
    } catch {
      /* nothing to stop */
    }
  }
}

/** Short confirmation tap for toggles and selections. */
export const tapFeedback = () => vibrate(12)

/** Repeating pattern for a ringing alarm. */
export const ALARM_VIBRATION: number[] = [0, 500, 300, 500, 300, 500, 900]
