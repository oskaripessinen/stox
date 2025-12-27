"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ExternalLink, Globe, Building2, MapPin, Calendar, TrendingUp, DollarSign, Newspaper, ChevronLeft, ChevronRight, Plus, Check, Star } from "lucide-react";
import { getStockDetails, StockProfile, StockQuote, StockBar, formatPrice, formatMarketCap, formatVolume, MarketNews, getCompanyNews, getWatchlists, addToWatchlist, Watchlist, removeFromWatchlist, createWatchlist } from "@/lib/api";
import Image from "next/image";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import * as Recharts from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { toast } from "sonner";
import { CreateWatchlistDialog } from "@/components/market/create-watchlist-dialog";

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

const ITEMS_PER_PAGE = 6;

export function StockProfileDialog({ symbol, open, onOpenChange }: StockProfileDialogProps) {
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [bars, setBars] = useState<StockBar[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [newsPage, setNewsPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAME_OPTIONS[0]); // Default 1D
  
  const [logoLoaded, setLogoLoaded] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [createWatchlistOpen, setCreateWatchlistOpen] = useState(false);

  useEffect(() => {
    if (open) {
      getWatchlists().then(setWatchlists);
    }
  }, [open]);

  const handleCreateWatchlist = async (name: string, description?: string) => {
    const newWatchlist = await createWatchlist(name, description);
    if (newWatchlist) {
      toast.success(`Created watchlist "${name}"`);
      const updated = await getWatchlists();
      setWatchlists(updated);
      
      // Optionally add the current stock to the new watchlist immediately
      if (symbol) {
        await addToWatchlist(newWatchlist.id, symbol);
        toast.success(`Added ${symbol} to ${name}`);
        // Refresh again to show the checkmark
        getWatchlists().then(setWatchlists);
      }
    } else {
      toast.error("Failed to create watchlist");
    }
  };

  const handleToggleWatchlist = async (watchlistId: string, watchlistName: string, currentItems: { symbol: string }[]) => {
    if (!symbol) return;
    
    const isinList = currentItems.some(i => i.symbol === symbol);
    
    if (isinList) {
      await removeFromWatchlist(watchlistId, symbol);
      toast.success(`Removed ${symbol} from ${watchlistName}`);
    } else {
      await addToWatchlist(watchlistId, symbol);
      toast.success(`Added ${symbol} to ${watchlistName}`);
    }
    
    // Refresh watchlists
    const updated = await getWatchlists();
    setWatchlists(updated);
  };


  useEffect(() => {
    if (!symbol || !open) {
      setProfile(null);
      setQuote(null);
      setBars([]);
      setNews([]);
      setNewsPage(1);
      setError(null);
      setLogoLoaded(false);
      return;
    }

    async function fetchDetails() {
      setLoading(true);
      
      try {
        const data = await getStockDetails(symbol!, selectedTimeframe.timeframe, selectedTimeframe.limit);
        if (!data) {
          setError("Unable to load stock data");
          setProfile(null);
          setQuote(null);
          setBars([]);
        } else {
          setProfile(data.profile || null);
          setQuote(data.quote || null);
          setBars(data.history?.bars || []);
        }
      } catch (err) {
        setError("Failed to load stock data");
        console.error(err);
      } finally {
        setLoading(false);
        
      }
    }
    
    async function fetchNews() {
      setNewsLoading(true);
      setNewsPage(1);
      try {
        const newsData = await getCompanyNews(symbol!);
        setNews(newsData);
      } catch (err) {
        console.error("Failed to load news", err);
      } finally {
        setNewsLoading(false);
      }
    }

    fetchDetails();
    fetchNews();
  }, [symbol, open, selectedTimeframe.timeframe, selectedTimeframe.limit]);

  async function fetchChartData() {
    if (!symbol) return;
    setChartLoading(true);
    try {
      const data = await getStockDetails(symbol, selectedTimeframe.timeframe, selectedTimeframe.limit);
      if (data?.history?.bars) {
        setBars(data.history.bars);
      }
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    } finally {
      setChartLoading(false);
    }
  }

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

  const formatBarTime = (ts: string | number) => {
    const d = typeof ts === "number" ? new Date(ts) : new Date(String(ts));
    if (isNaN(d.getTime())) return String(ts);
    if (selectedTimeframe.label.includes("1D")) {
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    if( selectedTimeframe.label.includes("1W")) {
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit" });
    }
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };


  const isPositive = (quote?.changePercent || 0) >= 0;

  const valuesForDomain = bars.map((b) => b.close);
  const domainMin = valuesForDomain.length ? Math.min(...valuesForDomain) : 0;
  const domainMax = valuesForDomain.length ? Math.max(...valuesForDomain) : 0;
  const domainRange = Math.abs(domainMax - domainMin);
  const domainPadding = domainRange > 0 ? Math.max(domainRange * 0.15, Math.abs(domainMax) * 0.01) : Math.max(Math.abs(domainMax) * 0.01, 1);
  const yDomain: [number, number] = [domainMin - domainPadding, domainMax + domainPadding];



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] h-[750px] flex flex-col p-0 gap-5 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
                  {profile?.logo && (
                    <div className="relative w-12 h-12 flex-shrink-0">
                      {!logoLoaded && (
                        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
                      )}
                      <Image
                        src={profile.logo}
                        alt={`${profile.name} logo`}
                        width={48}
                        height={48}
                        className={`w-12 h-12 rounded-lg object-contain transition-opacity duration-200 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoadingComplete={() => setLogoLoaded(true)}
                        onError={() => setLogoLoaded(true)}
                      />
                    </div>
                  )}
              <div className="flex w-full flex-row justify-between items-start">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-semibold">{symbol}</span>
                    <SignedIn>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="link" size="icon" className="group h-8 w-8 text-primary transition-all">
                            <Star className={`h-7 w-7 text-primary transition-all duration-200 ${watchlists.some(w => w.items.some(i => i.symbol === symbol)) ? "fill-primary" : "fill-none group-hover:fill-primary"}`} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Add to Watchlist</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setCreateWatchlistOpen(true)}>
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              <span>Create New Watchlist</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {watchlists.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground">No watchlists created</div>
                          ) : (
                            watchlists.map((wl) => {
                              const isInList = wl.items.some((i) => i.symbol === symbol);
                              return (
                                <DropdownMenuItem 
                                  key={wl.id} 
                                  onClick={() => handleToggleWatchlist(wl.id, wl.name, wl.items)}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <span>{wl.name}</span>
                                  {isInList && <Check className="h-3 w-3" />}
                                </DropdownMenuItem>
                              );
                            })
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SignedIn>
                  </div>
                  {profile?.name && (
                    <p className="text-sm font-normal text-muted-foreground">{profile.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                   <SignedOut>
                     <SignInModal>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                         <Star className="h-5 w-5" />
                       </Button>
                     </SignInModal>
                   </SignedOut>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 px-6 pb-6">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-4">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 py-2"
            >
              News
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-hidden space-y-6 mt-0 pr-2 min-h-0">
            {loading ? (
              <div className="space-y-6">
                <div className="flex items-baseline justify-between">
                  <div className="h-10 w-40 bg-muted animate-pulse rounded" />
                  <div className="text-right space-y-1">
                    <div className="h-6 w-32 bg-muted animate-pulse rounded ml-auto" />
                    <div className="h-4 w-14 bg-muted animate-pulse rounded ml-auto" />
                  </div>
                </div>

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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                      <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  ))}
                </div>

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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="relative inline-flex bg-muted rounded-md p-0.5 gap-0.5">
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
                          onClick={() => {
                            setSelectedTimeframe(tf);
                            fetchChartData();
                          }}
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
                    <div className="flex-col">
                      {quote && (
                        <div className="">
                          <span className="text-2xl font-bold">{formatPrice(quote.price)}</span>
                          <div className="text-right">
                            <span
                              className={`text-xl font-semibold ${
                                isPositive ? "text-chart-3" : "text-destructive"
                              }`}
                            >
                            </span>
                          </div>
                        </div>
                        )}
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
                  </div>

                  <div className="flex gap-2">
                    <div 
                      ref={chartRef}
                        className="relative h-64 flex-1 rounded-lg overflow-hidden"
                    >
                      {chartLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : bars.length > 0 ? (
                        <ChartContainer id={`profile-${symbol}`} className="h-full w-full" config={{ value: { color: chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)" } }}>
                          <Recharts.AreaChart
                            data={bars.map((b) => ({ time: b.timestamp, value: b.close }))}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id={`chart-gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Recharts.CartesianGrid horizontal={false} vertical={false} />
                            <Recharts.XAxis dataKey="time" hide />
                            <Recharts.YAxis hide domain={yDomain} />
                            <Recharts.Tooltip content={<ChartTooltipContent indicator="dot" labelFormatter={(l) => formatBarTime(l as string | number)} />} />
                            <Recharts.Area
                              type="monotone"
                              dataKey="value"
                              stroke={chartStats?.isPositive ? "var(--chart-3)" : "var(--destructive)"}
                              fill={`url(#chart-gradient-${symbol})`}
                              fillOpacity={1}
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              shapeRendering="geometricPrecision"
                              dot={false}
                              activeDot={{ r: 4 }}
                              isAnimationActive={false}
                            />
                          </Recharts.AreaChart>
                        </ChartContainer>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No chart data available
                      </div>
                    )}
                    
                    </div>
                    
                  </div>
                </div>

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

                {profile && (
                  <div className="space-y-3 border-t pt-4 pb-4">
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
          </TabsContent>

          <TabsContent value="news" className="flex-1 overflow-hidden space-y-4 mt-0 pr-2 min-h-0">
             {newsLoading ? (
              <div className="grid grid-cols-1 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 w-full bg-muted/50 animate-pulse rounded-lg" />
                ))}
              </div>
             ) : news.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg bg-muted/5">
                <Newspaper className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent news found for {symbol}.</p>
              </div>
             ) : (
               <>
                <div className="grid grid-cols-1 gap-2">
                  {news.slice((newsPage - 1) * ITEMS_PER_PAGE, newsPage * ITEMS_PER_PAGE).map((item) => (
                    <a 
                      key={item.id} 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200 border border-transparent hover:border-border/50"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="font-semibold uppercase tracking-wider">
                            {item.source}
                          </span>
                          <span className="flex items-center gap-1">
                            {formatDistanceToNow(item.datetime * 1000, { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                          {item.headline}
                        </h3>
                      </div>
                    </a>
                  ))}
                </div>
                {Math.ceil(news.length / ITEMS_PER_PAGE) > 1 && (
                  <div className="flex items-center justify-end gap-2 pt-0">
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                      disabled={newsPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-[11px] font-medium text-muted-foreground mr-2">
                      {newsPage} / {Math.ceil(news.length / ITEMS_PER_PAGE)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setNewsPage((p) => Math.min(Math.ceil(news.length / ITEMS_PER_PAGE), p + 1))}
                      disabled={newsPage >= Math.ceil(news.length / ITEMS_PER_PAGE)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
               </>
             )}
          </TabsContent>
        </Tabs>
      </DialogContent>

      <CreateWatchlistDialog 
        open={createWatchlistOpen} 
        onOpenChange={setCreateWatchlistOpen}
        onCreate={handleCreateWatchlist}
      />
    </Dialog>
  );
}
