import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getAuth } from "@clerk/express";

const router = Router();

// GET /watchlists - Get all user's watchlists
router.get('/', async (req, res) => {

    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    try {
        const user = await prisma.user.findUnique({ where: { clerkId: userId } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const watchlists = await prisma.watchlist.findMany({
            where: { userId: user.id },
            include: {
                _count: {
                    select: { items: true }
                }
            }
        });

        res.json(watchlists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /watchlists - Create a new watchlist
router.post('/', async (req, res) => {
    const { userId: clerkId, isAuthenticated } = getAuth(req);
    const { name } = req.body;

    if (!isAuthenticated || !clerkId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Watchlist name is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const watchlist = await prisma.watchlist.create({
            data: {
                userId: user.id,
                name,
            },
        });

        res.status(201).json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /watchlists/:id - Get a specific watchlist
router.get('/:id', async (req, res) => {
    const { userId: clerkId, isAuthenticated } = getAuth(req);
    const { id } = req.params;

    if (!isAuthenticated || !clerkId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const watchlist = await prisma.watchlist.findFirst({
            where: { id, userId: user.id },
            include: { items: true },
        });

        if (!watchlist) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }

        res.json(watchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /watchlists/:id/stocks - Add a stock to a watchlist
router.post('/:id/stocks', async (req, res) => {
    const { userId: clerkId, isAuthenticated } = getAuth(req);
    const { id } = req.params;
    const { symbol } = req.body;

    if (!isAuthenticated || !clerkId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const watchlist = await (prisma as any).watchlist.findFirst({
            where: { id, userId: user.id },
        });

        if (!watchlist) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }

        const watchlistItem = await prisma.watchlistItem.create({
            data: {
                watchlistId: watchlist.id,
                symbol,
            },
        });

        res.status(201).json(watchlistItem);
    } catch (error) {
        const err: any = error;
        if (err?.code === 'P2002') {
            return res.status(409).json({ error: 'Stock already in watchlist' });
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /watchlists/:id/stocks/:symbol - Remove a stock from a watchlist
router.delete('/:id/stocks/:symbol', async (req, res) => {
    const { userId: clerkId, isAuthenticated } = getAuth(req);
    const { id, symbol } = req.params;

    if (!isAuthenticated || !clerkId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const watchlist = await prisma.watchlist.findFirst({
            where: { id, userId: user.id },
        });

        if (!watchlist) {
            return res.status(404).json({ error: 'Watchlist not found' });
        }

        await prisma.watchlistItem.delete({
            where: {
                watchlistId_symbol: {
                    watchlistId: id,
                    symbol,
                }
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default router;