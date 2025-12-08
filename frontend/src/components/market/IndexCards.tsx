"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPoints } from "@/lib/api";
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
};

export default function IndexCards({ indices, loading }: { indices: IndexPoint[]; loading: boolean }) {
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
          const values = index.data.map((d) => d.value);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const range = Math.abs(max - min);
          const padding = range > 0 ? Math.max(range * 0.15, Math.abs(max) * 0.001) : Math.max(Math.abs(max) * 0.01, 1);
          const domain: Array<number | string> = [min - padding, max + padding];

          return (
          <Card key={index.id} className="py-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{index.name}</CardDescription>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    index.up ? "bg-chart-3/20 text-chart-3" : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {index.changePercent !== null ? `${index.changePercent.toFixed(2)}%` : "-"}
                </span>
              </div>
              <CardTitle className="text-xl">{formatPoints(index.value)}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-16 w-full">
                {index.data.length > 0 ? (
                  <ChartContainer id={index.id} className="h-full w-full" config={{ value: { color: index.up ? "var(--chart-3)" : "var(--destructive)" } }}>
                    <Recharts.AreaChart data={index.data.map((d) => ({ time: d.time, value: d.value }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Recharts.YAxis hide domain={domain as any} />
                      <defs>
                        <linearGradient id={`chart-gradient-${index.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={index.up ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={index.up ? "var(--chart-3)" : "var(--destructive)"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Recharts.CartesianGrid horizontal={false} vertical={false} />
                      <Recharts.XAxis dataKey="time" hide />
                      <Recharts.Area
                        type="monotone"
                        dataKey="value"
                        stroke={index.up ? "var(--chart-3)" : "var(--destructive)"}
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-xs">No chart data</div>
                )}
              </div>
            </CardContent>
          </Card>
          );
        })
      )}
    </div>
  );
}
