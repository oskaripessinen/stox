import { Router } from "express";
import authRoutes from "./auth";
import stocksRoutes from "./stocks";
import watchlistsRoutes from "./watchlists";
import newsRoutes from "./news";

const router = Router();


router.use("/auth", authRoutes);
router.use("/stocks", stocksRoutes);
router.use("/watchlists", watchlistsRoutes);
router.use("/news", newsRoutes);

export default router;
