import express from 'express';
import {
    getModuleVideos,
    getVideoById,
    trackVideoWatch,
    getCourseVideos
} from '../controllers/videoController.js';

const router = express.Router();

// Get all videos for a course (grouped by module)
router.get('/course/:courseId', getCourseVideos);

// Get all videos for a specific module
router.get('/module/:moduleId', getModuleVideos);

// Get single video by ID
router.get('/:videoId', getVideoById);

// Track video watch time
router.post('/:videoId/watch', trackVideoWatch);

export default router;
