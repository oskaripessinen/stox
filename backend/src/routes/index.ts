import { Router } from "express";
import authRoutes from "./auth";
import stocksRoutes from "./stocks";
import watchlistsRoutes from "./watchlists";

const router = Router();


router.use("/auth", authRoutes);
router.use("/stocks", stocksRoutes);
router.use("/watchlists", watchlistsRoutes);

export default router;
