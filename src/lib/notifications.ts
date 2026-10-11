export type NotificationSupport = 'granted' | 'denied' | 'default' | 'unsupported'

export function notificationSupport(): NotificationSupport {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission as NotificationSupport
}

export async function requestNotificationPermission(): Promise<NotificationSupport> {
  if (notificationSupport() === 'unsupported') return 'unsupported'
  try {
    return (await Notification.requestPermission()) as NotificationSupport
  } catch {
    return 'denied'
  }
}

/** Fire-and-forget; never throws into the alarm engine. */
export function showNotification(title: string, body: string, tag: string): void {
  if (notificationSupport() !== 'granted') return
  try {
    new Notification(title, { body, tag, renotify: false, silent: true } as NotificationOptions)
  } catch {
    /* some browsers require a service worker; ignore */
  }
}
