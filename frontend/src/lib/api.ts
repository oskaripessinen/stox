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

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  symbol: string;
  createdAt: string;
}

/**
 * Get user watchlist
 */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/watchlist`);
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return [];
  }
}

/**
 * Add a stock to the watchlist
 */
export async function addToWatchlist(symbol: string): Promise<WatchlistItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
 * Remove a stock from the watchlist
 */
export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/watchlist/${symbol}`, {
      method: "DELETE",
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