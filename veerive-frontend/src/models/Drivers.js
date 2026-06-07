import mongoose from 'mongoose';

const { Schema } = mongoose;

const driverSchema = new Schema({
    driverName: { type: String, required: true },
    driverDescription: { type: String, required: false },
    icon: { type: String, required: false }
}, {timestamps: true})

export default mongoose.models.Drivers || mongoose.model('Drivers', driverSchema);