import { Router } from "express";
import authRoutes from "./auth";
import stocksRoutes from "./stocks";
import watchlistRoutes from "./watchlist";

const router = Router();


router.use("/auth", authRoutes);
router.use("/stocks", stocksRoutes);
router.use("/watchlist", watchlistRoutes);

export default router;
