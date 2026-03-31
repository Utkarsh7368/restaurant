const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Dish = require('../models/Dish');

// ================= REVENUE ANALYTICS =================

// Get daily revenue stats for all branches
router.get('/revenue', verifyAdmin, async (req, res) => {
  try {
    // Only superadmins can access this globally
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'SuperAdmin access required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aggregate revenue for both branches
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'delivered' } },
      { $group: { 
          _id: "$branch", 
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        } 
      }
    ]);

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ================= MENU MANAGEMENT =================
// (Shifted from Admin to SuperAdmin)

// Add new dish
router.post('/menu', verifyAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') return res.status(403).json({ msg: 'Unauthorized' });
    const dish = new Dish(req.body);
    await dish.save();
    res.status(201).json(dish);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Update dish
router.put('/menu/:id', verifyAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') return res.status(403).json({ msg: 'Unauthorized' });
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json(dish);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete dish
router.delete('/menu/:id', verifyAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') return res.status(403).json({ msg: 'Unauthorized' });
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) return res.status(404).json({ msg: 'Dish not found' });
    res.json({ msg: 'Dish removed' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
