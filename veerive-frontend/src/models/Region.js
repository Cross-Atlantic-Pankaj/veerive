import mongoose from 'mongoose';

const RegionSchema = new mongoose.Schema({
  regionName: { type: String, required: true },
    regionIcon: { type: String, required: false },
    regionDescription: { type: String, required: false },
    generalComment: { type: String, required: false },
});

export default mongoose.models.Region || mongoose.model('Region', RegionSchema);