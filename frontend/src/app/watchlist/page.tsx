"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { StockProfileDialog } from "@/components/stocks/stock-profile-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon, Star, Settings, MoreHorizontal } from "lucide-react";
import { Stock, StockTable } from "@/components/market/stock-table";
import { useSearch } from "@/context/search-context";
import { getStockDetails, getStockHistory } from "@/lib/api";

const allColumns = {
  ticker: { name: "Ticker", visible: true },
  companyName: { name: "Company Name", visible: true },
  price: { name: "Price", visible: true },
  dailyChange: { name: "1D %", visible: true },
  weeklyChange: { name: "1W %", visible: true },
  monthlyChange: { name: "1M %", visible: true },
  marketCap: { name: "Market Cap", visible: true },
  volume: { name: "Volume", visible: true },
  peRatio: { name: "P/E", visible: false },
  last30Days: { name: "Last 30 Days", visible: false },
};

type ColumnKey = keyof typeof allColumns;

type WatchlistHeaderProps = {
  onNewStockClick: () => void;
  columns: typeof allColumns;
  onColumnToggle: (key: ColumnKey) => void;
};

function WatchlistHeader({ onNewStockClick, columns, onColumnToggle }: WatchlistHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My First Stock Watchlist</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onNewStockClick}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Stock
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Customize</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(columns).map(([key, { name, visible }]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={visible}
                onCheckedChange={() => onColumnToggle(key as ColumnKey)}
              >
                {name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function WatchlistTabs() {
  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
            <Button onClick={onAddStockClick}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add your first stock
            </Button>
        </div>
    );
}


export default function WatchlistPage() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [visibleColumns, setVisibleColumns] = useState(allColumns);
  const { openSearch } = useSearch();

  const handleColumnToggle = (columnKey: ColumnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible },
    }));
  };

  const handleSearchSelect = async (symbol: string) => {
    const [newStockDetails, history] = await Promise.all([
      getStockDetails(symbol),
      getStockHistory(symbol, "1Day", 30),
    ]);

    if (newStockDetails && newStockDetails.profile && newStockDetails.quote) {
      const newStock: Stock = {
        id: newStockDetails.profile.symbol,
        ticker: newStockDetails.profile.symbol,
        companyName: newStockDetails.profile.name,
        price: newStockDetails.quote.price,
        dailyChange: newStockDetails.quote.changePercent ?? 0,
        weeklyChange: 0, // Placeholder
        monthlyChange: 0, // Placeholder
        marketCap: newStockDetails.profile.marketCap,
        volume: newStockDetails.quote.volume,
        peRatio: 0, // Placeholder
        last30Days: history?.bars || [],
      };

      setStocks(prevStocks => [...prevStocks, newStock]);
    }
  };

  const handleStockClick = (symbol: string) => {
    setSelectedStock(symbol);
    setProfileDialogOpen(true);
  }

  const handleRemoveStock = (ticker: string) => {
    setStocks(prevStocks => prevStocks.filter(stock => stock.ticker !== ticker));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onStockSelect={handleSearchSelect} />

      <main className="pt-20 pb-8 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <WatchlistHeader onNewStockClick={openSearch} columns={visibleColumns} onColumnToggle={handleColumnToggle} />
          <WatchlistTabs />
          <div className="mt-8">
            {stocks.length === 0 ? <EmptyState onAddStockClick={openSearch} /> : <StockTable stocks={stocks} onStockClick={handleStockClick} onRemoveStock={handleRemoveStock} columns={visibleColumns} loading={false} />}
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