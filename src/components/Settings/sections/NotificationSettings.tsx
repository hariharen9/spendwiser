import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Calendar, 
  Smartphone, 
  Monitor, 
  TestTube,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';

interface NotificationSettingsProps {
  userId: string | null;
  userTimezone: string;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  userId, 
  userTimezone, 
  onShowToast 
}) => {
  const {
    permission,
    isSupported,
    settings,
    isLoading,
    requestPermission,
    updateSettings,
    testNotification,
    enablePushNotifications,
    disablePushNotifications,
    isPushEnabled,
    nextNotificationTime
  } = useNotifications(userId);

  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Handle permission request
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      onShowToast('Notification permission granted! 🎉', 'success');
      // Auto-enable browser notifications
      await updateSettings({ browserEnabled: true });
    } else {
      onShowToast('Notification permission denied. Please enable in browser settings.', 'error');
    }
  };

  // Handle test notification
  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      onShowToast('Please grant notification permission first.', 'warning');
      return;
    }

    try {
      setIsTestingNotification(true);
      await testNotification();
      onShowToast('Test notification sent! 📱', 'success');
    } catch (error) {
      onShowToast('Failed to send test notification.', 'error');
    } finally {
      setIsTestingNotification(false);
    }
  };

  // Handle push notification toggle
  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await enablePushNotifications();
      if (success) {
        onShowToast('Push notifications enabled! 🚀', 'success');
      } else {
        onShowToast('Failed to enable push notifications.', 'error');
      }
    } else {
      const success = await disablePushNotifications();
      if (success) {
        onShowToast('Push notifications disabled.', 'info');
      } else {
        onShowToast('Failed to disable push notifications.', 'error');
      }
    }
  };

  // Format next notification time
  const formatNextNotification = (date: Date | null): string => {
    if (!date) return 'Not scheduled';
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#242424] rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <BellOff className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
            Notifications Not Supported
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Your browser doesn't support notifications. Please use a modern browser like Chrome, Firefox, or Safari.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#242424] rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
          Daily Reminders
        </h3>
      </div>

      <div className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-3">
            {permission === 'granted' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Notification Permission
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {permission === 'granted' ? 'Granted' : 
                 permission === 'denied' ? 'Denied' : 'Not requested'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Requesting...' : 'Grant Permission'}
            </button>
          )}
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {settings.enabled ? (
              <Bell className="w-5 h-5 text-blue-500" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Enable Daily Reminders
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get reminded to log your daily transactions
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              disabled={permission !== 'granted' || isLoading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
          </label>
        </div>

        {settings.enabled && permission === 'granted' && (
          <>
            {/* Notification Time */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <label className="font-medium text-gray-900 dark:text-white">
                  Reminder Time
                </label>
              </div>
              <input
                type="time"
                value={settings.time}
                onChange={(e) => updateSettings({ time: e.target.value })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Timezone: {userTimezone}
              </p>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <label className="font-medium text-gray-900 dark:text-white">
                  Frequency
                </label>
              </div>
              <select
                value={settings.frequency}
                onChange={(e) => updateSettings({ 
                  frequency: e.target.value as 'daily' | 'weekdays' | 'weekends' | 'custom'
                })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="daily">Every Day</option>
                <option value="weekdays">Weekdays Only</option>
                <option value="weekends">Weekends Only</option>
                <option value="custom">Custom Days</option>
              </select>
            </div>

            {/* Custom Days */}
            {settings.frequency === 'custom' && (
              <div className="space-y-3">
                <label className="font-medium text-gray-900 dark:text-white">
                  Select Days
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <button
                      key={day}
                      onClick={() => {
                        const newDays = settings.customDays.includes(index)
                          ? settings.customDays.filter(d => d !== index)
                          : [...settings.customDays, index];
                        updateSettings({ customDays: newDays });
                      }}
                      className={`p-2 text-xs font-medium rounded-lg transition-colors ${
                        settings.customDays.includes(index)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Types */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <SettingsIcon className="w-4 h-4" />
                <span>Notification Types</span>
              </h4>

              {/* Browser Notifications */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Browser Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Show notifications when app is open
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.browserEnabled}
                    onChange={(e) => updateSettings({ browserEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Reliable notifications even when app is closed
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPushEnabled}
                    onChange={(e) => handlePushToggle(e.target.checked)}
                    disabled={isLoading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50"></div>
                </label>
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-3">
              <label className="font-medium text-gray-900 dark:text-white">
                Custom Reminder Message
              </label>
              <textarea
                value={settings.reminderText}
                onChange={(e) => updateSettings({ reminderText: e.target.value })}
                placeholder="Don't forget to log your transactions for today! 💰"
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Snooze Duration */}
            <div className="space-y-3">
              <label className="font-medium text-gray-900 dark:text-white">
                Snooze Duration (minutes)
              </label>
              <select
                value={settings.snoozeMinutes}
                onChange={(e) => updateSettings({ snoozeMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
                <option value={480}>8 hours</option>
              </select>
            </div>

            {/* Next Notification */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  Next Reminder
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {formatNextNotification(nextNotificationTime)}
              </p>
            </div>

            {/* Test Notification */}
            <button
              onClick={handleTestNotification}
              disabled={isTestingNotification || isLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <TestTube className="w-5 h-5" />
              <span>
                {isTestingNotification ? 'Sending...' : 'Test Notification'}
              </span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationSettings;