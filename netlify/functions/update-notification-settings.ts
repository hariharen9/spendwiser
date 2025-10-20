import { Handler } from '@netlify/functions';

// This will store notification settings - in production, use a proper database
const userSettings = new Map();

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
    const { userId, settings, timezone } = JSON.parse(event.body || '{}');

    if (!userId || !settings) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Update the settings (in production, save to database)
    const settingsData = {
      userId,
      settings,
      timezone,
      updatedAt: new Date().toISOString(),
    };

    // For demo purposes, we'll store in memory
    // In production, save to Firebase, Supabase, or another database
    userSettings.set(userId, settingsData);

    console.log(`Notification settings updated for user: ${userId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Notification settings updated successfully' 
      }),
    };
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};