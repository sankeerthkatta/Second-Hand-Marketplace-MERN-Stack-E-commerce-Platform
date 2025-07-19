const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/signup', signup);
router.post('/login', login);

// Get current user info
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ msg: "User not found" });
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    location: user.location || '',
    purchasedProducts: user.purchasedProducts || []
  });
});

// Update current user info
router.put('/me', auth, async (req, res) => {
  try {
    const { name, email, location } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.location = location || user.location; 

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      location: user.location 
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update Razorpay ID
router.put('/razorpay-id', auth, async (req, res) => {
  const { razorpayId } = req.body;
  const user = await require('../models/User').findById(req.user.id);
  user.razorpayId = razorpayId;
  await user.save();
  res.json({ msg: "Razorpay ID updated" });
});

// Onboard seller as sub-account
router.post('/onboard-razorpay', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.razorpayAccountId) return res.json({ accountId: user.razorpayAccountId });

  // Minimal example, expand as per Razorpay docs
  const account = await razorpay.accounts.create({
    name: user.name,
    email: user.email,
    contact: req.body.contact, // phone number
    type: "individual",
    // Add more fields as required by Razorpay KYC
  });
  user.razorpayAccountId = account.id;
  await user.save();
  res.json({ accountId: account.id });
});

module.exports = router;
