import mongoose from 'mongoose';

const SignalSchema = new mongoose.Schema({
  signalName: { type: String, required: true },
  generalComment: { type: String, default: '' },
}, {
  timestamps: true
});

export default mongoose.models.Signal || mongoose.model('Signal', SignalSchema);