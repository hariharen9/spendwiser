// Investment Manager Type Definitions

export type AssetType = 'STOCK' | 'CRYPTO' | 'MF' | 'GOLD' | 'FIXED_INCOME' | 'REAL_ESTATE' | 'CASH';

export interface Asset {
  id: string;
  symbol: string;           // e.g., "AAPL", "BTC", "GOLD" (Empty for FD/Real Estate)
  name: string;             // "Apple Inc.", "Bitcoin", "Fixed Deposit - HDFC"
  type: AssetType;
  quantity: number;         // Number of shares/units (supports decimals for crypto)
  avgBuyPrice: number;      // Average cost basis per unit
  currentPrice: number;     // Live fetched price (or calculated for FD)
  currency: string;         // "USD", "INR", etc.

  // For Fixed Income specifically
  interestRate?: number;    // Annual interest rate %
  maturityDate?: string;    // ISO Date string
  principal?: number;       // Initial investment amount

  // For Real Estate
  purchaseDate?: string;    // ISO Date string
  location?: string;        // Property location

  // Metadata
  tags: string[];
  notes?: string;
  lastUpdated: string;      // Timestamp of last price fetch
  isMock?: boolean;
}

export type InvestmentTransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'INTEREST' | 'SPLIT';

export interface InvestmentTransaction {
  id: string;
  assetId: string;
  type: InvestmentTransactionType;
  date: string;             // ISO Date string
  quantity: number;         // 0 for Dividend/Interest
  pricePerUnit: number;
  totalAmount: number;
  fees: number;
  notes?: string;
  linkedTransactionId?: string;  // Link to core SpendWise expense
  isMock?: boolean;
}

export type SIPFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface SIP {
  id: string;
  name: string;
  assetId?: string;         // Optional: Can create asset on first run
  targetAssetSymbol?: string;
  targetAssetType?: AssetType;
  amount: number;
  frequency: SIPFrequency;
  nextDueDate: string;      // ISO Date string
  startDate: string;        // ISO Date string
  endDate?: string;         // Optional end date
  isActive: boolean;
  autoLog: boolean;         // If true, auto-creates transaction on due date
  isMock?: boolean;
}

// Calculated portfolio metrics
export interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  assetAllocation: {
    type: AssetType;
    value: number;
    percentage: number;
  }[];
}

// Asset with calculated fields
export interface AssetWithMetrics extends Asset {
  currentValue: number;     // quantity * currentPrice
  investedValue: number;    // quantity * avgBuyPrice
  unrealizedPL: number;     // currentValue - investedValue
  unrealizedPLPercent: number;
  dayChange?: number;
  dayChangePercent?: number;
}

// Market data response types
export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  currency: string;
  lastUpdated: string;
}

// Historical price data for charts
export interface PriceHistoryPoint {
  date: string;
  price: number;
  volume?: number;
}

// Asset type display configuration
export const ASSET_TYPE_CONFIG: Record<AssetType, { label: string; icon: string; color: string }> = {
  STOCK: { label: 'Stocks & ETFs', icon: '📈', color: 'blue' },
  CRYPTO: { label: 'Cryptocurrency', icon: '₿', color: 'orange' },
  MF: { label: 'Mutual Funds', icon: '📊', color: 'purple' },
  GOLD: { label: 'Gold & Commodities', icon: '🥇', color: 'yellow' },
  FIXED_INCOME: { label: 'Fixed Income', icon: '🏦', color: 'emerald' },
  REAL_ESTATE: { label: 'Real Estate', icon: '🏠', color: 'indigo' },
  CASH: { label: 'Cash & Equivalents', icon: '💵', color: 'green' },
};
