"use client";

import React from "react";
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
import { formatPrice, formatVolume, formatChange } from "@/lib/api";

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
}) {
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
                  {/* These should probably trigger a state change, not a sort */}
                  <DropdownMenuItem>S&P 500</DropdownMenuItem>
                  <DropdownMenuItem>NASDAQ</DropdownMenuItem>
                  <DropdownMenuItem>DOW JONES</DropdownMenuItem>
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
            {loading ? (
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
