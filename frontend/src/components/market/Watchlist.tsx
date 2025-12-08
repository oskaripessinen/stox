"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { Button } from "@/components/ui/button";

export default function Watchlist() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Watchlist</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="h-full flex flex-col items-center justify-center py-4">
        <SignedOut>
          <div className="flex flex-col items-center justify-center -mt-7 gap-2 w-full">
            <p className="text-sm text-muted-foreground text-center mb-1">Sign in to track your favorite stocks</p>
            <SignInModal>
              <Button size="sm">Sign in</Button>
            </SignInModal>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="h-full flex flex-col items-center justify-center gap-2 -mt-15 w-full">
            <p className="text-sm text-muted-foreground text-center mb-1">Your watchlist is empty</p>
            <Button className="text-[14px]" variant="outline"> 
              <Sparkles className="size-4"/>
              Get Suggestions
            </Button>
          </div>
        </SignedIn>
      </CardContent>
    </Card>
  );
}
