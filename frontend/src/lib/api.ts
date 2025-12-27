const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export interface StockQuote {
  symbol: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface StockBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap: number;
}

interface HistoryData {
    timestamp: string;
    close: number;
}

export type Stock = {
    id: string;
    ticker: string;
    companyName: string;
    price: number;
    dailyChange: number | null;
    weeklyChange: number;
    monthlyChange: number;
    marketCap?: number;
    volume: number;
    peRatio?: number;
    last30Days: HistoryData[];
};

export interface IndexData {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number | null;
  changePercent: number | null;
  up: boolean;
  data: Array<{ time: string; value: number }>;
  etf?: {
    symbol: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    up?: boolean;
  };
}

export interface EtfHolding {
  symbol: string;
  name: string;
  weight?: number;
  shares?: number;
  marketValue?: number;
}

export interface MarketClock {
  timestamp: string;
  is_open: boolean;
  next_open: string;
  next_close: string;
}

/**
 * Get current market status
 */
export async function getMarketStatus(): Promise<MarketClock | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/market-status`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching market status:", error);
    return null;
  }
}

/**
 * Get top constituents for an index (paged)
 */
export async function getIndexConstituents(indexSymbol: string, limit: number = 20, offset: number = 0): Promise<{ index: string; etf: string; total: number; constituents: EtfHolding[] } | null> {
  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    const res = await fetch(`${API_BASE_URL}/api/stocks/indices/${encodeURIComponent(indexSymbol)}/constituents?${params}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching index constituents:", error);
    return null;
  }
}

export interface MarketMover {
  symbol: string;
  price: number;
  change: number;
  percent_change: number;
  volume: number;
  marketCap?: number;
}

export interface TopMovers {
  gainers: MarketMover[];
  losers: MarketMover[];
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface StockProfile {
  symbol: string;
  name: string;
  logo: string;
  industry: string;
  country: string;
  exchange: string;
  currency: string;
  marketCap: number;
  sharesOutstanding: number;
  website: string;
  ipo: string;
}

export interface Watchlist {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WatchlistItem[];
  _count?: {
      items: number;
  }
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  createdAt: string;
}

export interface MarketNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Get general market news
 */
export async function getMarketNews(category: string = "general"): Promise<MarketNews[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/news?category=${category}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
}

/**
 * Get company specific news
 */
export async function getCompanyNews(symbol: string): Promise<MarketNews[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/news/${symbol}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}


/**
 * Get company profile from Finnhub
 */
export async function getStockProfile(symbol: string): Promise<StockProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/profile`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching stock profile:", error);
    return null;
  }
}

/**
 * Search for stocks
 */
export async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}

/**
 * Get all user watchlists
 */
export async function getWatchlists(): Promise<Watchlist[]> {
    try {
    const res = await fetch(`${API_BASE_URL}/api/watchlists`, {
      credentials: 'include',
    });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Error fetching watchlists:", error);
        return [];
    }
}

/**
 * Create a new watchlist
 */
export async function createWatchlist(name: string, description?: string): Promise<Watchlist | null> {
    try {
    const res = await fetch(`${API_BASE_URL}/api/watchlists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error creating watchlist:", error);
        return null;
    }
}

/**
 * Get a specific watchlist by id
 */
export async function getWatchlist(id: string): Promise<Watchlist | null> {
    try {
    const res = await fetch(`${API_BASE_URL}/api/watchlists/${id}`, { credentials: 'include' });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        return null;
    }
}

/**
 * Add a stock to a watchlist
 */
export async function addToWatchlist(watchlistId: string, symbol: string): Promise<Watchlist | null> {
    try {
    const res = await fetch(`${API_BASE_URL}/api/watchlists/${watchlistId}/stocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ symbol }),
    });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        return null;
    }
}

/**
 * Remove a stock from a watchlist
 */
export async function removeFromWatchlist(watchlistId: string, symbol: string): Promise<{ success: boolean }> {
    try {
    const res = await fetch(`${API_BASE_URL}/api/watchlists/${watchlistId}/stocks/${symbol}`, {
      method: "DELETE",
      credentials: 'include',
    });
        return { success: res.ok };
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        return { success: false };
    }
}

/**
 * Get top market movers (gainers and losers)
 */
export async function getTopMovers(top: number = 5): Promise<TopMovers> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/movers?top=${top}`);
    if (!res.ok) return { gainers: [], losers: [] };
    return res.json();
  } catch (error) {
    console.error("Error fetching movers:", error);
    return { gainers: [], losers: [] };
  }
}

/**
 * Get market indices
 */
export async function getIndices(): Promise<IndexData[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/indices`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.indices || [];
  } catch (error) {
    console.error("Error fetching indices:", error);
    return [];
  }
}

/**
 * Get stock quote by symbol
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching stock:", error);
    return null;
  }
}

/**
 * Get latest price for a stock
 */
export async function getStockPrice(symbol: string): Promise<{ symbol: string; price: number; timestamp: string } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/price`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return null;
  }
}

/**
 * Get historical bars for a stock
 */
export async function getStockHistory(
  symbol: string,
  timeframe: string = "1Day",
  limit: number = 100
): Promise<{ symbol: string; timeframe: string; bars: StockBar[] } | null> {
  try {
    const params = new URLSearchParams({ timeframe, limit: String(limit) });
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/history?${params}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching stock history:", error);
    return null;
  }
}

/**
 * Get quotes for multiple stocks
 */
export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/stocks/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.quotes || [];
  } catch (error) {
    console.error("Error fetching multiple quotes:", error);
    return [];
  }
}

/**
 * Get aggregated details (profile, quote, history) for a stock
 */
export async function getStockDetails(
  symbol: string,
  timeframe: string = "1Day",
  limit: number = 100
): Promise<{ profile: StockProfile | null; quote: StockQuote | null; history: { symbol: string; timeframe: string; bars: StockBar[] } | null } | null> {
  try {
    const params = new URLSearchParams({ timeframe, limit: String(limit) });
    const res = await fetch(`${API_BASE_URL}/api/stocks/${symbol}/details?${params}`);
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching stock details:", error);
    return null;
  }
}

/**
 * Format price to display string
 */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format index points to display string (no currency symbol)
 */
export function formatPoints(points: number): string {
  return points.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format change percent to display string
 */
export function formatChange(changePercent: number | null | undefined): string {
  if (changePercent === null || changePercent === undefined) return "-";
  const sign = changePercent >= 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(2)}%`;
}

/**
 * Format volume to display string
 */
export function formatVolume(volume: number): string {
  if (volume == null) return "-";
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
}

/**
 * Format market cap
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000000000) {
    return `$${(marketCap / 1000000000000).toFixed(1)}T`;
  } else if (marketCap >= 1000000000) {
    return `$${(marketCap / 1000000000).toFixed(0)}B`;
  } else if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(0)}M`;
  }
  return `$${marketCap}`;
}
