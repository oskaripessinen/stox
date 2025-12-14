"use client";

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Star, X } from "lucide-react";

import { formatMarketCap, formatVolume } from "@/lib/api";

import { AreaChart, Area, ResponsiveContainer } from "recharts";



type Column = {

    name: string;

    visible: boolean;

};



type Columns = Record<string, Column>;



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



    last30Days: any[];



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

    <TableCell>

        <div className="h-4 w-4 bg-muted rounded"></div>

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



  return (

    <Table>

      <TableHeader>

        <TableRow>

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
              <TableRow key={stock.id} onClick={() => onStockClick(stock.ticker)} className="cursor-pointer group">
                <TableCell className="w-10">{index + 1}</TableCell>
                {columns.ticker.visible && <TableCell className="font-medium">{stock.ticker}</TableCell>}
                {columns.companyName.visible && <TableCell>{stock.companyName}</TableCell>}
                {columns.price.visible && <TableCell>${stock.price.toFixed(2)}</TableCell>}
                {columns.dailyChange.visible && (
                  <TableCell>
                    {typeof stock.dailyChange === 'number' ? (
                      <Badge variant={stock.dailyChange >= 0 ? "success" : "destructive"}>
                        {stock.dailyChange.toFixed(1)}%
                      </Badge>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                )}
                {columns.weeklyChange.visible && <TableCell>
                  <Badge variant={stock.weeklyChange >= 0 ? "success" : "destructive"}>
                    {stock.weeklyChange.toFixed(1)}%
                  </Badge>
                </TableCell>}
                {columns.monthlyChange.visible && <TableCell>
                  <Badge variant={stock.monthlyChange >= 0 ? "success" : "destructive"}>
                    {stock.monthlyChange.toFixed(1)}%
                  </Badge>
                </TableCell>}
                {columns.marketCap.visible && <TableCell>{typeof stock.marketCap === 'number' ? formatMarketCap(stock.marketCap) : 'N/A'}</TableCell>}
                {columns.volume.visible && <TableCell>{formatVolume(stock.volume)}</TableCell>}
                {columns.peRatio.visible && <TableCell>{stock.peRatio ?? 'N/A'}</TableCell>}
                {columns.last30Days.visible && <TableCell>
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

              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  );
}
