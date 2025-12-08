"use client";
import React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatPoints, getStockHistory, StockBar } from "@/lib/api";
import * as Recharts from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type IndexPoint = {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number | null;
  changePercent: number | null;
  up: boolean;
  data: Array<{ time: string; value: number }>;
  etf?: {
    symbol: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    up?: boolean;
  };
};

const formatBarTime = (ts: string | number) => {
    const d = typeof ts === "number" ? new Date(ts) : new Date(String(ts));

    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

// Remove unused function; keep simple formatting helpers inline where needed


export default function IndexCards({ indices, loading }: { indices: IndexPoint[]; loading: boolean }) {
  const [etfBarsMap, setEtfBarsMap] = useState<Record<string, StockBar[]>>({});

  // Mapping of index symbols to ETF tickers
  const indexToEtf: Record<string, string> = {
    '^GSPC': 'SPY',
    '^IXIC': 'QQQ',
    '^DJI': 'DIA',
    '^RUT': 'IWM',
  };

  useEffect(() => {
    // Load bars for ETFs for each index; only use ETF data (no Yahoo fallback)
    async function fetchEtfBars() {
      const etfSymbols = Array.from(new Set(Object.values(indexToEtf)));
      const candidateTimeframes = [
        { tf: '1Min', limit: 390 },
        { tf: '5Min', limit: 78 },
        { tf: '15Min', limit: 26 },
        { tf: '1Hour', limit: 6 },
        { tf: '1Day', limit: 1 },
      ];

      const map: Record<string, StockBar[]> = {};

      await Promise.all(etfSymbols.map(async (sym) => {
        for (const c of candidateTimeframes) {
          try {
            const data = await getStockHistory(sym, c.tf, c.limit);
            if (data && Array.isArray(data.bars) && data.bars.length > 0) {
              map[sym] = data.bars.map((b) => ({ ...b }));
              break;
            }
          } catch (e) {
            // ignore and try next timeframe
          }
        }
      }));

      setEtfBarsMap(map);
    }

    fetchEtfBars();
  }, [indices]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="py-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="h-7 w-24 bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))
      ) : (
        indices.map((index) => {

          return (
          <Card key={index.id} className="py-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>
                  {index.name}
                  {index.etf?.symbol ? (
                    <span className="ml-2 text-xs text-muted-foreground">· {index.etf.symbol}</span>
                  ) : null}
                </CardDescription>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    (index.etf?.up ?? index.up) ? "bg-chart-3/20 text-chart-3" : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {index.etf?.changePercent !== null && index.etf?.changePercent !== undefined
                    ? `${(index.etf.changePercent as number).toFixed(2)}%`
                    : index.changePercent !== null && index.changePercent !== undefined
                    ? `${index.changePercent.toFixed(2)}%`
                    : "-"}
                </span>
              </div>
              <CardTitle className="text-xl">
                {index.etf?.price !== null && index.etf?.price !== undefined
                  ? formatPrice(index.etf.price as number)
                  : formatPoints(index.value)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-16 w-full">
                {(() => {
                  const etfSymbol = indexToEtf[index.symbol];
                  const bars = etfSymbol ? etfBarsMap[etfSymbol] || [] : [];
                  if (!bars || bars.length === 0) return <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No chart data</div>;
                  const displayUp = index.etf?.up ?? index.up;
                  // Map bars into chart data with raw price values. The chart will use actual prices on Y axis.
                  const rawData = bars.map((b) => ({ time: b.timestamp, rawValue: b.close }));
                  const last = rawData[rawData.length - 1];
                  const lastVal = last?.rawValue || 1;
                  const chartData = rawData.map((d) => ({ time: d.time, value: d.rawValue, rawValue: d.rawValue }));
                  const vals = chartData.map((d) => d.value);
                  const minV = Math.min(...vals);
                  const maxV = Math.max(...vals);
                  const r = Math.abs(maxV - minV);
                  const paddingVal = r > 0 ? Math.max(r * 0.15, Math.abs(maxV) * 0.001) : Math.max(Math.abs(maxV) * 0.01, 0.1);
                  const domain: Array<number | string> = [minV - paddingVal, maxV + paddingVal];
                  return (
                    <ChartContainer id={index.id} className="h-full w-full" config={{ value: { color: displayUp ? "var(--chart-3)" : "var(--destructive)" } }}>
                      <Recharts.AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Recharts.YAxis hide domain={domain as any} tickFormatter={(v) => `${formatPrice(Number(v))}`} />
                        <defs>
                          <linearGradient id={`chart-gradient-${index.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={displayUp ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={displayUp ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Recharts.CartesianGrid horizontal={false} vertical={false} />
                        <Recharts.XAxis dataKey="time" hide />
                        <Recharts.Tooltip
                          content={<ChartTooltipContent />}
                          labelFormatter={(label: string) => `${formatBarTime(label)}`}
                        />
                        <Recharts.Area
                          type="monotone"
                          dataKey="value"
                          stroke={displayUp ? "var(--chart-3)" : "var(--destructive)"}
                          fill={`url(#chart-gradient-${index.id})`}
                          fillOpacity={1}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          shapeRendering="geometricPrecision"
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </Recharts.AreaChart>
                    </ChartContainer>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
          );
        })
      )}
    </div>
  );
}
