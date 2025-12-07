"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Globe, Building2, MapPin, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { getStockProfile, getStockQuote, getStockHistory, StockProfile, StockQuote, StockBar, formatPrice, formatChange, formatMarketCap, formatVolume } from "@/lib/api";

interface StockProfileDialogProps {
  symbol: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TimeframeOption = {
  label: string;
  timeframe: string;
  limit: number;
};

const TIMEFRAME_OPTIONS: TimeframeOption[] = [
  { label: "1D", timeframe: "1Hour", limit: 24 },
  { label: "1W", timeframe: "1Hour", limit: 168 },
  { label: "1M", timeframe: "1Day", limit: 30 },
  { label: "3M", timeframe: "1Day", limit: 90 },
  { label: "1Y", timeframe: "1Day", limit: 365 },
  { label: "5Y", timeframe: "1Week", limit: 260 },
];

export function StockProfileDialog({ symbol, open, onOpenChange }: StockProfileDialogProps) {
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [bars, setBars] = useState<StockBar[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAME_OPTIONS[2]); // Default 1M
  const [hoverData, setHoverData] = useState<{ index: number; x: number; y: number; price: number; date: string } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch profile and quote
  useEffect(() => {
    if (!symbol || !open) {
      setProfile(null);
      setQuote(null);
      setBars([]);
      setError(null);
      setHoverData(null);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [profileData, quoteData] = await Promise.all([
          getStockProfile(symbol!),
          getStockQuote(symbol!),
        ]);

        if (!quoteData) {
          setError("Unable to load stock data");
        } else {
          setProfile(profileData);
          setQuote(quoteData);
        }
      } catch (err) {
        setError("Failed to load stock data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol, open]);

  // Fetch chart data when timeframe changes
  useEffect(() => {
    if (!symbol || !open) return;

    async function fetchChart() {
      setChartLoading(true);
      try {
        const data = await getStockHistory(symbol!, selectedTimeframe.timeframe, selectedTimeframe.limit);
        if (data?.bars) {
          setBars(data.bars);
        }
      } catch (err) {
        console.error("Failed to load chart data:", err);
      } finally {
        setChartLoading(false);
      }
    }

    fetchChart();
  }, [symbol, open, selectedTimeframe]);

  // Calculate chart stats
  const chartStats = useMemo(() => {
    if (bars.length < 2) return null;
    
    const firstClose = bars[0].close;
    const lastClose = bars[bars.length - 1].close;
    const change = lastClose - firstClose;
    const changePercent = (change / firstClose) * 100;
    
    return {
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      isPositive: changePercent >= 0,
    };
  }, [bars]);

  const isPositive = (quote?.changePercent || 0) >= 0;

  // Generate SVG path for chart
  const chartPath = useMemo(() => {
    if (bars.length === 0) return { linePath: "", areaPath: "", min: 0, max: 0, priceLines: [] };
    
    const closes = bars.map((b) => b.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    
    const width = 100;
    const height = 100;
    const padding = 5;
    
    const points = closes.map((close, i) => {
      const x = (i / (closes.length - 1)) * width;
      const y = height - padding - ((close - min) / range) * (height - padding * 2);
      return { x, y, close };
    });
    
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
    
    // Calculate open price Y position (first bar's open)
    const openPrice = bars[0].open;
    const openY = height - padding - ((openPrice - min) / range) * (height - padding * 2);
    
    // Generate horizontal price grid lines (5 lines)
    const numLines = 5;
    const priceLines = [];
    for (let i = 0; i < numLines; i++) {
      const price = min + (range * i) / (numLines - 1);
      const y = height - padding - ((price - min) / range) * (height - padding * 2);
      priceLines.push({ y, price });
    }
    
    return { linePath, areaPath, min, max, points, openY, openPrice, height, padding, range, priceLines };
  }, [bars]);

  // Handle mouse move on chart - smooth interpolation
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || bars.length === 0 || !chartPath.points) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = Math.max(0, Math.min(1, x / rect.width));
    
    // Calculate exact position (can be between data points)
    const exactIndex = relativeX * (bars.length - 1);
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.min(lowerIndex + 1, bars.length - 1);
    const fraction = exactIndex - lowerIndex;
    
    // Interpolate price between two nearest points
    const lowerPrice = bars[lowerIndex].close;
    const upperPrice = bars[upperIndex].close;
    const interpolatedPrice = lowerPrice + (upperPrice - lowerPrice) * fraction;
    
    // Interpolate Y position
    const lowerY = chartPath.points[lowerIndex].y;
    const upperY = chartPath.points[upperIndex].y;
    const interpolatedY = lowerY + (upperY - lowerY) * fraction;
    
    // Get nearest bar for date display
    const nearestIndex = Math.round(exactIndex);
    const nearestBar = bars[nearestIndex];
    
    setHoverData({
      index: nearestIndex,
      x: relativeX * 100,
      y: interpolatedY,
      price: interpolatedPrice,
      date: new Date(nearestBar.timestamp).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: selectedTimeframe.label === "1D" ? undefined : "numeric",
        hour: selectedTimeframe.label === "1D" || selectedTimeframe.label === "1W" ? "2-digit" : undefined,
        minute: selectedTimeframe.label === "1D" || selectedTimeframe.label === "1W" ? "2-digit" : undefined,
      }),
    });
  };

  const handleChartMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] h-[750px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {profile?.logo && (
              <img
                src={profile.logo}
                alt={`${profile.name} logo`}
                className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div>
              <span className="text-2xl">{symbol}</span>
              {profile?.name && (
                <p className="text-sm font-normal text-muted-foreground">{profile.name}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-6">
            {/* Price Section skeleton */}
            <div className="flex items-baseline justify-between">
              <div className="h-10 w-40 bg-muted animate-pulse rounded" />
              <div className="text-right space-y-1">
                <div className="h-6 w-32 bg-muted animate-pulse rounded ml-auto" />
                <div className="h-4 w-14 bg-muted animate-pulse rounded ml-auto" />
              </div>
            </div>

            {/* Chart Section skeleton */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {TIMEFRAME_OPTIONS.map((tf) => (
                    <div key={tf.label} className="h-8 w-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
                <div className="h-5 w-28 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex gap-2">
                <div className="relative h-64 flex-1 rounded-lg bg-muted animate-pulse" />
                <div className="h-64 w-14 flex-shrink-0" />
              </div>
            </div>

            {/* Stats Grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>

            {/* Company Info skeleton */}
            <div className="space-y-3 border-t pt-4">
              <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price Section */}
            {quote && (
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-bold">{formatPrice(quote.price)}</span>
                <div className="text-right">
                  <span
                    className={`text-xl font-semibold ${
                      isPositive ? "text-chart-3" : "text-destructive"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {quote.change.toFixed(2)} ({formatChange(quote.changePercent)})
                  </span>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
            )}

            {/* Chart Section */}
            <div className="space-y-3">
              {/* Timeframe selector - slide menu */}
              <div className="flex items-center justify-between">
                <div className="relative inline-flex bg-muted rounded-md p-0.5 gap-0.5">
                  {/* Sliding background */}
                  <div
                    className="absolute top-0.5 bottom-0.5 bg-background rounded shadow-sm transition-all duration-200 ease-out pointer-events-none"
                    style={{
                      width: '36px',
                      transform: `translateX(${TIMEFRAME_OPTIONS.findIndex(tf => tf.label === selectedTimeframe.label) * 38}px)`,
                    }}
                  />
                  {TIMEFRAME_OPTIONS.map((tf) => (
                    <button
                      key={tf.label}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`relative z-10 w-9 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                        selectedTimeframe.label === tf.label
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
                {chartStats && (
                  <span
                    className={`text-sm font-medium ${
                      chartStats.isPositive ? "text-chart-3" : "text-destructive"
                    }`}
                  >
                    {chartStats.isPositive ? "+" : ""}
                    {chartStats.changePercent.toFixed(2)}% ({selectedTimeframe.label})
                  </span>
                )}
              </div>

              {/* Chart */}
              <div className="flex gap-2">
                {/* Chart area */}
                <div 
                  ref={chartRef}
                  className="relative h-64 flex-1 rounded-lg overflow-hidden cursor-crosshair"
                  onMouseMove={handleChartMouseMove}
                  onMouseLeave={handleChartMouseLeave}
                >
                  {chartLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : bars.length > 0 ? (
                    <>
                    
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id={`chart-gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)"}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor={chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)"}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      
                      {/* Horizontal price grid lines */}
                      {chartPath.priceLines?.map((line, i) => (
                        <line
                          key={i}
                          x1="0"
                          y1={line.y}
                          x2="100"
                          y2={line.y}
                          stroke="var(--muted-foreground)"
                          strokeWidth="0.2"
                          vectorEffect="non-scaling-stroke"
                          opacity={0.3}
                        />
                      ))}
                      
                      {/* Area fill */}
                      <path
                        d={chartPath.areaPath}
                        fill={`url(#chart-gradient-${symbol})`}
                      />
                      
                      {/* Price line */}
                      <path
                        d={chartPath.linePath}
                        fill="none"
                        stroke={chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)"}
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                      
                      {/* Hover vertical line */}
                      {hoverData && (
                        <line
                          x1={hoverData.x}
                          y1="0"
                          x2={hoverData.x}
                          y2="100"
                          stroke="var(--foreground)"
                          strokeWidth="0.3"
                          vectorEffect="non-scaling-stroke"
                          opacity={0.5}
                        />
                      )}
                    </svg>
                    
                    {/* Hover dot - separate element to avoid distortion */}
                    {hoverData && (
                      <div
                        className="absolute w-2.25 h-2.25 rounded-full border-1 border-white pointer-events-none"
                        style={{
                          left: `${hoverData.x}%`,
                          top: `${hoverData.y}%`,
                          transform: "translate(-50%, -50%)",
                          backgroundColor: chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)",
                        }}
                      />
                    )}
                    
                    {/* Hover tooltip */}
                    {hoverData && (
                      <div 
                        className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm border rounded-md px-2 py-1 text-sm pointer-events-none"
                      >
                        <p className="font-semibold">{formatPrice(hoverData.price)}</p>
                        <p className="text-xs text-muted-foreground">{hoverData.date}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    No chart data available
                  </div>
                )}
                
                </div>
                
                {/* Price labels - outside chart on the right */}
                {bars.length > 0 && (
                  <div className="relative h-64 w-14 flex-shrink-0">
                    {chartPath.priceLines?.map((line, i) => (
                      <div
                        key={i}
                        className="absolute right-0 text-xs text-muted-foreground whitespace-nowrap"
                        style={{ top: `${line.y}%`, transform: "translateY(-50%)" }}
                      >
                        {line.price.toFixed(2)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            {quote && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Open</p>
                  <p className="font-semibold">{formatPrice(quote.open)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">High</p>
                  <p className="font-semibold">{formatPrice(quote.high)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p className="font-semibold">{formatPrice(quote.low)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Volume</p>
                  <p className="font-semibold">{formatVolume(quote.volume)}</p>
                </div>
              </div>
            )}

            {/* Company Info */}
            {profile && (
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Company Info
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.industry && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{profile.industry}</span>
                    </div>
                  )}
                  {profile.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{profile.country}</span>
                    </div>
                  )}
                  {profile.exchange && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{profile.exchange}</span>
                    </div>
                  )}
                  {profile.ipo && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">IPO: {profile.ipo}</span>
                    </div>
                  )}
                  {profile.marketCap > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">Mkt Cap: {formatMarketCap(profile.marketCap)}</span>
                    </div>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}