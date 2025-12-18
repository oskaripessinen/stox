"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { formatPrice, formatVolume, formatChange, getIndexConstituents, getMultipleQuotes } from "@/lib/api";
import { indices as mockIndices } from "@/lib/mock-data";

type StockQuote = {
  symbol: string;
  price: number;
  changePercent: number | null;
  volume: number;
};

function SortableHeader({
  column,
  sortBy,
  sortOrder,
  onSort,
  children,
  className,
}: {
  column: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (col: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const isSorted = sortBy === column;
  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(column)}
        className={`flex items-center hover:text-foreground transition-colors w-full ${
          className?.includes('text-right') ? 'justify-end' : ''
        }`}
      >
        {children}
        {isSorted ? (
          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
        ) : (
          <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}

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
  indices?: string[];
}) {
  const [selectedIndexSymbol, setSelectedIndexSymbol] = useState<string | null>("^GSPC");
  const [selectedIndexLabel, setSelectedIndexLabel] = useState<string | null>("S&P 500");

  const [constituentsLoading, setConstituentsLoading] = useState(false);
  const [constituents, setConstituents] = useState<StockQuote[] | null>(null);
  const [constituentsError, setConstituentsError] = useState<string | null>(null);

  const INDEX_OPTIONS: { name: string; symbol: string }[] = [
    { name: "S&P 500", symbol: "^GSPC" },
    { name: "NASDAQ", symbol: "^IXIC" },
    { name: "DOW JONES", symbol: "^DJI" },
    { name: "RUSSELL 2000", symbol: "^RUT" },
  ];

  useEffect(() => {
    if (!selectedIndexSymbol) {
      setConstituents(null);
      setSelectedIndexLabel(null);
      return;
    }

    let cancelled = false;
    async function fetchConstituents() {
      setConstituentsLoading(true);
      setConstituentsError(null);
      try {
        const res = await getIndexConstituents(selectedIndexSymbol!, 20, 0);
        if (!res) {
          if (!cancelled) setConstituents([]);
          if (!cancelled) setConstituentsError("Failed to fetch constituents (network or API error)");
          return;
        }
        if (!res.constituents || res.constituents.length === 0) {
          if (!cancelled) setConstituents([]);
          if (!cancelled) setConstituentsError("No constituents returned for this index");
          return;
        }

        const symbols = res.constituents.map((c) => c.symbol).slice(0, 20);
        const quotes = await getMultipleQuotes(symbols);
        const mapped = quotes.map((q) => ({ symbol: q.symbol, price: q.price, changePercent: q.changePercent, volume: q.volume }));
        if (!cancelled) setConstituents(mapped);
      } catch (e) {
        console.error("Failed to fetch constituents or quotes:", e);
        if (!cancelled) setConstituents([]);
        if (!cancelled) setConstituentsError(String(e || "Unknown error"));
      } finally {
        if (!cancelled) setConstituentsLoading(false);
      }
    }

    fetchConstituents();

    return () => {
      cancelled = true;
    };
  }, [selectedIndexSymbol]);
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
                    {selectedIndexLabel ?? "Select index"}
                    <ChevronDown strokeWidth={2} className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {mockIndices && mockIndices.length > 0 ? (
                    mockIndices.map((idx) => {
                      const opt = INDEX_OPTIONS.find((o) => o.name.toLowerCase() === idx.name.toLowerCase());
                      const symbol = opt ? opt.symbol : idx.name;
                      return (
                        <DropdownMenuItem
                          key={idx.name}
                          onClick={() => {
                            setSelectedIndexSymbol(symbol);
                            setSelectedIndexLabel(idx.name);
                          }}
                        >
                          {idx.name}
                        </DropdownMenuItem>
                      );
                    })
                  ) : (
                    <DropdownMenuItem disabled>No indices available</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="symbol" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort}>
                Symbol
              </SortableHeader>
              <SortableHeader column="price" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} className="text-right">
                Price
              </SortableHeader>
              <SortableHeader column="change" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} className="text-right">
                Change
              </SortableHeader>
              <SortableHeader column="volume" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} className="text-right hidden md:table-cell">
                Volume
              </SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedIndexSymbol ? (
              constituentsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                  </TableCell>
                </TableRow>
              ) : constituents && constituents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="text-muted-foreground">{constituentsError ?? "No constituents available"}</div>
                    {constituentsError ? (
                      <div className="mt-2">
                        <Button variant="ghost" onClick={() => setSelectedIndexSymbol((s) => { setSelectedIndexSymbol(s); return s; })}>Retry</Button>
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              ) : (
                (constituents || []).map((stock) => (
                  <TableRow
                    key={stock.symbol}
                    onClick={() => onStockClick(stock.symbol)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-semibold">{stock.symbol}</TableCell>
                    <TableCell className="text-right font-medium">{formatPrice(stock.price)}</TableCell>
                    <TableCell className={`text-right font-medium ${(stock.changePercent ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatChange(stock.changePercent)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground hidden md:table-cell">{formatVolume(stock.volume)}</TableCell>
                  </TableRow>
                ))
              )
            ) : loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-destructive">{error}</TableCell>
              </TableRow>
            ) : sortedStocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No stocks found</TableCell>
              </TableRow>
            ) : (
              sortedStocks.map((stock) => (
                <TableRow
                  key={stock.symbol}
                  onClick={() => onStockClick(stock.symbol)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-semibold">{stock.symbol}</TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(stock.price)}</TableCell>
                  <TableCell className={`text-right font-medium ${(stock.changePercent ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatChange(stock.changePercent)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground hidden md:table-cell">{formatVolume(stock.volume)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
