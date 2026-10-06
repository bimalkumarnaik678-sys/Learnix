import mongoose from 'mongoose';
import User from './models/User.js';
import { MONGODB_URI } from './config/env.js';

async function testCaseSensitivity() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = 'case@test.com';
        const password = 'password123';

        // Cleanup
        await User.deleteOne({ email });

        // Register (Mongoose lowercase setter should make this lowercase in DB)
        console.log('Creating user with MixedCase...');
        await User.create({
            name: 'Case Test',
            email: 'Case@Test.com',
            password
        });

        // Verify it is stored as lowercase
        const stored = await User.findOne({ email: 'case@test.com' });
        if (stored) {
            console.log('✅ User stored as lowercase:', stored.email);
        } else {
            console.error('❌ User NOT found with lowercase query (unexpected).');
        }

        // Try to find with MixedCase (simulating login bug)
        console.log('Attempting findOne with MixedCase...');
        const foundMixed = await User.findOne({ email: 'Case@Test.com' });

        if (foundMixed) {
            console.log('✅ Found user with MixedCase query (Mongoose might be handling it? or Collation?)');
        } else {
            console.log('❌ Failed to find user with MixedCase query. THIS IS THE BUG.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testCaseSensitivity();
