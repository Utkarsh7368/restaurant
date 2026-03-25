const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  image: { type: String },
  tags: [{ type: String }],
  isPopular: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  isVeg: { type: Boolean, default: true }
}, { timestamps: true });

dishSchema.index({ tags: 1 });
dishSchema.index({ isPopular: 1 });
dishSchema.index({ name: 'text' }); // For faster text search if needed later

module.exports = mongoose.model('Dish', dishSchema);
