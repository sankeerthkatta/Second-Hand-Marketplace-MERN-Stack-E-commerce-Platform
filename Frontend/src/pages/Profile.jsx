import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', location: '' });
  const [tab, setTab] = useState('purchased');
  const [myListings, setMyListings] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [sold, setSold] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [razorpayId, setRazorpayId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setForm({ name: res.data.name, email: res.data.email, location: res.data.location || "" });
      setRazorpayId(res.data.razorpayId || "");
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        // Purchased products
        const purchasesRes = await axios.get(
          `http://localhost:5000/api/users/${user.id}/purchases`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPurchased(purchasesRes.data);

        // Sold products
        const salesRes = await axios.get(
          `http://localhost:5000/api/users/${user.id}/sales`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSold(salesRes.data);

        // My Listings (unsold)
        const productsRes = await axios.get("http://localhost:5000/api/products");
        setMyListings(productsRes.data.filter(p => p.userId === user.id && !p.sold));
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchListings();
      window.addEventListener("productListUpdated", fetchListings);
      window.addEventListener("purchaseCompleted", fetchListings);
      return () => {
        window.removeEventListener("productListUpdated", fetchListings);
        window.removeEventListener("purchaseCompleted", fetchListings);
      };
    }
  }, [user]);

  const handleEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5000/api/auth/me", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch user data from backend to get the latest info
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setForm({ name: res.data.name, email: res.data.email, location: res.data.location || "" });
      setEdit(false);
      alert("Profile updated!");
    } catch {
      alert("Failed to update profile.");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      brand: product.brand,
      state: product.state,
      // Add other fields as needed
    });
    navigate('/sell', { state: { product } });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/products/${editingProduct}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingProduct(null);
      // Refresh listings
      const res = await axios.get("http://localhost:5000/api/products");
      setMyListings(res.data.filter(p => p.userId === user?.id));
      alert("Product updated!");
      navigate(`/product/${editingProduct}`);
    } catch {
      alert("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyListings(myListings.filter(p => p._id !== productId));
      window.dispatchEvent(new Event("productListUpdated")); // Notify Home
      alert("Product deleted.");
    } catch {
      alert("Failed to delete product.");
    }
  };

  const handleRazorpayIdUpdate = async () => {
    const token = localStorage.getItem("token");
    await axios.put(
      "http://localhost:5000/api/auth/razorpay-id",
      { razorpayId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Razorpay ID updated!");
  };

  const handleOnboardRazorpay = async () => {
    const token = localStorage.getItem("token");
    const contact = prompt("Enter your phone number for Razorpay KYC:");
    const res = await axios.post(
      "http://localhost:5000/api/auth/onboard-razorpay",
      { contact },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Onboarded! Your Razorpay Account ID: " + res.data.accountId);
  };

  if (!user) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
      </div>
      {!edit ? (
        <div className="profile-info">
          <div><b>Name:</b> {user.name}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Location:</b> {user.location}</div>
          <button onClick={() => setEdit(true)}>Edit</button>
        </div>
      ) :
        <form onSubmit={handleEdit} className="profile-edit-form">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            required
            placeholder="Location"
          />
          <button type="submit">Save</button>
          <div className="razorpay-id-section" style={{ marginTop: 40 }}>
        <h3>Razorpay ID</h3>
        <input
          value={razorpayId}
          onChange={e => setRazorpayId(e.target.value)}
          placeholder="Your Razorpay ID"
          style={{ marginBottom: 8, padding: 8, width: "100%", maxWidth: 400 }}
        />
        <button onClick={handleRazorpayIdUpdate} style={{ background: "#1976d2", color: "white", border: "none", borderRadius: 4, padding: "8px 16px" }}>
          Update Razorpay ID
        </button>
      </div>
          <button type="button" onClick={() => setEdit(false)}>Cancel</button>
        </form>
      }

      <div className="profile-tabs">
        <button onClick={() => setTab('purchased')} className={tab === 'purchased' ? 'active' : ''}>Purchased</button>
        <button onClick={() => setTab('selling')} className={tab === 'selling' ? 'active' : ''}>Selling</button>
        <button onClick={() => setTab('sold')} className={tab === 'sold' ? 'active' : ''}>Sold</button>
      </div>
      {loading ? (
        <div style={{ padding: 40 }}>Loading...</div>
      ) : (
        <>
          {tab === 'purchased' && (
            <div>
              <h3>Purchased Products</h3>
              {purchased.length === 0 ? <div>No purchases yet.</div> :
                <div className="product-grid">
                  {purchased.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              }
            </div>
          )}
          {tab === 'selling' && (
            <div>
              <h3>My Listings</h3>
              {myListings.length === 0 ? <div>No listings yet.</div> :
                <div className="product-grid">
                  {myListings.map(product => (
                    <div key={product._id} style={{ position: "relative" }}>
                      {editingProduct === product._id ? (
                        <form onSubmit={handleEditFormSubmit} style={{ background: "#f9f9f9", padding: 12, borderRadius: 6 }}>
                          <input name="title" value={editForm.title} onChange={handleEditFormChange} required style={{ marginBottom: 6, width: "100%" }} />
                          <input name="brand" value={editForm.brand} onChange={handleEditFormChange} required style={{ marginBottom: 6, width: "100%" }} />
                          <input name="state" value={editForm.state} onChange={handleEditFormChange} required style={{ marginBottom: 6, width: "100%" }} />
                          <input name="price" type="number" value={editForm.price} onChange={handleEditFormChange} required style={{ marginBottom: 6, width: "100%" }} />
                          <textarea name="description" value={editForm.description} onChange={handleEditFormChange} required style={{ marginBottom: 6, width: "100%" }} />
                          <button type="submit" style={{ marginRight: 8, background: "#1976d2", color: "white", border: "none", borderRadius: 4, padding: "6px 16px" }}>Save</button>
                          <button type="button" onClick={() => setEditingProduct(null)} style={{ background: "#eee", border: "none", borderRadius: 4, padding: "6px 16px" }}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <ProductCard product={product} />
                          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                            <button onClick={() => handleEditProduct(product)} style={{ background: "#1976d2", color: "white", border: "none", borderRadius: 4, padding: "6px 16px" }}>Edit</button>
                            <button onClick={() => handleDeleteProduct(product._id)} style={{ background: "#ff4757", color: "white", border: "none", borderRadius: 4, padding: "6px 16px" }}>Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              }
            </div>
          )}
          {tab === 'sold' && (
            <div>
              <h3>Sold Products</h3>
              {sold.length === 0 ? <div>No sold products yet.</div> :
                <div className="product-grid">
                  {sold.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              }
            </div>
          )}
        </>
      )}

      <button onClick={handleOnboardRazorpay}>Onboard with Razorpay</button>
    </div>
  );
};

export default Profile;