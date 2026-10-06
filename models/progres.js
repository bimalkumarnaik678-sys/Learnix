import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true, required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', index: true, required: true },
    lastTime: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

progressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
