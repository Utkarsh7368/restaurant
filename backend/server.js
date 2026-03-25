require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swadsadan';

// CRITICAL FOR VERCEL: Ensure DB is connected before handling any requests
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) { // 1 = connected
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB Re-connected');
    } catch (err) {
      console.error('MongoDB connection error in middleware:', err);
      return res.status(500).json({ msg: 'Database connection timeout' });
    }
  }
  next();
});

// Basic route for health check
app.get('/', (req, res) => res.send('Swad Sadan API is running.'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', require('./routes/agent'));
app.use('/api/menu', require('./routes/menu'));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
