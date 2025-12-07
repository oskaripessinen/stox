/**
 * Finnhub API for company profiles and fundamentals
 * Get free API key at https://finnhub.io/
 */

import "dotenv/config";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
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
export async function getCompanyProfile(symbol: string): Promise<StockProfile | null> {
  if (!FINNHUB_API_KEY) {
    console.warn("FINNHUB_API_KEY not set - company profiles unavailable");
    return null;
  }

  try {
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`Finnhub API error: ${res.status}`);
      return null;
    }

    const data: CompanyProfile = await res.json();

    if (!data || !data.name) {
      return null;
    }

    return {
      symbol: data.ticker || symbol,
      name: data.name,
      logo: data.logo,
      industry: data.finnhubIndustry,
      country: data.country,
      exchange: data.exchange,
      currency: data.currency,
      marketCap: data.marketCapitalization * 1000000, // Finnhub returns in millions
      sharesOutstanding: data.shareOutstanding * 1000000,
      website: data.weburl,
      ipo: data.ipo,
    };
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    return null;
  }
}

/**
 * Check if Finnhub API is configured
 */
export function isFinnhubConfigured(): boolean {
  return !!FINNHUB_API_KEY;
}
