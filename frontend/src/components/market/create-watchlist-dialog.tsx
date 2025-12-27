"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateWatchlistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description?: string) => void;
};

export function CreateWatchlistDialog({ open, onOpenChange, onCreate }: CreateWatchlistDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
      setName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold tracking-tight">New Watchlist</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. My Tech Growth"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 bg-muted/30 focus-visible:ring-primary border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <textarea
              id="description"
              placeholder="Optional description for your watchlist"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-6 pt-0">
          <Button 
            onClick={handleCreate} 
            className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg"
          >
            Create Watchlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

