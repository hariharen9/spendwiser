import { useState, useEffect, useCallback } from 'react';
import { NotificationSettings, NotificationPermission } from '../types/notifications';
import NotificationService from '../services/notificationService';
import ClientNotificationScheduler from '../services/clientNotificationScheduler';
import { TimezoneManager } from '../lib/timezone';

interface UseNotificationsReturn {
  // Permission state
  permission: NotificationPermission;
  isSupported: boolean;
  
  // Settings state
  settings: NotificationSettings;
  isLoading: boolean;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<boolean>;
  testNotification: () => Promise<void>;
  enablePushNotifications: () => Promise<boolean>;
  disablePushNotifications: () => Promise<boolean>;
  
  // Status
  isPushEnabled: boolean;
  nextNotificationTime: Date | null;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
  time: '09:00',
  timezone: TimezoneManager.getUserTimezone(),
  frequency: 'weekdays',
  customDays: [1, 2, 3, 4, 5], // Monday to Friday
  lastNotified: '',
  pushEnabled: false,
  browserEnabled: false,
  reminderText: "Don't forget to log your transactions for today! 💰",
  snoozeMinutes: 120
};

export const useNotifications = (userId: string | null): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  const notificationService = NotificationService.getInstance();
  const clientScheduler = ClientNotificationScheduler.getInstance();
  const isSupported = notificationService.isSupported();

  // Initialize notification state
  useEffect(() => {
    if (isSupported) {
      setPermission(notificationService.getPermission());
      
      // Check if push is already enabled
      notificationService.getPushSubscription().then(subscription => {
        setIsPushEnabled(!!subscription);
      });
    }
  }, [isSupported]);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (userId) {
      const savedSettings = localStorage.getItem(`spendwise-notifications-${userId}`);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('Error parsing notification settings:', error);
        }
      }
    }
  }, [userId]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (userId && settings !== defaultSettings) {
      localStorage.setItem(`spendwise-notifications-${userId}`, JSON.stringify(settings));
    }
  }, [userId, settings]);

  // Start/stop client scheduler when settings change
  useEffect(() => {
    if (settings.enabled && permission === 'granted') {
      clientScheduler.startPeriodicCheck();
    } else {
      clientScheduler.stopPeriodicCheck();
    }

    return () => {
      clientScheduler.stopPeriodicCheck();
    };
  }, [settings, permission]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      setIsLoading(true);
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      return newPermission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Update notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>): Promise<boolean> => {
    if (!userId) return false;

    try {
      setIsLoading(true);
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Update backend if push notifications are enabled
      if (updatedSettings.pushEnabled) {
        await notificationService.updateNotificationSettings(userId, updatedSettings);
      }

      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, settings]);

  // Enable push notifications
  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!userId || !isSupported || permission !== 'granted') return false;

    try {
      setIsLoading(true);
      
      // Subscribe to push notifications
      const subscription = await notificationService.subscribeToPush();
      if (!subscription) return false;

      // Register with backend
      const success = await notificationService.registerPushSubscription(userId, subscription, settings);
      if (success) {
        setIsPushEnabled(true);
        await updateSettings({ pushEnabled: true });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSupported, permission, settings, updateSettings]);

  // Disable push notifications
  const disablePushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const success = await notificationService.unsubscribeFromPush();
      if (success) {
        setIsPushEnabled(false);
        await updateSettings({ pushEnabled: false });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateSettings]);

  // Test notification
  const testNotification = useCallback(async (): Promise<void> => {
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    await notificationService.showNotification({
      title: '🎉 Test Notification',
      body: 'Great! Your notifications are working perfectly.',
      tag: 'test-notification',
      requireInteraction: false
    });
  }, [permission]);

  // Calculate next notification time
  const nextNotificationTime = settings.enabled 
    ? notificationService.calculateNextNotificationTime(settings)
    : null;

  return {
    // Permission state
    permission,
    isSupported,
    
    // Settings state
    settings,
    isLoading,
    
    // Actions
    requestPermission,
    updateSettings,
    testNotification,
    enablePushNotifications,
    disablePushNotifications,
    
    // Status
    isPushEnabled,
    nextNotificationTime
  };
};