"use client";

import { useState, useEffect, useRef } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { Button } from "@/components/ui/button";
import { Search, Sun, Moon, TrendingUp, Loader2 } from "lucide-react";
import { searchStocks, SearchResult } from "@/lib/api";

interface HeaderProps {
  onStockSelect?: (symbol: string) => void;
}

export function Header({ onStockSelect }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

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

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const timeoutId = setTimeout(async () => {
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSelectStock = (symbol: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    onStockSelect?.(symbol);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 px-10 items-center justify-between">
          <div className="flex items-center gap-6">
              <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold font-orbitron">Stox</span>
            </a>

            <nav className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
              >
                Markets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
              >
                Stocks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
              >
                Watchlist
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
              >
                News
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
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
                <span className="text-xs mt-[1px]">⌘</span>K
              </kbd>
            </Button>

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
              <UserDropdown />
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
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" />

          <div className="relative flex justify-center pt-[20vh] pointer-events-none">
            <div
              className="w-full max-w-xl mx-4 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-4 active:border-0 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
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
                  className="w-full rounded-t-lg border border-border bg-background py-4 pl-12 pr-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
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

              <div className="rounded-b-lg border border-t-0 border-border bg-background shadow-lg max-h-[50vh] overflow-y-auto">
                {searchQuery.length === 0 ? (
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Popular stocks
                    </p>
                    <div className="space-y-1">
                      {["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA"].map((symbol) => (
                        <button
                          key={symbol}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => handleSelectStock(symbol)}
                        >
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">
                      Results for &quot;{searchQuery}&quot;
                    </p>
                    <div className="space-y-1">
                      {searchResults.map((result) => (
                        <button
                          key={result.symbol}
                          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onClick={() => handleSelectStock(result.symbol)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{result.symbol}</span>
                            <span className="text-muted-foreground truncate max-w-[200px]">
                              {result.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {result.type} • {result.exchange}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No results found for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
