import { Router } from "express";
import authRoutes from "./auth";
import stocksRoutes from "./stocks";

const router = Router();


router.use("/auth", authRoutes);
router.use("/stocks", stocksRoutes);

export default router;
