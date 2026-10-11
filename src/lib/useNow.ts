import { useEffect, useState } from 'react'

/**
 * A ticking clock aligned to the wall-clock second, so the display flips at the
 * same moment the real minute does. Re-aligns after each tick instead of using
 * a fixed interval, which otherwise drifts on a throttled background tab.
 */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: number

    const schedule = () => {
      const delay = intervalMs - (Date.now() % intervalMs)
      timer = window.setTimeout(() => {
        setNow(new Date())
        schedule()
      }, delay)
    }

    schedule()
    return () => window.clearTimeout(timer)
  }, [intervalMs])

  return now
}
