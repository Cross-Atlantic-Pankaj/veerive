import mongoose from 'mongoose';

const sidebarMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  acknowledgment: {
    type: String,
    required: true
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt fields
});

const SidebarMessage = mongoose.models.SidebarMessage || mongoose.model('SidebarMessage', sidebarMessageSchema);
export default SidebarMessage; 