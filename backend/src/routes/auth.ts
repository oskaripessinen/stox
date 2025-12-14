import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { clerkClient, getAuth, clerkMiddleware  } from "@clerk/express";

const router = Router();

// User sync endpoint - validates Clerk token and creates/updates user in database
router.post("/sync", async (req, res) => {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const clerkUser = await clerkClient.users.getUser(userId);



    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const firstName = clerkUser.firstName || "User";
    const lastName = clerkUser.lastName || "";
    const imageUrl = clerkUser.imageUrl || "";

    if (!email) {
      return res.status(400).json({ error: "Email not found in Clerk user" });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: { email },
      create: {
        clerkId: clerkUser.id,
        email,
        firstName,
        lastName,
        imageUrl,
      },
    });
    
    res.json({ user });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// Get current user endpoint
router.get("/me", async (req, res) => {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
