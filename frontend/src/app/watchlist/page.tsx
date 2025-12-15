"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { StockProfileDialog } from "@/components/stocks/stock-profile-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon, Star, MoreHorizontal } from "lucide-react";
import { Stock, StockTable } from "@/components/market/stock-table";
import { useSearch } from "@/context/search-context";
import {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
  StockQuote,
  Watchlist,
} from "@/lib/api";





type WatchlistHeaderProps = {
  onNewStockClick: () => void;
  watchlists: Record<string, Watchlist>;
  setWatchlist: (watchlist: Watchlist) => void;
  watchlist: Watchlist;
};


const allColumns: Record<string, { name: string; visible: boolean }> = {
  ticker: { name: "Ticker", visible: true },
  companyName: { name: "Company Name", visible: true },
  price: { name: "Price", visible: true },
  dailyChange: { name: "Daily Change", visible: true },
  weeklyChange: { name: "Weekly Change", visible: false },
  monthlyChange: { name: "Monthly Change", visible: false },
  marketCap: { name: "Market Cap", visible: false },
  volume: { name: "Volume", visible: true },
  peRatio: { name: "P/E Ratio", visible: false },
  
};

function WatchlistHeader({ onNewStockClick, watchlists, setWatchlist, watchlist }: WatchlistHeaderProps) {



  return (
    <div className="flex items-center justify-between mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <h1 className="text-2xl font-bold text-foreground">My First Stock Watchlist</h1>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {Object.entries(watchlists).map(([key, watchlist]) => (
            <DropdownMenuCheckboxItem
              key={key}
              onCheckedChange={() => setWatchlist(watchlist)}
            >
              {watchlist?.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-2">
        <Button onClick={onNewStockClick} className="text-white">
          <PlusIcon className="h-4 w-4" />
          New Stock
        </Button>
        <Button variant="secondary" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function WatchlistTabs() {
  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        <a
          href="#"
          className="border-primary text-primary whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
        >
          Stocks
        </a>
        <a
          href="#"
          className="border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
        >
          Market Overview
        </a>
        <a
          href="#"
          className="border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
        >
          Sectors
        </a>
      </nav>
    </div>
  );
}

function EmptyState({ onAddStockClick }: { onAddStockClick: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="flex justify-center mb-4">
        <Star className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">Your stock watchlist is empty</h2>
      <p className="text-muted-foreground mt-2 mb-4">
        Add stocks to track prices, performance, and key metrics in one place.
      </p>
      <Button onClick={onAddStockClick} className="text-white">
        <PlusIcon className="h-4 w-4" />
        Add your first stock
      </Button>
    </div>
  );
}

const mapStockQuoteToStock = (quote: StockQuote): Stock => ({
  id: quote.symbol,
  ticker: quote.symbol,
  companyName: quote.symbol, // Placeholder, ideally from profile
  price: quote.price,
  dailyChange: quote.changePercent ?? 0,
  weeklyChange: 0, // Placeholder
  monthlyChange: 0, // Placeholder
  marketCap: 0, // Placeholder
  volume: quote.volume,
  peRatio: 0, // Placeholder
  last30Days: [], // Placeholder
});

export default function WatchlistPage() {

  const [watchlists, setWatchlists] = useState<Record<string, Watchlist>>({
    default: {
      id: "default",
      name: "My First Stock Watchlist",
      userId: "user123",
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
  const [watchlist, setWatchlist] = useState<Watchlist>(watchlists["default"]);

  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>(watchlist.items);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const { openSearch } = useSearch();

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      const watchlist = await getWatchlist("default");
      setStocks(watchlist?.items ? watchlist.items : []);
      setLoading(false);
    };
    fetchWatchlist();
  }, []);



  const handleSearchSelect = async (symbol: string) => {
    const newStock = await addToWatchlist(watchlist.id, symbol);
    if (newStock) {
      setStocks(prevStocks => [...prevStocks, newStock.items.find(item => item.ticker === symbol)!]);
    }
  };

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    setProfileDialogOpen(true);
  };

  const handleRemoveStock = async (ticker: string) => {
    const { success } = await removeFromWatchlist(watchlist.id, ticker);
    if (success) {
      setStocks(prevStocks => prevStocks.filter(stock => stock.ticker !== ticker));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onStockSelect={handleSearchSelect} />

      <main className="pt-20 pb-8 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <WatchlistHeader
            onNewStockClick={openSearch}
            watchlists={watchlists}
            setWatchlist={setWatchlist}
            watchlist={watchlist}
          />
          <WatchlistTabs />
          <div className="mt-8">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : stocks.length === 0 ? (
              <EmptyState onAddStockClick={openSearch} />
            ) : (
              <StockTable
                stocks={stocks}
                onStockClick={handleStockClick}
                onRemoveStock={handleRemoveStock}
                columns={visibleColumns}
                loading={loading}
              />
            )}
          </div>
        </div>

        <StockProfileDialog
          symbol={selectedStock}
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
      </main>
    </div>
  );
}