import "dotenv/config";

const ALPACA_API_KEY = process.env.ALPACA_API_KEY!;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET!;
const ALPACA_DATA_URL = "https://data.alpaca.markets/v2";

const headers = {
  "APCA-API-KEY-ID": ALPACA_API_KEY,
  "APCA-API-SECRET-KEY": ALPACA_API_SECRET,
};

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

interface AlpacaTrade {
  t: string;
  p: number;
}

interface AlpacaBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw: number;
}

export interface AlpacaClock {
  timestamp: string;
  is_open: boolean;
  next_open: string;
  next_close: string;
}

/**
 * Get the market clock
 */
export async function getClock(): Promise<AlpacaClock | null> {
  try {
    const res = await fetch("https://api.alpaca.markets/v2/clock", { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching market clock:", error);
    return null;
  }
}

/**
 * Get the latest trade price for a stock
 */
export async function getLatestTrade(symbol: string) {
  try {
    const res = await fetch(`${ALPACA_DATA_URL}/stocks/${symbol}/trades/latest`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return { Price: data.trade.p, Timestamp: data.trade.t };
  } catch (error) {
    console.error("Error fetching latest trade:", error);
    return null;
  }
}

/**
 * Get the latest bar (OHLCV) for a stock
 */
export async function getLatestBar(symbol: string) {
  try {
    const res = await fetch(`${ALPACA_DATA_URL}/stocks/${symbol}/bars/latest`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    const bar = data.bar as AlpacaBar;
    return {
      Timestamp: bar.t,
      OpenPrice: bar.o,
      HighPrice: bar.h,
      LowPrice: bar.l,
      ClosePrice: bar.c,
      Volume: bar.v,
      VWAP: bar.vw,
    };
  } catch (error) {
    console.error("Error fetching latest bar:", error);
    return null;
  }
}

/**
 * Get historical bars for a stock
 */
export async function getBars(
  symbol: string,
  timeframe: string = "1Day",
  start?: string,
  end?: string,
  limit: number = 100
) {
  try {
    const params = new URLSearchParams({ timeframe, limit: String(limit) });
    // If start not provided, compute start based on timeframe and limit so we fetch exactly the needed range
    if (!start) {
      const now = Date.now();
      // Parse timeframe: e.g., "1Min", "5Min", "15Min", "1Hour", "1Day"
      const match = timeframe.match(/(\d+)(Min|Hour|Day|Week)/i);
      let timeUnitMinutes = 1440; // default 1 day
      if (match) {
        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit === "min") timeUnitMinutes = value;
        else if (unit === "hour") timeUnitMinutes = value * 60;
        else if (unit === "day") timeUnitMinutes = value * 60 * 24;
        else if (unit === "week") timeUnitMinutes = value * 60 * 24 * 7;
      }
      // Calculate total minutes to go back: limit * minutes per bar.
      const totalMinutes = Math.ceil(timeUnitMinutes * limit);
      // Cap totalMinutes to 365 days to avoid insane ranges
      const maxMinutes = 365 * 24 * 60;
      const minutesToBack = Math.min(totalMinutes, maxMinutes);
      const startDate = new Date(now - minutesToBack * 60 * 1000);
      start = startDate.toISOString();
    }
    
    params.append("start", start);
    if (end) params.append("end", end);

    const res = await fetch(`${ALPACA_DATA_URL}/stocks/${symbol}/bars?${params}`, { headers });
    if (!res.ok) {
      console.error(`Alpaca bars error: ${res.status} ${await res.text()}`);
      return [];
    }
    const data = await res.json();

    return (data.bars || []).map((bar: AlpacaBar) => ({
      Timestamp: bar.t,
      OpenPrice: bar.o,
      HighPrice: bar.h,
      LowPrice: bar.l,
      ClosePrice: bar.c,
      Volume: bar.v,
      VWAP: bar.vw,
    }));
  } catch (error) {
    console.error("Error fetching bars:", error);
    return [];
  }
}

/**
 * Get comprehensive stock quote with price and change using Snapshot API
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const res = await fetch(`${ALPACA_DATA_URL}/stocks/${symbol}/snapshot`, { headers });
    if (!res.ok) return null;

    const data = await res.json();
    const currentPrice = data.latestTrade?.p || data.dailyBar?.c;
    const previousClose = data.prevDailyBar?.c || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return {
      symbol: symbol.toUpperCase(),
      price: currentPrice,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      open: data.dailyBar?.o || currentPrice,
      high: data.dailyBar?.h || currentPrice,
      low: data.dailyBar?.l || currentPrice,
      close: data.dailyBar?.c || currentPrice,
      volume: data.dailyBar?.v || 0,
      timestamp: data.latestTrade?.t || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

/**
 * Get quotes for multiple stocks
 */
export async function getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
  const quotes = await Promise.all(symbols.map((symbol) => getStockQuote(symbol)));
  return quotes.filter((quote): quote is StockQuote => quote !== null);
}

export interface MarketMover {
  symbol: string;
  price: number;
  change: number;
  percent_change: number;
  volume: number;
}

export interface TopMovers {
  gainers: MarketMover[];
  losers: MarketMover[];
}

/**
 * Get top market movers (gainers and losers)
 */
export async function getTopMovers(top: number = 5): Promise<TopMovers> {
  try {
    const res = await fetch(
      `https://data.alpaca.markets/v1beta1/screener/stocks/movers?top=${top}`,
      { headers }
    );
    if (!res.ok) {
      console.error(`Alpaca movers API error: ${res.status}`);
      return { gainers: [], losers: [] };
    }
    const data = await res.json();
    return {
      gainers: data.gainers || [],
      losers: data.losers || [],
    };
  } catch (error) {
    console.error("Error fetching top movers:", error);
    return { gainers: [], losers: [] };
  }
}
