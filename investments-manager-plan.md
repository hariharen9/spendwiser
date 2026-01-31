# Investment Manager - Feature Specification & Vision

## 1. Executive Summary
The goal is to replace the existing, static "Goals" section of SpendWise with a **comprehensive, feature-rich Investment Manager**. This new module will function essentially as a "standalone app" integrated seamlessly within SpendWise. It is designed to be a "heaven for traders" and serious investors, offering granular tracking, live market data, and deep integration with the user's expense history.

## 2. Core Philosophy
*   **Investments are Assets, Not Expenses:** While money leaves the bank account (an "expense" in cash flow terms), it enters the Portfolio as an asset.
*   **Distinct Handling:** Different asset classes (Stocks, Crypto, Gold, FDs) behave differently and require specialized data structures and UI.
*   **Separation of Concerns:** The "SIP Manager" is a distinct entity from standard "Recurring Transactions" (bills/subscriptions) to allow for specialized wealth-building features.
*   **Visual Richness:** The UI will prioritize data density, visualizations (charts, sparklines, heatmaps), and a professional "trading terminal" aesthetic.

## 3. Supported Asset Classes
The manager will support distinct distinct handling for the following:

1.  **Stocks/ETFs:** Tracked via live market symbols (e.g., AAPL, VOO). Requires quantity, average buy price, and live price fetching.
2.  **Mutual Funds:** Tracked via NAV. Supports SIP (Systematic Investment Plan) linking.
3.  **Crypto:** 24/7 live tracking for cryptocurrencies. Supports high-precision decimal quantities.
4.  **Commodities:** Gold/Silver tracking (Spot price or ETF equivalents).
5.  **Fixed Income:** Fixed Deposits (FDs), Bonds, PPF. These rely on deterministic math (Principal + Interest Rate over Time) rather than live market feeds.

## 4. Integration with SpendWise Core
*   **The "Investments" Category:**
    *   We will not create a new "Transaction Type".
    *   Instead, we introduce a reserved System Category: **"Investments"**.
    *   **Workflow:** When a user adds an Expense with the category "Investments", the UI detects this and offers an optional "Link to Asset" flow.
        *   *User Action:* "Spent $500 on Investments".
        *   *System Prompt:* "Do you want to allocate this to an Asset?" -> User selects "Bitcoin".
        *   *Result:* Bank Balance -$500, Bitcoin Asset +$500 value (at current price).

## 5. The "SIP Manager" (Systematic Investment Plans)
A dedicated engine for recurring investments, separate from standard bill payments.
*   **Functionality:** Tracks active SIPs, frequency, amounts, and target assets.
*   **Automation:** Auto-generates "Investment" transactions on due dates and updates the linked asset's unit balance automatically.
*   **Visuals:** A "SIP Calendar" showing upcoming investment deductions.

## 6. Detailed Feature Set (Phase 1: Foundation & Integration)

### A. Portfolio Dashboard (The Command Center)
*   **Net Worth Card:** Real-time summation of all assets.
*   **P&L Summary:**
    *   **Unrealized P&L:** (Current Value - Invested Cost).
    *   **Day's Change:** Today's gain/loss in absolute and percentage terms.
*   **Asset Allocation:** Interactive Donut/Pie chart (e.g., "60% Equity, 30% Crypto, 10% Gold").
*   **Holdings List:** A rich list view of all assets with:
    *   Mini Sparkline (7-day trend).
    *   Current Price & Value.
    *   P&L indicators (Green/Red pills).

### B. Asset Details View
A deep-dive page for each individual asset.
*   **Performance Chart:** Line/Candlestick chart showing value over time.
*   **Transaction History:** A filtered list of all Buys, Sells, and Dividend events for *this specific asset*.
*   **Edit/Update:** Manual override for current price (if API fails) or adjusting average buy price.

### C. Market Data Engine
*   **Live Pricing:** Integration with a proxy service (likely wrapping Yahoo Finance or CoinGecko) to fetch real-time prices for Stocks, Crypto, and Gold.
*   **Currency Conversion:** (If applicable) Handling USD assets for a user with a different base currency.

### D. Transaction Management (Buy/Sell)
*   **Buy:** Increases quantity, recalculates "Average Buy Price".
*   **Sell:** Decreases quantity, calculates "Realized P&L" (Profit booked).
*   **Dividends:** Logs cash inflow without changing asset quantity.

## 7. Future Intelligence (Phase 2: Analytics & Projections)
*   **XIRR Calculator:** True return on investment calculation for SIPs.
*   **Projections:** "If you keep investing $X at Y% return, you will have $Z by 2030."
*   **Heatmaps:** Visual "Market Map" of the user's portfolio.
*   **Advanced Charts:** Comparative relative performance (My Portfolio vs S&P 500).

## 8. User Experience (UX) Vision
*   **Dark Mode First:** The trading interface should look sleek and professional in dark mode.
*   **Fast & Responsive:** Instant switching between asset classes.
*   **Data Density:** Information-rich cards rather than excessive whitespace.
