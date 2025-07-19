const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createOrder } = require("../controllers/paymentController");

router.post("/create-order", auth, createOrder);

module.exports = router;