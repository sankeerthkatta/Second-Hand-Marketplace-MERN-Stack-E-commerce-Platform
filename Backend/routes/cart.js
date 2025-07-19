const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Cart = require("../models/Cart"); // Add this at the top if not already

router.post('/clear', auth, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ msg: "Cart cleared" });
});

module.exports = router;