"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { formatPrice, formatVolume, formatChange } from "@/lib/api";

type StockQuote = {
  symbol: string;
  price: number;
  changePercent: number | null;
  volume: number;
};

export default function StockList({
  sortedStocks,
  loading,
  error,
  onStockClick,
  sortBy,
  sortOrder,
  onSort,
}: {
  sortedStocks: StockQuote[];
  loading: boolean;
  error: string | null;
  onStockClick: (symbol: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (col: string) => void;
}) {
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortOrder === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle>Stocks</CardTitle>
            <CardDescription>Browse stocks by index</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 px-3 gap-2">
                    Select Index
                    <ChevronDown strokeWidth={2} className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSort("sp500")}>S&P 500</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSort("nasdaq")}>NASDAQ</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSort("dow")}>DOW JONES</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden md:grid grid-cols-4 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
          <button onClick={() => onSort("symbol")} className="flex items-center hover:text-foreground transition-colors text-left">
            Symbol
            <SortIndicator column="symbol" />
          </button>
          <button onClick={() => onSort("price")} className="flex items-center justify-end hover:text-foreground transition-colors">
            Price
            <SortIndicator column="price" />
          </button>
          <button onClick={() => onSort("change")} className="flex items-center justify-end hover:text-foreground transition-colors">
            Change
            <SortIndicator column="change" />
          </button>
          <button onClick={() => onSort("volume")} className="flex items-center justify-end hover:text-foreground transition-colors">
            Volume
            <SortIndicator column="volume" />
          </button>
        </div>
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
                onClick={() => onStockClick(stock.symbol)}
              >
                <div className="font-semibold text-foreground">{stock.symbol}</div>
                <div className="text-right font-medium">{formatPrice(stock.price)}</div>
                <div className={`text-right font-medium ${(stock.changePercent ?? 0) >= 0 ? "text-chart-3" : "text-destructive"}`}>
                  {formatChange(stock.changePercent)}
                </div>
                <div className="text-right text-muted-foreground text-sm hidden md:block">{formatVolume(stock.volume)}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
