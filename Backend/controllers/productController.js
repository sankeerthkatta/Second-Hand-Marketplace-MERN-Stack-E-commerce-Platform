const Product = require('../models/Product');

exports.uploadProduct = async (req, res) => {
  try {
    const {
      sellerName, phoneNumber,
      category, subcategory, brand, title,
      description, price, state
    } = req.body;

    const imagePaths = req.files.map(file => file.path);

    const product = new Product({
      userId: req.user.id,
      sellerName,
      phoneNumber,
      category,
      subcategory,
      brand,
      title,
      description,
      price,
      state,
      images: imagePaths
    });

    await product.save();
    res.status(201).json({ msg: "Product uploaded successfully", product });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Failed to upload product", error: err.message });
  }
};