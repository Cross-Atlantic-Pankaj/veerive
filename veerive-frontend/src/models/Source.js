import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema({
  sourceName: { type: String, required: true },
  sourceType: { type: String },
  generalComment: { type: String, default: '' },
}, {
  timestamps: true
});

export default mongoose.models.Source || mongoose.model('Source', SourceSchema);