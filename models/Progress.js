import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true
        },
        completedModules: [{
            moduleId: String,
            completedAt: { type: Date, default: Date.now }
        }],
        completedVideos: [{
            videoId: String,
            watchTime: Number, // seconds watched
            completedAt: { type: Date, default: Date.now }
        }],
        totalWatchTime: {
            type: Number, // total seconds watched across all videos
            default: 0
        },
        lastWatchedVideo: {
            videoId: String,
            moduleId: String,
            timestamp: Date
        },
        completionPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        quizScores: [{
            quizId: mongoose.Schema.Types.ObjectId,
            moduleId: String,
            score: Number,
            totalPoints: Number,
            percentage: Number,
            passed: Boolean,
            attemptedAt: Date
        }],
        certificateEarned: {
            type: Boolean,
            default: false
        },
        certificateIssuedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

// Compound index for efficient user-course queries
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Method to update completion percentage
progressSchema.methods.calculateCompletion = async function (totalModules, totalVideos) {
    const moduleCompletion = (this.completedModules.length / totalModules) * 50;
    const videoCompletion = (this.completedVideos.length / totalVideos) * 50;
    this.completionPercentage = Math.min(100, Math.round(moduleCompletion + videoCompletion));
    return this.completionPercentage;
};

// Method to check certificate eligibility
progressSchema.methods.checkCertificateEligibility = function () {
    return this.completionPercentage >= 80 && !this.certificateEarned;
};

// Static method to get or create progress
progressSchema.statics.getOrCreate = async function (userId, courseId) {
    let progress = await this.findOne({ userId, courseId });
    if (!progress) {
        progress = await this.create({ userId, courseId });
    }
    return progress;
};

// Static method to mark video as complete
progressSchema.statics.markVideoComplete = async function (userId, courseId, videoId, watchTime) {
    const progress = await this.getOrCreate(userId, courseId);

    // Check if video already completed
    const existingIndex = progress.completedVideos.findIndex(v => v.videoId === videoId);

    if (existingIndex === -1) {
        progress.completedVideos.push({
            videoId,
            watchTime,
            completedAt: new Date()
        });
    } else {
        // Update watch time if video watched again
        progress.completedVideos[existingIndex].watchTime = Math.max(
            progress.completedVideos[existingIndex].watchTime,
            watchTime
        );
    }

    progress.totalWatchTime += watchTime;
    await progress.save();
    return progress;
};

export default mongoose.model('Progress', progressSchema);
