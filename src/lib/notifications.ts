export type NotificationState = 'unsupported' | 'default' | 'granted' | 'denied';

export function getNotificationState(): NotificationState {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationState> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission;
  }
  const result = await Notification.requestPermission();
  return result;
}

export function notify(title: string, body?: string): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body });
  } catch {
    // best-effort only
  }
}
