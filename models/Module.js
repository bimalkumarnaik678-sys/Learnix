import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, required: true },
    captions: [{ lang: String, label: String, url: String }],
    durationSec: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Module', moduleSchema);