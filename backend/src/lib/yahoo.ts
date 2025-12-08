/**
 * Yahoo Finance API for market indices
 * No API key required, but requires User-Agent header
 */

const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  timestamp: number;
}

export interface IndexChartData {
  timestamps: number[];
  closes: number[];
}

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        shortName?: string;
        longName?: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        regularMarketDayHigh: number;
        regularMarketDayLow: number;
        regularMarketTime: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: number[];
          open: number[];
          high: number[];
          low: number[];
          volume: number[];
        }>;
      };
    }>;
    error: null | { code: string; description: string };
  };
}

// Market index symbols
export const INDEX_SYMBOLS = {
  "sp500": "^GSPC",
  "nasdaq": "^IXIC",
  "dow": "^DJI",
  "russell": "^RUT",
} as const;

export const INDEX_NAMES: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^IXIC": "NASDAQ",
  "^DJI": "Dow Jones",
  "^RUT": "Russell 2000",
};

/**
 * Get index quote with chart data
 */
export async function getIndexData(
  symbol: string,
  range: string = "5d",
  interval: string = "1d"
): Promise<{ quote: IndexQuote; chart: IndexChartData } | null> {
  try {
    const url = `${YAHOO_BASE_URL}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      console.error(`Yahoo API error: ${res.status}`);
      return null;
    }

    const data: YahooChartResponse = await res.json();
    
    if (data.chart.error || !data.chart.result?.[0]) {
      console.error("Yahoo API returned error:", data.chart.error);
      return null;
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators.quote[0];

    const change = meta.regularMarketPrice - meta.chartPreviousClose;
    const changePercent = (change / meta.chartPreviousClose) * 100;

    return {
      quote: {
        symbol: meta.symbol,
        name: INDEX_NAMES[meta.symbol] || meta.shortName || meta.longName || meta.symbol,
        price: meta.regularMarketPrice,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        previousClose: meta.chartPreviousClose,
        dayHigh: meta.regularMarketDayHigh,
        dayLow: meta.regularMarketDayLow,
        timestamp: meta.regularMarketTime,
      },
      chart: {
        timestamps: result.timestamp || [],
        closes: quotes.close?.filter((c): c is number => c !== null) || [],
      },
    };
  } catch (error) {
    console.error(`Error fetching index ${symbol}:`, error);
    return null;
  }
}

/**
 * Get all major indices
 */
export async function getAllIndices(): Promise<Array<{ quote: IndexQuote; chart: IndexChartData }>> {
  const symbols = Object.values(INDEX_SYMBOLS);
  const results = await Promise.all(symbols.map((s) => getIndexData(s)));
  return results.filter((r): r is { quote: IndexQuote; chart: IndexChartData } => r !== null);
}

/**
 * Search result interface
 */
export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

/**
 * Search for stocks/symbols using Yahoo Finance
 */
export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;
    
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(`Yahoo search error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (!data.quotes || !Array.isArray(data.quotes)) {
      return [];
    }

    // Sallitut yhdysvaltalaiset pörssit
    const US_EXCHANGES = ["NYQ", "NYE", "NMS", "NAS", "ASE", "AMEX", "ARCX", "ARCA", "BATS"];
    // Indeksisymbolit joita EI sallita osakehaussa
    const INDEX_SYMBOLS_SET = new Set(["^GSPC", "^IXIC", "^DJI", "^RUT"]);
    return data.quotes
      .filter((q: any) =>
        (q.quoteType === "EQUITY" || q.quoteType === "ETF") &&
        US_EXCHANGES.includes((q.exchange || "").toUpperCase()) &&
        !INDEX_SYMBOLS_SET.has(q.symbol)
      )
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType,
        exchange: q.exchange || "",
      }));
  } catch (error) {
    console.error("Error searching symbols:", error);
    return [];
  }
}
