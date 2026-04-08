import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines if passed via standard env vars
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const db = admin.firestore();

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { apiKey, smsText } = body;

    if (!apiKey || !smsText) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing apiKey or smsText' }) };
    }

    // 1. Validate API Key
    const usersRef = db.collection('spenders');
    const snapshot = await usersRef.where('listenerApiKey', '==', apiKey).limit(1).get();

    if (snapshot.empty) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid API Key' }) };
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    // 2. Parse SMS Text using Gemini API
    let amount: number | undefined;
    let merchant = 'Unknown Merchant';
    let type: 'expense' | 'income' = 'expense';

    try {
      const geminiApiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('Missing Gemini API Key');
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const prompt = `Extract from this bank SMS — amount (number), merchant (string), type ("income" or "expense"). Reply in JSON only, no markdown. SMS: "${smsText}"`;

      let responseText = '';

      try {
        // Fallback 1: Try Gemini 3.1 Flash Lite Preview
        const model31 = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });
        const result = await model31.generateContent(prompt);
        responseText = result.response.text().trim();
      } catch (error31) {
        console.warn('Gemini 3.1 failed, falling back to 2.5 Flash:', error31);
        // Fallback 2: Try Gemini 2.5 Flash as a secondary AI fallback
        const model25 = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model25.generateContent(prompt);
        responseText = result.response.text().trim();
      }

      // Strip markdown code block if model mistakenly added it
      const jsonString = responseText.replace(/```json\n?|\n?```/g, '');
      const parsedData = JSON.parse(jsonString);

      amount = typeof parsedData.amount === 'number' ? parsedData.amount : parseFloat(parsedData.amount);
      merchant = parsedData.merchant || 'Unknown Merchant';
      type = parsedData.type === 'income' ? 'income' : 'expense';

    } catch (parseError) {
      console.error('All Gemini attempts failed, falling back to Regex:', parseError);

      // Enhanced Fallback Regex
      const amountMatch = smsText.match(/(?:rs\.?|inr|usd|\$|₹|€|£)\s*([\d,]+\.?\d*)/i) ||
        smsText.match(/([\d,]+\.?\d*)\s*(?:rs\.?|inr|usd|\$|₹|€|£)/i);
      amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;

      const isExpense = /(?:debited|spent|paid|top-up|sent|withdrawn|deducted|trf|transfer)/i.test(smsText);
      const isIncome = /(?:credited|received|deposited|added|refunded)/i.test(smsText);
      type = (isIncome && !isExpense) ? 'income' : 'expense';

      const merchantMatch = smsText.match(/(?:at|to|towards|info\s*[:\-]?\s*(?:vpa)?\s*[:\-]?\s*|from)\s+([A-Za-z0-9\s&@\.\-\*]+?)(?=\s+(?:on|avl|available|bal|balance|val|ref|upi|cards|txn)|$|\.|\,)/i);
      if (merchantMatch && merchantMatch[1]) {
        merchant = merchantMatch[1].trim().replace(/[\n\r]+.*$/g, '');
      } else {
        merchant = 'Unknown Merchant';
      }
    }

    // 3. Save to Firestore pending_transactions
    const pendingRef = db.collection(`spenders/${userId}/pending_transactions`);
    await pendingRef.add({
      smsText,
      extractedAmount: amount,
      extractedMerchant: merchant,
      extractedType: type,
      status: 'pending',
      receivedAt: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Transaction queued for review.' }),
    };

  } catch (error: any) {
    console.error('Error processing SMS:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};