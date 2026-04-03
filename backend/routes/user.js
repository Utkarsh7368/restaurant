const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Update profile (supports primary and secondary addresses)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { 
      phone, alternatePhone, address, landmark, lat, lng, houseNo, label,
      isSecondary // Flag to update secondary address
    } = req.body;
    
    // Build update object (only include fields that are provided)
    const update = {};
    if (phone !== undefined) update.phone = phone;
    if (alternatePhone !== undefined) update.alternatePhone = alternatePhone;

    if (isSecondary) {
      if (address !== undefined) update.secondaryAddress = address;
      if (landmark !== undefined) update.secondaryLandmark = landmark;
      if (lat !== undefined) update.secondaryLat = lat;
      if (lng !== undefined) update.secondaryLng = lng;
      if (houseNo !== undefined) update.secondaryHouseNo = houseNo;
      if (label !== undefined) update.secondaryAddressLabel = label;
    } else {
      if (address !== undefined) update.address = address;
      if (landmark !== undefined) update.landmark = landmark;
      if (lat !== undefined) update.lat = lat;
      if (lng !== undefined) update.lng = lng;
      if (houseNo !== undefined) update.houseNo = houseNo;
      if (label !== undefined) update.addressLabel = label;
    }

    // Single DB call: find + update + return new doc
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: update }, 
      { new: true, select: '-password' }
    ).lean();

    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
