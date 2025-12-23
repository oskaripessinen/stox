import { Router, Request, Response } from "express";
import { getMarketNews, getCompanyNews } from "../lib/finnhub";
import { getCache, setCache, cacheKeys, TTL } from "../lib/cache";

const router = Router();

/**
 * GET /api/news
 * Get general market news
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || "general";
    
    // Check cache first
    const cacheKey = `news:${category}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    
    const news = await getMarketNews(category);
    
    // Cache results (15 minutes for news)
    await setCache(cacheKey, news, 900);
    
    res.json(news);
  } catch (error) {
    console.error("Error fetching market news:", error);
    res.status(500).json({ error: "Failed to fetch market news" });
  }
});

/**
 * GET /api/news/:symbol
 * Get company specific news
 */
router.get("/:symbol", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      res.status(400).json({ error: "Symbol is required" });
      return;
    }

    // Check cache first
    const cacheKey = `news:${symbol.toUpperCase()}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Calculate date range (last 7 days)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 7);
    
    const to = toDate.toISOString().split('T')[0];
    const from = fromDate.toISOString().split('T')[0];
    
    const news = await getCompanyNews(symbol.toUpperCase(), from, to);
    
    // Cache results (15 minutes)
    await setCache(cacheKey, news, 900);
    
    res.json(news);
  } catch (error) {
    console.error(`Error fetching news for ${req.params.symbol}:`, error);
    res.status(500).json({ error: "Failed to fetch company news" });
  }
});

export default router;
