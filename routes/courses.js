import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = express.Router();

// List courses
router.get('/', requireAuth, async (req, res) => {
  res.json({ items: [], total: 0 });
});

// Get a single course
router.get('/:id', requireAuth, async (req, res) => {
  res.json({ course: null });
});

// Admin: create course
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  res.status(201).json({ course: { id: 'stub' } });
});

// Admin: update course
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  res.json({ course: { id: req.params.id } });
});

// Admin: delete course
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  res.json({ ok: true });
});

export default router;