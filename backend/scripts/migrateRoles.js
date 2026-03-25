require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swadsadan';

const migrate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Migration');

    const users = await User.find();
    console.log(`Found ${users.length} users...`);

    let updatedCount = 0;
    for (let user of users) {
      if (user.isAdmin) {
        user.role = 'admin';
      } else {
        user.role = 'user';
      }
      // Explicitly set role and save
      await user.save();
      updatedCount++;
    }

    console.log(`Successfully migrated ${updatedCount} users!`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
