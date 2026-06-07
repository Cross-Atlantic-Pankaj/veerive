import mongoose from 'mongoose';

const SubSectorSchema = new mongoose.Schema({
  subSectorName: { type: String, required: true },
  sectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sector' },
  generalComment: { type: String, default: '' },
}, {
  timestamps: true
});

export default mongoose.models.SubSector || mongoose.model('SubSector', SubSectorSchema);