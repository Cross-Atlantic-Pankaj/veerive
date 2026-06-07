import mongoose from 'mongoose';

const StoryOrderSchema = new mongoose.Schema({
  publishDate: { type: Date, required: true },
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'Context', required: true },
  rank: { type: Number, required: true },
}, {
  timestamps: true
});

export default mongoose.models.StoryOrder || mongoose.model('StoryOrder', StoryOrderSchema);