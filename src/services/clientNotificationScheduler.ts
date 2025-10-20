import { NotificationSettings } from '../types/notifications';
import NotificationService from './notificationService';
import { TimezoneManager } from '../lib/timezone';

/**
 * Client-side notification scheduler that works without server-side cron jobs
 * This is perfect for the free tier and provides reliable notifications
 */
class ClientNotificationScheduler {
  private static instance: ClientNotificationScheduler;
  private checkInterval: number | null = null;
  private notificationService: NotificationService;
  private readonly CHECK_INTERVAL_MS = 60000; // Check every minute

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.startPeriodicCheck();
  }

  public static getInstance(): ClientNotificationScheduler {
    if (!ClientNotificationScheduler.instance) {
      ClientNotificationScheduler.instance = new ClientNotificationScheduler();
    }
    return ClientNotificationScheduler.instance;
  }

  /**
   * Start the periodic check for notifications
   */
  public startPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(() => {
      this.checkAndSendNotifications();
    }, this.CHECK_INTERVAL_MS);

    // Also check immediately
    this.checkAndSendNotifications();
  }

  /**
   * Stop the periodic check
   */
  public stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if any users need notifications and send them
   */
  private async checkAndSendNotifications(): Promise<void> {
    try {
      // Get all users with notification settings from localStorage
      const users = this.getAllUsersWithNotifications();
      
      for (const user of users) {
        await this.checkUserNotification(user);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  /**
   * Get all users with notification settings from localStorage
   */
  private getAllUsersWithNotifications(): Array<{userId: string, settings: NotificationSettings}> {
    const users: Array<{userId: string, settings: NotificationSettings}> = [];
    
    // Scan localStorage for notification settings
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('spendwise-notifications-')) {
        try {
          const userId = key.replace('spendwise-notifications-', '');
          const settingsJson = localStorage.getItem(key);
          if (settingsJson) {
            const settings = JSON.parse(settingsJson) as NotificationSettings;
            if (settings.enabled) {
              users.push({ userId, settings });
            }
          }
        } catch (error) {
          console.error('Error parsing notification settings:', error);
        }
      }
    }
    
    return users;
  }

  /**
   * Check if a specific user needs a notification
   */
  private async checkUserNotification(user: {userId: string, settings: NotificationSettings}): Promise<void> {
    const { userId, settings } = user;
    
    // Check if notifications are enabled and permission is granted
    if (!settings.enabled || this.notificationService.getPermission() !== 'granted') {
      return;
    }

    // Check if we should send a notification now
    if (!this.shouldSendNotificationNow(settings)) {
      return;
    }

    // Check if we already sent a notification today
    if (this.hasNotifiedToday(userId, settings)) {
      return;
    }

    // Send the notification
    await this.sendDailyReminder(userId, settings);
  }

  /**
   * Check if we should send a notification right now
   */
  private shouldSendNotificationNow(settings: NotificationSettings): boolean {
    const now = new Date();
    const [targetHour, targetMinute] = settings.time.split(':').map(Number);
    
    // Check if it's within 1 minute of the target time
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour !== targetHour || Math.abs(currentMinute - targetMinute) > 1) {
      return false;
    }

    // Check if today is a valid day according to frequency
    return this.isValidDay(now, settings);
  }

  /**
   * Check if today is a valid day for notifications
   */
  private isValidDay(date: Date, settings: NotificationSettings): boolean {
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

  /**
   * Check if we already notified the user today
   */
  private hasNotifiedToday(userId: string, settings: NotificationSettings): boolean {
    const today = new Date().toISOString().split('T')[0];
    const lastNotified = settings.lastNotified;
    
    return lastNotified === today;
  }

  /**
   * Send daily reminder notification
   */
  private async sendDailyReminder(userId: string, settings: NotificationSettings): Promise<void> {
    try {
      await this.notificationService.showNotification({
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
          userId: userId,
          snoozeMinutes: settings.snoozeMinutes || 120
        }
      });

      // Update last notified date
      this.updateLastNotifiedDate(userId, settings);
      
      console.log(`Daily reminder sent to user: ${userId}`);
    } catch (error) {
      console.error(`Failed to send daily reminder to user ${userId}:`, error);
    }
  }

  /**
   * Update the last notified date for a user
   */
  private updateLastNotifiedDate(userId: string, settings: NotificationSettings): void {
    const today = new Date().toISOString().split('T')[0];
    const updatedSettings = { ...settings, lastNotified: today };
    
    localStorage.setItem(
      `spendwise-notifications-${userId}`,
      JSON.stringify(updatedSettings)
    );
  }

  /**
   * Schedule a snooze notification
   */
  public scheduleSnoozeNotification(minutes: number, userId: string): void {
    setTimeout(async () => {
      try {
        await this.notificationService.showNotification({
          title: '💰 SpendWiser Reminder (Snoozed)',
          body: "Time to log your transactions!",
          icon: '/icon-money.svg',
          badge: '/icon-money.svg',
          tag: 'snoozed-reminder',
          requireInteraction: true,
          data: {
            type: 'snoozed-reminder',
            timestamp: new Date().toISOString(),
            userId: userId
          }
        });
      } catch (error) {
        console.error('Failed to send snoozed notification:', error);
      }
    }, minutes * 60 * 1000);
  }

  /**
   * Handle notification click events
   */
  public handleNotificationClick(action: string, data: any): void {
    switch (action) {
      case 'add-transaction':
        // Open the app and navigate to add transaction
        if ('clients' in self) {
          // This is running in service worker context
          (self as any).clients.openWindow('/?action=add-transaction');
        } else {
          // This is running in main thread
          window.location.href = '/?action=add-transaction';
        }
        break;
        
      case 'snooze':
        const snoozeMinutes = data.snoozeMinutes || 120;
        this.scheduleSnoozeNotification(snoozeMinutes, data.userId);
        break;
        
      case 'dismiss':
        // Just dismiss - no action needed
        break;
        
      default:
        // Default action - open the app
        if ('clients' in self) {
          (self as any).clients.openWindow('/');
        } else {
          window.location.href = '/';
        }
        break;
    }
  }
}

export default ClientNotificationScheduler;