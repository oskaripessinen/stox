import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// GET /watchlist - Get user's watchlist
router.get('/', auth, async (req, res) => {
  const clerkId = req.auth.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        watchlists: {
          where: { name: 'Default Watchlist' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.watchlists.length === 0) {
      return res.json([]);
    }

    res.json(user.watchlists[0].items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /watchlist - Add a stock to user's watchlist
router.post('/', auth, async (req, res) => {
    const clerkId = req.auth.userId;
    const { symbol } = req.body;

    if (!symbol) {
        return res.status(400).json({ error: 'Stock symbol is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let watchlist = await prisma.watchlist.findFirst({
            where: { userId: user.id, name: 'Default Watchlist' },
        });

        if (!watchlist) {
            watchlist = await prisma.watchlist.create({
                data: {
                    userId: user.id,
                    name: 'Default Watchlist',
                },
            });
        }

        const watchlistItem = await prisma.watchlistItem.create({
            data: {
                watchlistId: watchlist.id,
                symbol,
            },
        });

        res.status(201).json(watchlistItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
