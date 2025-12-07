"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <BaseClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      routerPush={(to) => router.push(to)}
      routerReplace={(to) => router.replace(to)}
    >
      {children}
    </BaseClerkProvider>
  );
}
