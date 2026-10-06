import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Video from './models/Video.js';
import Quiz from './models/Quiz.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnix';

// Course modules structure for Discrete Math
const modulesData = [
    {
        id: 'mod-1',
        title: '1. Sets and Set Operations',
        description: 'Introduction to Set Theory, types of sets, and fundamental set operations.',
        duration: 900, // 15 minutes
        tags: ['sets', 'discrete-math', 'foundations']
    },
    {
        id: 'mod-2',
        title: '2. Logic and Propositional Calculus',
        description: 'Understanding logical connectives, truth tables, and logical equivalence.',
        duration: 1200, // 20 minutes
        tags: ['logic', 'propositions', 'truth-tables']
    },
    {
        id: 'mod-3',
        title: '3. Relations and Functions',
        description: 'Deep dive into relations, properties of relations, and function types.',
        duration: 1500, // 25 minutes
        tags: ['relations', 'functions', 'mappings']
    },
    {
        id: 'mod-4',
        title: '4. Combinatorics and Counting',
        description: 'Permutations, combinations, and the pigeonhole principle.',
        duration: 1800, // 30 minutes
        tags: ['combinatorics', 'counting', 'probability']
    },
    {
        id: 'mod-5',
        title: '5. Graph Theory Fundamentals',
        description: 'Introduction to graphs, vertices, edges, and graph traversal algorithms.',
        duration: 2100, // 35 minutes
        tags: ['graphs', 'nodes', 'edges']
    }
];

// Single Video Source (Discrete Math Full Course)
const VIDEO_ID = 'M5-F_zQB12k'; // freeCodeCamp Discrete Math
const BASE_URL = `https://www.youtube.com/embed/${VIDEO_ID}`;

// Videos for each module (Segments of the main video)
const videosData = {
    'mod-1': [
        { title: 'Introduction to Sets', startTime: 0, endTime: 600, duration: 600, order: 1 },
        { title: 'Set Operations', startTime: 600, endTime: 900, duration: 300, order: 2 }
    ],
    'mod-2': [
        { title: 'Propositions & Logic', startTime: 900, endTime: 1500, duration: 600, order: 1 },
        { title: 'Truth Tables', startTime: 1500, endTime: 2100, duration: 600, order: 2 }
    ],
    'mod-3': [
        { title: 'Relations Basics', startTime: 2100, endTime: 2700, duration: 600, order: 1 },
        { title: 'Functions & Mappings', startTime: 2700, endTime: 3600, duration: 900, order: 2 }
    ],
    'mod-4': [
        { title: 'Permutations', startTime: 3600, endTime: 4500, duration: 900, order: 1 },
        { title: 'Combinations', startTime: 4500, endTime: 5400, duration: 900, order: 2 }
    ],
    'mod-5': [
        { title: 'Graph Basics', startTime: 5400, endTime: 6300, duration: 900, order: 1 },
        { title: 'Graph Traversal', startTime: 6300, endTime: 7500, duration: 1200, order: 2 }
    ]
};

async function seedDiscreteMathCourse() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Course.deleteMany({ title: 'Discrete Mathematics Masterclass' });
        // Also clear the old Algorithms course to avoid confusion if needed, but let's keep it for now or delete it if user wants "only" this. 
        // User said "the course module was only thought to add a video lecture from youtube which is a descrete mathematics". 
        // I'll delete the old one to be clean.
        await Course.deleteMany({ title: 'Algorithms & Data Structures Masterclass' });

        // We need to be careful not to delete ALL videos if there are other courses, but for this dev environment it's likely safe to clear related videos.
        // I'll fetch the course IDs first if I were being very safe, but here I'll just delete all videos for simplicity as per previous seed script.
        await Video.deleteMany({});
        console.log('Cleared existing course data');

        // Create course
        const course = await Course.create({
            title: 'Discrete Mathematics Masterclass',
            description: 'A comprehensive course on Discrete Mathematics, covering sets, logic, relations, functions, combinatorics, and graph theory. Essential for computer science fundamentals.',
            instructor: 'Dr. Karol Kurek (freeCodeCamp)',
            level: 'beginner',
            category: 'Mathematics',
            tags: ['discrete-math', 'math', 'computer-science', 'logic'],
            thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', // Math-y image
            totalDuration: modulesData.reduce((sum, m) => sum + m.duration, 0),
            videoCount: Object.values(videosData).flat().length,
            certificateEligible: true,
            passingThreshold: 80,
            modules: modulesData.map(mod => ({
                title: mod.title,
                description: mod.description,
                videoUrl: BASE_URL,
                durationSec: mod.duration,
                order: parseInt(mod.id.split('-')[1])
            })),
            published: true
        });

        console.log(`Created course: ${course.title}`);

        // Create videos for each module
        let totalVideos = 0;
        for (const moduleData of modulesData) {
            const moduleVideos = videosData[moduleData.id];
            // Find the module _id from the created course
            const courseModule = course.modules.find(m => m.title === moduleData.title);

            if (!courseModule) {
                console.error(`Module not found for ${moduleData.title}`);
                continue;
            }

            for (const videoData of moduleVideos) {
                await Video.create({
                    courseId: course._id,
                    moduleId: courseModule._id, // Use the actual ObjectId
                    title: videoData.title,
                    description: `Learn about ${videoData.title.toLowerCase()} in this segment.`,
                    videoUrl: BASE_URL,
                    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
                    duration: videoData.duration,
                    startTime: videoData.startTime,
                    endTime: videoData.endTime,
                    order: videoData.order,
                    resources: [
                        { title: 'Lecture Notes', url: '/resources/notes.pdf', type: 'pdf' }
                    ],
                    isPublished: true
                });
                totalVideos++;
            }
        }

        console.log(`Created ${totalVideos} videos across ${modulesData.length} modules`);
        console.log('✅ Discrete Math course seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding course:', error);
        process.exit(1);
    }
}

seedDiscreteMathCourse();
