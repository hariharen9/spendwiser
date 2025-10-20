export interface NotificationSettings {
  enabled: boolean;
  time: string; // "09:00" format (24-hour)
  timezone: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays: number[]; // [0,1,2,3,4,5,6] where 0=Sunday
  lastNotified: string; // ISO date string
  pushEnabled: boolean; // For push notifications via service worker
  browserEnabled: boolean; // For browser notifications
  reminderText: string; // Custom reminder message
  snoozeMinutes: number; // How long to snooze (default 120 minutes)
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface UserNotificationPreference {
  userId: string;
  settings: NotificationSettings;
  pushSubscription?: PushSubscription;
  createdAt: string;
  updatedAt: string;
}

export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface NotificationSchedule {
  userId: string;
  nextNotificationTime: string; // ISO string
  timezone: string;
  settings: NotificationSettings;
}