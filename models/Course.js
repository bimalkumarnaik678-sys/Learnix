import mongoose from 'mongoose';

const moduleRefSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    thumbnails: [{ type: String }],
    captions: [{ lang: String, label: String, url: String }],
    durationSec: { type: Number, default: 0 },
    quality: [{ label: String, url: String }],
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    tags: [{ type: String, index: true }],
    modules: [moduleRefSchema],
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    thumbnail: { type: String },
    published: { type: Boolean, default: true },
    instructor: { type: String, default: 'Learnix Team' },
    totalDuration: { type: Number, default: 0 }, // in seconds
    videoCount: { type: Number, default: 0 },
    category: { type: String, default: 'Computer Science' },
    certificateEligible: { type: Boolean, default: true },
    passingThreshold: { type: Number, default: 80 }, // percentage for certificate
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);