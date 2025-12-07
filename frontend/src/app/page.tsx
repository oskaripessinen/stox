"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { Header } from "@/components/layout/header";
import { StockProfileDialog } from "@/components/stocks/stock-profile-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronUp, ChevronDown, Star, Loader2 } from "lucide-react";
import { getMultipleQuotes, getIndices, getTopMovers, StockQuote, IndexData, MarketMover, formatPrice, formatPoints, formatChange, formatVolume } from "@/lib/api";

// Stock symbols for each index
const indexSymbols: Record<string, string[]> = {
  sp500: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "JNJ", "WMT", "UNH"],
  nasdaq: ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "AVGO", "ADBE", "NFLX"],
  dow: ["AAPL", "MSFT", "JPM", "V", "JNJ", "WMT", "UNH", "HD", "DIS", "BA"],
};

export default function Home() {
  // Indices data state
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [indicesLoading, setIndicesLoading] = useState(true);

  // Top movers state
  const [topGainers, setTopGainers] = useState<MarketMover[]>([]);
  const [topLosers, setTopLosers] = useState<MarketMover[]>([]);
  const [moversLoading, setMoversLoading] = useState(true);

  // Stock data state
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stock profile dialog state
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Index stocks data
  const [selectedIndex, setSelectedIndex] = useState("sp500");
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch indices on mount
  useEffect(() => {
    async function fetchIndices() {
      setIndicesLoading(true);
      try {
        const data = await getIndices();
        setIndices(data);
      } catch (err) {
        console.error("Failed to fetch indices:", err);
      } finally {
        setIndicesLoading(false);
      }
    }
    fetchIndices();
  }, []);

  // Fetch top movers on mount
  useEffect(() => {
    async function fetchMovers() {
      setMoversLoading(true);
      try {
        const movers = await getTopMovers(5);
        setTopGainers(movers.gainers);
        setTopLosers(movers.losers);
      } catch (err) {
        console.error("Failed to fetch movers:", err);
      } finally {
        setMoversLoading(false);
      }
    }
    fetchMovers();
  }, []);

  // Fetch stocks when selected index changes
  useEffect(() => {
    async function fetchStocks() {
      setLoading(true);
      setError(null);
      try {
        const symbols = indexSymbols[selectedIndex] || indexSymbols.sp500;
        const quotes = await getMultipleQuotes(symbols);
        setStocks(quotes);
      } catch (err) {
        setError("Failed to fetch stock data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStocks();
  }, [selectedIndex]);

  // Sort stocks based on selected column
  const sortedStocks = [...stocks].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortBy) {
      case "symbol":
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case "price":
        aVal = a.price;
        bVal = b.price;
        break;
      case "change":
        aVal = a.changePercent;
        bVal = b.changePercent;
        break;
      case "volume":
        aVal = a.volume;
        bVal = b.volume;
        break;
      default:
        aVal = a.price;
        bVal = b.price;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  // Handle column header click
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Sort indicator component
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const handleSearchSelect = (symbol: string) => {
    setSelectedStock(symbol);
    setProfileDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onStockSelect={handleSearchSelect} />

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Market Overview Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Market Overview</h1>
            <p className="text-sm text-muted-foreground">Real-time market data and trends</p>
          </div>

          {/* Index Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {indicesLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="py-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                    </div>
                    <div className="h-7 w-24 bg-muted animate-pulse rounded mt-2" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-12 w-full bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))
            ) : (
              indices.map((index) => (
                <Card key={index.id} className="py-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription>{index.name}</CardDescription>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          index.up
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {formatChange(index.changePercent)}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{formatPoints(index.value)}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="h-12 w-full">
                      {index.data.length > 0 ? (
                        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id={`fill-${index.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={index.up ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={index.up ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <path
                            d={(() => {
                              const values = index.data.map((d) => d.value);
                              const min = Math.min(...values);
                              const max = Math.max(...values);
                              const range = max - min || 1;
                              const points = values.map((v, i) => {
                                const x = (i / (values.length - 1)) * 100;
                                const y = 30 - ((v - min) / range) * 28;
                                return `${i === 0 ? "M" : "L"}${x},${y}`;
                              });
                              return points.join(" ");
                            })()}
                            fill="none"
                            stroke={index.up ? "var(--chart-3)" : "var(--destructive)"}
                            strokeWidth="2"
                          />
                          <path
                            d={(() => {
                              const values = index.data.map((d) => d.value);
                              const min = Math.min(...values);
                              const max = Math.max(...values);
                              const range = max - min || 1;
                              const points = values.map((v, i) => {
                                const x = (i / (values.length - 1)) * 100;
                                const y = 30 - ((v - min) / range) * 28;
                                return `${i === 0 ? "M" : "L"}${x},${y}`;
                              });
                              return points.join(" ") + ` L100,30 L0,30 Z`;
                            })()}
                            fill={`url(#fill-${index.id})`}
                          />
                        </svg>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                          No chart data
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Top Gainers, Losers & Watchlist */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Top Gainers */}
            <Card>
              <CardHeader className="">
                <div className="flex items-center gap-2">
                  <ChevronUp strokeWidth={3} className="h-5 w-5 text-chart-3" />
                  <CardTitle className="text-base mb-0 pb-0">Top Gainers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {moversLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : topGainers.length > 0 ? (
                  topGainers.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-1 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedStock(stock.symbol);
                        setProfileDialogOpen(true);
                      }}
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">{stock.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">{formatPrice(stock.price)}</p>
                        <p className="text-xs font-medium text-chart-3">
                          +{stock.change.toFixed(2)} ({formatChange(stock.percent_change)})
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No gainers</p>
                )}
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card>
              <CardHeader className="">
                <div className="flex items-center gap-2">
                  <ChevronDown strokeWidth={3} className="h-5 w-5 text-destructive" /> 
                  <CardTitle className="text-base">Top Losers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {moversLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : topLosers.length > 0 ? (
                  topLosers.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="flex items-center justify-between p-1 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedStock(stock.symbol);
                        setProfileDialogOpen(true);
                      }}
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm">{stock.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">{formatPrice(stock.price)}</p>
                        <p className="text-xs font-medium text-destructive">
                          {stock.change.toFixed(2)} ({formatChange(stock.percent_change)})
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">No losers</p>
                )}
              </CardContent>
            </Card>

            {/* Watchlist */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Watchlist</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-4">
                <SignedOut>
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Sign in to track your favorite stocks
                  </p>
                  <SignInModal>
                    <Button size="sm">Sign in</Button>
                  </SignInModal>
                </SignedOut>
                <SignedIn>
                  <p className="text-sm text-muted-foreground text-center">
                    Your watchlist is empty
                  </p>
                </SignedIn>
              </CardContent>
            </Card>
          </div>

          {/* Stock List */}
          <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Stocks</CardTitle>
                    <CardDescription>Browse stocks by index</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Index selector */}
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="h-9 px-3 gap-2">
                            {selectedIndex === "sp500" ? "S&P 500" : selectedIndex === "nasdaq" ? "NASDAQ" : "DOW JONES"}
                            <ChevronDown strokeWidth={2} className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedIndex("sp500")}>
                            S&P 500
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedIndex("nasdaq")}>
                            NASDAQ
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedIndex("dow")}>
                            DOW JONES
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Table header */}
                <div className="hidden md:grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                  <button
                    onClick={() => handleSort("symbol")}
                    className="flex items-center hover:text-foreground transition-colors text-left"
                  >
                    Symbol
                    <SortIndicator column="symbol" />
                  </button>
                  <button
                    onClick={() => handleSort("price")}
                    className="flex items-center justify-end hover:text-foreground transition-colors"
                  >
                    Price
                    <SortIndicator column="price" />
                  </button>
                  <button
                    onClick={() => handleSort("change")}
                    className="flex items-center justify-end hover:text-foreground transition-colors"
                  >
                    Change
                    <SortIndicator column="change" />
                  </button>
                  <button
                    onClick={() => handleSort("volume")}
                    className="flex items-center justify-end hover:text-foreground transition-colors"
                  >
                    Volume
                    <SortIndicator column="volume" />
                  </button>
                </div>
                {/* Stock rows */}
                <div className="divide-y divide-border">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-destructive">{error}</div>
                  ) : sortedStocks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No stocks found</div>
                  ) : (
                    sortedStocks.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedStock(stock.symbol);
                          setProfileDialogOpen(true);
                        }}
                      >
                        <div className="font-semibold text-foreground">{stock.symbol}</div>
                        <div className="text-right font-medium">{formatPrice(stock.price)}</div>
                        <div className={`text-right font-medium ${stock.changePercent >= 0 ? "text-chart-3" : "text-destructive"}`}>
                          {formatChange(stock.changePercent)}
                        </div>
                        <div className="text-right text-muted-foreground text-sm hidden md:block">{formatVolume(stock.volume)}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Stock Profile Dialog */}
        <StockProfileDialog
          symbol={selectedStock}
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
      </main>
    </div>
  );
}