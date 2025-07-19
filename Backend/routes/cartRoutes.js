const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user's cart
router.get("/", auth, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(cart ? cart.items : []);
});

// Add to cart (no quantity, no duplicates)
router.post("/add/:productId", auth, async (req, res) => {
  const { productId } = req.params;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });

  const alreadyInCart = cart.items.some(i => i.product.toString() === productId);
  if (alreadyInCart) {
    return res.status(400).json({ msg: "Product is already in your cart." });
  }

  cart.items.push({ product: productId });
  await cart.save();
  res.json({ msg: "Added to cart" });
});

// Remove from cart
router.post("/remove/:productId", auth, async (req, res) => {
  const { productId } = req.params;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ msg: "Cart not found" });

  cart.items = cart.items.filter(i => i.product.toString() !== productId);
  await cart.save();
  res.json({ msg: "Removed from cart" });
});

// Make payment (purchase all items in cart)
router.post("/purchase", auth, async (req, res) => {
  const { name, mobile, address } = req.body;
  let cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ msg: "Cart is empty" });
  }

  // Add products to user's purchasedProducts
  const user = await require("../models/User").findById(req.user.id);
  const purchasedIds = cart.items.map(i => i.product._id);

  user.purchasedProducts = [...new Set([...(user.purchasedProducts || []), ...purchasedIds])];
  await user.save();

  // Mark products as sold and set buyerId
  await Product.updateMany(
    { _id: { $in: purchasedIds } },
    { $set: { sold: true, buyerId: req.user.id } }
  );

  const updatedProducts = await Product.find({ _id: { $in: purchasedIds } });
  console.log("Updated products after purchase:", updatedProducts);

  // Clear cart
  cart.items = [];
  await cart.save();

  res.json({ msg: "Purchase successful", purchased: purchasedIds });
});

module.exports = router;