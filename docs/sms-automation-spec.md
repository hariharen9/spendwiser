# SpendWiser SMS Automation Extension: Technical Specification

## 1. Overview & Goal
This document outlines the architecture and implementation plan for adding zero-touch SMS transaction automation to the SpendWiser financial tracking application. 

**The End Goal:** Allow users to automatically draft new transactions in their SpendWiser web dashboard the exact moment their bank sends an SMS alert to their Android phone, requiring zero manual data entry.

### Why this approach? (The "Solo / Tech-Savvy" Advantage)
Standard web applications (PWAs) are strictly prohibited by mobile operating systems (iOS/Android) from reading a user's SMS inbox for privacy and security reasons. Traditional financial apps solve this by spending thousands of dollars on secure bank API aggregators (like Plaid) or building full-fledged native apps that require strict Google Play Store permissions (which are often heavily restricted or outright denied to indie developers).

Since SpendWiser is primarily a single-user project (with the potential for a small, tech-savvy user base), we can completely bypass these restrictions and costs:
*   **Zero Cost:** We rely on free-tier serverless functions (Netlify) and personal device processing. No paid APIs.
*   **Sideloading & Trust:** By building a standalone Android APK that the user installs manually (sideloads), we bypass the Google Play Store's strict SMS permission policies. Tech-savvy users can verify the open-source code and build it themselves, ensuring total privacy and trust.
*   **Decoupled Architecture:** The main web app remains a clean, cross-platform PWA. The SMS capability is strictly an "optional add-on" via a companion app, keeping the core codebase uncluttered.

---

## 2. Architecture Diagram

```mermaid
graph TD;
    A[Bank Sends SMS] -->|Android OS Broadcast| B[SpendWiser Listener App (APK)];
    B -->|Background HTTP POST with API Key| C[Netlify Function Webhook];
    C -->|Regex/LLM Parsing| D[Extract Amount & Merchant];
    D -->|Secure Firestore Write| E[pending_transactions Collection];
    E -->|Real-time onSnapshot| F[SpendWiser Web Dashboard];
    F -->|User Reviews & Approves| G[Final transactions Collection];
```

---

## 3. Technology Stack

*   **Main Web App (Existing):** React 18, TypeScript, Vite, Firebase Auth/Firestore.
*   **Webhook / Parser:** Netlify Functions (Node.js). The free tier allows 125,000 invocations/month.
*   **Companion Mobile App:** React Native with Expo (Development Build). This allows us to use JavaScript/TypeScript to write native Android Headless tasks to process SMS in the background.

---

## 4. Implementation Plan

The project is divided into two distinct phases to ensure the backend is fully functional and testable before writing any mobile code.

### Phase 1: The Web Core & Backend (Current Repository)
*Goal: Build the secure ingestion pipeline and the web UI to review pending transactions. This can be fully tested via tools like Postman/cURL.*

1.  **Data Schema:** Update TypeScript definitions (`types.ts`) to include a `PendingTransaction` interface.
2.  **API Key Management:** Build a UI in the Settings page for the user to generate and revoke unique UUIDs (API Keys). Store these securely in the user's Firestore document.
3.  **The Webhook (Netlify Function):** Create `/netlify/functions/process-sms.ts`.
    *   Accepts: `{ "apiKey": "...", "smsText": "..." }`
    *   Validates the API key against Firestore.
    *   Uses Regex (or a free LLM API like Google Gemini) to extract `amount`, `merchant`, and `type`.
    *   Saves the parsed data as a document in `spenders/{userId}/pending_transactions`.
4.  **Dashboard Integration:** 
    *   Add a real-time `onSnapshot` listener to the `pending_transactions` collection in `App.tsx`.
    *   Display a persistent badge/alert on the dashboard when a pending transaction exists.
    *   Clicking the alert opens the `AddTransactionModal`, pre-filled with the parsed data for final user approval.

### Phase 2: The Android Companion App (New Repository)
*Goal: Build a minimalist Android APK that runs quietly in the background, listening for bank texts.*

1.  **Setup:** Initialize a bare React Native Expo project.
2.  **Permissions:** Request Android `READ_SMS` and `RECEIVE_SMS` permissions.
3.  **Background Task:** Implement an SMS listener with a Headless JS task so the app can wake up and read texts even when closed or when the phone is locked.
4.  **Filtering & Forwarding:** 
    *   Locally filter SMS messages using basic Regex (e.g., checking for keywords like "debited", "spent", "rs.") to avoid pinging the webhook unnecessarily.
    *   If matched, execute an HTTP POST to the Phase 1 Netlify Function containing the text and the user's API Key.
5.  **Minimal UI:** A single screen where the user pastes their SpendWiser API Key and sees a status indicator ("Listening...").
6.  **Distribution:** Compile an `.apk` using EAS Build for direct sideloading.

---

## 5. Future Considerations
*   **Offline Queuing:** If the Android phone receives an SMS without an active internet connection, the companion app should queue the POST requests locally using `AsyncStorage` and retry when connectivity returns.
*   **Advanced AI Parsing:** While initial parsing can use Regex, eventually routing the text through a free-tier LLM will provide near 100% accuracy for all bank text variations without manual rule updates.