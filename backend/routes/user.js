const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Update profile (phone and address and coordinates)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { phone, alternatePhone, address, landmark, lat, lng } = req.body;
    
    let user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.phone = phone !== undefined ? phone : user.phone;
    user.alternatePhone = alternatePhone !== undefined ? alternatePhone : user.alternatePhone;
    user.address = address !== undefined ? address : user.address;
    user.landmark = landmark !== undefined ? landmark : user.landmark;
    user.lat = lat !== undefined ? lat : user.lat;
    user.lng = lng !== undefined ? lng : user.lng;
    
    // Automatically add to address list if it's empty
    if (address && user.addresses.length === 0) {
      user.addresses.push({ address, houseNo: req.body.houseNo, landmark, lat, lng, label: 'Home' });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a new address to the list
router.post('/add-address', auth, async (req, res) => {
  try {
    const { label, address, houseNo, landmark, lat, lng } = req.body;
    let user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.addresses.push({ label, address, houseNo, landmark, lat, lng });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Delete an address from the list
router.delete('/delete-address/:id', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
