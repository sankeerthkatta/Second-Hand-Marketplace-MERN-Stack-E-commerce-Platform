import './ProductCard.css';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { format } from 'date-fns';

const ProductCard = ({ product, isFavourite = false, onToggleFavourite }) => {
  const handleFavouriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavourite(product._id);
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="card-header">
        {onToggleFavourite && (
          <button
            className={`favourite-btn ${isFavourite ? 'favourited' : ''}`}
            onClick={handleFavouriteClick}
            aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          >
            {isFavourite ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>
      <img
        src={`http://localhost:5000/${product.images?.[0] || "fallback.jpg"}`}
        alt={product.title}
        className="product-img"
      />
      <div className="product-info">
        <h4 className="product-title">{product.title}</h4>
        <p className="product-price">₹ {product.price}</p>
        <p className="product-location">{product.state}</p>
        <p className="product-date">
          {format(new Date(product.createdAt), 'MMM d, yyyy')}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
