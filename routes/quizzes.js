import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { quizSubmitLimiter } from '../middleware/rateLimit.js';
import { validateQuizSubmission, sanitizeInputs } from '../middleware/validation.js';
import {
  getQuizByModule,
  submitQuiz,
  getUserScores,
  getAttemptDetails,
  getQuizStats
} from '../controllers/quizController.js';

const router = express.Router();

// Student routes
router.get('/:moduleId', requireAuth, getQuizByModule);
router.post('/:moduleId/submit', requireAuth, quizSubmitLimiter, sanitizeInputs, validateQuizSubmission, submitQuiz);
router.get('/scores/user/:userId?', requireAuth, getUserScores);
router.get('/scores/stats', requireAuth, getQuizStats);
router.get('/attempt/:attemptId', requireAuth, getAttemptDetails);

// Admin routes (create/update/delete quiz)
router.post('/:moduleId', requireAuth, requireRole('admin'), async (req, res) => {
  res.status(201).json({ ok: true });
});

router.put('/:moduleId', requireAuth, requireRole('admin'), async (req, res) => {
  res.json({ ok: true });
});

router.delete('/:moduleId', requireAuth, requireRole('admin'), async (req, res) => {
  res.json({ ok: true });
});

export default router;