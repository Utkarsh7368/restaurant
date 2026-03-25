const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'swadsadan_secret_123';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, role: role || 'user' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { id: user.id, name, email, phone: user.phone, role: user.role } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { id: user.id, name: user.name, email, phone: user.phone, role: user.role } 
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
