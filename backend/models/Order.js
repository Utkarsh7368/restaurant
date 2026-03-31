const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  quantity: Number,
  price: Number
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, default: 'COD' },
  isPaid: { type: Boolean, default: false },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  isDelivered: { type: Boolean, default: false },
  branch: { 
    type: String, 
    enum: ['Auraiya', 'Dibiyapur'], 
    default: 'Auraiya' 
  }
}, { timestamps: true });

orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ branch: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
