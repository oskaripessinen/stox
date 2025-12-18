"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getIndexConstituents, EtfHolding } from "@/lib/api";

export default function IndexConstituents({ indexSymbol, open, onOpenChange }: { indexSymbol: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [holdings, setHoldings] = useState<EtfHolding[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState<number>(20);
  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    fetchPage(offset);
  }, [open, offset]);

  async function fetchPage(off: number) {
    setLoading(true);
    const res = await getIndexConstituents(indexSymbol, limit, off);
    if (res) {
      setHoldings(res.constituents || []);
      setTotal(res.total || 0);
    } else {
      setHoldings([]);
      setTotal(0);
    }
    setLoading(false);
  }

  function handleNext() {
    if (offset + limit < total) setOffset(offset + limit);
  }

  function handlePrev() {
    setOffset(Math.max(0, offset - limit));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top constituents — {indexSymbol}</DialogTitle>
        </DialogHeader>
        <div className="min-h-[200px] max-h-[60vh] overflow-auto py-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : holdings.length === 0 ? (
            <div className="text-sm text-muted-foreground">No holdings available</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Weight</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={h.symbol} className="border-t">
                    <td className="py-2">{offset + i + 1}</td>
                    <td className="py-2 font-mono">{h.symbol}</td>
                    <td className="py-2">{h.name}</td>
                    <td className="py-2">{h.weight ? `${h.weight.toFixed(2)}%` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between">
          <div className="space-x-2">
            <Button variant="ghost" onClick={handlePrev} disabled={offset === 0 || loading}>Prev</Button>
            <Button variant="ghost" onClick={handleNext} disabled={offset + limit >= total || loading}>Next</Button>
            <span className="ml-4 text-sm text-muted-foreground">{Math.min(offset + 1, total)}-{Math.min(offset + limit, total)} of {total}</span>
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
