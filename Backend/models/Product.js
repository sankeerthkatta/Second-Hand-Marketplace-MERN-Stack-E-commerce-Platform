const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    brand: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    state: { type: String, required: true },
    images: [String], 
    createdAt: { type: Date, default: Date.now },
    sold: { type: Boolean, default: false },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
