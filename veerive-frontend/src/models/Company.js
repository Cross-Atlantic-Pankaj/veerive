import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  parentName: { type: String, default: '' },
  website: { type: String, required: true },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  sectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sector' }],
  subSectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubSector' }],
  generalComment: { type: String, default: '' },
  seoData: {
    metaDescription: { type: Boolean, default: false }
  },
}, {
  timestamps: true
});

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);