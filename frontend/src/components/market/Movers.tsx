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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { formatPrice, formatChange, formatVolume, MarketMover } from "@/lib/api";

function MoverTable({ movers, onSelect, type }: { movers: MarketMover[], onSelect: (symbol: string) => void, type: "gainer" | "loser" }) {
  const changeColor = type === "gainer" ? "text-green-600" : "text-red-600";
  
  if (movers.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-2">No {type === "gainer" ? "gainers" : "losers"}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Volume</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movers.map((stock) => (
          <TableRow key={stock.symbol} onClick={() => onSelect(stock.symbol)} className="cursor-pointer">
            <TableCell className="font-semibold">{stock.symbol}</TableCell>
            <TableCell className="text-right font-medium">{formatPrice(stock.price)}</TableCell>
            <TableCell className={`text-right font-medium ${changeColor}`}>{formatChange(stock.percent_change)}</TableCell>
            <TableCell className="text-right text-muted-foreground">{formatVolume(stock.volume)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

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
        <CardHeader>
          <div className="flex items-center gap-2">
            <ChevronUp strokeWidth={3} className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Top Gainers</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-full py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MoverTable movers={topGainers} onSelect={onSelect} type="gainer" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ChevronDown strokeWidth={3} className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">Top Losers</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-full py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MoverTable movers={topLosers} onSelect={onSelect} type="loser" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
