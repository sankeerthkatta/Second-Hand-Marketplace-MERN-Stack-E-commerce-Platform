// routes/favoriteRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Favourite = require("../models/Favourite");
const Product = require("../models/Product");

// Get all favorite products for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const favourites = await Favourite.find({ user: req.user.id }).populate("product");
    const products = favourites.map(f => f.product);
    res.json(products);
  } catch (err) {
    console.error("Error fetching favourites:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Toggle favourite: add if not exists, remove if already favourited
router.post("/:productId", auth, async (req, res) => {
  const { productId } = req.params;
  try {
    const existing = await Favourite.findOne({ user: req.user.id, product: productId });

    if (existing) {
      await Favourite.findByIdAndDelete(existing._id);
      return res.json({ msg: "Removed from favourites" });
    } else {
      const fav = new Favourite({ user: req.user.id, product: productId });
      await fav.save();
      return res.json({ msg: "Added to favourites" });
    }
  } catch (err) {
    console.error("Error toggling favourite:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
