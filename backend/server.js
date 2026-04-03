require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();

// --- Performance: gzip/brotli compress all responses ---
app.use(compression());

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swadsadan';

// --- Performance: Connect ONCE at startup with optimized pool ---
let dbReady = false;

async function connectDB() {
  if (dbReady) return;
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      // Keep connections alive – avoids cold-start reconnection overhead
      socketTimeoutMS: 45000,
      maxPoolSize: 10,         // Reuse up to 10 connections
      minPoolSize: 2,          // Always keep 2 warm connections ready
    });
    dbReady = true;
    console.log('MongoDB Connected');

    // Handle disconnections gracefully
    mongoose.connection.on('disconnected', () => {
      dbReady = false;
      console.warn('MongoDB disconnected, will reconnect on next request');
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    dbReady = false;
  }
}

// For Vercel serverless: ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  if (!dbReady || mongoose.connection.readyState !== 1) {
    dbReady = false;
    try {
      await connectDB();
    } catch (err) {
      return res.status(500).json({ msg: 'Database connection timeout' });
    }
  }
  next();
});

// Connect immediately (for non-serverless / local dev)
connectDB();

// Basic route for health check
app.get('/', (req, res) => res.send('Swad Sadan API is running.'));

// Routes (removed duplicate user route mount that was doubling middleware)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', require('./routes/superadmin'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/menu', require('./routes/menu'));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;
