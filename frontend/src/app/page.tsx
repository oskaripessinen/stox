"use client";

import { useState, useEffect, useRef } from "react";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { SignInModal } from "@/components/auth/sign-in-modal";
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
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Search, Sun, Moon, TrendingUp, TrendingDown, Star, Clock } from "lucide-react";

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Market indices data
  const indices = [
    {
      name: "S&P 500",
      value: "4,567.89",
      change: "+1.23%",
      up: true,
      data: [
        { time: "9:30", value: 4520 },
        { time: "10:00", value: 4535 },
        { time: "10:30", value: 4528 },
        { time: "11:00", value: 4545 },
        { time: "11:30", value: 4540 },
        { time: "12:00", value: 4555 },
        { time: "12:30", value: 4550 },
        { time: "13:00", value: 4560 },
        { time: "13:30", value: 4558 },
        { time: "14:00", value: 4565 },
        { time: "14:30", value: 4562 },
        { time: "15:00", value: 4568 },
      ],
    },
    {
      name: "NASDAQ",
      value: "14,234.56",
      change: "+1.87%",
      up: true,
      data: [
        { time: "9:30", value: 14000 },
        { time: "10:00", value: 14050 },
        { time: "10:30", value: 14080 },
        { time: "11:00", value: 14060 },
        { time: "11:30", value: 14100 },
        { time: "12:00", value: 14090 },
        { time: "12:30", value: 14130 },
        { time: "13:00", value: 14160 },
        { time: "13:30", value: 14150 },
        { time: "14:00", value: 14190 },
        { time: "14:30", value: 14210 },
        { time: "15:00", value: 14235 },
      ],
    },
    {
      name: "DOW JONES",
      value: "35,678.90",
      change: "+0.54%",
      up: true,
      data: [
        { time: "9:30", value: 35500 },
        { time: "10:00", value: 35520 },
        { time: "10:30", value: 35550 },
        { time: "11:00", value: 35580 },
        { time: "11:30", value: 35570 },
        { time: "12:00", value: 35600 },
        { time: "12:30", value: 35620 },
        { time: "13:00", value: 35640 },
        { time: "13:30", value: 35650 },
        { time: "14:00", value: 35660 },
        { time: "14:30", value: 35670 },
        { time: "15:00", value: 35679 },
      ],
    },
    {
      name: "FTSE 100",
      value: "7,456.78",
      change: "-0.32%",
      up: false,
      data: [
        { time: "9:30", value: 7480 },
        { time: "10:00", value: 7475 },
        { time: "10:30", value: 7470 },
        { time: "11:00", value: 7465 },
        { time: "11:30", value: 7468 },
        { time: "12:00", value: 7462 },
        { time: "12:30", value: 7458 },
        { time: "13:00", value: 7460 },
        { time: "13:30", value: 7455 },
        { time: "14:00", value: 7450 },
        { time: "14:30", value: 7458 },
        { time: "15:00", value: 7457 },
      ],
    },
  ];

  // Top movers
  const topGainers = [
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "$485.09", change: "+5.21%" },
    { symbol: "META", name: "Meta Platforms", price: "$334.92", change: "+4.12%" },
    { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%" },
  ];

  const topLosers = [
    { symbol: "INTC", name: "Intel Corp.", price: "$42.15", change: "-3.45%" },
    { symbol: "BA", name: "Boeing Co.", price: "$198.34", change: "-2.18%" },
    { symbol: "DIS", name: "Walt Disney", price: "$89.23", change: "-1.56%" },
  ];

  // Index stocks data
  const [selectedIndex, setSelectedIndex] = useState("sp500");
  const [sortBy, setSortBy] = useState("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const indexStocks: Record<string, Array<{ symbol: string; name: string; price: string; change: string; marketCap: string; volume: string }>> = {
    sp500: [
      { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%", marketCap: "$2.8T", volume: "52.3M" },
      { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.91", change: "+1.56%", marketCap: "$2.8T", volume: "23.1M" },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: "$141.80", change: "+1.12%", marketCap: "$1.8T", volume: "18.7M" },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: "$178.25", change: "+0.92%", marketCap: "$1.8T", volume: "31.2M" },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: "$485.09", change: "+5.21%", marketCap: "$1.2T", volume: "45.8M" },
      { symbol: "META", name: "Meta Platforms", price: "$334.92", change: "+4.12%", marketCap: "$860B", volume: "12.4M" },
      { symbol: "TSLA", name: "Tesla Inc.", price: "$238.45", change: "-0.87%", marketCap: "$756B", volume: "89.2M" },
      { symbol: "BRK.B", name: "Berkshire Hathaway", price: "$356.78", change: "+0.45%", marketCap: "$780B", volume: "3.2M" },
      { symbol: "JPM", name: "JPMorgan Chase", price: "$156.23", change: "+1.23%", marketCap: "$456B", volume: "8.9M" },
      { symbol: "V", name: "Visa Inc.", price: "$258.90", change: "+0.78%", marketCap: "$532B", volume: "5.6M" },
      { symbol: "JNJ", name: "Johnson & Johnson", price: "$156.45", change: "-0.23%", marketCap: "$378B", volume: "6.1M" },
      { symbol: "WMT", name: "Walmart Inc.", price: "$163.89", change: "+0.56%", marketCap: "$432B", volume: "7.8M" },
    ],
    nasdaq: [
      { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%", marketCap: "$2.8T", volume: "52.3M" },
      { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.91", change: "+1.56%", marketCap: "$2.8T", volume: "23.1M" },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: "$141.80", change: "+1.12%", marketCap: "$1.8T", volume: "18.7M" },
      { symbol: "AMZN", name: "Amazon.com Inc.", price: "$178.25", change: "+0.92%", marketCap: "$1.8T", volume: "31.2M" },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: "$485.09", change: "+5.21%", marketCap: "$1.2T", volume: "45.8M" },
      { symbol: "META", name: "Meta Platforms", price: "$334.92", change: "+4.12%", marketCap: "$860B", volume: "12.4M" },
      { symbol: "TSLA", name: "Tesla Inc.", price: "$238.45", change: "-0.87%", marketCap: "$756B", volume: "89.2M" },
      { symbol: "AVGO", name: "Broadcom Inc.", price: "$912.45", change: "+2.89%", marketCap: "$420B", volume: "2.1M" },
      { symbol: "ADBE", name: "Adobe Inc.", price: "$578.23", change: "+1.67%", marketCap: "$256B", volume: "1.8M" },
      { symbol: "NFLX", name: "Netflix Inc.", price: "$478.90", change: "+3.21%", marketCap: "$210B", volume: "4.5M" },
    ],
    dow: [
      { symbol: "AAPL", name: "Apple Inc.", price: "$178.72", change: "+2.34%", marketCap: "$2.8T", volume: "52.3M" },
      { symbol: "MSFT", name: "Microsoft Corp.", price: "$378.91", change: "+1.56%", marketCap: "$2.8T", volume: "23.1M" },
      { symbol: "JPM", name: "JPMorgan Chase", price: "$156.23", change: "+1.23%", marketCap: "$456B", volume: "8.9M" },
      { symbol: "V", name: "Visa Inc.", price: "$258.90", change: "+0.78%", marketCap: "$532B", volume: "5.6M" },
      { symbol: "JNJ", name: "Johnson & Johnson", price: "$156.45", change: "-0.23%", marketCap: "$378B", volume: "6.1M" },
      { symbol: "WMT", name: "Walmart Inc.", price: "$163.89", change: "+0.56%", marketCap: "$432B", volume: "7.8M" },
      { symbol: "UNH", name: "UnitedHealth Group", price: "$523.45", change: "+0.89%", marketCap: "$489B", volume: "2.3M" },
      { symbol: "HD", name: "Home Depot", price: "$312.67", change: "+1.12%", marketCap: "$312B", volume: "3.1M" },
      { symbol: "DIS", name: "Walt Disney", price: "$89.23", change: "-1.56%", marketCap: "$163B", volume: "8.9M" },
      { symbol: "BA", name: "Boeing Co.", price: "$198.34", change: "-2.18%", marketCap: "$118B", volume: "5.4M" },
    ],
  };

  const currentStocks = indexStocks[selectedIndex] || indexStocks.sp500;

  // Helper function to parse numeric values
  const parseValue = (value: string): number => {
    // Remove $ and % signs, and commas
    let cleaned = value.replace(/[$%,]/g, "");
    
    // Handle T, B, M, K suffixes for market cap
    let multiplier = 1;
    if (cleaned.endsWith("T")) {
      multiplier = 1000000000000;
      cleaned = cleaned.slice(0, -1);
    } else if (cleaned.endsWith("B")) {
      multiplier = 1000000000;
      cleaned = cleaned.slice(0, -1);
    } else if (cleaned.endsWith("M")) {
      multiplier = 1000000;
      cleaned = cleaned.slice(0, -1);
    } else if (cleaned.endsWith("K")) {
      multiplier = 1000;
      cleaned = cleaned.slice(0, -1);
    }
    
    return (parseFloat(cleaned) || 0) * multiplier;
  };

  // Sort stocks based on selected column
  const sortedStocks = [...currentStocks].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortBy) {
      case "symbol":
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case "name":
        aVal = a.name;
        bVal = b.name;
        break;
      case "price":
        aVal = parseValue(a.price);
        bVal = parseValue(b.price);
        break;
      case "change":
        aVal = parseValue(a.change);
        bVal = parseValue(b.change);
        break;
      case "marketCap":
        aVal = parseValue(a.marketCap);
        bVal = parseValue(b.marketCap);
        break;
      default:
        aVal = a.symbol;
        bVal = b.symbol;
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between lg:px-8">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Stox</span>
            </a>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                Markets
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                Stocks
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                Watchlist
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                News
              </Button>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            {/* Mobile search button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="flex md:hidden"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Dark mode toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Auth */}
            <SignedOut>
              <SignInModal>
                <Button>Sign In</Button>
              </SignInModal>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div 
          className="fixed inset-0 z-[100]"
          onClick={() => {
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" />
          
          {/* Search Container */}
          <div 
            className="relative flex justify-center pt-[20vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-xl mx-4 animate-in slide-in-from-top-4 fade-in duration-300">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search stocks, ETFs, indices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  className="w-full rounded-t-lg border border-border bg-background py-4 pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <kbd className="pointer-events-none h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground flex">
                    ESC
                  </kbd>
                </button>
              </div>
              
              {/* Search Results Dropdown */}
              <div className="rounded-b-lg border border-t-0 border-border bg-background shadow-lg max-h-[50vh] overflow-y-auto">
                {searchQuery.length === 0 ? (
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">Recent searches</p>
                    <div className="space-y-1">
                      {["AAPL", "TSLA", "GOOGL", "MSFT"].map((symbol) => (
                        <button
                          key={symbol}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => setSearchQuery(symbol)}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{symbol}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-border mt-3 pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Popular stocks</p>
                      <div className="space-y-1">
                        {[
                          { symbol: "NVDA", name: "NVIDIA Corporation", change: "+3.24%" },
                          { symbol: "META", name: "Meta Platforms Inc", change: "+1.87%" },
                          { symbol: "AMZN", name: "Amazon.com Inc", change: "+0.92%" },
                        ].map((stock) => (
                          <button
                            key={stock.symbol}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={() => setSearchQuery(stock.symbol)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{stock.symbol}</span>
                              <span className="text-muted-foreground">{stock.name}</span>
                            </div>
                            <span className="text-green-500 text-xs">{stock.change}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Results for &quot;{searchQuery}&quot;
                    </p>
                    <div className="space-y-1">
                      {stocks
                        .filter(
                          (stock) =>
                            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            stock.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((stock) => (
                          <button
                            key={stock.symbol}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{stock.symbol}</span>
                              <span className="text-muted-foreground">{stock.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{stock.price}</span>
                              <span className={stock.up ? "text-green-500" : "text-red-500"}>
                                {stock.change}
                              </span>
                            </div>
                          </button>
                        ))}
                      {stocks.filter(
                        (stock) =>
                          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No results found for &quot;{searchQuery}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
            {indices.map((index) => (
              <Card key={index.name} className="py-4">
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
                      {index.change}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{index.value}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="h-12 w-full">
                    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`fill-${index.name.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
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
                        fill={`url(#fill-${index.name.replace(/\s/g, "")})`}
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Top Gainers, Losers & Watchlist */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Top Gainers */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                  <CardTitle className="text-base">Top Gainers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {topGainers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground text-sm">{stock.price}</p>
                      <p className="text-xs font-medium text-chart-3">{stock.change}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Losers */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-base">Top Losers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {topLosers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground text-sm">{stock.price}</p>
                      <p className="text-xs font-medium text-destructive">{stock.change}</p>
                    </div>
                  </div>
                ))}
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
                            <ChevronDown className="h-4 w-4 opacity-50" />
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
                <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
                  <button
                    onClick={() => handleSort("symbol")}
                    className="flex items-center hover:text-foreground transition-colors text-left"
                  >
                    Symbol
                    <SortIndicator column="symbol" />
                  </button>
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-foreground transition-colors text-left"
                  >
                    Name
                    <SortIndicator column="name" />
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
                    onClick={() => handleSort("marketCap")}
                    className="flex items-center justify-end hover:text-foreground transition-colors"
                  >
                    Market Cap
                    <SortIndicator column="marketCap" />
                  </button>
                </div>
                {/* Stock rows */}
                <div className="divide-y divide-border">
                  {sortedStocks.map((stock) => (
                    <div
                      key={stock.symbol}
                      className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="font-semibold text-foreground">{stock.symbol}</div>
                      <div className="text-muted-foreground text-sm hidden md:block">{stock.name}</div>
                      <div className="text-right font-medium">{stock.price}</div>
                      <div className={`text-right font-medium ${stock.change.startsWith("+") ? "text-chart-3" : "text-destructive"}`}>
                        {stock.change}
                      </div>
                      <div className="text-right text-muted-foreground text-sm hidden md:block">{stock.marketCap}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}