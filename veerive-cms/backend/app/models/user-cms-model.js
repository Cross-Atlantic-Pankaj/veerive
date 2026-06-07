import mongoose from 'mongoose';

const userCmsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['SuperAdmin', 'Admin', 'Moderator', 'User'],
        default: 'User'
    },
    name: {
        type: String,
        trim: true
    },
    provider: {
        type: String,
        default: 'local'
    },
    resetToken: String,
    resetTokenExpiration: Date,
    lastPasswordUpdate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'users_cms' // Explicitly specify the collection name
});

const UserCms = mongoose.model('UserCms', userCmsSchema);

export default UserCms;
