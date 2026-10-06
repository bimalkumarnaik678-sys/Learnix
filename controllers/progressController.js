import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import Video from '../models/Video.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

// Get or create user progress for a course
export const getCourseProgress = async (req, res) => {
    try {
        const { userId, courseId } = req.params;

        const progress = await Progress.getOrCreate(userId, courseId);

        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch progress',
            error: error.message
        });
    }
};

// Get all progress for a user
export const getUserProgress = async (req, res) => {
    try {
        const { userId } = req.params;

        const progressList = await Progress.find({ userId })
            .populate('courseId', 'title thumbnail description')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: progressList.length,
            data: progressList
        });
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch progress',
            error: error.message
        });
    }
};

// Update progress (mark module complete)
export const updateProgress = async (req, res) => {
    try {
        const { userId, courseId, moduleId } = req.body;

        if (!userId || !courseId || !moduleId) {
            return res.status(400).json({
                success: false,
                message: 'userId, courseId, and moduleId are required'
            });
        }

        const progress = await Progress.getOrCreate(userId, courseId);

        // Check if module already completed
        const existingIndex = progress.completedModules.findIndex(m => m.moduleId === moduleId);

        if (existingIndex === -1) {
            progress.completedModules.push({
                moduleId,
                completedAt: new Date()
            });
        }

        // Recalculate completion
        const course = await Course.findById(courseId);
        const totalModules = course?.modules?.length || 0;
        const totalVideos = await Video.countDocuments({ courseId, isPublished: true });

        await progress.calculateCompletion(totalModules, totalVideos);

        // Check certificate eligibility
        if (progress.checkCertificateEligibility()) {
            // Auto-issue certificate
            const user = await User.findById(userId);
            const certificateData = {
                courseName: course.title,
                userName: user.name || user.email,
                completionPercentage: progress.completionPercentage,
                totalWatchTime: progress.totalWatchTime,
                quizScoresSummary: {
                    totalQuizzes: progress.quizScores.length,
                    averageScore: progress.quizScores.reduce((sum, q) => sum + q.percentage, 0) / (progress.quizScores.length || 1),
                    passedQuizzes: progress.quizScores.filter(q => q.passed).length
                }
            };

            const certificate = await Certificate.issueCertificate(userId, courseId, certificateData);
            progress.certificateEarned = true;
            progress.certificateIssuedAt = certificate.issuedAt;
        }

        await progress.save();

        res.json({
            success: true,
            message: 'Progress updated',
            data: progress
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update progress',
            error: error.message
        });
    }
};

// Mark video as complete
export const completeVideo = async (req, res) => {
    try {
        const { userId, courseId, videoId, watchTime } = req.body;

        if (!userId || !courseId || !videoId) {
            return res.status(400).json({
                success: false,
                message: 'userId, courseId, and videoId are required'
            });
        }

        const progress = await Progress.markVideoComplete(userId, courseId, videoId, watchTime || 0);

        // Update last watched
        const video = await Video.findOne({ videoId });
        if (video) {
            progress.lastWatchedVideo = {
                videoId,
                moduleId: video.moduleId,
                timestamp: new Date()
            };
        }

        // Recalculate completion
        const course = await Course.findById(courseId);
        const totalModules = course?.modules?.length || 0;
        const totalVideos = await Video.countDocuments({ courseId, isPublished: true });

        await progress.calculateCompletion(totalModules, totalVideos);
        await progress.save();

        res.json({
            success: true,
            message: 'Video marked as complete',
            data: progress
        });
    } catch (error) {
        console.error('Error completing video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete video',
            error: error.message
        });
    }
};

// Add quiz score to progress
export const addQuizScore = async (req, res) => {
    try {
        const { userId, courseId, quizId, moduleId, score, totalPoints, percentage, passed } = req.body;

        const progress = await Progress.getOrCreate(userId, courseId);

        progress.quizScores.push({
            quizId,
            moduleId,
            score,
            totalPoints,
            percentage,
            passed,
            attemptedAt: new Date()
        });

        await progress.save();

        res.json({
            success: true,
            message: 'Quiz score added',
            data: progress
        });
    } catch (error) {
        console.error('Error adding quiz score:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add quiz score',
            error: error.message
        });
    }
};
