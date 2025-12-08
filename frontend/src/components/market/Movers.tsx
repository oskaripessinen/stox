"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { formatPrice, formatChange, formatMarketCap } from "@/lib/api";

type MarketMover = {
  symbol: string;
  price: number;
  change: number;
  percent_change: number;
  marketCap?: number;
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-90">
      <Card>
        <CardHeader className="">
          <div className="flex items-center gap-2">
            <ChevronUp strokeWidth={3} className="h-5 w-5 text-chart-3" />
            <CardTitle className="text-base mb-0 pb-0">Top Gainers</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-full">
          {/* Column headers */}
          <div className="hidden md:flex items-center justify-between text-xs text-muted-foreground px-2 -mt-1 mb-2">
            <div className="w-1/4">Symbol</div>
            <div className="w-1/4 text-right">Price</div>
            <div className="w-1/4 text-right">Change</div>
            <div className="w-1/4 text-right">Mkt Cap</div>
          </div>
          {loading ? (
            <div className="flex justify-center h-full items-center -mt-7">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : topGainers.length > 0 ? (
            topGainers.map((stock, i) => (
              <div
                key={stock.symbol}
                className={`flex items-center justify-between py-4 px-3 hover:bg-muted/50 transition-colors cursor-pointer ${i == 4 ? "border-y" : "border-t"} rounded-0`}
                onClick={() => onSelect(stock.symbol)}

              >
                <div className="w-1/4">
                  <p className="font-semibold text-foreground text-xs">{stock.symbol}</p>
                </div>
                <div className="w-1/4 text-right">
                  <p className="font-semibold text-foreground text-xs">{formatPrice(stock.price)}</p>
                </div>
                <div className="w-1/4 text-right">
                  <p className="text-xs font-medium text-chart-3">{formatChange(stock.percent_change)}</p>
                </div>
                <div className="w-1/4 text-right">
                  <p className="text-xs text-muted-foreground">{stock.marketCap && stock.marketCap > 0 ? formatMarketCap(stock.marketCap) : "-"}</p>
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
        <CardContent className="h-full justify-center items-center">
          {/* Column headers */}
          <div className="hidden md:flex items-center justify-between text-xs text-muted-foreground px-2 -mt-1 mb-2">
            <div className="w-1/4">Symbol</div>
            <div className="w-1/4 text-right">Price</div>
            <div className="w-1/4 text-right">Change</div>
            <div className="w-1/4 text-right">Mkt Cap</div>
          </div>
          {loading ? (
            <div className="flex justify-center h-full items-center -mt-7">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : topLosers.length > 0 ? (
            topLosers.map((stock, i) => (
              <div
                key={stock.symbol}
                className={`flex items-center justify-between py-4 px-3 hover:bg-muted/50 transition-colors cursor-pointer ${i == 4 ? "border-y" : "border-t"} rounded-0`}
                onClick={() => onSelect(stock.symbol)}
              >
                <div className="w-1/4">
                  <p className="font-semibold text-foreground text-xs">{stock.symbol}</p>
                </div>
                <div className="w-1/4 text-right">
                  <p className="font-semibold text-foreground text-xs">{formatPrice(stock.price)}</p>
                </div>
                <div className="w-1/4 text-right">
                  <p className="text-xs font-medium text-destructive">{formatChange(stock.percent_change)}</p>
                </div>
                <div className="w-1/4 text-right">
                  <p className="text-xs text-muted-foreground">{stock.marketCap && stock.marketCap > 0 ? formatMarketCap(stock.marketCap) : "-"}</p>
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
