import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useEffect, useState } from 'react';
import { FaHeart, FaBell, FaShoppingCart, FaUser, FaSearch, FaPlusCircle, FaComments } from 'react-icons/fa';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // true if token exists

    const saved = localStorage.getItem("notifications");
    setNotifCount(saved ? JSON.parse(saved).length : 0);
    const handler = () => {
      const saved = localStorage.getItem("notifications");
      setNotifCount(saved ? JSON.parse(saved).length : 0);
    };
    window.addEventListener("newNotification", handler);
    return () => window.removeEventListener("newNotification", handler);
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserName('');
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSellClick = (e) =>{
    if(isLoggedIn){
      navigate('/sell');
    }else{
      navigate('/login');
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container">
        <img 
          src="/image.png" 
          alt="ABC Company Logo" 
          className="logo-image"
        />
        <span className="logo-text">ABC express</span>
      </Link>

      <form onSubmit={handleSearch} className="search-container">
        <input 
          type="text" 
          className="search-box" 
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          <FaSearch />
        </button>
      </form>
      
      
      <div className="icon-links">
        <Link to="favourites"><FaHeart /></Link>
        <Link to="notifications"><FaBell /></Link>
        <Link to="cart"><FaShoppingCart /></Link>
        <Link to="profile"><FaUser /></Link>
        <Link to="/chats">
          <FaComments />
        </Link>
      </div>

      <button onClick={handleSellClick} className="sell-button">
        <FaPlusCircle /> Sell
      </button>

      {isLoggedIn ? (
        <button onClick={handleLogout} className="login-button">
          Logout
        </button>
      ) : (
        <Link to="/login" className="login-button">
          Login
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
