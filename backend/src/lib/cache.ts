import Redis from "ioredis";

// Valkey/Redis connection
const redis = new Redis({
  host: process.env.VALKEY_HOST || "localhost",
  port: parseInt(process.env.VALKEY_PORT || "6379"),
  password: process.env.VALKEY_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

let isConnected = false;

redis.on("error", (err) => {
  if (isConnected) {
    console.error("Valkey connection error:", err.message);
  }
  isConnected = false;
});

redis.on("connect", () => {
  isConnected = true;
  console.log("✓ Connected to Valkey cache");
});

// Try to connect
redis.connect().catch(() => {
  console.log("⚠ Valkey not available - running without cache");
});

// Default TTLs (seconds)
export const TTL = {
  QUOTE: 60,   
  PROFILE: 86400,     
  BARS: 900,          
  SEARCH: 3600,       
  MOVERS: 60,         
  INDICES: 60,        
};

/**
 * Get cached data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!isConnected) return null;
  
  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`Cache HIT: ${key}`);
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set cached data with TTL
 */
export async function setCache(key: string, data: any, ttlSeconds: number = TTL.QUOTE): Promise<void> {
  if (!isConnected) return;
  
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCache(key: string): Promise<void> {
  if (!isConnected) return;
  
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

// Cache key generators
export const cacheKeys = {
  quote: (symbol: string) => `stock:quote:${symbol.toUpperCase()}`,
  profile: (symbol: string) => `stock:profile:${symbol.toUpperCase()}`,
  bars: (symbol: string, timeframe: string, limit: number) => 
    `stock:bars:${symbol.toUpperCase()}:${timeframe}:${limit}`,
  search: (query: string) => `search:${query.toLowerCase()}`,
  movers: (top: number) => `movers:${top}`,
  indices: () => `indices`,
};

export default redis;
