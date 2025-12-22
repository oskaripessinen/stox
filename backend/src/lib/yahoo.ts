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

export interface EtfHolding {
  symbol: string;
  name: string;
  weight?: number; // percentage
  shares?: number;
  marketValue?: number;
}

// Static fallback data for top holdings
const STATIC_HOLDINGS: Record<string, EtfHolding[]> = {
  "SPY": [
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc. Class A" },
    { symbol: "GOOG", name: "Alphabet Inc. Class C" },
    { symbol: "BRK-B", name: "Berkshire Hathaway Inc." },
    { symbol: "LLY", name: "Eli Lilly and Company" },
    { symbol: "AVGO", name: "Broadcom Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "XOM", name: "Exxon Mobil Corporation" },
    { symbol: "UNH", name: "UnitedHealth Group Incorporated" },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "PG", name: "Procter & Gamble Company" },
    { symbol: "MA", name: "Mastercard Incorporated" },
    { symbol: "COST", name: "Costco Wholesale Corporation" },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "HD", name: "Home Depot, Inc." },
  ],
  "QQQ": [
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "AVGO", name: "Broadcom Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc. Class A" },
    { symbol: "GOOG", name: "Alphabet Inc. Class C" },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "COST", name: "Costco Wholesale Corporation" },
    { symbol: "NFLX", name: "Netflix, Inc." },
    { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "PEP", name: "PepsiCo, Inc." },
    { symbol: "LIN", name: "Linde plc" },
    { symbol: "CSCO", name: "Cisco Systems, Inc." },
    { symbol: "TMUS", name: "T-Mobile US, Inc." },
    { symbol: "INTC", name: "Intel Corporation" },
    { symbol: "QCOM", name: "Qualcomm Incorporated" },
    { symbol: "TXN", name: "Texas Instruments Incorporated" },
  ],
  "DIA": [
    { symbol: "UNH", name: "UnitedHealth Group Incorporated" },
    { symbol: "GS", name: "The Goldman Sachs Group, Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "HD", name: "The Home Depot, Inc." },
    { symbol: "CAT", name: "Caterpillar Inc." },
    { symbol: "AMGN", name: "Amgen Inc." },
    { symbol: "CRM", name: "Salesforce, Inc." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MCD", name: "McDonald's Corporation" },
    { symbol: "TRV", name: "The Travelers Companies, Inc." },
    { symbol: "HON", name: "Honeywell International Inc." },
    { symbol: "AXP", name: "American Express Company" },
    { symbol: "BA", name: "The Boeing Company" },
    { symbol: "CVX", name: "Chevron Corporation" },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "IBM", name: "International Business Machines" },
    { symbol: "PG", name: "The Procter & Gamble Company" },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "AAPL", name: "Apple Inc." },
  ],
  "IWM": [
    { symbol: "SMCI", name: "Super Micro Computer, Inc." },
    { symbol: "MSTR", name: "MicroStrategy Incorporated" },
    { symbol: "ELF", name: "e.l.f. Beauty, Inc." },
    { symbol: "VRT", name: "Vertiv Holdings Co" },
    { symbol: "CAR", name: "Avis Budget Group, Inc." },
    { symbol: "OVV", name: "Ovintiv Inc." },
    { symbol: "CLSK", name: "CleanSpark, Inc." },
    { symbol: "MARA", name: "Marathon Digital Holdings, Inc." },
    { symbol: "CVNA", name: "Carvana Co." },
    { symbol: "GCT", name: "GigaCloud Technology Inc." },
    { symbol: "CELH", name: "Celsius Holdings, Inc." },
    { symbol: "DKNG", name: "DraftKings Inc." },
    { symbol: "FSLR", name: "First Solar, Inc." },
    { symbol: "APP", name: "AppLovin Corporation" },
    { symbol: "RCL", name: "Royal Caribbean Cruises Ltd." },
    { symbol: "PLTR", name: "Palantir Technologies Inc." },
    { symbol: "DUOL", name: "Duolingo, Inc." },
    { symbol: "WING", name: "Wingstop Inc." },
    { symbol: "ANF", name: "Abercrombie & Fitch Co." },
    { symbol: "SAIA", name: "Saia, Inc." },
  ],
};

/**
 * Get top holdings for an ETF using Yahoo Finance quoteSummary topHoldings module
 */
export async function getEtfHoldings(symbol: string): Promise<EtfHolding[]> {
  const upperSymbol = symbol.toUpperCase();
  
  // Try fetching from API first (optional: or just go straight to static if you know it's blocked)
  try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=topHoldings`;
    const res = await fetch(url, { headers });
    
    if (res.ok) {
        const data = await res.json();
        const result = data?.quoteSummary?.result?.[0];
        const holdings = result?.topHoldings?.holdings;
        
        if (holdings && Array.isArray(holdings) && holdings.length > 0) {
            return holdings.map((h: any) => ({
            symbol: (h?.symbol || h?.symbol || "").toUpperCase(),
            name: h?.name || h?.longName || h?.shortName || h?.symbol || "",
            weight: typeof h?.weight === 'number' ? h.weight : (typeof h?.holdingPercent === 'number' ? h.holdingPercent * 100 : undefined),
            shares: typeof h?.shares === 'number' ? h.shares : undefined,
            marketValue: typeof h?.marketValue === 'number' ? h.marketValue : undefined,
            }));
        }
    } else {
        console.warn(`Yahoo ETF holdings error for ${symbol}: ${res.status}. Using fallback data.`);
    }
  } catch (error) {
    console.error(`Error fetching ETF holdings for ${symbol}:`, error);
    // Proceed to fallback
  }

  // Fallback to static data
  if (STATIC_HOLDINGS[upperSymbol]) {
    console.log(`Using static holdings for ${upperSymbol}`);
    return STATIC_HOLDINGS[upperSymbol];
  }

  return [];
}
