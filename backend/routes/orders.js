const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');

// Create a new order
router.post('/create', auth, async (req, res) => {
  try {
    const { items, totalAmount, branch } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'No order items' });
    }

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      branch: branch || 'Auraiya'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user orders
router.get('/user/:id', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const orders = await Order.find({ user: req.params.id })
      .populate('deliveryAgentId', ['name', 'phone'])
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
