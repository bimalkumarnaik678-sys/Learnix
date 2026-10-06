import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/users', async (req, res) => {
  res.json({ items: [], total: 0 });
});

router.get('/analytics', async (req, res) => {
  res.json({ metrics: {} });
});

export default router;