// Market Data Service - Live price fetching for stocks, crypto, and commodities

import { MarketQuote, PriceHistoryPoint, AssetType } from '../types/investments';

// ==================== CONFIGURATION ====================

// Finnhub API Key - Get yours free at https://finnhub.io/
// Free tier: 60 calls/minute, which is very generous
// Set this in your environment or replace with your key
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';

// Cache configuration
const CACHE_DURATION = 60 * 1000; // 1 minute cache for live prices
const priceCache: Map<string, { data: MarketQuote; timestamp: number }> = new Map();

// API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const FINNHUB_API = 'https://finnhub.io/api/v1';

// CORS Proxy for Yahoo Finance (fallback if Finnhub key not set)
// Using corsproxy.io which is free and reliable
const CORS_PROXY = 'https://corsproxy.io/?';
const YAHOO_FINANCE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Common crypto symbol mappings (symbol -> coingecko id)
const CRYPTO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'SHIB': 'shiba-inu',
  'LTC': 'litecoin',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'NEAR': 'near',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'INJ': 'injective-protocol',
};

// Gold and commodity symbols (for Yahoo Finance)
const COMMODITY_SYMBOLS: Record<string, string> = {
  'GOLD': 'GC=F',     // Gold Futures
  'SILVER': 'SI=F',   // Silver Futures
  'XAUUSD': 'GC=F',   // Gold in USD
  'XAGUSD': 'SI=F',   // Silver in USD
};

// ==================== CACHE HELPERS ====================

function isCacheValid(symbol: string): boolean {
  const cached = priceCache.get(symbol);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}

function getCachedQuote(symbol: string): MarketQuote | null {
  if (isCacheValid(symbol)) {
    return priceCache.get(symbol)!.data;
  }
  return null;
}

function cacheQuote(symbol: string, quote: MarketQuote): void {
  priceCache.set(symbol, { data: quote, timestamp: Date.now() });
}

// ==================== CRYPTO (CoinGecko) ====================

/**
 * Fetch cryptocurrency price from CoinGecko
 * Free, no API key required, CORS-friendly
 */
export async function fetchCryptoPrice(symbol: string, currency: string = 'usd'): Promise<MarketQuote | null> {
  const upperSymbol = symbol.toUpperCase();
  const cached = getCachedQuote(`CRYPTO:${upperSymbol}`);
  if (cached) return cached;

  const coinId = CRYPTO_ID_MAP[upperSymbol] || upperSymbol.toLowerCase();

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=${currency}&include_24hr_change=true&include_last_updated_at=true`
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const coinData = data[coinId];

    if (!coinData) {
      console.error(`No data found for ${coinId}`);
      return null;
    }

    const price = coinData[currency];
    const change24h = coinData[`${currency}_24h_change`] || 0;

    const quote: MarketQuote = {
      symbol: upperSymbol,
      price: price,
      change: (price * change24h) / 100,
      changePercent: change24h,
      previousClose: price - (price * change24h) / 100,
      currency: currency.toUpperCase(),
      lastUpdated: new Date().toISOString(),
    };

    cacheQuote(`CRYPTO:${upperSymbol}`, quote);
    return quote;
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    return null;
  }
}

// ==================== STOCKS (Finnhub - Primary) ====================

/**
 * Fetch stock/ETF price using Finnhub
 * Free tier: 60 calls/minute - very generous!
 * CORS-friendly, reliable
 */
export async function fetchStockPriceFinnhub(symbol: string): Promise<MarketQuote | null> {
  if (!FINNHUB_API_KEY) {
    console.warn('Finnhub API key not set. Get a free key at https://finnhub.io/');
    return null;
  }

  const upperSymbol = symbol.toUpperCase();
  const cached = getCachedQuote(`STOCK:${upperSymbol}`);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${FINNHUB_API}/quote?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Finnhub returns: c (current), d (change), dp (percent change), h (high), l (low), o (open), pc (previous close)
    if (!data.c || data.c === 0) {
      console.error(`No data found for ${symbol} on Finnhub`);
      return null;
    }

    const quote: MarketQuote = {
      symbol: upperSymbol,
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      previousClose: data.pc || data.c,
      currency: 'USD', // Finnhub returns USD prices
      lastUpdated: new Date().toISOString(),
    };

    cacheQuote(`STOCK:${upperSymbol}`, quote);
    return quote;
  } catch (error) {
    console.error(`Error fetching stock price from Finnhub for ${symbol}:`, error);
    return null;
  }
}

// ==================== STOCKS (Yahoo Finance via CORS Proxy - Fallback) ====================

/**
 * Fetch stock/ETF price using Yahoo Finance with CORS proxy
 * Free, no API key, but uses a CORS proxy
 */
export async function fetchStockPriceYahoo(symbol: string): Promise<MarketQuote | null> {
  const upperSymbol = symbol.toUpperCase();
  const cached = getCachedQuote(`STOCK:${upperSymbol}`);
  if (cached) return cached;

  try {
    // Use CORS proxy to bypass browser restrictions
    const url = `${CORS_PROXY}${encodeURIComponent(`${YAHOO_FINANCE_URL}/${upperSymbol}?interval=1d&range=1d`)}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) {
      console.error(`No data found for ${symbol}`);
      return null;
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    const quote: MarketQuote = {
      symbol: upperSymbol,
      price: price,
      change: change,
      changePercent: changePercent,
      previousClose: previousClose,
      currency: meta.currency || 'USD',
      lastUpdated: new Date().toISOString(),
    };

    cacheQuote(`STOCK:${upperSymbol}`, quote);
    return quote;
  } catch (error) {
    console.error(`Error fetching stock price from Yahoo for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch stock price - tries Finnhub first, falls back to Yahoo with CORS proxy
 */
export async function fetchStockPrice(symbol: string): Promise<MarketQuote | null> {
  // Try Finnhub first (if API key is set)
  if (FINNHUB_API_KEY) {
    const finnhubQuote = await fetchStockPriceFinnhub(symbol);
    if (finnhubQuote) return finnhubQuote;
  }

  // Fallback to Yahoo Finance with CORS proxy
  return fetchStockPriceYahoo(symbol);
}

// ==================== COMMODITIES (Gold, Silver) ====================

/**
 * Fetch gold/commodity price
 */
export async function fetchCommodityPrice(symbol: string): Promise<MarketQuote | null> {
  const upperSymbol = symbol.toUpperCase();
  const yahooSymbol = COMMODITY_SYMBOLS[upperSymbol] || `${upperSymbol}=F`;

  // Commodities work better with Yahoo Finance
  return fetchStockPriceYahoo(yahooSymbol);
}

// ==================== UNIFIED FETCHER ====================

/**
 * Unified price fetcher based on asset type
 */
export async function fetchAssetPrice(
  symbol: string,
  assetType: AssetType,
  currency: string = 'usd'
): Promise<MarketQuote | null> {
  switch (assetType) {
    case 'CRYPTO':
      return fetchCryptoPrice(symbol, currency);
    case 'STOCK':
    case 'MF':
      return fetchStockPrice(symbol);
    case 'GOLD':
      return fetchCommodityPrice(symbol);
    case 'FIXED_INCOME':
    case 'REAL_ESTATE':
    case 'CASH':
      // These don't have live market prices
      return null;
    default:
      return null;
  }
}

// ==================== BATCH FETCHING ====================

/**
 * Batch fetch multiple crypto prices (more efficient)
 */
export async function fetchMultipleCryptoPrices(
  symbols: string[],
  currency: string = 'usd'
): Promise<Map<string, MarketQuote>> {
  const results = new Map<string, MarketQuote>();

  // Check cache first
  const uncachedSymbols: string[] = [];
  for (const symbol of symbols) {
    const cached = getCachedQuote(`CRYPTO:${symbol.toUpperCase()}`);
    if (cached) {
      results.set(symbol.toUpperCase(), cached);
    } else {
      uncachedSymbols.push(symbol);
    }
  }

  if (uncachedSymbols.length === 0) return results;

  // Convert symbols to CoinGecko IDs
  const coinIds = uncachedSymbols.map(s =>
    CRYPTO_ID_MAP[s.toUpperCase()] || s.toLowerCase()
  );

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${currency}&include_24hr_change=true`
    );

    if (!response.ok) return results;

    const data = await response.json();

    for (let i = 0; i < uncachedSymbols.length; i++) {
      const symbol = uncachedSymbols[i].toUpperCase();
      const coinId = coinIds[i];
      const coinData = data[coinId];

      if (coinData) {
        const price = coinData[currency];
        const change24h = coinData[`${currency}_24h_change`] || 0;

        const quote: MarketQuote = {
          symbol: symbol,
          price: price,
          change: (price * change24h) / 100,
          changePercent: change24h,
          previousClose: price - (price * change24h) / 100,
          currency: currency.toUpperCase(),
          lastUpdated: new Date().toISOString(),
        };

        cacheQuote(`CRYPTO:${symbol}`, quote);
        results.set(symbol, quote);
      }
    }
  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error);
  }

  return results;
}

// ==================== PRICE HISTORY (for charts) ====================

/**
 * Fetch price history for charts
 */
export async function fetchPriceHistory(
  symbol: string,
  assetType: AssetType,
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo'
): Promise<PriceHistoryPoint[]> {
  if (assetType === 'CRYPTO') {
    return fetchCryptoPriceHistory(symbol, range);
  }
  return fetchStockPriceHistory(symbol, range);
}

/**
 * Fetch crypto price history from CoinGecko
 */
async function fetchCryptoPriceHistory(
  symbol: string,
  range: string
): Promise<PriceHistoryPoint[]> {
  const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();

  const daysMap: Record<string, number> = {
    '1d': 1,
    '5d': 5,
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
    '5y': 1825,
  };

  const days = daysMap[range] || 30;

  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) return [];

    const data = await response.json();

    return data.prices.map(([timestamp, price]: [number, number]) => ({
      date: new Date(timestamp).toISOString(),
      price: price,
    }));
  } catch (error) {
    console.error(`Error fetching crypto history for ${symbol}:`, error);
    return [];
  }
}

/**
 * Fetch stock price history from Yahoo Finance (with CORS proxy)
 */
async function fetchStockPriceHistory(
  symbol: string,
  range: string
): Promise<PriceHistoryPoint[]> {
  const intervalMap: Record<string, string> = {
    '1d': '5m',
    '5d': '15m',
    '1mo': '1d',
    '3mo': '1d',
    '6mo': '1d',
    '1y': '1wk',
    '5y': '1mo',
  };

  const interval = intervalMap[range] || '1d';

  try {
    const url = `${CORS_PROXY}${encodeURIComponent(`${YAHOO_FINANCE_URL}/${symbol}?interval=${interval}&range=${range}`)}`;
    const response = await fetch(url);

    if (!response.ok) return [];

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) return [];

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];

    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString(),
      price: closes[i] || 0,
    })).filter((p: PriceHistoryPoint) => p.price > 0);
  } catch (error) {
    console.error(`Error fetching stock history for ${symbol}:`, error);
    return [];
  }
}

// ==================== SYMBOL SEARCH ====================

/**
 * Search for crypto symbols
 */
export async function searchCrypto(query: string): Promise<{ id: string; symbol: string; name: string }[]> {
  try {
    const response = await fetch(`${COINGECKO_API}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.coins?.slice(0, 10).map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
    })) || [];
  } catch (error) {
    console.error('Error searching crypto:', error);
    return [];
  }
}

/**
 * Search for stock symbols using Finnhub
 */
export async function searchStocks(query: string): Promise<{ symbol: string; name: string; type: string }[]> {
  if (!FINNHUB_API_KEY) return [];

  try {
    const response = await fetch(
      `${FINNHUB_API}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );
    if (!response.ok) return [];

    const data = await response.json();
    return data.result?.slice(0, 10).map((item: any) => ({
      symbol: item.symbol,
      name: item.description,
      type: item.type,
    })) || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

// ==================== UTILITIES ====================

/**
 * Calculate fixed income current value based on interest
 */
export function calculateFixedIncomeValue(
  principal: number,
  interestRate: number,
  startDate: string,
  maturityDate?: string
): number {
  const start = new Date(startDate);
  const end = maturityDate ? new Date(maturityDate) : new Date();
  const now = new Date();

  // Calculate elapsed time in years
  const yearsElapsed = Math.min(
    (now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    maturityDate ? (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000) : Infinity
  );

  // Simple interest calculation (can be extended to compound)
  const interest = principal * (interestRate / 100) * yearsElapsed;
  return principal + interest;
}

/**
 * Clear price cache
 */
export function clearPriceCache(): void {
  priceCache.clear();
}

/**
 * Check if Finnhub is configured
 */
export function isFinnhubConfigured(): boolean {
  return !!FINNHUB_API_KEY;
}
