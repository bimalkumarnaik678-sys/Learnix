import express from 'express';
import {
    getCourseProgress,
    getUserProgress,
    updateProgress,
    completeVideo,
    addQuizScore
} from '../controllers/progressController.js';

const router = express.Router();

// Get all progress for a user
router.get('/user/:userId', getUserProgress);

// Get progress for a specific course
router.get('/:userId/:courseId', getCourseProgress);

// Update progress (mark module complete)
router.post('/update', updateProgress);

// Mark video as complete
router.post('/complete-video', completeVideo);

// Add quiz score to progress
router.post('/quiz-score', addQuizScore);

export default router;
