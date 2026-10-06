import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Save progress for a video module
router.post('/:moduleId/progress', requireAuth, async (req, res) => {
  const { lastTime = 0, completed = false } = req.body || {};
  res.json({ moduleId: req.params.moduleId, lastTime, completed });
});

// Get progress for a video module
router.get('/:moduleId/progress', requireAuth, async (req, res) => {
  res.json({ moduleId: req.params.moduleId, lastTime: 0, completed: false });
});

// Signed download token (stub)
router.post('/:moduleId/download', requireAuth, async (req, res) => {
  res.json({ token: 'stub-token', expiresIn: 300 });
});

export default router;