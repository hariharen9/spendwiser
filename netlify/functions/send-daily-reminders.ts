import { Handler } from '@netlify/functions';
import webpush from 'web-push';

// Configure web-push with VAPID keys
// You'll need to generate these keys and set them as environment variables
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

// This function will be triggered by Netlify's scheduled functions
// You'll need to set up the schedule in netlify.toml
export const handler: Handler = async (event, context) => {
  console.log('Daily reminder function triggered at:', new Date().toISOString());

  try {
    // In production, fetch all users with push subscriptions from your database
    // For now, we'll use a mock implementation
    const usersWithNotifications = await getUsersWithNotifications();

    const results = await Promise.allSettled(
      usersWithNotifications.map(async (user) => {
        return sendNotificationToUser(user);
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Notifications sent: ${successful} successful, ${failed} failed`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error('Error in daily reminder function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function getUsersWithNotifications() {
  // In production, query your database for users with:
  // 1. Push notifications enabled
  // 2. Current time matches their reminder time
  // 3. Today is a valid day according to their frequency settings
  
  // Mock implementation
  return [
    {
      userId: 'user1',
      subscription: {
        endpoint: 'https://fcm.googleapis.com/fcm/send/...',
        keys: {
          p256dh: 'key1',
          auth: 'auth1'
        }
      },
      settings: {
        enabled: true,
        pushEnabled: true,
        time: '09:00',
        frequency: 'weekdays',
        reminderText: "Don't forget to log your transactions! 💰",
        timezone: 'Asia/Kolkata'
      }
    }
  ];
}

async function sendNotificationToUser(user: any) {
  const { userId, subscription, settings } = user;

  // Check if today is a valid day for this user
  if (!isValidDayForUser(settings)) {
    console.log(`Skipping notification for user ${userId} - not a valid day`);
    return;
  }

  // Check if it's the right time for this user (considering timezone)
  if (!isRightTimeForUser(settings)) {
    console.log(`Skipping notification for user ${userId} - not the right time`);
    return;
  }

  const payload = {
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
      userId: userId,
      url: '/?action=add-transaction'
    }
  };

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      },
      JSON.stringify(payload)
    );
    
    console.log(`Notification sent successfully to user: ${userId}`);
  } catch (error) {
    console.error(`Failed to send notification to user ${userId}:`, error);
    throw error;
  }
}

function isValidDayForUser(settings: any): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  switch (settings.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6; // Saturday and Sunday
    case 'custom':
      return settings.customDays?.includes(dayOfWeek) || false;
    default:
      return false;
  }
}

function isRightTimeForUser(settings: any): boolean {
  // This is a simplified check - in production, you'd want more sophisticated
  // timezone handling and scheduling
  const now = new Date();
  const [targetHour, targetMinute] = settings.time.split(':').map(Number);
  
  // Allow a 5-minute window around the target time
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return (
    currentHour === targetHour && 
    Math.abs(currentMinute - targetMinute) <= 5
  );
}

// Note: This function can be called manually or via external cron services
// For free Netlify tier, consider using external services like:
// - GitHub Actions with cron
// - Vercel Cron (if migrating)
// - External cron services that hit this endpoint