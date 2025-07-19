const Razorpay = require("razorpay");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "Failed to create Razorpay order", error: err.message });
  }
};

exports.createOrderForProduct = async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId).populate('userId');
  if (!product) return res.status(404).json({ msg: "Product not found" });
  const seller = product.userId;
  if (!seller.razorpayAccountId) return res.status(400).json({ msg: "Seller not onboarded" });

  const order = await razorpay.orders.create({
    amount: product.price * 100,
    currency: "INR",
    receipt: "order_rcptid_" + Date.now(),
    transfers: [
      {
        account: seller.razorpayAccountId,
        amount: Math.floor(product.price * 100 * 0.95), // 95% to seller
        currency: "INR",
        notes: { productId: product._id }
      }
      // Remaining 5% stays with platform as commission
    ]
  });
  res.json(order);
};