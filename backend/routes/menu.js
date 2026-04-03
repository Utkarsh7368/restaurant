const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');

// Public route to get all dishes
router.get('/', async (req, res) => {
  try {
    const dishes = await Dish.find({}).lean();
    res.json(dishes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
