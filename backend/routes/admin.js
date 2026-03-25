const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const Order = require('../models/Order');
const Dish = require('../models/Dish');

// Get all orders across the restaurant
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
         .populate('user', ['name', 'phone', 'address', 'email', 'landmark', 'lat', 'lng'])
         .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin update order status
router.patch('/order/:id', adminAuth, async (req, res) => {
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

// ================= MENU MANAGEMENT =================

// Add new dish
router.post('/menu', adminAuth, async (req, res) => {
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
router.put('/menu/:id', adminAuth, async (req, res) => {
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
router.delete('/menu/:id', adminAuth, async (req, res) => {
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
