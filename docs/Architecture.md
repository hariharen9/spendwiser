# SpendWiser — Complete Architectural Specification & System Blueprints

> **Critical Notice for AI Coding Assistants & Developers:**  
> This document is the **single source of truth** for the architecture, data models, state flows, component hierarchies, and backend pipelines of **SpendWiser**. Every detail in this document has been verified against the active codebase. Refer to this specification to build a complete mental model before modifying or extending any part of the project.

---

## 1. Executive Summary & Core Philosophy

**SpendWiser** is a privacy-first, enterprise-grade Personal Finance Management (PFM) Progressive Web Application (PWA). It is engineered to deliver complete financial transparency—encompassing transaction logging, multi-account and credit card tracking, category and global budgeting, savings goals, loan amortization with debt paydown strategies, multi-party bill splitting, and automated bank SMS transaction ingestion.

### Key Architectural Pillars:
1. **Zero-Touch Automation without Bank Aggregators:** Instead of requiring users to hand over banking credentials to invasive third-party aggregators (e.g., Plaid, Yodlee), SpendWiser utilizes a decoupled **Android SMS Listener Companion App** that intercepts bank alerts locally and relays them to a serverless processing webhook.
2. **Bring Your Own Key (BYOK) Intelligence:** Financial text is parsed using Google's Gemini models via the user's personal Google AI API key, guaranteeing zero exposure of personal financial information to third-party subscription backends.
3. **Decoupled Serverless & Real-Time Sync:** Built on top of **Google Firebase (Auth & Firestore)** and **Netlify Functions**, running at zero recurring infrastructure cost while maintaining live bi-directional WebSocket-grade synchronization via Firestore's `onSnapshot` listeners.
4. **Offline Resilience & Data Sovereignty:** Firestore offline cache persistence is enabled on the client alongside a Progressive Web App service worker. Users retain full data ownership with JSON backup/restore, CSV import/export, and complete one-click migration exports into adjacent ecosystems (such as SpendState).

---

## 2. Technology Stack & Key Dependencies

| Domain | Technology / Library | Version | Purpose & Implementation Details |
| :--- | :--- | :--- | :--- |
| **Runtime & Bundler** | **Vite** | `^5.4.2` | Rapid ESM-based development and optimized production bundling with path alias `@` mapping to `/src`. |
| **UI Framework** | **React** | `^18.3.1` | Client UI logic using functional components and hooks. |
| **Language** | **TypeScript** | `^5.5.3` | Strict static typing across domain models, UI props, and serverless handlers. |
| **Styling & Design System** | **Tailwind CSS** | `^3.4.1` | Utility-first responsive styling with comprehensive dark-mode variants (`dark:`). |
| **Animations & Transitions** | **Framer Motion** | `^12.23.12` | Layout animations, page transitions, modal spring physics, and SVG path drawing. |
| **Kinetic Motion & Smooth Scroll** | **Lenis** & **GSAP** | `^1.3.17` / `^3.13.0` | Inertial smooth scrolling (`useLenis`) and micro-animations. |
| **Data Visualization** | **Recharts** | `^3.2.1` | Donut charts, multi-bar comparison charts, area cash-flow trends, and payoff curves. |
| **Drag & Drop** | **@dnd-kit/core**, **@dnd-kit/sortable** | `^6.3.1` / `^10.0.0` | Fluid 3-column dashboard widget customization with collision detection. |
| **PWA & Offline** | **vite-plugin-pwa** | `^1.0.3` | Service worker injection, resource caching, and standalone mobile app manifest. |
| **Database & Auth (Client)** | **Firebase Client SDK** | `^11.10.0` | Authentication (Google OAuth Popup, Email/Password) and Firestore with `enablePersistence`. |
| **Serverless Functions** | **Netlify Functions** + **Firebase Admin** | `^13.7.0` | Node.js serverless functions with Firestore Admin privileges. |
| **Artificial Intelligence** | **@google/generative-ai** | `^0.24.1` | Gemini 3.1 Flash Lite Preview and Gemini 2.5 Flash for natural language SMS parsing. |
| **PDF & Canvas Export** | **jspdf** & **html2canvas** | `^2.5.1` / `^1.4.1` | High-fidelity client-side PDF generation for monthly financial statements. |
| **Push Notifications** | **web-push** | `^3.6.7` | Web push protocol integration with VAPID authentication for background reminders. |
| **Testing Suite** | **Vitest** & **React Testing Library** | `^3.2.4` / `^16.3.0` | Unit and component testing within a JSDOM virtual DOM environment. |

---

## 3. Directory Structure & File Map

```
spendwiser/
├── .env.example                     # Reference environment variables for client and functions
├── companion-app-spec.md            # Standalone Kotlin/Android specification for the SMS listener app
├── eslint.config.js                 # ESLint 9 configuration with React hooks & refresh rules
├── index.html                       # HTML5 entry with fonts (Montserrat, Outfit, Inter) & meta tags
├── netlify.toml                     # Netlify build configuration, SPA redirect rules, and headers
├── package.json                     # Node dependencies and build scripts
├── postcss.config.js                # PostCSS pipeline loading Tailwind CSS and Autoprefixer
├── tailwind.config.js               # Tailwind CSS theme extensions and responsive breakpoints
├── tsconfig.json                    # Root TypeScript configuration referencing app and node subconfigs
├── vite.config.ts                   # Vite bundler, PWA manifest, path aliases (@ -> /src), Vitest setup
│
├── docs/                            # Deep-dive documentation
│   ├── Architecture.md              # THIS DOCUMENT (Single source of truth)
│   ├── SMS_AUTOMATION_DEEP_DIVE.md  # Detailed specs on zero-touch SMS edge relay
│   ├── UI_DEEP_DIVE.md              # Visual design language and per-screen breakdown
│   └── sms-automation-spec.md       # Ingestion contract and fallback specifications
│
├── netlify/functions/               # Netlify Serverless Backend
│   ├── process-sms.ts               # Ingestion webhook: validates API key, calls Gemini, writes pending tx
│   ├── send-daily-reminders.ts      # Web-push daily reminder dispatcher via VAPID
│   ├── register-push-subscription.ts# Saves browser PushSubscription into user document
│   └── update-notification-settings.ts# Modifies notification preferences and schedules
│
├── public/                          # Static assets and Service Worker
│   ├── icon-money.svg               # App iconography
│   └── sw.js                        # Custom service worker: caching, push reception, snooze actions
│
└── src/                             # Main React Frontend Source
    ├── main.tsx                     # React DOM root render mounting <App />
    ├── App.tsx                      # Root coordinator: State, Firestore sync, routing, modals (~3.6k lines)
    ├── firebaseConfig.ts            # Firebase app init & Firestore offline persistence setup
    │
    ├── types/                       # TypeScript Type Definitions
    │   ├── types.ts                 # Core entities: Transaction, Account, Budget, Loan, Goal, User, etc.
    │   └── notifications.ts         # Push notification and reminder setting interfaces
    │
    ├── lib/                         # Pure Business Logic & Algorithms
    │   ├── timezone.ts              # TimezoneManager: Centralized time arithmetic (Default: Asia/Kolkata)
    │   ├── loanCalculations.ts      # Amortization generator, extra EMI payoff, interest savings
    │   ├── monthlyReport.ts         # Analytical aggregations for monthly statements
    │   └── migrateExport.ts         # Lossless Firestore tree exporter for migrations
    │
    ├── hooks/                       # Custom React Hooks
    │   ├── useStreaks.ts            # Visit streaks and daily transaction logging streak tracker
    │   ├── useBillSplittingData.ts  # Multi-group, participant, and split expense synchronization
    │   ├── useNotifications.ts      # Browser notification permissions and state management
    │   ├── useOnboarding.ts         # Guided tour wizard state and completion tracking
    │   ├── usePullToRefresh.ts      # Mobile touch pull-to-refresh gesture handler
    │   ├── useLenis.ts              # Inertial smooth scrolling controller
    │   ├── useHaptic.ts             # Web Vibration API integration for micro-interactions
    │   └── useToast.ts              # Global notification toast dispatcher
    │
    ├── services/                    # Background Services
    │   ├── clientNotificationScheduler.ts # 60-second in-browser interval scheduler (Free tier fallback)
    │   └── notificationService.ts   # Web-push subscription coordinator
    │
    ├── data/
    │   └── mockData.ts              # Mock accounts, transactions, budgets, and default category seeds
    │
    ├── components/                  # UI Components by Domain
    │   ├── Dashboard/               # 19 Drag & Drop customizable widgets + container & metric cards
    │   │   ├── DashboardPage.tsx    # Dashboard view, layout persistence, privacy mode toggle
    │   │   ├── DashboardContainer.tsx# DnD context wrapping 3 sortable column zones
    │   │   ├── DraggableWidget.tsx  # Widget card wrapper with drag handles and edit overlays
    │   │   ├── MetricCard.tsx       # Top summary cards (Total Balance, Income, Expenses)
    │   │   ├── SpendingChart.tsx    # Interactive donut & trend chart with drilldowns
    │   │   ├── AccountBalances.tsx  # Dynamic account list with credit utilization bars
    │   │   ├── BudgetSummary.tsx    # 3D Flip-card toggling category vs total budget views
    │   │   ├── CashFlowForecast.tsx # 30/90-day predictive cash balance projections
    │   │   ├── InsightsEngine.tsx   # Algorithmic spending anomaly detector and suggestions
    │   │   ├── Achievements.tsx     # Milestone badges and gamification tracker
    │   │   └── WidgetLibraryModal.tsx# Modal to add/hide/restore dashboard widgets
    │   │
    │   ├── Transactions/            # Ledger views & filtration
    │   │   ├── TransactionsPage.tsx # Master ledger page coordinating filters and views
    │   │   ├── FilterBar.tsx        # Multi-attribute filter controls (date, type, category, tags)
    │   │   ├── TransactionTable.tsx # Desktop tabular ledger with inline editing & bulk actions
    │   │   ├── MobileTransactionList.tsx # Card-based swipeable mobile transaction list
    │   │   └── CalendarView.tsx     # Month-grid calendar displaying daily income/expense chips
    │   │
    │   ├── CreditCards/             # Dedicated credit card management
    │   │   └── CreditCardsPage.tsx  # Realistic CSS gradient cards, statement/due tracking, billing
    │   │
    │   ├── Budgets/                 # Category and total monthly budget monitoring
    │   │   └── BudgetsPage.tsx      # Spend progress bars, threshold alerts, budget CRUD
    │   │
    │   ├── Goals/                   # Savings targets
    │   │   ├── GoalsPage.tsx        # Emoji cards, target completion calculator, funding triggers
    │   │   └── GoalDetailsModal.tsx # Detailed goal breakdown and contribution ledger
    │   │
    │   ├── Loans/                   # Debt and EMI management
    │   │   ├── LoansPage.tsx        # Loan cards, payoff strategy comparison (Snowball vs Avalanche)
    │   │   ├── PayoffChart.tsx      # Comparative payoff curve visualizer
    │   │   └── StrategySummaryTable.tsx # Time & interest savings across debt reduction strategies
    │   │
    │   ├── BillSplitting/           # Group expense sharing
    │   │   ├── GroupManager.tsx     # Group creation and participant assignment
    │   │   ├── ExpenseForm.tsx      # Split logic (Equal, Exact Amounts, Percentages)
    │   │   ├── SummaryView.tsx      # Simplified debt settlement graph ("Who owes whom")
    │   │   └── HistoryView.tsx      # Audit trail of past group splits and payments
    │   │
    │   ├── Settings/                # Modular application preferences
    │   │   ├── SettingsPage.tsx     # Tabbed settings container
    │   │   └── sections/
    │   │       ├── ProfileSettings.tsx      # User name, email, avatar
    │   │       ├── AppearanceSettings.tsx   # Dark/light theme, custom font selection
    │   │       ├── FinancialSettings.tsx    # Currency symbol, default account, category & tag manager
    │   │       ├── AutomationSettings.tsx   # SMS Listener API key generator & BYOK Gemini key
    │   │       ├── NotificationSettings.tsx # Reminder time, frequency, web-push toggle
    │   │       ├── SecuritySettings.tsx     # Password change, re-auth, account purge
    │   │       └── DataManagement.tsx       # JSON backup/restore, CSV import/export, SpendState migration
    │   │
    │   ├── Modals/                  # Floating dialogs and workflows
    │   │   ├── AddTransactionModal.tsx      # Transaction entry with shortcuts, tags, and bill split link
    │   │   ├── BillSplittingModal.tsx       # Standalone group bill splitting workflow
    │   │   ├── PayCreditCardModal.tsx       # Bill payment modal linking bank account to credit card
    │   │   ├── MonthlyReportModal.tsx       # Interactive monthly review with PDF export
    │   │   ├── CalculatorModal.tsx          # Floating financial utility calculator (Global Shortcut Alt+C)
    │   │   ├── ImportCSVModal.tsx           # CSV transaction parser and column mapper
    │   │   ├── ExportModal.tsx              # CSV and JSON data export utility
    │   │   ├── LoanModal.tsx                # Loan and EMI creation/editing dialog
    │   │   ├── RecurringTransactionModal.tsx# Automated scheduled transaction configuration
    │   │   └── ShortcutModal.tsx            # Keyword quick-entry shortcut manager
    │   │
    │   ├── Layout/                  # Shell framing
    │   │   ├── Sidebar.tsx          # Desktop left navigation bar + profile card + streak pill
    │   │   └── Header.tsx           # Top navigation bar with live date, calculator, and action buttons
    │   │
    │   ├── Common/                  # Shared micro-components & primitives
    │   │   ├── EnhancedFAB.tsx      # Bottom-right speed dial (Add income/expense, repeat last, shortcuts)
    │   │   ├── CurrencyInput.tsx    # Formatted numerical input with en-IN numbering and words preview
    │   │   ├── TagInput.tsx         # Color-coded custom tag creator and selector
    │   │   ├── AnimatedNumber.tsx   # Smooth numeric odometer scrolling effect
    │   │   ├── AnimatedButton.tsx   # Terminal-inspired matrix scramble hover button
    │   │   ├── ConnectionStatus.tsx # Network online/offline status banner
    │   │   └── StreakBadge.tsx      # Animated flame badge displaying visit & transaction streaks
    │   │
    │   ├── Login/                   # Authentication surfaces
    │   │   ├── LoginPage.tsx        # Auth modal container
    │   │   ├── Landing.tsx          # Marketing showcase, features, and landing hero
    │   │   └── EmailAuthForm.tsx    # Email/password registration, login, and password reset
    │   │
    │   └── Onboarding/              # New user walkthrough
    │       ├── OnboardingWizard.tsx # Multi-step interactive guided setup
    │       ├── SpotlightOverlay.tsx # Element highlight backdrop
    │       └── GamifiedProgress.tsx # Setup progress bar with checklist completion
    │
    └── tests/                       # Test setup and test cases
        ├── setup.ts                 # Vitest matchers setup
        └── Layout/
            ├── Header.test.tsx      # Header render and title tests
            └── Sidebar.test.tsx     # Navigation links test
```

---

## 4. Complete Data Models & Firestore Schema

All user-specific data is encapsulated under the root collection `spenders/` keyed by the user's Firebase Auth `uid`:

```
spenders/
  └── {userId}/                       ← User Profile Document
      ├── transactions/               ← Income and Expense records
      ├── accounts/                   ← Bank Accounts, Wallets, and Credit Cards
      ├── budgets/                    ← Category spend limits
      ├── total_budget/               ← Monthly global limits
      ├── goals/                      ← Target savings goals
      ├── loans/                      ← Active loans and mortgages
      ├── recurring_transactions/     ← Scheduled recurring templates
      ├── shortcuts/                  ← Quick-entry keyword mappings
      ├── pending_transactions/       ← Ingested SMS transactions awaiting review
      ├── billSplittingParticipants/  ← Global bill-split contacts
      └── billSplittingGroups/        ← Split groups
          └── {groupId}/
              └── expenses/           ← Split ledger entries for that group
```

### 4.1. Core Interfaces

#### User Profile Document (`spenders/{userId}`)
```typescript
interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency?: string;                    // Default: '₹'
  themePreference?: 'dark' | 'light';  // Default: 'dark'
  fontPreference?: string;              // Default: 'Montserrat'
  timezone?: string;                    // Default: 'Asia/Kolkata'
  defaultAccountId?: string;            // Default account for transactions
  categories?: string[];                // User custom categories
  tags?: Tag[];                         // User custom tags
  listenerApiKey?: string;              // UUID v4 used by Android SMS sidecar
  geminiApiKey?: string;                // User's BYOK Google Gemini API key
  feedbackStars?: number;
  feedbackText?: string;
  hasGivenFeedback?: boolean;
}
```

#### Transaction (`spenders/{userId}/transactions/{id}`)
```typescript
interface Transaction {
  id: string;
  name: string;                         // Description / Merchant name
  amount: number;                       // NEGATIVE for expenses, POSITIVE for income
  date: string;                         // Normalized ISO string (YYYY-MM-DD or full ISO)
  category: string;                     // e.g., 'Food', 'Salary', 'Shopping'
  type: 'income' | 'expense';
  accountId?: string;                   // Reference to accounts collection doc id
  comments?: string;
  isMock?: boolean;                     // Flag for demo transactions
  createdAt?: string;                   // Audit timestamp
  isRecurring?: boolean;                // Flag indicating generation from a recurring rule
  recurringTransactionId?: string;      // Parent recurring rule reference
  loanId?: string;                      // Linked loan reference for EMI tracking
  creditCardPaymentId?: string;         // Linked credit card reference for card payments
  tags?: string[];                      // Array of Tag IDs
  receivedAt?: string;                  // Timestamp of SMS arrival from companion app
}
```

#### Account (`spenders/{userId}/accounts/{id}`)
```typescript
interface Account {
  id: string;
  name: string;                         // e.g., 'HDFC Bank', 'Chase Sapphire'
  type: 'Bank' | 'Credit Card' | 'Cash' | 'Wallet' | 'Investment' | string;
  balance: number;                      // Initial opening balance (for non-credit cards)
  limit?: number;                       // Total credit limit (for Credit Cards)
  isMock?: boolean;
  
  // Credit Card Specific Attributes
  last4Digits?: string;                 // e.g., '4821'
  network?: 'visa' | 'mastercard' | 'amex' | 'RuPay' | 'discover' | 'other';
  statementDate?: number;               // Day of the month billing cycle closes (1-31)
  paymentDueDate?: number;              // Day of the month payment is due (1-31)
  theme?: string;                       // CSS Tailwind gradient classes (e.g., 'from-blue-900 via-indigo-900...')
}
```

#### Budget (`spenders/{userId}/budgets/{id}`)
```typescript
interface Budget {
  id: string;
  category: string;                     // Associated category name
  limit: number;                        // Monthly cap in selected currency
  spent?: number;                       // Dynamically computed during runtime
  isMock?: boolean;
}
```

#### Total Budget (`spenders/{userId}/total_budget/{id}`)
```typescript
interface TotalBudget {
  id: string;
  limit: number;                        // Overall spending limit for the month
  month: string;                        // Format: 'YYYY-MM'
  isMock?: boolean;
}
```

#### Loan (`spenders/{userId}/loans/{id}`)
```typescript
interface Loan {
  id: string;
  name: string;                         // e.g., 'Home Loan', 'Car Loan'
  loanAmount: number;                   // Principal borrowed
  interestRate: number;                 // Annual percentage rate (e.g., 8.5)
  tenure: number;                       // Duration in years
  tenureInMonths?: number;              // Duration in months (optional override)
  emi: number;                          // Monthly installment amount
  startDate: string;                    // Commencement date (YYYY-MM-DD)
  type?: 'home' | 'auto' | 'personal' | 'student' | 'other';
  isMock?: boolean;
}
```

#### Recurring Transaction (`spenders/{userId}/recurring_transactions/{id}`)
```typescript
interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;                       // Negative for expense, positive for income
  category: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;                    // Rule start date
  endDate?: string;                     // Optional rule expiry date
  lastProcessedDate: string;            // Date up to which transactions were generated
  accountId?: string;
  isPaused?: boolean;                   // Temporary suspension flag
  isMock?: boolean;
}
```

#### Pending Transaction (`spenders/{userId}/pending_transactions/{id}`)
```typescript
interface PendingTransaction {
  id: string;
  smsText: string;                      // Raw SMS text forwarded from Android device
  extractedAmount?: number;             // Parsed currency value
  extractedMerchant?: string;           // Identified merchant name
  extractedType?: 'income' | 'expense'; // Detected transaction direction
  status: 'pending' | 'approved' | 'rejected';
  receivedAt: string;                   // ISO date string recorded on device
}
```

#### Bill Splitting Entities
```typescript
interface Participant {
  id: string;
  name: string;
  avatar?: string;
  amountOwed: number;                   // Dynamically computed
  amountPaid: number;                   // Dynamically computed
}

interface Group {
  id: string;
  name: string;
  participantIds: string[];
  createdAt?: Date;
  currency?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;                       // Participant ID who funded the expense
  splitType: 'equal' | 'unequal' | 'percentage';
  splits: {
    participantId: string;
    amount: number;
    percentage?: number;
  }[];
  date: string;
  groupId?: string;
  category?: string;
  createdAt?: Date;
}
```

### 4.2. Global Collection (`analytics/global`)
Aggregates anonymous global usage counters to track system scale:
- `totalUsers`, `totalTransactions`, `totalIncome`, `totalExpenses`
- `totalAccounts`, `totalBudgets`, `totalGoals`, `totalLoans`, `totalRecurringTransactions`
- `totalCSVImports`, `totalCSVExports`, `totalPDFExports`, `totalBackups`, `totalRestores`

---

## 5. Runtime Architecture & Execution Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant App as App.tsx (Coordinator)
    participant FBAuth as Firebase Auth
    participant FS as Cloud Firestore
    participant Engine as Recurring & Balance Engines

    User->>App: Opens Application
    App->>FBAuth: onAuthStateChanged()
    FBAuth-->>App: Returns User object
    
    par Concurrent Real-time Subscriptions
        App->>FS: onSnapshot(spenders/{uid})
        App->>FS: onSnapshot(spenders/{uid}/transactions)
        App->>FS: onSnapshot(spenders/{uid}/accounts)
        App->>FS: onSnapshot(spenders/{uid}/budgets)
        App->>FS: onSnapshot(spenders/{uid}/loans)
        App->>FS: onSnapshot(spenders/{uid}/goals)
        App->>FS: onSnapshot(spenders/{uid}/recurring_transactions)
        App->>FS: onSnapshot(spenders/{uid}/pending_transactions)
    end

    FS-->>App: Push Initial Snapshots
    App->>Engine: Calculate accountsWithDynamicBalances
    App->>Engine: processRecurringTransactions()
    Engine->>FS: writeBatch() commit missed recurring txs
    App-->>User: Renders Dashboard with Real-time Data
```

### 5.1. Central State Hub Pattern (`App.tsx`)
The application deliberately avoids external state-container overhead (Redux/Zustand) in favor of a centralized reactive coordinator in [`App.tsx`](file:///e:/Projects/spendwiser/src/App.tsx):
- **Authentication Lifecycle:** Listens via `auth.onAuthStateChanged`. Unauthenticated users are routed to `Landing.tsx` or `LoginPage.tsx`.
- **Parallel Subscriptions:** Initializes listeners across all user sub-collections simultaneously. When all collections emit their first snapshot, `loading` resolves to `false`.
- **Screen Router:** Manages navigation via the `currentScreen` state (`'dashboard' | 'transactions' | 'credit-cards' | 'budgets' | 'settings' | 'goals' | 'loans' | 'shortcuts'`). Each screen is rendered with Framer Motion page entrance transitions (`pageVariants`).
- **Global Action Modals:** Manages open/close states and pass-through handlers for modals (`AddTransactionModal`, `BudgetModal`, `GoalModal`, `LoanModal`, `CalculatorModal`, `MonthlyReportModal`, etc.).

### 5.2. Dynamic Account Balance Engine
Account balances are **not mutated directly on transaction writes**. This guarantees zero drift and prevents synchronization race conditions:
1. **Regular Accounts (Bank, Cash, Wallet):**
   $$\text{Current Balance} = \text{Account Opening Balance} + \sum (\text{Transactions where } accountId == account.id)$$
   *(Note: Expense amounts are negative numbers, income amounts are positive numbers).*
2. **Credit Card Accounts:**
   $$\text{Current Balance} = \sum |\text{Transactions where } accountId == card.id|$$
   For credit cards, balance represents **current total billing spend**. Payments to the card are linked using `creditCardPaymentId`.
3. **Partitioning:** [App.tsx](file:///e:/Projects/spendwiser/src/App.tsx#L825-L835) automatically derives:
   - `creditCards`: Accounts where `type === 'Credit Card'`.
   - `regularAccounts`: Accounts where `type !== 'Credit Card'`.

### 5.3. Autonomous Recurring Transaction Engine
Located in [`App.tsx:processRecurringTransactions`](file:///e:/Projects/spendwiser/src/App.tsx#L587-L667):
- **Triggers:** Automatically executes on component mount, on `window.focus`, and when `document.visibilitychange` returns to foreground. Debounced to 5-second intervals.
- **Execution Algorithm:**
  1. Compares `rt.lastProcessedDate` against today's normalized date.
  2. If earlier, loops forward using `TimezoneManager.getNextOccurrence(date, rt.frequency)`.
  3. Generates all missed transaction documents up to the current date.
  4. Commits all new transactions and updates the recurring rule's `lastProcessedDate` atomically using a Firestore `writeBatch`.

---

## 6. The Zero-Touch SMS Automation Pipeline

The SMS automation system solves the "Data Entry Tax" friction in personal finance tracking by turning Android mobile notifications into reviewed ledger entries in seconds.

```mermaid
graph LR
    subgraph "Edge Device (Android Phone)"
        A[Bank SMS Arrives] --> B[Kotlin BroadcastReceiver]
        B --> C{High-Pass Keyword Filter}
        C -->|Match| D[Headless Background Task]
        C -->|Ignore| E[Sleep]
        D --> F[HTTP POST /api/process-sms]
    end

    subgraph "Serverless Pipeline (Netlify Function)"
        F --> G[Validate listenerApiKey]
        G --> H[Retrieve user geminiApiKey]
        H --> I[Gemini 3.1 Flash Lite]
        I -.->|Failover| J[Gemini 2.5 Flash]
        J -.->|Failover| K[Regex Fallback Engine]
        I --> L[JSON Output]
        J --> L
        K --> L
        L --> M[Write to pending_transactions]
    end

    subgraph "Web Application"
        M -->|Firestore Snapshot| N[React UI Alert Banner]
        N --> O[User 1-Click Review & Approve]
        O --> P[Permanent Transaction Record]
    end
```

### 6.1. Edge Interception (Android Sidecar)
- An open-source, sideloaded Android APK registers a native Kotlin `BroadcastReceiver` for `SMS_RECEIVED_ACTION`.
- **Local Filtering:** Checks for currency signs (`₹`, `Rs`, `$`) and financial verbs (`debited`, `credited`, `spent`, `transferred`). Non-financial texts are discarded immediately to conserve battery.
- **Dispatch:** Forwards payload `{ apiKey, smsText, receivedAt }` to Netlify endpoint. In offline conditions, payloads are queued in local SQLite/AsyncStorage and flushed when connectivity resumes.

### 6.2. Serverless Intelligence Pipeline (`netlify/functions/process-sms.ts`)
1. **Authentication:** Validates incoming `apiKey` by querying Firestore for `spenders.where('listenerApiKey', '==', apiKey)`.
2. **AI Parsing Strategy:**
   - Retrieves the user's personal `geminiApiKey`.
   - Queries `gemini-3.1-flash-lite-preview` with an extraction prompt requiring JSON output: `{ "amount": number, "merchant": string, "type": "income" | "expense" }`.
   - **Fallback Tier 1:** If the Lite preview fails or times out, immediately retries with `gemini-2.5-flash`.
   - **Fallback Tier 2:** If both AI calls fail or no API key is provided, routes to an enhanced deterministic Regex engine capable of matching international currencies and merchant formats.
3. **Draft Staging:** Writes the structured extraction into `spenders/{userId}/pending_transactions`.

### 6.3. User Review & Ledger Commitment
- The web app listens to `pending_transactions` in real time.
- If pending records exist, an alert banner mounts across all screens.
- Clicking **Review** opens `AddTransactionModal` pre-filled with the extracted merchant, amount, transaction type, and original SMS receipt date.
- Upon saving, the transaction is committed to `transactions` and the pending draft is deleted.

---

## 7. Core Feature Modules Deep Dive

### 7.1. Dashboard & Customizable Widget Grid
- **Drag-and-Drop Architecture:** Built using `@dnd-kit/core` and `@dnd-kit/sortable` inside [`DashboardContainer.tsx`](file:///e:/Projects/spendwiser/src/components/Dashboard/DashboardContainer.tsx). Provides a 3-column layout on desktop that gracefully stacks to 1 column on mobile.
- **Persistence:** Layout positions, visible widgets, and hidden widgets are persisted in browser `localStorage`.
- **Privacy Mode:** A global toggle masks sensitive monetary values across metrics with playful privacy placeholders (`Bazillions 💰`, `Stonks Only 🚀`, `Don't Look 🙈`).
- **19 Specialized Widgets:**
  1. `SpendingChart`: Donut, horizontal bar, and gradient area view with selectable slice drilldowns.
  2. `AccountBalances`: Live account balances and credit utilization progress bars.
  3. `IncomeVsExpenseChart`: 6-month historical savings rate comparison.
  4. `BudgetSummary`: 3D flip card alternating between category budgets and total monthly limits.
  5. `TotalBudgetWidget`: Monthly spend progress indicator with threshold alerts.
  6. `TopSpendingCategories`: Top 5 expense ranks with custom category emojis.
  7. `RecentTransactions`: 7 most recent transactions with inline double-click editing.
  8. `CashFlowForecast`: 30/90-day balance projections.
  9. `NetWorthWidget`: Liquid net-worth calculation across all non-credit accounts minus credit balances.
  10. `DaysOfBuffer`: Financial runway estimation based on average daily burn rate.
  11. `InsightsEngine`: Algorithmic spending alerts and optimization suggestions.
  12. `LifestyleCreepIndicator`: Year-over-year expenditure vs income expansion tracker.
  13. `FutureBalanceProjection`: Multi-month forward trajectory with recurring rules factored in.
  14. `SubscriptionTracker`: Detection of recurring vendor charges and subscription costs.
  15. `FinancialGoalsWidget`: Quick-look widget showing progress toward active savings goals.
  16. `DebtPaydownWidget`: Active loan summary and next installment countdown.
  17. `BillSplittingSummary`: Summary of net balances across split groups.
  18. `Achievements`: Gamification badges based on streak days and budgeting discipline.
  19. `MonthlyBalanceWidget`: Month-to-date net surplus/deficit indicator.

### 7.2. Transactions & Advanced Ledger
- **Views:** Seamlessly toggle between Tabular View (`TransactionTable.tsx`), Mobile Card View (`MobileTransactionList.tsx`), and Month-Grid Calendar View (`CalendarView.tsx`).
- **Filtering Engine:** Multi-attribute filtering supported via [`FilterBar.tsx`](file:///e:/Projects/spendwiser/src/components/Transactions/FilterBar.tsx):
  - Text search (matches name, merchant, or category).
  - Transaction type (`all`, `income`, `expense`).
  - Category selector & multi-category filters.
  - Date range filtering normalized through `TimezoneManager`.
  - Amount range filter (`minAmount`, `maxAmount`).
  - Tag filters and comments toggle.
- **Bulk Operations:** Select multiple records to perform bulk category re-assignment or batch deletion.
- **Reporting:** Direct integration with `MonthlyReportModal.tsx` to export formatted PDF financial statements via `jspdf` and `html2canvas`.

### 7.3. Credit Card Management Center (`CreditCardsPage.tsx`)
- **Virtual Realistic Visualizer:** Dynamically generates credit card UI widgets with authentic network branding (Visa, Mastercard, Amex, RuPay, Discover), custom gradient themes, masked card numbers, and balance/limit indicators.
- **Billing Cycle Intelligence:** Tracks Statement Generation Date and Payment Due Date. Calculates days remaining until payment is due and flags overdue warnings.
- **Bill Payment Workflow:** Dedicated modal [`PayCreditCardModal.tsx`](file:///e:/Projects/spendwiser/src/components/Modals/PayCreditCardModal.tsx) allows users to pay down card balances from bank accounts, automatically creating the corresponding expense and linking it via `creditCardPaymentId`.

### 7.4. Loan Amortization & Debt Reduction (`LoansPage.tsx`)
- **Mathematical Amortization:** Calculates full schedules via [`loanCalculations.ts`](file:///e:/Projects/spendwiser/src/lib/loanCalculations.ts), producing principal vs interest breakdowns for every month across the tenure.
- **Payoff Strategy Simulator:** Compares **Debt Snowball** (lowest balance first) against **Debt Avalanche** (highest interest first) strategies, calculating exact months shaved off and total interest saved.
- **Pre-closure Analysis:** Simulates lump-sum prepayments and recurrent EMI increments.

### 7.5. Bill Splitting Engine (`BillSplittingModal.tsx` & `useBillSplittingData.ts`)
- **Ledger Independence:** Maintained under `billSplittingGroups` and sub-collection `expenses` without polluting the user's primary transaction ledger.
- **Splitting Models:** Supports Equal split, Unequal exact amounts, and Percentage splits.
- **Settlement Minimization:** Computes a simplified settlement matrix indicating who owes whom with minimal transaction transfers.
- **Primary Ledger Linkage:** Individual user portions can be directly exported into the main transactions ledger as an expense.

### 7.6. Streaks & Gamification (`useStreaks.ts`)
- Tracks two independent streak metrics saved in `localStorage`:
  1. **Visit Streak:** Increments when the user logs in on consecutive calendar days.
  2. **Transaction Streak:** Consecutive calendar days with at least one transaction logged.
- Visualized via the animated `StreakBadge.tsx` featuring an animated flame icon that upgrades to a "Super Streak" gradient when thresholds are surpassed.

### 7.7. Notification Architecture
- **Dual-Layer Delivery:**
  1. **In-Browser Fallback:** [`ClientNotificationScheduler.ts`](file:///e:/Projects/spendwiser/src/services/clientNotificationScheduler.ts) polls every 60 seconds while the app is open. If current time matches user reminder preferences, dispatches an HTML5 notification.
  2. **Push Service Worker:** Web-push subscription registered via VAPID keys. Netlify function `send-daily-reminders.ts` can be scheduled via Netlify Scheduled Functions or external crons.
- **Interactive Notification Actions:** Service worker notifications support direct action clicks: `Add Transaction`, `Remind Later (Snooze)`, or `Dismiss`.

---

## 8. Design System & Visual Grammar

SpendWiser follows a modern aesthetic prioritizing visual polish and tactile micro-interactions:

| Token / Concept | Value / Implementation |
| :--- | :--- |
| **Dark Canvas Background** | `#1A1A1A` (Clean neutral charcoal, avoids muddy grays) |
| **Card & Surface Background** | `#242424` with frosted glass overlays (`backdrop-blur-md bg-white/5` or `bg-black/20`) |
| **Primary Accent** | Blue `#007BFF` (Buttons, active navigation states, selected items) |
| **Success / Income** | Emerald / Green `#10B981` / `#28A745` (Income records, positive cash flow, settled balances) |
| **Danger / Expense** | Red `#EF4444` / `#DC3545` (Expenses, over-budget indicators, delete buttons) |
| **Caution / Warning** | Amber / Yellow `#FFC107` / `#F59E0B` (Near budget limits, upcoming bills) |
| **Intelligence / AI Accent**| Purple / Indigo / Cyan (AI parsing indicators, insights engine) |
| **Typography** | Montserrat (Default), Inter, Outfit loaded via Google Fonts; tabular numbers enabled |
| **Numeric Formatting** | Indian numbering system grouping (`en-IN`: `1,00,000.00`) or standard locale via `AnimatedNumber` |
| **Tactile Speed Dial** | Bottom-right `EnhancedFAB` with press-and-hold radial menu for rapid logging |

---

## 9. Environment Variables & Configuration

### Client Environment (`.env`)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="spendwiser.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="spendwiser"
VITE_FIREBASE_STORAGE_BUCKET="spendwiser.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Gemini AI (Optional fallback key for development test scripts)
VITE_GEMINI_API_KEY="AIzaSy..."

# Web Push Notification Public Key
VITE_VAPID_PUBLIC_KEY="BEl62iUYg..."
```

### Serverless Environment (Netlify Dashboard)
```bash
# Firebase Admin Credentials
FIREBASE_PROJECT_ID="spendwiser"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@spendwiser.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...-----END PRIVATE KEY-----\n"

# Web Push Keys
VAPID_PUBLIC_KEY="BEl62iUYg..."
VAPID_PRIVATE_KEY="xxxxxxxx..."
```

---

## 10. Developer & Agent Guidelines: Critical Invariants

When reading, debugging, or extending SpendWiser, adhere strictly to these invariants:

1. **Transaction Amount Sign Invariant:**
   - Expenses must ALWAYS be stored as **negative numbers** (`amount < 0`).
   - Income must ALWAYS be stored as **positive numbers** (`amount > 0`).
   - UI forms accept positive values from users; negation must occur prior to Firestore writes.
2. **Never Statically Mutate Account Balances on Transaction Write:**
   - Account documents store their initial opening balance. Current balances are dynamically derived in `accountsWithDynamicBalances`. Do not increment/decrement `account.balance` in Firestore when transactions are added, edited, or deleted.
3. **Timezone Uniformity:**
   - Never use raw `new Date().toISOString().split('T')[0]` for calendar comparisons. Always use [`TimezoneManager`](file:///e:/Projects/spendwiser/src/lib/timezone.ts) to guarantee consistent dates across timezones (defaults to `Asia/Kolkata` / IST).
4. **App.tsx State Propagation:**
   - Because `App.tsx` acts as the root coordinator, any new global entity or modal must be wired into `App.tsx`'s state hooks and passed down through props. Do not introduce ad-hoc global state stores that bypass this pipeline without refactoring the parent coordinator.
5. **BYOK Privacy Guarantee:**
   - Never store or log Gemini API keys on centralized backend servers. The Netlify webhook reads `geminiApiKey` directly from the user's private Firestore record, talks directly to Google's API, and discards the credentials immediately upon request completion.
6. **Unused Directories:**
   - The directory `src/cyber/` contains experimental empty directories; `src/components/unused/` contains archived components. Do not import from these locations. All active components reside within their respective domain folders under `src/components/`.