import { Router, Request, Response } from "express";
import { getMarketNews } from "../lib/finnhub";
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

export default router;
