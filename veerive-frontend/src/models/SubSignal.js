import mongoose from 'mongoose';

const SubSignalSchema = new mongoose.Schema({
  subSignalName: { type: String, required: true },
  signalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signal', required: true },
  generalComment: { type: String, default: '' },
}, {
  timestamps: true
});

export default mongoose.models.SubSignal || mongoose.model('SubSignal', SubSignalSchema);