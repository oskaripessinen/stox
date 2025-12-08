"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { formatPrice, formatChange } from "@/lib/api";

type MarketMover = {
  symbol: string;
  price: number;
  change: number;
  percent_change: number;
};

export default function Movers({
  topGainers,
  topLosers,
  loading,
  onSelect,
}: {
  topGainers: MarketMover[];
  topLosers: MarketMover[];
  loading: boolean;
  onSelect: (symbol: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="">
          <div className="flex items-center gap-2">
            <ChevronUp strokeWidth={3} className="h-5 w-5 text-chart-3" />
            <CardTitle className="text-base mb-0 pb-0">Top Gainers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : topGainers.length > 0 ? (
            topGainers.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-1 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelect(stock.symbol)}
              >
                <div>
                  <p className="font-semibold text-foreground text-sm">{stock.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">{formatPrice(stock.price)}</p>
                  <p className="text-xs font-medium text-chart-3">+{stock.change.toFixed(2)} ({formatChange(stock.percent_change)})</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No gainers</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="">
          <div className="flex items-center gap-2">
            <ChevronDown strokeWidth={3} className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Top Losers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : topLosers.length > 0 ? (
            topLosers.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-1 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onSelect(stock.symbol)}
              >
                <div>
                  <p className="font-semibold text-foreground text-sm">{stock.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">{formatPrice(stock.price)}</p>
                  <p className="text-xs font-medium text-destructive">{stock.change.toFixed(2)} ({formatChange(stock.percent_change)})</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No losers</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
