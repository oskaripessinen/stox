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
  DropdownMenuSeparator,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { PlusIcon, Star, MoreHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { Stock, StockTable } from "@/components/market/stock-table";
import { useSearch } from "@/context/search-context";
import {
  addToWatchlist,
  getWatchlists,
  createWatchlist,
  removeFromWatchlist,
  getMultipleQuotes,
  Watchlist,
  WatchlistItem,
} from "@/lib/api";
import { toast } from "sonner";
import { CreateWatchlistDialog } from "@/components/market/create-watchlist-dialog";






type WatchlistHeaderProps = {
  onNewStockClick: () => void;
  onCreateWatchlist: () => void;
  watchlists: Record<string, Watchlist>;
  setWatchlist: (watchlist: Watchlist | null) => void;
  watchlist: Watchlist | null;
};


const allColumns: Record<string, { name: string; visible: boolean }> = {
  ticker: { name: "Ticker", visible: true },
  companyName: { name: "Company Name", visible: true },
  price: { name: "Price", visible: true },
  dailyChange: { name: "Daily Change", visible: true },
  weeklyChange: { name: "Weekly Change", visible: false },
  monthlyChange: { name: "Monthly Change", visible: false },
  last30Days: { name: "Last 30 Days", visible: false },
  marketCap: { name: "Market Cap", visible: false },
  volume: { name: "Volume", visible: true },
  peRatio: { name: "P/E Ratio", visible: false },
  
};

function WatchlistHeader({ onNewStockClick, onCreateWatchlist, watchlists, setWatchlist, watchlist }: WatchlistHeaderProps) {



  return (
    <div className="flex items-center justify-between mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer">
            <h1 className="text-2xl font-bold text-foreground">{watchlist?.name ?? "My First Stock Watchlist"} </h1>
            <ChevronDown/>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80">
          {Object.entries(watchlists).map(([key, wl]) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={watchlist?.id === key}
              onCheckedChange={() => setWatchlist(wl)}
            >
              {wl?.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCreateWatchlist}>
            <PlusIcon className="size-4" color="white"/>Create New Watchlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-2">
        <Button onClick={onNewStockClick} className="text-white text-xs font-semibold">
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


export default function WatchlistPage() {

  const [watchlists, setWatchlists] = useState<Record<string, Watchlist>>({});
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);

  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const [createWatchlistOpen, setCreateWatchlistOpen] = useState(false);
  const { openSearch } = useSearch();

  const mapItemsToStocks = (items?: WatchlistItem[]) =>
    (items ?? []).map((it) => ({
      id: it.symbol,
      ticker: it.symbol,
      companyName: it.symbol,
      price: 0,
      dailyChange: 0,
      weeklyChange: 0,
      monthlyChange: 0,
      marketCap: 0,
      volume: 0,
      peRatio: 0,
      last30Days: [],
    } as Stock));

  const hydrateStockPrices = async (rows: Stock[]) => {
    try {
      const symbols = rows.map((r) => r.ticker);
      if (symbols.length === 0) return;
      const quotes = await getMultipleQuotes(symbols);
      const qmap = new Map(quotes.map((q) => [q.symbol, q]));
      setStocks((prev) =>
        rows.map((r) => {
          const q = qmap.get(r.ticker);
          return q
            ? {
                ...r,
                price: q.price,
                dailyChange: q.changePercent ?? r.dailyChange,
                volume: q.volume,
              }
            : r;
        })
      );
    } catch (err) {
      console.error("Failed to hydrate quotes:", err);
    }
  };

  const selectWatchlist = (wl: Watchlist | null) => {
    setWatchlist(wl);
    const rows = mapItemsToStocks(wl?.items);
    setStocks(rows);
    hydrateStockPrices(rows);
  };

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      try {
        const lists = await getWatchlists();
        if (lists.length === 0) {
          const created = await createWatchlist("My First Stock Watchlist");
          if (created) {
            setWatchlists({ [created.id]: created });
            selectWatchlist(created);
          } else {
            setStocks([]);
          }
        } else {
          const map: Record<string, Watchlist> = {};
          lists.forEach((wl: Watchlist) => (map[wl.id] = wl));
          setWatchlists(map);
          selectWatchlist(lists[0]);
        }
      } catch (err) {
        console.error("Failed to fetch watchlists:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, []);

  const handleCreateWatchlist = async (name: string) => {
    try {
      const created = await createWatchlist(name);
      if (created) {
        setWatchlists((prev) => ({ ...prev, [created.id]: created }));
        selectWatchlist(created);
        toast.success(`Created watchlist "${name}"`);
      }
    } catch (err) {
      console.error("Failed to create watchlist:", err);
      toast.error("Failed to create watchlist");
    }
  };

  const handleSearchSelect = async (symbol: string) => {
    if (!watchlist) return;
    const updated = await addToWatchlist(watchlist.id, symbol);
    if (updated) {
      setWatchlists((prev) => ({ ...prev, [updated.id]: updated }));
      selectWatchlist(updated);
      toast.success(`Added ${symbol} to ${watchlist.name}`);
    } else {
      toast.error(`Failed to add ${symbol} to watchlist`);
    }
  };

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    setProfileDialogOpen(true);
  };

  const handleRemoveStock = async (ticker: string) => {
    if (!watchlist) return;
    const { success } = await removeFromWatchlist(watchlist.id, ticker);
    if (success) {
      setStocks((prevStocks) => prevStocks.filter((stock) => stock.ticker !== ticker));
      setWatchlist((prev) => prev ? { ...prev, items: (prev.items ?? []).filter(i => i.symbol !== ticker) } as Watchlist : prev);
      setWatchlists((prev) => ({ ...prev, [watchlist.id]: { ...(prev[watchlist.id] ?? watchlist), items: (watchlist.items ?? []).filter(i => i.symbol !== ticker) } }));
      toast.success(`Removed ${ticker} from ${watchlist.name}`);
    } else {
      toast.error(`Failed to remove ${ticker} from watchlist`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onStockSelect={handleSearchSelect} />

      <main className="pt-20 pb-8 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <WatchlistHeader
            onNewStockClick={openSearch}
            onCreateWatchlist={() => setCreateWatchlistOpen(true)}
            watchlists={watchlists}
            setWatchlist={selectWatchlist}
            watchlist={watchlist}
          />
          <WatchlistTabs />
          <div className="mt-8">
            {loading ? (
              <div className="text-center">
                <Loader2 className="mx-auto animate-spin" />
              </div>
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

        <CreateWatchlistDialog
          open={createWatchlistOpen}
          onOpenChange={setCreateWatchlistOpen}
          onCreate={handleCreateWatchlist}
        />
      </main>
    </div>
  );
}