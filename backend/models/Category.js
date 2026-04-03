const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true }, // slugified version like 'maincourse'
  icon: { type: String, default: '🍽️' },
  order: { type: Number, default: 0 } // For sorting categories
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
