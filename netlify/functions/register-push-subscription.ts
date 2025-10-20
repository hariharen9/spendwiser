import { Handler } from '@netlify/functions';

// This will store push subscriptions - in production, use a proper database
// For now, we'll use Netlify's environment variables or a simple JSON store
const subscriptions = new Map();

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, subscription, settings, timezone } = JSON.parse(event.body || '{}');

    if (!userId || !subscription || !settings) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Store the subscription (in production, save to database)
    const subscriptionData = {
      userId,
      subscription,
      settings,
      timezone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // For demo purposes, we'll store in memory
    // In production, save to Firebase, Supabase, or another database
    subscriptions.set(userId, subscriptionData);

    console.log(`Push subscription registered for user: ${userId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Push subscription registered successfully' 
      }),
    };
  } catch (error) {
    console.error('Error registering push subscription:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};