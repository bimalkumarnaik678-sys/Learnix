import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Quiz from './models/Quiz.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnix';

// Quiz questions for Discrete Math modules
const quizData = [
    {
        moduleIndex: 0, // Sets
        title: 'Sets and Set Operations Quiz',
        description: 'Test your understanding of set theory fundamentals',
        difficulty: 'Easy',
        timeLimit: 15,
        questions: [
            {
                type: 'mcq',
                text: 'What is a Set?',
                options: [
                    { text: 'A collection of ordered elements', value: 'a' },
                    { text: 'A collection of distinct objects', value: 'b' },
                    { text: 'A list of numbers', value: 'c' },
                    { text: 'A mapping between objects', value: 'd' }
                ],
                correctAnswer: 'b',
                explanation: 'A set is a well-defined collection of distinct objects.',
                difficulty: 'Easy',
                topicTags: ['sets', 'definitions']
            },
            {
                type: 'mcq',
                text: 'If A = {1, 2, 3} and B = {3, 4, 5}, what is A ∩ B?',
                options: [
                    { text: '{1, 2, 3, 4, 5}', value: 'a' },
                    { text: '{3}', value: 'b' },
                    { text: '{}', value: 'c' },
                    { text: '{1, 2}', value: 'd' }
                ],
                correctAnswer: 'b',
                explanation: 'The intersection (∩) contains elements present in both sets.',
                difficulty: 'Easy',
                topicTags: ['sets', 'operations']
            }
        ]
    },
    {
        moduleIndex: 1, // Logic
        title: 'Logic and Propositions Quiz',
        description: 'Test your knowledge of logical connectives and truth tables',
        difficulty: 'Medium',
        timeLimit: 20,
        questions: [
            {
                type: 'mcq',
                text: 'Which of the following is a proposition?',
                options: [
                    { text: 'What time is it?', value: 'a' },
                    { text: 'Read this book.', value: 'b' },
                    { text: '2 + 2 = 5', value: 'c' },
                    { text: 'x + 1 = 2', value: 'd' }
                ],
                correctAnswer: 'c',
                explanation: 'A proposition is a declarative sentence that is either true or false. "2 + 2 = 5" is a false proposition.',
                difficulty: 'Easy',
                topicTags: ['logic', 'propositions']
            },
            {
                type: 'mcq',
                text: 'The statement p → q is false only when:',
                options: [
                    { text: 'p is true and q is true', value: 'a' },
                    { text: 'p is true and q is false', value: 'b' },
                    { text: 'p is false and q is true', value: 'c' },
                    { text: 'p is false and q is false', value: 'd' }
                ],
                correctAnswer: 'b',
                explanation: 'An implication p → q is false only when the hypothesis p is true and the conclusion q is false.',
                difficulty: 'Medium',
                topicTags: ['logic', 'implication']
            }
        ]
    },
    {
        moduleIndex: 4, // Graphs
        title: 'Graph Theory Fundamentals Quiz',
        description: 'Test your understanding of graphs, vertices, and edges',
        difficulty: 'Medium',
        timeLimit: 20,
        questions: [
            {
                type: 'mcq',
                text: 'A graph in which every pair of distinct vertices is connected by a unique edge is called a:',
                options: [
                    { text: 'Complete Graph', value: 'a' },
                    { text: 'Bipartite Graph', value: 'b' },
                    { text: 'Connected Graph', value: 'c' },
                    { text: 'Cyclic Graph', value: 'd' }
                ],
                correctAnswer: 'a',
                explanation: 'In a complete graph (Kn), every pair of distinct vertices is connected by a unique edge.',
                difficulty: 'Medium',
                topicTags: ['graphs', 'definitions']
            }
        ]
    }
];

async function seedQuizzes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the discrete math course
        const course = await Course.findOne({ title: 'Discrete Mathematics Masterclass' });

        if (!course) {
            console.error('Course not found! Please run seed-algorithms-course.js first.');
            process.exit(1);
        }

        // Clear existing quizzes for this course
        await Quiz.deleteMany({ courseId: course._id });
        console.log('Cleared existing quizzes');

        // Create quizzes
        let quizCount = 0;
        for (const quizInfo of quizData) {
            // Get the actual module ID from the course using the index
            const module = course.modules[quizInfo.moduleIndex];

            if (!module) {
                console.log(`Module at index ${quizInfo.moduleIndex} not found, skipping quiz`);
                continue;
            }

            const quiz = await Quiz.create({
                courseId: course._id,
                moduleId: module._id,
                title: quizInfo.title,
                description: quizInfo.description,
                difficulty: quizInfo.difficulty,
                timeLimit: quizInfo.timeLimit,
                passingScore: 80, // Updated to 80% as per user requirement
                maxAttempts: 3,
                topicTags: [...new Set(quizInfo.questions.flatMap(q => q.topicTags))],
                questions: quizInfo.questions.map(q => ({
                    type: q.type,
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    difficulty: q.difficulty,
                    points: q.difficulty === 'Easy' ? 1 : q.difficulty === 'Medium' ? 2 : 3
                })),
                isActive: true
            });

            quizCount++;
            console.log(`Created quiz: ${quiz.title}`);
        }

        console.log(`✅ Created ${quizCount} quizzes successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding quizzes:', error);
        process.exit(1);
    }
}

seedQuizzes();
