import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
    {
        videoId: {
            type: String,
            unique: true,
            required: true,
            default: () => `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            index: true,
            required: true
        },
        moduleId: {
            type: String, // Reference to module within course
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ''
        },
        videoUrl: {
            type: String,
            required: true
        },
        thumbnailUrl: {
            type: String,
            default: ''
        },
        duration: {
            type: Number, // in seconds
            default: 0
        },
        startTime: {
            type: Number, // Start time in seconds
            default: 0
        },
        endTime: {
            type: Number, // End time in seconds
            default: 0
        },
        order: {
            type: Number,
            default: 0
        },
        resources: [{
            title: String,
            url: String,
            type: { type: String, enum: ['pdf', 'code', 'link', 'other'] }
        }],
        notes: {
            type: String,
            default: ''
        },
        captions: [{
            lang: String,
            label: String,
            url: String
        }],
        quality: [{
            label: String, // '720p', '1080p', etc.
            url: String
        }],
        isPublished: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Indexes for efficient queries
videoSchema.index({ courseId: 1, moduleId: 1, order: 1 });

export default mongoose.model('Video', videoSchema);
