"use client";

import { useEffect, useState } from "react";
import { getMarketStatus, MarketClock } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MarketStatusBadge() {
  const [status, setStatus] = useState<MarketClock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      const data = await getMarketStatus();
      setStatus(data);
      setLoading(false);
    }
    fetchStatus();
    
    // Refresh every minute
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !status) {
    return null;
  }

  const isOpen = status.is_open;
  
  const tooltipText = isOpen 
    ? (status.next_close ? `Closes ${format(new Date(status.next_close), "h:mm a")}` : "")
    : (status.next_open ? `Opens ${format(new Date(status.next_open), "EEE h:mm a")}` : "");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 select-none">
            <span className={cn(
              "relative flex h-2 w-2",
              isOpen ? "text-green-500" : "text-red-500"
            )}>
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                isOpen ? "bg-green-500" : "bg-red-500"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                isOpen ? "bg-green-500" : "bg-red-500"
              )} />
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isOpen ? "Market Open" : "Market Closed"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


