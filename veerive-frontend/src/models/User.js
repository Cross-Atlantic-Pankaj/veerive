const mongoose = require('mongoose');

const savedPostSchema = new mongoose.Schema({
  SavedpostId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'savedPosts.postType'
  },
  SavedpostType: {
    type: String,
    required: true,
    enum: ['Post', 'Context', 'Theme'] 
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.linkedinId;
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true 
  },
  linkedinId: {
    type: String,  
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String 
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  savedPosts: [savedPostSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
