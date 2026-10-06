import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';
import Module from './models/Module.js';
import Course from './models/Course.js';

dotenv.config();

const sampleQuizzes = [
    {
        title: "Introduction to Algorithms Quiz",
        description: "Test your understanding of basic algorithm concepts",
        topicTags: ["algorithms", "basics", "introduction"],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        difficulty: "Easy",
        questions: [
            {
                type: "mcq",
                text: "What is an algorithm?",
                options: [
                    { text: "A step-by-step procedure to solve a problem", value: "A" },
                    { text: "A programming language", value: "B" },
                    { text: "A type of data structure", value: "C" },
                    { text: "A computer hardware component", value: "D" }
                ],
                correctAnswer: "A",
                points: 1,
                explanation: "An algorithm is a step-by-step procedure or formula for solving a problem.",
                difficulty: "Easy"
            },
            {
                type: "mcq",
                text: "Which of the following is NOT a characteristic of a good algorithm?",
                options: [
                    { text: "Finiteness", value: "A" },
                    { text: "Definiteness", value: "B" },
                    { text: "Ambiguity", value: "C" },
                    { text: "Effectiveness", value: "D" }
                ],
                correctAnswer: "C",
                points: 1,
                explanation: "A good algorithm should be unambiguous, not ambiguous. It should have clear and precise steps.",
                difficulty: "Easy"
            },
            {
                type: "multiselect",
                text: "Which of the following are common algorithm design paradigms? (Select all that apply)",
                options: [
                    { text: "Divide and Conquer", value: "A" },
                    { text: "Dynamic Programming", value: "B" },
                    { text: "Object-Oriented Programming", value: "C" },
                    { text: "Greedy Algorithms", value: "D" }
                ],
                correctAnswer: ["A", "B", "D"],
                points: 2,
                explanation: "Divide and Conquer, Dynamic Programming, and Greedy Algorithms are algorithm design paradigms. OOP is a programming paradigm.",
                difficulty: "Medium"
            },
            {
                type: "mcq",
                text: "What is the time complexity of linear search in the worst case?",
                options: [
                    { text: "O(1)", value: "A" },
                    { text: "O(log n)", value: "B" },
                    { text: "O(n)", value: "C" },
                    { text: "O(n²)", value: "D" }
                ],
                correctAnswer: "C",
                points: 1,
                explanation: "Linear search has O(n) time complexity in the worst case as it may need to check every element.",
                difficulty: "Medium"
            },
            {
                type: "mcq",
                text: "Which sorting algorithm has the best average-case time complexity?",
                options: [
                    { text: "Bubble Sort", value: "A" },
                    { text: "Insertion Sort", value: "B" },
                    { text: "Merge Sort", value: "C" },
                    { text: "Selection Sort", value: "D" }
                ],
                correctAnswer: "C",
                points: 1,
                explanation: "Merge Sort has O(n log n) average-case time complexity, which is better than the O(n²) of the other options.",
                difficulty: "Medium"
            }
        ]
    },
    {
        title: "Big O Notation Mastery",
        description: "Master the concepts of time and space complexity",
        topicTags: ["complexity", "big-o", "analysis"],
        timeLimit: 15,
        passingScore: 75,
        maxAttempts: 3,
        difficulty: "Medium",
        questions: [
            {
                type: "mcq",
                text: "What does Big O notation describe?",
                options: [
                    { text: "The exact runtime of an algorithm", value: "A" },
                    { text: "The upper bound of an algorithm's growth rate", value: "B" },
                    { text: "The lower bound of an algorithm's growth rate", value: "C" },
                    { text: "The average runtime of an algorithm", value: "D" }
                ],
                correctAnswer: "B",
                points: 1,
                explanation: "Big O notation describes the upper bound (worst-case) growth rate of an algorithm.",
                difficulty: "Easy"
            },
            {
                type: "multiselect",
                text: "Which of the following time complexities are considered efficient for large inputs? (Select all that apply)",
                options: [
                    { text: "O(1)", value: "A" },
                    { text: "O(log n)", value: "B" },
                    { text: "O(n²)", value: "C" },
                    { text: "O(n log n)", value: "D" }
                ],
                correctAnswer: ["A", "B", "D"],
                points: 2,
                explanation: "O(1), O(log n), and O(n log n) are considered efficient. O(n²) becomes slow for large inputs.",
                difficulty: "Medium"
            },
            {
                type: "mcq",
                text: "What is the space complexity of an algorithm that uses a fixed-size array regardless of input size?",
                options: [
                    { text: "O(1)", value: "A" },
                    { text: "O(n)", value: "B" },
                    { text: "O(log n)", value: "C" },
                    { text: "O(n²)", value: "D" }
                ],
                correctAnswer: "A",
                points: 1,
                explanation: "If the space used doesn't grow with input size, it's O(1) constant space.",
                difficulty: "Easy"
            }
        ]
    },
    {
        title: "Sorting Algorithms Deep Dive",
        description: "Test your knowledge of various sorting algorithms",
        topicTags: ["sorting", "algorithms", "comparison"],
        timeLimit: 25,
        passingScore: 70,
        maxAttempts: 3,
        difficulty: "Hard",
        questions: [
            {
                type: "mcq",
                text: "Which sorting algorithm is NOT comparison-based?",
                options: [
                    { text: "Quick Sort", value: "A" },
                    { text: "Merge Sort", value: "B" },
                    { text: "Counting Sort", value: "C" },
                    { text: "Heap Sort", value: "D" }
                ],
                correctAnswer: "C",
                points: 1,
                explanation: "Counting Sort is a non-comparison based sorting algorithm that counts occurrences.",
                difficulty: "Medium"
            },
            {
                type: "multiselect",
                text: "Which sorting algorithms are stable? (Select all that apply)",
                options: [
                    { text: "Merge Sort", value: "A" },
                    { text: "Quick Sort", value: "B" },
                    { text: "Insertion Sort", value: "C" },
                    { text: "Heap Sort", value: "D" }
                ],
                correctAnswer: ["A", "C"],
                points: 2,
                explanation: "Merge Sort and Insertion Sort are stable. Quick Sort and Heap Sort are typically not stable.",
                difficulty: "Hard"
            },
            {
                type: "mcq",
                text: "What is the worst-case time complexity of Quick Sort?",
                options: [
                    { text: "O(n)", value: "A" },
                    { text: "O(n log n)", value: "B" },
                    { text: "O(n²)", value: "C" },
                    { text: "O(log n)", value: "D" }
                ],
                correctAnswer: "C",
                points: 1,
                explanation: "Quick Sort has O(n²) worst-case complexity when the pivot selection is poor.",
                difficulty: "Medium"
            },
            {
                type: "mcq",
                text: "Which sorting algorithm is best for nearly sorted data?",
                options: [
                    { text: "Bubble Sort", value: "A" },
                    { text: "Insertion Sort", value: "B" },
                    { text: "Heap Sort", value: "C" },
                    { text: "Merge Sort", value: "D" }
                ],
                correctAnswer: "B",
                points: 1,
                explanation: "Insertion Sort performs very well (O(n)) on nearly sorted data.",
                difficulty: "Hard"
            }
        ]
    }
];

async function seedQuizzes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing quizzes
        await Quiz.deleteMany({});
        console.log('Cleared existing quizzes');

        // Get all modules
        const modules = await Module.find();

        if (modules.length === 0) {
            console.log('No modules found. Please seed modules first.');
            process.exit(1);
        }

        // Create quizzes for modules
        const quizzesToCreate = [];

        for (let i = 0; i < Math.min(modules.length, sampleQuizzes.length); i++) {
            const module = modules[i];
            const quizData = sampleQuizzes[i];

            // Get course ID from module
            const course = await Course.findById(module.courseId);

            quizzesToCreate.push({
                ...quizData,
                courseId: course._id,
                moduleId: module._id,
                isActive: true
            });
        }

        const createdQuizzes = await Quiz.insertMany(quizzesToCreate);
        console.log(`✅ Created ${createdQuizzes.length} quizzes`);

        // Display summary
        createdQuizzes.forEach((quiz, index) => {
            console.log(`\n${index + 1}. ${quiz.title}`);
            console.log(`   Module: ${modules[index].title}`);
            console.log(`   Questions: ${quiz.questions.length}`);
            console.log(`   Time Limit: ${quiz.timeLimit} minutes`);
            console.log(`   Difficulty: ${quiz.difficulty}`);
        });

        console.log('\n✅ Quiz seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding quizzes:', error);
        process.exit(1);
    }
}

seedQuizzes();
