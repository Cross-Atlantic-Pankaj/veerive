import mongoose from 'mongoose';

const SectorSchema = new mongoose.Schema({
  sectorName: { type: String, required: true },
  generalComment: { type: String, default: '' },
}, {
  timestamps: true
});

export default mongoose.models.Sector || mongoose.model('Sector', SectorSchema);