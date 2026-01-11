import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings as SettingsIcon,
  ChevronRight
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  // ... (Handlers remain the same)
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      onShowToast('Notification permission granted! 🎉', 'success');
      await updateSettings({ browserEnabled: true });
    } else {
      onShowToast('Notification permission denied. Please enable in browser settings.', 'error');
    }
  };

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

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await enablePushNotifications();
      success ? onShowToast('Push notifications enabled! 🚀', 'success') : onShowToast('Failed to enable push notifications.', 'error');
    } else {
      const success = await disablePushNotifications();
      success ? onShowToast('Push notifications disabled.', 'info') : onShowToast('Failed to disable push notifications.', 'error');
    }
  };

  const formatNextNotification = (date: Date | null): string => {
    if (!date) return 'Not scheduled';
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? 's' : ''} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <BellOff className="text-red-500" />
          <h3 className="font-bold text-red-700 dark:text-red-400">Notifications Unsupported</h3>
        </div>
        <p className="text-sm text-red-600/80 dark:text-red-400/70">Your browser doesn't support notifications.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Bell size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Reminders</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure your alert preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {settings.enabled && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              Active
            </span>
          )}
          <motion.div animate={{ rotate: isCollapsed ? 0 : 90 }}>
            <ChevronRight className="text-gray-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 space-y-6 border-t border-gray-100 dark:border-gray-800 pt-6">
              
              {/* Permission Banner */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${permission === 'granted' ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30'}`}>
                <div className="flex items-center gap-3">
                  {permission === 'granted' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-yellow-500" />}
                  <div>
                    <p className={`font-bold text-sm ${permission === 'granted' ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                      {permission === 'granted' ? 'Permission Granted' : 'Permission Required'}
                    </p>
                  </div>
                </div>
                {permission !== 'granted' && (
                  <button onClick={handleRequestPermission} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                    Allow
                  </button>
                )}
              </div>

              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Enable Reminders</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Toggle all notifications on or off</p>
                </div>
                <button
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {settings.enabled && permission === 'granted' && (
                <div className="space-y-6 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Time</label>
                      <input
                        type="time"
                        value={settings.time}
                        onChange={(e) => updateSettings({ time: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Frequency</label>
                      <select
                        value={settings.frequency}
                        onChange={(e) => updateSettings({ frequency: e.target.value as any })}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-blue-500"
                      >
                        <option value="daily">Every Day</option>
                        <option value="weekdays">Weekdays</option>
                        <option value="weekends">Weekends</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  {settings.frequency === 'custom' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Days</label>
                      <div className="flex gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                          <button
                            key={i}
                            onClick={() => updateSettings({ customDays: settings.customDays.includes(i) ? settings.customDays.filter(d => d !== i) : [...settings.customDays, i] })}
                            className={`w-8 h-8 rounded-lg text-xs font-bold ${settings.customDays.includes(i) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Types */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Delivery Method</label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Smartphone size={18} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Push Notification</span>
                        </div>
                        <input type="checkbox" checked={isPushEnabled} onChange={(e) => handlePushToggle(e.target.checked)} className="accent-blue-600 w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Monitor size={18} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">In-App Alert</span>
                        </div>
                        <input type="checkbox" checked={settings.browserEnabled} onChange={(e) => updateSettings({ browserEnabled: e.target.checked })} className="accent-blue-600 w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleTestNotification}
                    disabled={isTestingNotification}
                    className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <TestTube size={16} />
                    {isTestingNotification ? 'Sending...' : 'Send Test Alert'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationSettings;
