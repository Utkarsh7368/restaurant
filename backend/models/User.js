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
  houseNo: { type: String, default: '' },
  addressLabel: { type: String, default: 'Home' },
  // Secondary Address
  secondaryAddress: { type: String, default: '' },
  secondaryLandmark: { type: String, default: '' },
  secondaryLat: { type: Number, default: 0 },
  secondaryLng: { type: Number, default: 0 },
  secondaryHouseNo: { type: String, default: '' },
  secondaryAddressLabel: { type: String, default: 'Work' },
  // Role & Branch Management
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  branch: { type: String, enum: ['Auraiya', 'Dibiyapur'], default: 'Auraiya' } // Only for admins
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
