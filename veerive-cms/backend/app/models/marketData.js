import { Schema, model } from 'mongoose';

const marketDataSchema = new Schema({
  title: { type: String, required: true },
  dataDescription: { type: String, required: true },
  sector: { type: Schema.Types.ObjectId, ref: 'Sector', required: true },
  subSector: { type: Schema.Types.ObjectId, ref: 'SubSector', required: false },
  sourceName: { type: String, required: true },
  csvUpload: { type: String } // store file path or URL
}, { timestamps: true });

export default model('MarketData', marketDataSchema, 'market_data'); 