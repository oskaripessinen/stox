"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { getMarketNews, MarketNews } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "general", label: "General Market" },
  { id: "forex", label: "Forex" },
  { id: "crypto", label: "Crypto" },
  { id: "merger", label: "Mergers" },
];

export default function NewsPage() {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("general");

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setNews([]); 
      const data = await getMarketNews(selectedCategory);
      setNews(data);
      setLoading(false);
    }
    fetchNews();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Market News</h1>
              <p className="text-muted-foreground text-sm">
                Latest updates tailored to your interests.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "rounded-md px-4 transition-all",
                    selectedCategory === cat.id 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-24 w-full bg-muted/50 animate-pulse rounded-lg border border-transparent" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20 border border-dashed rounded-lg bg-muted/5">
              <Newspaper className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No news available for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {news.map((item) => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group block p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200 border border-transparent hover:border-border/50"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold uppercase tracking-wider">
                        {item.source}
                      </span>
                      <span className="flex items-center gap-1">
                        {formatDistanceToNow(item.datetime * 1000, { addSuffix: true })}
                      </span>
                    </div>

                    <h3 className="text-md font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {item.headline}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}