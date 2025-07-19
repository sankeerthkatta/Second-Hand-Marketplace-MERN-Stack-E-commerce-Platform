import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Favourites.css';

function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://localhost:5000/api/favourites", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setFavourites(res.data))
    .catch(err => {
      console.error("Error fetching favourites:", err);
      navigate("/login");
    });
  }, []);

  const toggleFavourite = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/favourites/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refetch the favourites from backend to ensure consistency
      const res = await axios.get("http://localhost:5000/api/favourites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavourites(res.data);

      // Notify other pages (like Home) to refresh their favourites
      window.dispatchEvent(new Event("favouritesUpdated"));
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
    }
  };

  return (
    <div className="favourites-container">
      <h1>Your Favourites</h1>
      <Link to="/" className="back-link">← Back to all products</Link>

      {favourites.filter(product => product && product._id && !product.sold).length === 0 ? (
        <div className="empty-favourites">
          <p>You haven't added any favourites yet</p>
          <Link to="/" className="browse-link">Browse products</Link>
        </div>
      ) : (
        <div className="product-grid">
          {favourites
            .filter(product => product && product._id && !product.sold) // Only show existing and unsold products
            .map(product => (
              <ProductCard
                key={product._id}
                product={product}
                isFavourite={true}
                onToggleFavourite={() => toggleFavourite(product._id)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default Favourites;
