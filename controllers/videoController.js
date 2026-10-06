import Video from '../models/Video.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';

// Get all videos for a module
export const getModuleVideos = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const videos = await Video.find({ moduleId, isPublished: true })
            .sort({ order: 1 })
            .select('-__v');

        res.json({
            success: true,
            count: videos.length,
            data: videos
        });
    } catch (error) {
        console.error('Error fetching module videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos',
            error: error.message
        });
    }
};

// Get single video by ID
export const getVideoById = async (req, res) => {
    try {
        const { videoId } = req.params;

        const video = await Video.findOne({ videoId })
            .populate('courseId', 'title description');

        if (!video) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch video',
            error: error.message
        });
    }
};

// Track video watch time
export const trackVideoWatch = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { watchTime, userId, courseId } = req.body;

        if (!userId || !courseId) {
            return res.status(400).json({
                success: false,
                message: 'userId and courseId are required'
            });
        }

        // Update progress
        const progress = await Progress.markVideoComplete(userId, courseId, videoId, watchTime || 0);

        // Get total videos in course to calculate completion
        const videos = await Video.countDocuments({ courseId, isPublished: true });
        const course = await Course.findById(courseId);
        const totalModules = course?.modules?.length || 0;

        await progress.calculateCompletion(totalModules, videos);
        await progress.save();

        res.json({
            success: true,
            message: 'Watch time tracked',
            data: {
                completionPercentage: progress.completionPercentage,
                totalWatchTime: progress.totalWatchTime
            }
        });
    } catch (error) {
        console.error('Error tracking watch time:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track watch time',
            error: error.message
        });
    }
};

// Get all videos for a course
export const getCourseVideos = async (req, res) => {
    try {
        const { courseId } = req.params;

        const videos = await Video.find({ courseId, isPublished: true })
            .sort({ moduleId: 1, order: 1 })
            .select('-__v');

        // Group by module
        const videosByModule = videos.reduce((acc, video) => {
            if (!acc[video.moduleId]) {
                acc[video.moduleId] = [];
            }
            acc[video.moduleId].push(video);
            return acc;
        }, {});

        res.json({
            success: true,
            count: videos.length,
            data: videosByModule
        });
    } catch (error) {
        console.error('Error fetching course videos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch videos',
            error: error.message
        });
    }
};
