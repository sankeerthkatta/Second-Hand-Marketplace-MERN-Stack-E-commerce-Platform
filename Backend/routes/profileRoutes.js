const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Product = require("../models/Product");

// Get all products purchased by a user
router.get('/:userId/purchases', auth, async (req, res) => {
  try {
    const purchases = await Product.find({ buyerId: req.params.userId }).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all products sold by a user
router.get('/:userId/sales', auth, async (req, res) => {
  try {
    const sales = await Product.find({ userId: req.params.userId, sold: true }).sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;