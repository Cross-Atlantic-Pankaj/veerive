import { Schema, model } from 'mongoose';

const clarificationGuidanceSchema = new Schema({
  title: { type: String, required: true },
  clarificationNote: { type: String, required: true },
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  subSector: { type: Schema.Types.ObjectId, ref: 'SubSector', required: false }
}, { timestamps: true });

export default model('ClarificationGuidance', clarificationGuidanceSchema, 'clarification_guidance'); 