# Investment Manager - Detailed Implementation Plan

This document outlines the technical execution plan for building the **Investment Manager** module. This module is designed as a self-contained "app-within-an-app" that plugs into the main SpendWise architecture, replacing the "Goals" feature.

## 1. Directory Structure & modularity

The feature will live entirely within `src/components/Investments` to ensure modularity.

```text
src/
├── components/
│   ├── Investments/
│   │   ├── Dashboard/
│   │   │   ├── PortfolioSummary.tsx    # Net worth, P&L, Day's Gain
│   │   │   ├── AssetAllocation.tsx     # Donut chart
│   │   │   └── MarketOverview.tsx      # Top movers / News (Phase 2)
│   │   ├── AssetList/
│   │   │   ├── AssetTable.tsx          # Rich list view with sparklines
│   │   │   └── AssetCard.tsx           # Mobile view card
│   │   ├── AssetDetails/
│   │   │   ├── AssetDetailsPage.tsx    # Deep dive view
│   │   │   └── PriceChart.tsx          # Recharts implementation
│   │   ├── Forms/
│   │   │   ├── AddAssetModal.tsx       # Polymorphic form (Stock vs FD vs Crypto)
│   │   │   └── TradeModal.tsx          # Buy/Sell/Dividend form
│   │   ├── SIP/
│   │   │   ├── SIPManagerPage.tsx      # Separate view for SIPs
│   │   │   └── SIPCalendar.tsx         # Visual timeline
│   │   ├── InvestmentsPage.tsx         # Main Container (The entry point)
│   │   └── investments.css             # Module-specific styles
├── types/
│   └── investments.ts                  # Dedicated type definitions
├── hooks/
│   └── useInvestments.ts               # Custom hook for investment logic
├── services/
│   └── marketData.ts                   # API Service (Yahoo Finance/CoinGecko wrapper)
└── context/
    └── InvestmentContext.tsx           # State management for the module
```

## 2. Data Models (`src/types/investments.ts`)

We need strict typing to handle the diversity of asset classes.

```typescript
export type AssetType = 'STOCK' | 'CRYPTO' | 'MF' | 'GOLD' | 'FIXED_INCOME' | 'REAL_ESTATE' | 'CASH';

export interface Asset {
  id: string;
  symbol: string;         // e.g., "AAPL", "BTC-USD" (Empty for FD/Real Estate)
  name: string;           // "Apple Inc."
  type: AssetType;
  quantity: number;       // Number of shares/units
  avgBuyPrice: number;    // Average cost basis
  currentPrice: number;   // Live fetched price
  currency: string;       // "USD", "INR", etc.
  
  // For Fixed Income specifically
  interestRate?: number;  // %
  maturityDate?: string;  // ISO Date
  principal?: number;     
  
  // Metadata
  tags: string[];
  lastUpdated: string;    // Timestamp of last price fetch
}

export interface InvestmentTransaction {
  id: string;
  assetId: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST';
  date: string;
  quantity: number;       // 0 for Dividend/Interest
  pricePerUnit: number;
  totalAmount: number;
  fees: number;
  linkedTransactionId?: string; // Link to core SpendWise expense
}

export interface SIP {
  id: string;
  name: string;
  assetId?: string;       // Optional: Can create asset on first run
  targetAssetSymbol?: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  nextDueDate: string;
  isActive: boolean;
  autoLog: boolean;       // If true, auto-creates transaction on due date
}
```

## 3. Implementation Steps

### Phase 1: Foundation (Data Layer & Basic UI)

**Step 1: Scaffolding & Types**
*   Create the directory structure.
*   Define `src/types/investments.ts`.
*   Create `InvestmentContext` to hold the state (Assets list, Transactions list, SIPs list).
*   Add dummy/mock data to the Context to visualize the UI during development.

**Step 2: The Main Dashboard (Read-Only View)**
*   Implement `InvestmentsPage.tsx` layout.
*   Build `PortfolioSummary` to calculate Net Worth (Quantity * Current Price).
*   Build `AssetList` to display the dummy data grouped by `AssetType`.
*   **Action:** Replace "Goals" route in `App.tsx` with `InvestmentsPage`.

**Step 3: Asset Management (CRUD)**
*   Implement `AddAssetModal`:
    *   **Tabbed Interface:** Different fields for Stock (Ticker search) vs FD (Interest Rate).
    *   **Logic:** Validates inputs and adds to `InvestmentContext`.
*   Implement `AssetDetailsPage`:
    *   Shows static details first.
    *   Lists history (mocked).

### Phase 2: Integration & Market Data

**Step 4: Market Data Service**
*   Implement `services/marketData.ts`.
*   Function: `fetchLivePrice(symbol: string)`.
*   Strategy: Use a client-side fetch to a reliable free API (e.g., CoinGecko for crypto, Yahoo proxy for stocks) with a fallback.
*   Hook: `useMarketData` to periodically refresh prices in the background.

**Step 5: Transaction Integration**
*   **The "Link" Hook:**
    *   Modify `TransactionForm.tsx` (Core SpendWise component).
    *   *Logic:* If Category == "Investments", show "Link to Asset" dropdown.
    *   *Effect:* When saved, it calls `addInvestmentTransaction` in `InvestmentContext`.

**Step 6: SIP Manager**
*   Build `SIPManagerPage`.
*   Implement the logic to check `today vs nextDueDate`.
*   Show alerts/notifications for due SIPs.

### Phase 3: "Trader Heaven" Visuals (Analytics)

**Step 7: Charts & Graphs**
*   Implement `Recharts` for Portfolio Growth.
*   Add Sparklines (mini SVG charts) to the Asset List rows.
*   Implement the "Asset Allocation" Pie Chart.

**Step 8: Dark Mode & Polish**
*   Ensure all investment components use the `dark:` Tailwind classes.
*   Add "Green/Red" coloring logic for P&L everywhere.

## 4. Technical Dependencies
*   **State:** React Context API (Sufficient for this scale).
*   **Charts:** `recharts` (Already in project).
*   **Icons:** `lucide-react` (Already in project).
*   **Dates:** Native `Date` object or `date-fns` if needed (Project uses native/TimezoneManager currently).
*   **API:** `fetch` with potential CORS proxy handling.

## 5. Execution Order
1.  **Scaffold:** Create folders and Types.
2.  **Context:** Build the data store.
3.  **UI Shell:** Get the page on the screen.
4.  **Forms:** Allow data entry.
5.  **API:** Make it live.
6.  **Integration:** Connect to Expenses.
