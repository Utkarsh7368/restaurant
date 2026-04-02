const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Agent = require('../models/Agent');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'swadsadan_secret_123';

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ msg: 'No token provided' });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = new User({
        name,
        email,
        googleId,
        role: 'user' // Default to user
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google account if they registered with email before
      user.googleId = googleId;
      await user.save();
    }

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      const userObj = user.toObject();
      delete userObj.password;
      res.json({ token, user: userObj });
    });
  } catch (err) {
    console.error('Google Login Error:', err.message);
    res.status(400).json({ msg: 'Invalid Google Token' });
  }
});

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
      const userObj = user.toObject();
      delete userObj.password;
      res.json({ token, user: userObj });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, agentId, password } = req.body;
    
    // Find user by email OR agentId
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (agentId) {
      user = await Agent.findOne({ agentId });
    }

    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { 
      id: user.id, 
      email: user.email || '', 
      agentId: user.agentId || '',
      name: user.name, 
      role: user.role,
      branch: user.branch || ''
    };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      const userObj = user.toObject();
      delete userObj.password;
      res.json({ token, user: userObj });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
