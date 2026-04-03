const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { verifyAdmin } = require('../middleware/auth');

// @route   GET api/category
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/category
// @desc    Add new category
// @access  Admin
router.post('/', verifyAdmin, async (req, res) => {
  const { name, id, icon, order } = req.body;
  try {
    let category = await Category.findOne({ id });
    if (category) return res.status(400).json({ msg: 'Category already exists' });

    category = new Category({ name, id, icon, order });
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/category/:id
// @desc    Update category
// @access  Admin
router.patch('/:id', verifyAdmin, async (req, res) => {
  const { name, icon, order } = req.body;
  try {
    let category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    if (name) category.name = name;
    if (icon) category.icon = icon;
    if (order !== undefined) category.order = order;

    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/category/:id
// @desc    Delete category
// @access  Admin
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
