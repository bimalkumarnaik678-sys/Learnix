import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';

mongoose
  .connect(MONGODB_URI, { autoIndex: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });