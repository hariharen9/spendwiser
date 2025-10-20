import { NotificationSettings, NotificationPayload, PushSubscription, NotificationPermission } from '../types/notifications';
import { TimezoneManager } from '../lib/timezone';

class NotificationService {
  private static instance: NotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initializeServiceWorker();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Check if notifications are supported
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check current permission status
  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission as NotificationPermission;
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  }

  // Get push subscription for the user
  public async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.initializeServiceWorker();
    }

    if (!this.swRegistration) return null;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (!subscription) return null;

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  }

  // Subscribe to push notifications
  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.initializeServiceWorker();
    }

    if (!this.swRegistration) return null;

    try {
      // VAPID public key - you'll need to generate this
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY';
      
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  public async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  }

  // Show immediate notification (browser API)
  public async showNotification(payload: NotificationPayload): Promise<void> {
    if (this.getPermission() !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    if (this.swRegistration) {
      // Use service worker for better control
      await this.swRegistration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-money.svg',
        badge: payload.badge || '/icon-money.svg',
        tag: payload.tag || 'spendwise-reminder',
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: false,
        vibrate: [200, 100, 200]
      });
    } else {
      // Fallback to basic notification
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-money.svg',
        tag: payload.tag || 'spendwise-reminder',
        data: payload.data,
        requireInteraction: payload.requireInteraction || false
      });
    }
  }

  // Schedule daily notification (client-side)
  public scheduleLocalNotification(settings: NotificationSettings): void {
    // Clear existing timeouts
    this.clearLocalNotifications();

    if (!settings.enabled || !settings.browserEnabled) return;

    const now = new Date();
    const nextNotificationTime = this.calculateNextNotificationTime(settings, now);
    
    if (!nextNotificationTime) return;

    const timeUntilNotification = nextNotificationTime.getTime() - now.getTime();
    
    if (timeUntilNotification > 0) {
      const timeoutId = setTimeout(() => {
        this.showDailyReminder(settings);
        // Schedule next notification
        this.scheduleLocalNotification(settings);
      }, timeUntilNotification);

      // Store timeout ID for cleanup
      localStorage.setItem('spendwise-notification-timeout', timeoutId.toString());
    }
  }

  // Clear local notifications
  public clearLocalNotifications(): void {
    const timeoutId = localStorage.getItem('spendwise-notification-timeout');
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem('spendwise-notification-timeout');
    }
  }

  // Calculate next notification time based on settings
  public calculateNextNotificationTime(settings: NotificationSettings, fromDate: Date = new Date()): Date | null {
    if (!settings.enabled) return null;

    const [hours, minutes] = settings.time.split(':').map(Number);
    const targetTime = new Date(fromDate);
    targetTime.setHours(hours, minutes, 0, 0);

    // If target time has passed today, move to next valid day
    if (targetTime <= fromDate) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    // Check if this day is valid according to frequency settings
    while (!this.isDayValid(targetTime, settings)) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime;
  }

  // Check if a day is valid for notifications based on frequency
  private isDayValid(date: Date, settings: NotificationSettings): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    switch (settings.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6; // Saturday and Sunday
      case 'custom':
        return settings.customDays.includes(dayOfWeek);
      default:
        return false;
    }
  }

  // Show daily reminder notification
  private async showDailyReminder(settings: NotificationSettings): Promise<void> {
    const payload: NotificationPayload = {
      title: '💰 SpendWiser Reminder',
      body: settings.reminderText || "Don't forget to log your transactions for today!",
      icon: '/icon-money.svg',
      badge: '/icon-money.svg',
      tag: 'daily-reminder',
      requireInteraction: true,
      actions: [
        {
          action: 'add-transaction',
          title: '💳 Add Transaction'
        },
        {
          action: 'snooze',
          title: `⏰ Remind in ${settings.snoozeMinutes || 120} min`
        },
        {
          action: 'dismiss',
          title: '✖️ Dismiss'
        }
      ],
      data: {
        type: 'daily-reminder',
        timestamp: new Date().toISOString(),
        snoozeMinutes: settings.snoozeMinutes || 120
      }
    };

    await this.showNotification(payload);
  }

  // Snooze notification
  public snoozeNotification(minutes: number): void {
    const snoozeTime = new Date();
    snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);

    const timeoutId = setTimeout(() => {
      this.showNotification({
        title: '💰 SpendWiser Reminder (Snoozed)',
        body: "Time to log your transactions!",
        tag: 'snoozed-reminder',
        requireInteraction: true
      });
    }, minutes * 60 * 1000);

    localStorage.setItem('spendwise-snooze-timeout', timeoutId.toString());
  }

  // Clear snooze
  public clearSnooze(): void {
    const timeoutId = localStorage.getItem('spendwise-snooze-timeout');
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem('spendwise-snooze-timeout');
    }
  }

  // Register push subscription with backend
  public async registerPushSubscription(userId: string, subscription: PushSubscription, settings: NotificationSettings): Promise<boolean> {
    try {
      const response = await fetch('/.netlify/functions/register-push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription,
          settings,
          timezone: TimezoneManager.getUserTimezone()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error registering push subscription:', error);
      return false;
    }
  }

  // Update notification settings on backend
  public async updateNotificationSettings(userId: string, settings: NotificationSettings): Promise<boolean> {
    try {
      const response = await fetch('/.netlify/functions/update-notification-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          settings,
          timezone: TimezoneManager.getUserTimezone()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Utility functions
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default NotificationService;