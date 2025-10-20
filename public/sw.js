// SpendWiser Service Worker
const CACHE_NAME = 'spendwiser-v1';

// Workbox manifest injection point
const urlsToCache = self.__WB_MANIFEST || [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-money.svg',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: '💰 SpendWiser Reminder',
    body: "Don't forget to log your transactions for today!",
    icon: '/icon-money.svg',
    badge: '/icon-money.svg',
    tag: 'spendwise-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'add-transaction',
        title: '💳 Add Transaction'
      },
      {
        action: 'snooze',
        title: '⏰ Remind Later'
      },
      {
        action: 'dismiss',
        title: '✖️ Dismiss'
      }
    ],
    data: {
      type: 'daily-reminder',
      timestamp: new Date().toISOString(),
      url: '/'
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      silent: false
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  if (action === 'add-transaction') {
    // Open app and navigate to add transaction
    event.waitUntil(
      clients.openWindow('/?action=add-transaction')
    );
  } else if (action === 'snooze') {
    // Schedule a snooze notification
    const snoozeMinutes = notificationData.snoozeMinutes || 120;
    const userId = notificationData.userId;
    
    // Store snooze info for later processing
    const snoozeData = {
      userId: userId,
      snoozeTime: Date.now() + (snoozeMinutes * 60 * 1000),
      message: "Time to log your transactions!"
    };
    
    // Use postMessage to communicate with main thread if available
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'SCHEDULE_SNOOZE',
            data: snoozeData
          });
        } else {
          // Fallback: schedule directly in service worker
          setTimeout(() => {
            self.registration.showNotification(
              '💰 SpendWiser Reminder (Snoozed)',
              {
                body: "Time to log your transactions!",
                icon: '/icon-money.svg',
                badge: '/icon-money.svg',
                tag: 'spendwise-snoozed',
                requireInteraction: true,
                data: {
                  type: 'snoozed-reminder',
                  timestamp: new Date().toISOString(),
                  userId: userId
                }
              }
            );
          }, snoozeMinutes * 60 * 1000);
        }
      })
    );
  } else if (action === 'dismiss') {
    // Just close the notification (already done above)
    console.log('Notification dismissed');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event (for future use)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Future: sync offline transactions, check for reminders, etc.
  console.log('Background sync triggered');
}

// Periodic background sync for checking reminders
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder-check') {
    event.waitUntil(checkForDailyReminders());
  }
});

async function checkForDailyReminders() {
  console.log('Periodic sync: checking for daily reminders');
  
  try {
    // Get user settings from IndexedDB or localStorage
    const settings = await getUserNotificationSettings();
    if (!settings || !settings.enabled) return;
    
    // Check if it's time for a reminder
    if (shouldShowReminder(settings)) {
      await self.registration.showNotification(
        '💰 SpendWiser Reminder',
        {
          body: settings.reminderText || "Don't forget to log your transactions for today!",
          icon: '/icon-money.svg',
          badge: '/icon-money.svg',
          tag: 'daily-reminder',
          requireInteraction: true,
          actions: [
            { action: 'add-transaction', title: '💳 Add Transaction' },
            { action: 'snooze', title: '⏰ Remind Later' },
            { action: 'dismiss', title: '✖️ Dismiss' }
          ],
          data: {
            type: 'daily-reminder',
            timestamp: new Date().toISOString()
          }
        }
      );
      
      // Update last notified time
      await updateLastNotifiedTime();
    }
  } catch (error) {
    console.error('Error in periodic sync:', error);
  }
}

async function getUserNotificationSettings() {
  // Try to get settings from IndexedDB first, then localStorage
  try {
    // This is a simplified version - in production you'd use IndexedDB
    return null; // Placeholder - implement based on your storage strategy
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
}

function shouldShowReminder(settings) {
  const now = new Date();
  const [targetHour, targetMinute] = settings.time.split(':').map(Number);
  
  // Check if it's the right time (within 5 minutes)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  if (currentHour !== targetHour || Math.abs(currentMinute - targetMinute) > 5) {
    return false;
  }
  
  // Check if today is a valid day
  const dayOfWeek = now.getDay();
  switch (settings.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return settings.customDays?.includes(dayOfWeek) || false;
    default:
      return false;
  }
}

async function updateLastNotifiedTime() {
  // Update the last notified time in storage
  const today = new Date().toISOString().split('T')[0];
  // Implement storage update logic here
}

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/icon-money.svg',
        badge: '/icon-money.svg',
        tag: 'scheduled-reminder'
      });
    }, delay);
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

console.log('SpendWiser Service Worker loaded');