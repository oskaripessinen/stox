"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
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
      <CardContent className="flex flex-col items-center justify-center py-4">
        <SignedOut>
          <p className="text-sm text-muted-foreground text-center mb-3">Sign in to track your favorite stocks</p>
          <SignInModal>
            <Button size="sm">Sign in</Button>
          </SignInModal>
        </SignedOut>
        <SignedIn>
          <p className="text-sm text-muted-foreground text-center mt-12">Your watchlist is empty</p>
        </SignedIn>
      </CardContent>
    </Card>
  );
}
