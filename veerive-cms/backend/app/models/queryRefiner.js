import { Schema, model } from 'mongoose';

const queryRefinerSchema = new Schema({
  title: { type: String, required: true },
  moduleDescription: { type: String, required: true },
  promptGuidance: { type: String, required: true },
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  subSector: { type: Schema.Types.ObjectId, ref: 'SubSector', required: false }
}, { timestamps: true });

export default model('QueryRefiner', queryRefinerSchema, 'query_refiner'); 