import mongoose from 'mongoose';

const tileTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    type: {
        type: String,
        required: true
    },
    jsxCode: {
        type: String,
        required: true
    },
    backgroundColor: {
        type: String
    },
    previewBackgroundColor: {
        type: String,
        default: '#f8f9fa'
    },
    iconName: {
        type: String
    },
    iconColor: {
        type: String,
        default: '#ffffff'
    },
    iconSize: {
        type: Number,
        default: 32,
        min: 16,
        max: 96
    }
}, { timestamps: true });

export default mongoose.models.TileTemplate || mongoose.model('TileTemplate', tileTemplateSchema);