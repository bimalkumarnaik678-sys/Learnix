import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    response: {
        type: mongoose.Schema.Types.Mixed, // String or Array
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    pointsEarned: {
        type: Number,
        default: 0
    }
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema(
    {
        attemptId: {
            type: String,
            unique: true,
            required: true,
            default: () => `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
            required: true
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            index: true,
            required: true
        },
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module',
            index: true,
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            index: true
        },
        answers: [answerSchema],
        score: {
            type: Number,
            required: true
        },
        totalPoints: {
            type: Number,
            required: true
        },
        percentage: {
            type: Number,
            required: true
        },
        passed: {
            type: Boolean,
            required: true
        },
        duration: {
            type: Number, // in seconds
            required: true
        },
        startedAt: {
            type: Date,
            required: true
        },
        submittedAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes for efficient queries
quizAttemptSchema.index({ userId: 1, quizId: 1 });
quizAttemptSchema.index({ userId: 1, moduleId: 1 });
quizAttemptSchema.index({ userId: 1, createdAt: -1 });
quizAttemptSchema.index({ quizId: 1, createdAt: -1 });

// Static method to get user's attempt count for a quiz
quizAttemptSchema.statics.getAttemptCount = async function (userId, quizId) {
    return await this.countDocuments({ userId, quizId });
};

// Static method to get user's best score for a quiz
quizAttemptSchema.statics.getBestScore = async function (userId, quizId) {
    const bestAttempt = await this.findOne({ userId, quizId })
        .sort({ percentage: -1 })
        .select('percentage score totalPoints');
    return bestAttempt;
};

// Static method to get user's recent attempts
quizAttemptSchema.statics.getRecentAttempts = async function (userId, limit = 10) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('quizId', 'title')
        .populate('moduleId', 'title');
};

export default mongoose.model('QuizAttempt', quizAttemptSchema);
