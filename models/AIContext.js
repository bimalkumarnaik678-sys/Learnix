import mongoose from 'mongoose';

const aiContextSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true, required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', index: true },
    chunk: { type: String, required: true },
    metadata: { type: Object, default: {} },
    embedding: { type: [Number] },
  },
  { timestamps: true }
);

export default mongoose.model('AIContext', aiContextSchema);