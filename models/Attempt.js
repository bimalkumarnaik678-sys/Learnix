import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    response: { type: mongoose.Schema.Types.Mixed },
    correct: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', index: true, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true, required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', index: true, required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Attempt', attemptSchema);