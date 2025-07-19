const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  purchasedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  location: { type: String, default: "" },
  razorpayAccountId: { type: String } // Razorpay sub-account ID for Route
});

const User = mongoose.model('User', userSchema);

module.exports = User;
