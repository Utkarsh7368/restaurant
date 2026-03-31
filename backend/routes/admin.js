const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Dish = require('../models/Dish');

// Get all orders across the restaurant
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = {};
    if (branch && branch !== 'All') {
      filter.branch = branch;
    }

    const orders = await Order.find(filter)
         .populate('user', ['name', 'phone', 'address', 'email', 'landmark', 'lat', 'lng'])
         .populate('deliveryAgentId', ['name', 'phone'])
         .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin update order status
router.patch('/order/:id', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.status = status;
    await order.save();
    
    // repopulate user so frontend can show who ordered
    const updatedOrder = await Order.findById(order._id).populate('user', ['name', 'phone', 'address', 'email']);
    
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin update payment status
router.patch('/order/payment/:id', verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.isPaid = true;
    await order.save();
    
    // repopulate user so frontend can show who ordered
    const updatedOrder = await Order.findById(order._id).populate('user', ['name', 'phone', 'address', 'email']);
    
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all delivery agents
router.get('/agents', verifyAdmin, async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('name phone');
    res.json(agents);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Assign agent to order
router.patch('/order/assign/:id', verifyAdmin, async (req, res) => {
  try {
    const { agentId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    order.deliveryAgentId = agentId;
    // When assigned, automatically mark as preparing if it's still pending
    if (order.status === 'pending') order.status = 'preparing';
    
    await order.save();
    const updatedOrder = await Order.findById(order._id)
      .populate('user', ['name', 'phone', 'address'])
      .populate('deliveryAgentId', ['name', 'phone']);
      
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ================= MENU MANAGEMENT =================

// Add new dish
router.post('/menu', verifyAdmin, async (req, res) => {
  try {
    const dish = new Dish(req.body);
    await dish.save();
    res.status(201).json(dish);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update dish
router.put('/menu/:id', verifyAdmin, async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json(dish);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete dish
router.delete('/menu/:id', verifyAdmin, async (req, res) => {
  try {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json({ msg: 'Dish removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
