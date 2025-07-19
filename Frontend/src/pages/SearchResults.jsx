import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResults() {
  const [products, setProducts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const searchTerm = query.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        // Simple case-insensitive search on title, description, brand, etc.
        const filtered = res.data.filter(product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setProducts(filtered);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Fetch favourites for heart icon
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
  }, [searchTerm]);

  const toggleFavourite = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to use favourites.");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/favourites/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavourites(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );
    } catch (err) {
      alert("Failed to update favourites. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Search Results for "{searchTerm}"</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
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
  );
}

export default SearchResults;