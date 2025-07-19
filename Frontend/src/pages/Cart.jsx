import React, { useEffect, useState } from 'react'
import { getCart, removeFromCart } from "../services/cartService";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { createOrder } from "../services/paymentService";

const Cart = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setItems(data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      }
    };
    fetchCart();
  }, [navigate]);

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
    setItems(items.filter(i => i.product._id !== productId));
  };

  // Individual buy handler
  const handleBuy = async (productId) => {
    const token = localStorage.getItem("token");
    const { data: order } = await axios.post(
      "http://localhost:5000/api/payment/create-order-product",
      { productId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: "YOUR_RAZORPAY_KEY_ID",
        amount: order.amount,
        currency: order.currency,
        name: "Marketplace",
        description: "Product Payment",
        order_id: order.id,
        handler: function (response) {
          alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
          // Optionally, call backend to mark product as sold
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    };
    document.body.appendChild(script);
  };

  // Clear cart handler
  const handleClearCart = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/cart/clear`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems([]);
      alert("Cart cleared!");
    } catch (err) {
      alert("Failed to clear cart.");
    }
  };

  const handlePayNow = async () => {
    if (items.length === 0) return alert("Cart is empty!");
    const total = items.reduce((sum, i) => sum + i.product.price, 0);
    try {
      const order = await createOrder(total);

      // Load Razorpay script
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        const options = {
          key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
          amount: order.amount,
          currency: order.currency,
          name: "ABC Second-Hand Marketplace",
          description: "Cart Payment",
          order_id: order.id,
          handler: async function (response) {
            // You can verify payment here and then call your backend to mark products as sold
            alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
            // Optionally, call your /cart/purchase endpoint here
          },
          prefill: {
            email: "", // Optionally fill user email
          },
          theme: { color: "#1976d2" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      alert("Payment failed: " + (err.response?.data?.msg || err.message));
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Your cart is empty</h2>
        <Link to="/">Browse products</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2>Your Cart</h2>
      <button
        onClick={handleClearCart}
        style={{
          marginBottom: 20,
          background: "#ff4757",
          color: "white",
          border: "none",
          borderRadius: 4,
          padding: "10px 24px",
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        Clear Cart
      </button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map(({ product }) => (
          <li key={product._id} style={{ display: "flex", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #eee", paddingBottom: 10 }}>
            <img src={`http://localhost:5000/${product.images[0]}`} alt={product.title} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6, marginRight: 20 }} />
            <div style={{ flex: 1 }}>
              <Link to={`/product/${product._id}`} style={{ fontWeight: 600, fontSize: 18 }}>{product.title}</Link>
              <div>Price: ₹ {product.price}</div>
            </div>
            <button
              onClick={() => handleBuy(product._id)}
              style={{ background: "#1976d2", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer", marginRight: 10 }}
            >
              Buy
            </button>
            <button
              onClick={() => handleRemove(product._id)}
              style={{ background: "#ff4757", color: "white", border: "none", borderRadius: 4, padding: "8px 16px", cursor: "pointer" }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Cart