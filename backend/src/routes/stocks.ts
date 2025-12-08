import { Router, Request, Response } from "express";
import {
  getStockQuote,
  getMultipleQuotes,
  getLatestTrade,
  getBars,
  getTopMovers,
} from "../lib/alpaca";
import { getAllIndices, searchSymbols } from "../lib/yahoo";
import { getCompanyProfile } from "../lib/finnhub";
import { requireAuth } from "../middleware/auth";
import { deleteCache } from "../lib/cache";
import { getCache, setCache, cacheKeys, TTL } from "../lib/cache";

const router = Router();

/**
 * GET /api/stocks/search
 * Search for stocks using Yahoo Finance
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 1) {
      res.json([]);
      return;
    }
    
    // Check cache first
    const cacheKey = cacheKeys.search(query);
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    
    const results = await searchSymbols(query);
    
    // Cache results
    await setCache(cacheKey, results, TTL.SEARCH);
    
    res.json(results);
  } catch (error) {
    console.error("Error searching stocks:", error);
    res.status(500).json({ error: "Failed to search stocks" });
  }
});

/**
 * GET /api/stocks/movers
 * Get top market movers (gainers and losers)
 */
router.get("/movers", async (req: Request, res: Response) => {
  try {
    const top = parseInt(req.query.top as string) || 5;
    
    // Check cache first
    const cacheKey = cacheKeys.movers(top);
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    
    const movers = await getTopMovers(Math.min(top, 50));
    
    // Cache results
    await setCache(cacheKey, movers, TTL.MOVERS);
    
    res.json(movers);
  } catch (error) {
    console.error("Error fetching movers:", error);
    res.status(500).json({ error: "Failed to fetch market movers" });
  }
});

/**
 * GET /api/stocks/indices
 * Get quotes for major market indices from Yahoo Finance
 */
router.get("/indices", async (req: Request, res: Response) => {
  try {
    // Check cache first
    const cacheKey = cacheKeys.indices();
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    
    const indexToEtf: Record<string, { index: string; etf: string; name: string }> = {
      '^GSPC': { index: '^GSPC', etf: 'SPY', name: 'S&P 500' },
      '^IXIC': { index: '^IXIC', etf: 'QQQ', name: 'NASDAQ' },
      '^DJI':  { index: '^DJI',  etf: 'DIA', name: 'Dow Jones' },
      '^RUT':  { index: '^RUT',  etf: 'IWM', name: 'Russell 2000' },
    };


    const indicesData = await getAllIndices();
    const etfSymbols = Object.values(indexToEtf).map(i => i.etf);
    const etfQuotes = await getMultipleQuotes(etfSymbols);
    console.log("Fetched ETF quotes for indices:", etfQuotes);
    const intradayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
    const candidateTimeframes = [
      { tf: '1Min', limit: 390, start: intradayStart },
      { tf: '5Min', limit: 78, start: intradayStart },
      { tf: '15Min', limit: 26, start: intradayStart },
      { tf: '1Hour', limit: 6, start: intradayStart },
      { tf: '1Day', limit: 1, start: undefined },
    ];

    async function fetchBestEtfBars(symbol: string) {
      for (const c of candidateTimeframes) {
        const cacheKeyBars = cacheKeys.bars(symbol, c.tf, c.limit);
        const cachedBars = await getCache<any>(cacheKeyBars);
        if (cachedBars && Array.isArray(cachedBars.bars) && cachedBars.bars.length > 0) {
          console.log(`Cache HIT for ${symbol} ${c.tf}:${c.limit} => ${cachedBars.bars.length}`);
          return cachedBars.bars.map((b: any) => ({ Timestamp: b.timestamp, ClosePrice: b.close, OpenPrice: b.open, HighPrice: b.high, LowPrice: b.low, Volume: b.volume, VWAP: b.vwap }));
        }
        const bars = await getBars(symbol, c.tf, c.start, undefined, c.limit);
        if (bars && bars.length > 0) {
          console.log(`Fetched ${bars.length} bars for ${symbol} at ${c.tf}`);
          await setCache(cacheKeyBars, {
            symbol: symbol.toUpperCase(),
            timeframe: c.tf,
            bars: bars.map((bar: any) => ({ timestamp: bar.Timestamp, open: bar.OpenPrice, high: bar.HighPrice, low: bar.LowPrice, close: bar.ClosePrice, volume: bar.Volume, vwap: bar.VWAP })),
          }, TTL.BARS);
          return bars;
        }
      }
      return [];
    }

    const etfBarsList = await Promise.all(etfSymbols.map((s) => fetchBestEtfBars(s)));
    console.log('Fetched ETF bars lengths per symbol:', etfBarsList.map(b => (Array.isArray(b) ? b.length : 0)));

    const indices = indicesData.map(({ quote, chart }, indx) => {
      const etfInfo = indexToEtf[quote.symbol];
      if (!etfInfo) {
        console.warn(`Unknown index symbol from Yahoo: ${quote.symbol} - no ETF mapping available.`);
        return {
          id: quote.symbol,
          name: quote.name || quote.symbol,
          symbol: quote.symbol,
          value: quote.price, 
          change: quote.change ?? null,
          changePercent: quote.changePercent ?? null,
          up: (quote.changePercent ?? 0) >= 0,
          data: [],
        };
      }
      const etfQuote = etfQuotes.find(q => q.symbol === etfInfo.etf);
      const bars = etfBarsList[etfSymbols.indexOf(etfInfo.etf)] || [];
      if (!bars.length) {
        console.log(`No ETF bars found for ${etfInfo.etf} - chart will be empty`);
      }

      return {
        id: quote.symbol,
        name: etfInfo.name,
        symbol: quote.symbol,
        value: quote.price, 
        change: quote.change ?? null,
        changePercent: quote.changePercent ?? null,
        up: (quote.changePercent ?? 0) >= 0,
        data: bars.length ? bars.map((bar: any) => ({ time: bar.Timestamp, value: bar.ClosePrice })) : [],
      };
    });

    const result = { indices };
    await setCache(cacheKey, result, TTL.INDICES);
    res.json(result);
  } catch (error) {
    console.error("Error fetching indices:", error);
    res.status(500).json({ error: "Failed to fetch indices" });
  }
});

/**
 * POST /api/stocks/indices/refresh
 * Refresh indices cache (requires auth)
 */
router.post("/indices/refresh", requireAuth, async (req: Request, res: Response) => {
  try {
    // Delete existing cache
    await deleteCache(cacheKeys.indices());
    // Trigger fetch by calling the same logic as GET /indices
    // (call getAllIndices and construct indices result)
    const indexToEtf: Record<string, { index: string; etf: string; name: string }> = {
      '^GSPC': { index: '^GSPC', etf: 'SPY', name: 'S&P 500' },
      '^IXIC': { index: '^IXIC', etf: 'QQQ', name: 'NASDAQ' },
      '^DJI':  { index: '^DJI',  etf: 'DIA', name: 'Dow Jones' },
      '^RUT':  { index: '^RUT',  etf: 'IWM', name: 'Russell 2000' },
    };

    const indicesData = await getAllIndices();
    const etfSymbols = Object.values(indexToEtf).map(i => i.etf);
    const etfQuotes = await getMultipleQuotes(etfSymbols);
    const intradayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const candidateTimeframes = [
      { tf: '1Min', limit: 390, start: intradayStart },
      { tf: '5Min', limit: 78, start: intradayStart },
      { tf: '15Min', limit: 26, start: intradayStart },
      { tf: '1Hour', limit: 6, start: intradayStart },
      { tf: '1Day', limit: 1, start: undefined },
    ];

    async function fetchBestEtfBars(symbol: string) {
      for (const c of candidateTimeframes) {
        const cacheKeyBars = cacheKeys.bars(symbol, c.tf, c.limit);
        const cachedBars = await getCache<any>(cacheKeyBars);
        if (cachedBars && Array.isArray(cachedBars.bars) && cachedBars.bars.length > 0) {
          console.log(`Cache HIT for ${symbol} ${c.tf}:${c.limit} => ${cachedBars.bars.length}`);
          return cachedBars.bars.map((b: any) => ({ Timestamp: b.timestamp, ClosePrice: b.close, OpenPrice: b.open, HighPrice: b.high, LowPrice: b.low, Volume: b.volume, VWAP: b.vwap }));
        }
        const bars = await getBars(symbol, c.tf, c.start, undefined, c.limit);
        if (bars && bars.length > 0) {
          console.log(`Fetched ${bars.length} bars for ${symbol} at ${c.tf}`);
          await setCache(cacheKeyBars, {
            symbol: symbol.toUpperCase(),
            timeframe: c.tf,
            bars: bars.map((bar: any) => ({ timestamp: bar.Timestamp, open: bar.OpenPrice, high: bar.HighPrice, low: bar.LowPrice, close: bar.ClosePrice, volume: bar.Volume, vwap: bar.VWAP })),
          }, TTL.BARS);
          return bars;
        }
      }
      return [];
    }

    const etfBarsList = await Promise.all(etfSymbols.map((s) => fetchBestEtfBars(s)));

    const indices = indicesData.map(({ quote, chart }, idx) => {
      const etfInfo = indexToEtf[quote.symbol];
      if (!etfInfo) {
          console.warn(`Unknown index symbol from Yahoo: ${quote.symbol} - no ETF mapping available.`);
          return {
          id: quote.symbol,
          name: quote.name || quote.symbol,
          symbol: quote.symbol,
          value: quote.price,
          change: quote.change ?? null,
          changePercent: quote.changePercent ?? null,
          up: (quote.changePercent ?? 0) >= 0,
            data: [],
        };
      }
      const etfQuote = etfQuotes.find(q => q.symbol === etfInfo.etf);
      const bars = etfBarsList[etfSymbols.indexOf(etfInfo.etf)] || [];
      if (!bars.length) {
        console.log(`No ETF bars found for ${etfInfo.etf} during refresh - chart will be empty`);
      }
      return {
        id: quote.symbol,
        name: etfInfo.name,
        symbol: quote.symbol,
        value: quote.price,
        change: quote.change ?? null,
        changePercent: quote.changePercent ?? null,
        up: (quote.changePercent ?? 0) >= 0,
        data: (bars.length ? bars.map((bar: any) => ({ time: bar.Timestamp, value: bar.ClosePrice })) : []),
      };
    });

    const result = { indices };
    // Update cache
    await setCache(cacheKeys.indices(), result, TTL.INDICES);
    res.json(result);
  } catch (error) {
    console.error("Error refreshing indices:", error);
    res.status(500).json({ error: "Failed to refresh indices" });
  }
});

/**
         // Map bars to time/value pairs; for intraday bars keep ISO timestamps, for daily bars keep date strings
         data: bars.length ? bars.map((bar: any) => ({ time: bar.Timestamp, value: bar.ClosePrice })) : fallbackChartData,
 * Body: { symbols: ["AAPL", "GOOGL", "MSFT"] }
 */
router.post("/quotes", async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      res.status(400).json({ error: "Symbols array is required" });
      return;
    }

    if (symbols.length > 50) {
      res.status(400).json({ error: "Maximum 50 symbols allowed" });
      return;
    }

    const quotes = await getMultipleQuotes(
      symbols.map((s: string) => s.toUpperCase())
    );

    res.json({ quotes });
  } catch (error) {
    console.error("Error fetching multiple quotes:", error);
    res.status(500).json({ error: "Failed to fetch stock quotes" });
  }
});

/**
 * GET /api/stocks/:symbol/profile
 * Get company profile from Finnhub
 */
router.get("/:symbol/profile", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({ error: "Symbol is required" });
      return;
    }

    // Check cache first
    const cacheKey = cacheKeys.profile(symbol);
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const profile = await getCompanyProfile(symbol.toUpperCase());

    if (!profile) {
      res.status(404).json({ error: "Company profile not found" });
      return;
    }

    // Cache results (24h for profiles)
    await setCache(cacheKey, profile, TTL.PROFILE);

    res.json(profile);
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ error: "Failed to fetch company profile" });
  }
});

/**
 * GET /api/stocks/:symbol
 * Get the latest price and quote for a stock
 */
router.get("/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({ error: "Symbol is required" });
      return;
    }

    // Check cache first
    const cacheKey = cacheKeys.quote(symbol);
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const quote = await getStockQuote(symbol.toUpperCase());

    if (!quote) {
      res.status(404).json({ error: `Stock ${symbol} not found` });
      return;
    }

    // Cache results
    await setCache(cacheKey, quote, TTL.QUOTE);

    res.json(quote);
  } catch (error) {
    console.error("Error fetching stock:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

/**
 * GET /api/stocks/:symbol/price
 * Get just the latest price for a stock
 */
router.get("/:symbol/price", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({ error: "Symbol is required" });
      return;
    }

    const trade = await getLatestTrade(symbol.toUpperCase());

    if (!trade) {
      res.status(404).json({ error: `Stock ${symbol} not found` });
      return;
    }

    res.json({
      symbol: symbol.toUpperCase(),
      price: trade.Price,
      timestamp: trade.Timestamp,
    });
  } catch (error) {
    console.error("Error fetching stock price:", error);
    res.status(500).json({ error: "Failed to fetch stock price" });
  }
});

/**
 * GET /api/stocks/:symbol/history
 * Get historical bars for a stock
 * Query params: timeframe (1Min, 5Min, 15Min, 1Hour, 1Day), limit, start, end
 */
router.get("/:symbol/history", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { timeframe = "1Day", limit = "100", start, end } = req.query;

    if (!symbol) {
      res.status(400).json({ error: "Symbol is required" });
      return;
    }

    const limitNum = parseInt(limit as string, 10);
    
    // Check cache first
    const cacheKey = cacheKeys.bars(symbol, timeframe as string, limitNum);
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const bars = await getBars(
      symbol.toUpperCase(),
      timeframe as string,
      start as string | undefined,
      end as string | undefined,
      limitNum
    );

    const result = {
      symbol: symbol.toUpperCase(),
      timeframe,
      bars: bars.map((bar: any) => ({
        timestamp: bar.Timestamp,
        open: bar.OpenPrice,
        high: bar.HighPrice,
        low: bar.LowPrice,
        close: bar.ClosePrice,
        volume: bar.Volume,
        vwap: bar.VWAP,
      })),
    };
    
    // Cache results
    await setCache(cacheKey, result, TTL.BARS);

    res.json(result);
  } catch (error) {
    console.error("Error fetching stock history:", error);
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
});

export default router;
