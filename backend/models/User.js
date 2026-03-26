const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, default: '' },
  password: { type: String, required: false },
  phone: { type: String, default: '' },
  alternatePhone: { type: String, default: '' },
  address: { type: String, default: '' },
  landmark: { type: String, default: '' },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin', 'agent'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
