const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  agentId: { type: String, required: true, unique: true }, // Systematic ID e.g. SWAD_AUR_001
  password: { type: String, required: true },
  branch: { 
    type: String, 
    enum: ['Auraiya', 'Dibiyapur'], 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'agent' } // Keep role for frontend compatibility
}, { timestamps: true });

// Index for admin agent listing (branch + active filter)
agentSchema.index({ branch: 1, isActive: 1 });

module.exports = mongoose.model('Agent', agentSchema);
