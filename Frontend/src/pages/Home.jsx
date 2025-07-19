import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    loadProducts();

    // Listen for product list updates
    const handleUpdate = () => loadProducts();
    window.addEventListener("productListUpdated", handleUpdate);
    return () => window.removeEventListener("productListUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    // Fetch favourites from backend
    const fetchFavourites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setFavourites([]);
        return;
      }
      try {
        const res = await axios.get("http://localhost:5000/api/favourites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavourites(res.data.map(p => p._id));
      } catch (err) {
        setFavourites([]);
      }
    };
    fetchFavourites();

    // Listen for favourites updates
    window.addEventListener("favouritesUpdated", fetchFavourites);

    return () => window.removeEventListener("favouritesUpdated", fetchFavourites);
  }, []);

  const toggleFavourite = async (productId, shouldAdd) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to use favourites.");
      return;
    }

    try {
      // Call backend to toggle favourite
      await axios.post(
        `http://localhost:5000/api/favourites/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state for immediate UI feedback
      setFavourites(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
      // Optionally update localStorage if you want to keep it in sync
      // localStorage.setItem('favourites', JSON.stringify(updatedFavourites));
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
      alert("Failed to update favourites. Please try again.");
    }
  };

  // Check if we're at the exact home path
  const isHomePath = location.pathname === '/';

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>Welcome to ABC Second-Hand Marketplace</h1>
        <p>Browse or sell used items easily!</p>
        
        {/* Outlet will render Favourites, Notifications, Cart, or Profile when those routes are active */}
        <Outlet />
        
        {/* Only show products when we're at the exact home path */}
        {isHomePath && (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                isFavourite={favourites.includes(product._id)}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;