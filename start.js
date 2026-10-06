import { createServer } from 'http';
import mongoose from 'mongoose';
import { execSync } from 'child_process';
import app from './app.js';
import { PORT } from './config/env.js';
import User from './models/User.js';

const server = createServer(app);

const start = async () => {
    try {
        // Wait for DB connection (app.js initiates it)
        if (mongoose.connection.readyState !== 1) {
            await new Promise(resolve => mongoose.connection.once('open', resolve));
        }

        console.log('🔍 Checking database...');
        // Check if admin exists as a proxy for "seeded"
        const admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('⚠️ Database seems empty. Running seed scripts...');
            try {
                // Run seed scripts synchronously
                console.log('Running basic seed...');
                execSync('node seed.js', { stdio: 'inherit' });

                console.log('Running course seed...');
                execSync('node seed-algorithms-course.js', { stdio: 'inherit' });

                console.log('Running quiz seed...');
                execSync('node seed-algorithms-quizzes.js', { stdio: 'inherit' });

                console.log('✅ Seeding complete.');
            } catch (err) {
                console.error('❌ Seeding failed:', err.message);
            }
        } else {
            console.log('✅ Database already seeded. Skipping seed scripts.');
        }

        server.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`➜  Local:   http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

start();
