import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';

// Get quiz by module ID (student-safe, no correct answers)
export const getQuizByModule = async (req, res) => {
    try {
        const { moduleId } = req.params;

        const quiz = await Quiz.findOne({ moduleId, isActive: true });

        if (!quiz) {
            return res.status(404).json({
                message: 'No quiz found for this module'
            });
        }

        // Get user's attempt count
        const attemptCount = await QuizAttempt.getAttemptCount(req.user._id, quiz._id);

        // Check if user has exceeded max attempts
        if (attemptCount >= quiz.maxAttempts) {
            return res.status(403).json({
                message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`,
                attemptCount,
                maxAttempts: quiz.maxAttempts
            });
        }

        // Get best score
        const bestScore = await QuizAttempt.getBestScore(req.user._id, quiz._id);

        // Return quiz without correct answers
        const studentQuiz = quiz.toStudentJSON();

        res.json({
            ...studentQuiz,
            attemptCount,
            maxAttempts: quiz.maxAttempts,
            bestScore: bestScore ? {
                percentage: bestScore.percentage,
                score: bestScore.score,
                total: bestScore.totalPoints
            } : null
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Error fetching quiz' });
    }
};

// Evaluate quiz submission
const evaluateAnswer = (question, userResponse) => {
    const { type, correctAnswer, points = 1 } = question;

    if (type === 'mcq') {
        // Exact match for MCQ
        const isCorrect = userResponse === correctAnswer;
        return {
            isCorrect,
            pointsEarned: isCorrect ? points : 0
        };
    } else if (type === 'multiselect') {
        // Partial scoring for multi-select
        if (!Array.isArray(userResponse) || !Array.isArray(correctAnswer)) {
            return { isCorrect: false, pointsEarned: 0 };
        }

        const correctSet = new Set(correctAnswer);
        const userSet = new Set(userResponse);

        // Count correct selections and incorrect selections
        let correctSelections = 0;
        let incorrectSelections = 0;

        userResponse.forEach(answer => {
            if (correctSet.has(answer)) {
                correctSelections++;
            } else {
                incorrectSelections++;
            }
        });

        // Partial scoring: (correct selections / total correct) - penalty for wrong selections
        const correctRatio = correctSelections / correctAnswer.length;
        const penalty = incorrectSelections / correctAnswer.length;
        const score = Math.max(0, correctRatio - penalty);

        return {
            isCorrect: score === 1,
            pointsEarned: score * points
        };
    } else if (type === 'short') {
        // Short answer requires manual review
        // For now, mark as pending (0 points)
        return {
            isCorrect: false,
            pointsEarned: 0,
            requiresReview: true
        };
    }

    return { isCorrect: false, pointsEarned: 0 };
};

// Submit quiz and calculate score
export const submitQuiz = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { answers, startedAt } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid answers format' });
        }

        if (!startedAt) {
            return res.status(400).json({ message: 'Start time is required' });
        }

        // Find quiz
        const quiz = await Quiz.findOne({ moduleId, isActive: true });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check attempt limit
        const attemptCount = await QuizAttempt.getAttemptCount(req.user._id, quiz._id);

        if (attemptCount >= quiz.maxAttempts) {
            return res.status(403).json({
                message: `Maximum attempts (${quiz.maxAttempts}) reached`
            });
        }

        // Evaluate answers
        const evaluatedAnswers = [];
        let totalScore = 0;
        let totalPoints = 0;

        quiz.questions.forEach(question => {
            const userAnswer = answers.find(a => a.questionId === question._id.toString());
            const response = userAnswer ? userAnswer.response : null;

            const evaluation = evaluateAnswer(question, response);

            evaluatedAnswers.push({
                questionId: question._id,
                response,
                isCorrect: evaluation.isCorrect,
                pointsEarned: evaluation.pointsEarned
            });

            totalScore += evaluation.pointsEarned;
            totalPoints += question.points || 1;
        });

        // Calculate percentage and pass/fail
        const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        const passed = percentage >= quiz.passingScore;

        // Calculate duration
        const submittedAt = new Date();
        const duration = Math.floor((submittedAt - new Date(startedAt)) / 1000); // seconds

        // Create quiz attempt record
        const attempt = new QuizAttempt({
            userId: req.user._id,
            quizId: quiz._id,
            moduleId: quiz.moduleId,
            courseId: quiz.courseId,
            answers: evaluatedAnswers,
            score: totalScore,
            totalPoints,
            percentage,
            passed,
            duration,
            startedAt: new Date(startedAt),
            submittedAt
        });

        await attempt.save();

        // Prepare detailed feedback
        const feedback = quiz.questions.map((q, index) => {
            const userAnswer = evaluatedAnswers[index];
            return {
                questionId: q._id,
                questionText: q.text || q.prompt,
                userResponse: userAnswer.response,
                correctAnswer: q.correctAnswer,
                isCorrect: userAnswer.isCorrect,
                pointsEarned: userAnswer.pointsEarned,
                totalPoints: q.points || 1,
                explanation: q.explanation
            };
        });

        res.json({
            attemptId: attempt.attemptId,
            score: totalScore,
            totalPoints,
            percentage,
            passed,
            passingScore: quiz.passingScore,
            duration,
            feedback,
            attemptsRemaining: quiz.maxAttempts - (attemptCount + 1)
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Error submitting quiz' });
    }
};

// Get user's quiz scores
export const getUserScores = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;

        // Ensure user can only access their own scores (unless admin)
        if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { moduleId, courseId, passed, limit = 50, skip = 0 } = req.query;

        // Build query
        const query = { userId };
        if (moduleId) query.moduleId = moduleId;
        if (courseId) query.courseId = courseId;
        if (passed !== undefined) query.passed = passed === 'true';

        const attempts = await QuizAttempt.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('quizId', 'title difficulty')
            .populate('moduleId', 'title')
            .populate('courseId', 'title');

        const total = await QuizAttempt.countDocuments(query);

        res.json({
            attempts,
            total,
            limit: parseInt(limit),
            skip: parseInt(skip)
        });

    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ message: 'Error fetching scores' });
    }
};

// Get specific attempt details
export const getAttemptDetails = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const attempt = await QuizAttempt.findOne({ attemptId })
            .populate('quizId')
            .populate('moduleId', 'title')
            .populate('courseId', 'title');

        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        // Ensure user can only access their own attempts (unless admin)
        if (attempt.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(attempt);

    } catch (error) {
        console.error('Error fetching attempt details:', error);
        res.status(500).json({ message: 'Error fetching attempt details' });
    }
};

// Get quiz statistics for a user
export const getQuizStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await QuizAttempt.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalAttempts: { $sum: 1 },
                    passedAttempts: {
                        $sum: { $cond: ['$passed', 1, 0] }
                    },
                    avgPercentage: { $avg: '$percentage' },
                    bestPercentage: { $max: '$percentage' }
                }
            }
        ]);

        const result = stats[0] || {
            totalAttempts: 0,
            passedAttempts: 0,
            avgPercentage: 0,
            bestPercentage: 0
        };

        res.json({
            ...result,
            passRate: result.totalAttempts > 0
                ? Math.round((result.passedAttempts / result.totalAttempts) * 100)
                : 0
        });

    } catch (error) {
        console.error('Error fetching quiz stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
};
