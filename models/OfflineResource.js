import mongoose from 'mongoose';

const offlineResourceSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        resourceId: { type: String, required: true }, // Can be videoId or generic ID
        type: { type: String, enum: ['video', 'pdf', 'quiz'], required: true },
        title: { type: String, required: true },
        size: { type: String }, // e.g., "15 MB"
        status: { type: String, enum: ['pending', 'downloading', 'completed', 'failed'], default: 'pending' },
        progress: { type: Number, default: 0 },
        localPath: { type: String }, // For simulated local storage or cache key
        thumbnailUrl: { type: String },
        metadata: { type: Map, of: String } // Extra data like duration, courseId
    },
    { timestamps: true }
);

// Compound index to prevent duplicate downloads for same user/resource
offlineResourceSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

export default mongoose.model('OfflineResource', offlineResourceSchema);
