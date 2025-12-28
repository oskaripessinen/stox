"use client";

import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Percent change is displayed as plain colored text now (was a Badge)
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { formatMarketCap, formatVolume } from "@/lib/api";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

type Column = {
    name: string;
    visible: boolean;
};

type Columns = Record<string, Column>;

interface HistoryData {
    timestamp: string;
    close: number;
}

export type Stock = {
    id: string;
    ticker: string;
    companyName: string;
    price: number;
    dailyChange: number | null;
    weeklyChange: number;
    monthlyChange: number;
    marketCap?: number;
    volume: number;
    peRatio?: number;
    last30Days: HistoryData[];
};



const LoadingSkeletonRow = ({ columns }: { columns: Columns }) => (

  <TableRow>
    <TableCell className="w-10">
      <div className="h-4 bg-muted rounded"></div>
    </TableCell>
    {columns.ticker.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.companyName.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.price.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.dailyChange.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.weeklyChange.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.monthlyChange.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.marketCap.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.volume.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.peRatio.visible && <TableCell><div className="h-4 bg-muted rounded"></div></TableCell>}
    {columns.last30Days.visible && <TableCell><div className="h-10 w-20 bg-muted rounded"></div></TableCell>}
    <TableCell className="text-right pr-4">
      <div className="h-4 w-4 bg-muted rounded ml-auto" />
    </TableCell>
  </TableRow>

);



export type StockTableProps = {
    stocks: Stock[];
    onStockClick: (ticker: string) => void;
    onRemoveStock: (ticker: string) => void;
    columns: Columns;
    loading: boolean;
};



export function StockTable({ stocks = [], onStockClick, onRemoveStock, columns, loading = false }: StockTableProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTicker, setPendingTicker] = useState<string | null>(null);

  const openConfirm = (ticker: string) => {
    setPendingTicker(ticker);
    setConfirmOpen(true);
  };

  const confirmRemove = () => {
    if (!pendingTicker) return;
    onRemoveStock(pendingTicker);
    setConfirmOpen(false);
    setPendingTicker(null);
  };
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10">#</TableHead>
          {columns.ticker.visible && <TableHead>Ticker</TableHead>}
          {columns.companyName.visible && <TableHead>Company Name</TableHead>}
          {columns.price.visible && <TableHead>Price</TableHead>}
          {columns.dailyChange.visible && <TableHead>1D %</TableHead>}
          {columns.weeklyChange.visible && <TableHead>1W %</TableHead>}
          {columns.monthlyChange.visible && <TableHead>1M %</TableHead>}
          {columns.marketCap.visible && <TableHead>Market Cap</TableHead>}
          {columns.volume.visible && <TableHead>Volume</TableHead>}
          {columns.peRatio.visible && <TableHead>P/E</TableHead>}
          {columns.last30Days.visible && <TableHead>Last 30 Days</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => <LoadingSkeletonRow key={i} columns={columns} />)}
          </>
        ) : (
          stocks.map((stock, index) => {
            const chartData = stock.last30Days.map(d => ({...d, time: new Date(d.timestamp).getTime()}));
            const isPositive = chartData.length > 1 ? chartData[chartData.length - 1].close > chartData[0].close : true;
            return (
              <TableRow key={stock.id} className="cursor-pointer group">
                <TableCell className="w-10" onClick={() => onStockClick(stock.ticker)}>{index + 1}</TableCell>
                {columns.ticker.visible && <TableCell className="font-medium" onClick={() => onStockClick(stock.ticker)}>{stock.ticker}</TableCell>}
                {columns.companyName.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>{stock.companyName}</TableCell>}
                {columns.price.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>${stock.price.toFixed(2)}</TableCell>}
                {columns.dailyChange.visible && (
                  <TableCell onClick={() => onStockClick(stock.ticker)}>
                    {typeof stock.dailyChange === "number" ? (
                      <span className={`flex items-center gap-1 ${stock.dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stock.dailyChange >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {Math.abs(stock.dailyChange).toFixed(1)}%
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                )}
                {columns.weeklyChange.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>
                  <span className={`flex items-center gap-1 ${stock.weeklyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stock.weeklyChange >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {Math.abs(stock.weeklyChange).toFixed(1)}%
                  </span>
                </TableCell>}
                {columns.monthlyChange.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>
                  <span className={`flex items-center gap-1 ${stock.monthlyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stock.monthlyChange >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {Math.abs(stock.monthlyChange).toFixed(1)}%
                  </span>
                </TableCell>}
                {columns.marketCap.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>{typeof stock.marketCap === 'number' ? formatMarketCap(stock.marketCap) : 'N/A'}</TableCell>}
                {columns.volume.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>{formatVolume(stock.volume)}</TableCell>}
                {columns.peRatio.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>{stock.peRatio ?? 'N/A'}</TableCell>}
                {columns.last30Days.visible && <TableCell onClick={() => onStockClick(stock.ticker)}>
                  <div className="w-20 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`color-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={isPositive ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="close" stroke={isPositive ? "#22c55e" : "#ef4444"} fillOpacity={1} fill={`url(#color-${stock.id})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TableCell>}
                <TableCell className="text-right pr-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${stock.ticker}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirm(stock.ticker);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
      {/* Confirmation dialog for removing a stock */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>Remove stock from watchlist</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{pendingTicker}</strong> from your watchlist? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRemove}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Table>
  );
}
