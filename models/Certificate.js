import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
    {
        certificateId: {
            type: String,
            unique: true,
            required: true,
            default: () => `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        },
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
        courseName: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        issuedAt: {
            type: Date,
            default: Date.now,
            required: true
        },
        completionPercentage: {
            type: Number,
            required: true,
            min: 80,
            max: 100
        },
        quizScoresSummary: {
            totalQuizzes: Number,
            averageScore: Number,
            passedQuizzes: Number
        },
        totalWatchTime: {
            type: Number, // in hours
            default: 0
        },
        verificationUrl: {
            type: String
        }
    },
    { timestamps: true }
);

// Compound index to ensure one certificate per user per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Method to generate verification URL
certificateSchema.methods.generateVerificationUrl = function () {
    const baseUrl = process.env.APP_URL || 'https://learnix.com';
    this.verificationUrl = `${baseUrl}/verify-certificate/${this.certificateId}`;
    return this.verificationUrl;
};

// Static method to issue certificate
certificateSchema.statics.issueCertificate = async function (userId, courseId, progressData) {
    // Check if certificate already exists
    const existing = await this.findOne({ userId, courseId });
    if (existing) {
        return existing;
    }

    // Create new certificate
    const certificate = new this({
        userId,
        courseId,
        courseName: progressData.courseName,
        userName: progressData.userName,
        completionPercentage: progressData.completionPercentage,
        quizScoresSummary: progressData.quizScoresSummary,
        totalWatchTime: Math.round(progressData.totalWatchTime / 3600 * 10) / 10 // Convert to hours
    });

    certificate.generateVerificationUrl();
    await certificate.save();

    return certificate;
};

export default mongoose.model('Certificate', certificateSchema);
