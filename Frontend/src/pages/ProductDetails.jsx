import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductDetails.css';
import { addToCart } from '../services/cartService';
import React from 'react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Listen for product updates
    const refetch = () => {
      setLoading(true);
      axios.get(`http://localhost:5000/api/products/${id}`)
        .then(res => {
          setProduct(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    window.addEventListener("productListUpdated", refetch);
    return () => window.removeEventListener("productListUpdated", refetch);
  }, [id]); // <-- This ensures refetch on id change

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add to cart.");
      return;
    }
    try {
      await addToCart(product._id);
      alert("Added to cart!");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg === "Product is already in your cart.") {
        alert("This product is already in your cart.");
      } else {
        alert("Failed to add to cart.");
      }
    }
  };

  const handleChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to chat.");
      return;
    }
    // Start or get chat
    const res = await axios.post(
      "http://localhost:5000/api/chats/start",
      { sellerId: product.userId._id || product.userId, productId: product._id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    navigate("/chats", { state: { chatId: res.data._id } });
  };

  let userId = localStorage.getItem("userId");
  if (!userId) {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userId = userObj._id || userObj.id || "";
      } catch {
        userId = "";
      }
    }
  }

  // Defensive: Wait for product and product.userId to be loaded
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="not-found">Product not found</div>;
  if (!product.userId) return <div className="loading">Loading seller info...</div>;

  // Defensive: sellerId extraction
  let sellerId = "";
  if (typeof product.userId === "object" && product.userId !== null) {
    sellerId = product.userId._id ? String(product.userId._id) : "";
  } else if (typeof product.userId === "string") {
    sellerId = product.userId;
  }
  const isMyProduct = sellerId && userId && String(sellerId) === String(userId);

  return (
    <div className="product-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="product-header">
        <h1 className="product-title">{product.title}</h1>
        <span className="product-featured">FEATURED</span>
      </div>

      <div className="product-content">
        <div className="product-images">
          <div className="main-image-container" onClick={() => setLightboxOpen(true)} style={{ cursor: "zoom-in" }}>
            <img
              src={`http://localhost:5000/${product.images[mainImage]}`}
              alt={product.title}
              className="main-image"
            />
          </div>
          <div className="thumbnail-gallery">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={`http://localhost:5000/${img}`}
                alt={`${product.title} ${index + 1}`}
                className={`thumbnail ${index === mainImage ? 'active' : ''}`}
                onClick={() => setMainImage(index)}
              />
            ))}
          </div>
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={mainImage}
            slides={product.images.map(img => ({ src: `http://localhost:5000/${img}` }))}
            on={{
              view: ({ index }) => setMainImage(index)
            }}
          />
        </div>

        <div className="product-info">
          <div className="price-section">
            <span className="price">₹ {product.price.toLocaleString()}</span>
            {!product.sold ? (
              <button
                className="make-offer-btn"
                onClick={handleAddToCart}
                disabled={isMyProduct}
                style={isMyProduct ? { background: "#ccc", cursor: "not-allowed" } : {}}
              >
                {isMyProduct ? "This is your product" : "Add to cart"}
              </button>
            ) : (
              <button className="make-offer-btn" disabled style={{ background: "#ccc", cursor: "not-allowed" }}>
                Already Purchased
              </button>
            )}
          </div>

          <div className="basic-info">
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">{product.location}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Posting date</span>
              <span className="info-value">{new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="seller-info">
            <h3>Posted By</h3>
            <div className="seller-details">
              <div className="seller-name">{product.sellerName}
                <div className="seller-number"> Contact: {product.phoneNumber}</div>
              </div>
              <div className="seller-meta">
                {product.userId && typeof product.userId === "object" && product.userId.location && (
                  <span>
                    <b>Location:</b> {product.userId.location}
                  </span>
                )}
              </div>
              <button
                className="chat-btn"
                onClick={handleChat}
                disabled={isMyProduct}
                style={isMyProduct ? { background: "#ccc", cursor: "not-allowed" } : {}}
              >
                {isMyProduct ? "You are the seller" : "Chat with seller"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;