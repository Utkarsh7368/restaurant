const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Update profile (supports primary and secondary addresses)
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { 
      phone, alternatePhone, address, landmark, lat, lng, houseNo,
      isSecondary // Flag to update secondary address
    } = req.body;
    
    let user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.phone = phone !== undefined ? phone : user.phone;
    user.alternatePhone = alternatePhone !== undefined ? alternatePhone : user.alternatePhone;

    if (isSecondary) {
      user.secondaryAddress = address !== undefined ? address : user.secondaryAddress;
      user.secondaryLandmark = landmark !== undefined ? landmark : user.secondaryLandmark;
      user.secondaryLat = lat !== undefined ? lat : user.secondaryLat;
      user.secondaryLng = lng !== undefined ? lng : user.secondaryLng;
      user.secondaryHouseNo = houseNo !== undefined ? houseNo : user.secondaryHouseNo;
    } else {
      user.address = address !== undefined ? address : user.address;
      user.landmark = landmark !== undefined ? landmark : user.landmark;
      user.lat = lat !== undefined ? lat : user.lat;
      user.lng = lng !== undefined ? lng : user.lng;
      user.houseNo = houseNo !== undefined ? houseNo : user.houseNo;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
