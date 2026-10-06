import mongoose from 'mongoose';
import User from './models/User.js';
import { MONGODB_URI } from './config/env.js';

async function testAuth() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = 'testauth@example.com';
        const password = 'password123';

        // Cleanup
        await User.deleteOne({ email });

        // Register
        console.log('Creating user...');
        const user = await User.create({
            name: 'Test Auth',
            email,
            password
        });
        console.log('User created with hash:', user.password);

        // Login check
        console.log('Attempting login...');
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            console.error('User not found!');
            return;
        }

        const isMatch = await foundUser.comparePassword(password);
        console.log('Password match result:', isMatch);

        if (isMatch) {
            console.log('✅ Auth logic works locally.');
        } else {
            console.error('❌ Password mismatch.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testAuth();
