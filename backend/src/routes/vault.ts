import { Router, Response } from 'express';
import { prisma } from '../services/db';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// Apply auth middleware to all vault routes
router.use(authenticateToken);

// 1. Fetch all items in user's vault
router.get('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized access." });

  try {
    const items = await prisma.vaultItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    console.error("Fetch Vault Error:", error);
    res.status(500).json({ error: "Failed to query the database vault records." });
  }
});

// 2. Save a new item to the vault
router.post('/', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized access." });

  const { title, content, type, previewText, tags } = req.body;

  if (!title || !content || !type) {
    return res.status(400).json({ error: "Title, content, and type are required fields." });
  }

  try {
    const item = await prisma.vaultItem.create({
      data: {
        title,
        content,
        type,
        previewText: previewText || content.slice(0, 100) + "...",
        tags: tags || "Saved",
        date: new Date().toLocaleDateString(),
        userId: req.user.id
      }
    });
    res.status(201).json(item);
  } catch (error) {
    console.error("Create Vault Item Error:", error);
    res.status(500).json({ error: "Failed to persist vault entry to database." });
  }
});

// 3. Delete a vault item
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized access." });

  const itemId = req.params.id;

  try {
    // Ensure item belongs to user before deletion
    const item = await prisma.vaultItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ error: "Vault item does not exist." });
    }

    if (item.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this resource." });
    }

    await prisma.vaultItem.delete({
      where: { id: itemId }
    });

    res.json({ message: "Vault record successfully purged." });
  } catch (error) {
    console.error("Delete Vault Item Error:", error);
    res.status(500).json({ error: "Failed to remove entry from the database." });
  }
});

export default router;
