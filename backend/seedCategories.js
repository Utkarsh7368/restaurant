const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swadsadan';

const INITIAL_CATEGORIES = [
  { id: 'thali', name: 'Thali', icon: '🥘', order: 1 },
  { id: 'starters', name: 'Starters', icon: '🧆', order: 2 },
  { id: 'maincourse', name: 'Main Course', icon: '🍛', order: 3 },
  { id: 'breads', name: 'Breads', icon: '🫓', order: 4 },
  { id: 'dal', name: 'Dal', icon: '🫕', order: 5 },
  { id: 'rice', name: 'Rice', icon: '🍚', order: 6 },
  { id: 'southindian', name: 'South Indian', icon: '🥞', order: 7 },
  { id: 'chinese', name: 'Chinese', icon: '🥢', order: 8 },
  { id: 'noodles', name: 'Noodles', icon: '🍜', order: 9 },
  { id: 'momos', name: 'Momos', icon: '🥟', order: 10 },
  { id: 'soups', name: 'Soups', icon: '🥣', order: 11 },
  { id: 'pizza', name: 'Pizza', icon: '🍕', order: 12 },
  { id: 'pasta', name: 'Pasta & Maggi', icon: '🍝', order: 13 },
  { id: 'burgers', name: 'Burgers', icon: '🍔', order: 14 },
  { id: 'sandwich', name: 'Sandwich', icon: '🥪', order: 15 },
  { id: 'fries', name: 'Fries', icon: '🍟', order: 16 },
  { id: 'shakes', name: 'Shakes', icon: '🥤', order: 17 },
  { id: 'mojito', name: 'Mojito', icon: '🍹', order: 18 },
  { id: 'salad', name: 'Salad & Raita', icon: '🥗', order: 19 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing (optional, but good for a fresh start in this case)
    // await Category.deleteMany({});

    for (const cat of INITIAL_CATEGORIES) {
      await Category.findOneAndUpdate(
        { id: cat.id },
        cat,
        { upsert: true, new: true }
      );
    }

    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
