import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['mcq', 'multiselect', 'short'],
      required: true
    },
    text: { type: String, required: true },
    prompt: { type: String }, // Backward compatibility
    options: [{
      text: String,
      value: String
    }],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // String for mcq, Array for multiselect
      required: true
    },
    points: { type: Number, default: 1 },
    explanation: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    }
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    quizId: {
      type: String,
      unique: true,
      required: true,
      default: () => `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    topicTags: [{
      type: String
    }],
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    passingScore: {
      type: Number, // percentage
      default: 60
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance (no inline index declarations to avoid duplicates)
quizSchema.index({ moduleId: 1, isActive: 1 });
quizSchema.index({ courseId: 1 });

// Virtual for total points
quizSchema.virtual('totalPoints').get(function () {
  return this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

// Method to get quiz without correct answers (for students)
quizSchema.methods.toStudentJSON = function () {
  const quiz = this.toObject();
  quiz.questions = quiz.questions.map(q => {
    const { correctAnswer, ...questionWithoutAnswer } = q;
    return questionWithoutAnswer;
  });
  return quiz;
};

export default mongoose.model('Quiz', quizSchema);