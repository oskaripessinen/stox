"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export function AuthSync() {
  const { isSignedIn, getToken } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    async function syncUser() {
      if (!isSignedIn || hasSynced.current) return;

      try {
        const token = await getToken();
        
        if (!token) return;

        const response = await fetch(`${BACKEND_URL}/api/auth/sync`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          hasSynced.current = true;
          console.log("User synced to backend");
        } else {
          console.error("Failed to sync user:", await response.text());
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    }

    syncUser();
  }, [isSignedIn, getToken]);

  // Reset sync flag when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      hasSynced.current = false;
    }
  }, [isSignedIn]);

  return null;
}
