const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");
const { uploadProduct } = require("../controllers/productController");
const Product = require("../models/Product");

router.post("/upload", auth, upload.array("images", 12), uploadProduct);

router.get("/", async (req, res) => {
  try {
    // Only fetch products that are not sold
    const products = await Product.find({ sold: { $ne: true } }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('userId', 'name location');
    if (!product) return res.status(404).json({ msg: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update product (with images)
router.put("/:id", auth, upload.array("images", 12), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Update fields
    const fields = [
      "sellerName", "phoneNumber", "brand", "title", "description",
      "price", "state", "category", "subcategory"
    ];
    fields.forEach(field => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    // Handle images
    if (req.files && req.files.length > 0) {
      // If new images uploaded, replace all images
      product.images = req.files.map(file => file.path);
    } else if (req.body.existingImages) {
      // If only existing images are kept (from frontend), use them
      // req.body.existingImages may be a string or array
      if (typeof req.body.existingImages === "string") {
        product.images = [req.body.existingImages];
      } else {
        product.images = req.body.existingImages;
      }
    }

    await product.save();
    res.json({ msg: "Product updated", product });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ msg: "Failed to update product", error: err.message });
  }
});

// Delete product (only by owner)
router.delete('/:id', auth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ msg: "Product not found" });
  if (product.userId.toString() !== req.user.id) {
    return res.status(403).json({ msg: "Unauthorized" });
  }
  await product.deleteOne();
  res.json({ msg: "Product deleted" });
});

// Purchase a single product directly (not via cart)
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.sold) {
      return res.status(400).json({ msg: "Product already sold" });
    }

    // Update product as sold
    product.sold = true;
    product.buyerId = req.user.id;
    product.soldAt = new Date();
    await product.save();

    res.json({ msg: "Purchase successful", product });
    // Optionally: emit socket.io event here for real-time updates
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Advanced search with filters
router.get("/search/advanced", async (req, res) => {
  const { minPrice, maxPrice, state, category, q } = req.query;
  const match = { sold: { $ne: true } };

  if (minPrice) match.price = { ...match.price, $gte: Number(minPrice) };
  if (maxPrice) match.price = { ...match.price, $lte: Number(maxPrice) };
  if (state) match.state = state;
  if (category) match.category = category;
  if (q) {
    match.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } }
    ];
  }

  try {
    const products = await Product.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
