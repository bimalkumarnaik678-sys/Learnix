// Seed script for Learnix demo data
import mongoose from 'mongoose';
import { MONGODB_URI } from './config/env.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Module from './models/Module.js';
import Quiz from './models/Quiz.js';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Ensure admin user exists
  const adminEmail = 'admin@learnai.local';
  const adminPassword = 'Admin123!';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: adminEmail, password: adminPassword, role: 'admin' });
    console.log('Admin created:', adminEmail, '(password:', adminPassword, ')');
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  // Create demo course if not exists
  const courseTitle = 'Intro to Algorithms (Demo)';
  let course = await Course.findOne({ title: courseTitle });
  if (!course) {
    course = await Course.create({
      title: courseTitle,
      description: 'A tiny demo course with two short modules.',
      tags: ['demo', 'algorithms'],
      modules: [
        {
          title: 'Module 1: What is an Algorithm?',
          description: 'Short intro',
          videoUrl: 'https://youtu.be/G9JxuWk7BDA',
          captions: [{ lang: 'en', label: 'English', url: '/public/subtitles/sample.vtt' }],
          durationSec: 60,
          order: 1,
        },
        {
          title: 'Module 2: Complexity Basics',
          description: 'Big-O intuition',
          videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
          captions: [{ lang: 'en', label: 'English', url: '/public/subtitles/sample.vtt' }],
          durationSec: 75,
          order: 2,
        },
      ],
      published: true,
    });
    console.log('Course created:', course.title);
  } else {
    console.log('Course already exists:', course.title);
  }

  // Create Module documents for each module entry
  const moduleDocs = [];
  for (const m of course.modules) {
    const exists = await Module.findOne({ _id: m._id });
    if (!exists) {
      const created = await Module.create({
        _id: m._id,
        courseId: course._id,
        title: m.title,
        description: m.description,
        videoUrl: m.videoUrl,
        captions: m.captions,
        durationSec: m.durationSec,
        order: m.order,
      });
      moduleDocs.push(created);
    }
  }
  if (moduleDocs.length) console.log('Module docs created:', moduleDocs.length);

  // Create a sample quiz for the first module
  const firstModuleId = course.modules[0]._id;
  const existingQuiz = await Quiz.findOne({ courseId: course._id, moduleId: firstModuleId });
  if (!existingQuiz) {
    await Quiz.create({
      courseId: course._id,
      moduleId: firstModuleId,
      title: 'Intro to Algorithms Quiz',
      questions: [
        {
          type: 'mcq',
          text: 'Which describes an algorithm best?',
          options: [
            { text: 'A cooking recipe', value: 'a' },
            { text: 'A computer', value: 'b' },
            { text: 'A programming language', value: 'c' },
          ],
          correctAnswer: 'a',
          explanation: 'An algorithm is a finite sequence of steps, like a recipe.',
        },
        {
          type: 'short',
          text: 'Define time complexity in one sentence.',
          correctAnswer: 'qualitative',
          explanation: 'Short-answer is evaluated later with rules/AI.',
        },
      ],
    });
    console.log('Sample quiz created for module 1');
  } else {
    console.log('Sample quiz already exists for module 1');
  }

  await mongoose.disconnect();
  console.log('Seed finished.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});