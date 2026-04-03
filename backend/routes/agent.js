const express = require('express');
const router = express.Router();
const { verifyAgent } = require('../middleware/auth');
const Order = require('../models/Order');

// Get assigned orders for the logged-in agent
router.get('/assigned-orders', verifyAgent, async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgentId: req.user.id })
      .populate('user', 'name phone address landmark')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Agent mark order as delivered
router.patch('/order/deliver/:id', verifyAgent, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    
    // Safety check: only assigned agent can deliver
    if (order.deliveryAgentId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not assigned to this order' });
    }

    order.isDelivered = true;
    order.status = 'delivered';
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Agent mark order as paid (for COD)
router.patch('/order/pay/:id', verifyAgent, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    
    if (order.deliveryAgentId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not assigned to this order' });
    }

    order.isPaid = true;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
