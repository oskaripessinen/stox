"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { Header } from "@/components/layout/header";
import { StockProfileDialog } from "@/components/stocks/stock-profile-dialog";
import IndexCards from "@/components/market/IndexCards";
import Movers from "@/components/market/Movers";
import StockList from "@/components/market/StockList";
import Watchlist from "@/components/market/Watchlist";
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
import { getMultipleQuotes, getIndices, getTopMovers, getStockProfile, StockQuote, IndexData, MarketMover, formatPrice, formatPoints, formatChange, formatMarketCap } from "@/lib/api";

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
        const gainerSymbols = movers.gainers.map((m) => m.symbol);
        const loserSymbols = movers.losers.map((m) => m.symbol);

        // Fetch profiles for marketCap and merge in
        const gainerProfiles = await Promise.all(gainerSymbols.map((s) => getStockProfile(s)));
        const loserProfiles = await Promise.all(loserSymbols.map((s) => getStockProfile(s)));

        const gainersWithCap = movers.gainers.map((g, i) => ({ ...g, marketCap: gainerProfiles[i]?.marketCap ?? undefined }));
        const losersWithCap = movers.losers.map((l, i) => ({ ...l, marketCap: loserProfiles[i]?.marketCap ?? undefined }));

        setTopGainers(gainersWithCap);
        setTopLosers(losersWithCap);
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
        aVal = a.changePercent ?? 0;
        bVal = b.changePercent ?? 0;
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

          <IndexCards indices={indices} loading={indicesLoading} />

          {/* Top Gainers, Losers & Watchlist */}
        
            <div className="lg:col-span-2 mb-16">
              <Movers topGainers={topGainers} topLosers={topLosers} loading={moversLoading} onSelect={(s) => { setSelectedStock(s); setProfileDialogOpen(true); }} />
            </div>
          

          {/* Stock List */}
          <StockList
            sortedStocks={sortedStocks}
            loading={loading}
            error={error}
            onStockClick={(s) => { setSelectedStock(s); setProfileDialogOpen(true); }}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(col) => handleSort(col)}
          />
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