import React, { useState, useEffect } from 'react';
import './Sell.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const categories = {
  Cars: ["Cars"],
  Bikes: ["Motorcycles", "Scooters", "Bicycles"],
  Mobiles: ["Mobile Phones", "Accessories", "Tablets"],
  "Electronics & Appliances": [
    "TVs", "Video - Audio", "Kitchen & Other Appliances", "Computers & Laptops",
    "Cameras & Lenses", "Games & Entertainment", "Fridges", "Computer Accessories",
    "Hard Disks", "Printers & Monitors", "ACs", "Washing Machines"
  ],
  "Commercial Vehicles & Spares": ["Commercial & Other Vehicles", "Spare Parts"],
  Furniture: [
    "Sofa & Dining", "Beds & Wardrobes", "Home Decor & Garden", "Kids Furniture", "Other Household Items"
  ],
  "Books Sports": ["Books", "Gym & Fitness", "Musical Instruments", "Sports Equipment"]
};

function Sell() {
  const location = useLocation();
  const productToEdit = location.state?.product;

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [form, setForm] = useState({
    sellerName: '',
    phoneNumber: '',
    brand: '',
    title: '',
    description: '',
    price: '',
    state: ''
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (productToEdit) {
      setForm({
        sellerName: productToEdit.sellerName || '',
        phoneNumber: productToEdit.phoneNumber || '',
        brand: productToEdit.brand || '',
        title: productToEdit.title || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        state: productToEdit.state || ''
      });
      setCategory(productToEdit.category || '');
      setSubcategory(productToEdit.subcategory || '');
       setStep(2); // <-- Add this line to go directly to the product form
      setExistingImages(productToEdit.images || []); //  set images if you want to show previews
    }
  }, [productToEdit]);

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/');
    }
  };

  const handleNext = () => {
    if (category && subcategory) setStep(2);
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to sell");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    images.forEach(img => formData.append("images", img));
    // Add this line to send existing images if editing
    if (productToEdit && existingImages.length > 0 && images.length === 0) {
      existingImages.forEach(img => formData.append("existingImages", img));
    }

    try {
      if (productToEdit) {
        // Update existing product
        await axios.put(
          `http://localhost:5000/api/products/${productToEdit._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            }
          }
        );
        alert("Product updated successfully!");
        window.dispatchEvent(new Event("productListUpdated")); 
      } else {
        // Create new product
        await axios.post("http://localhost:5000/api/products/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        });
        alert("Product posted successfully!");
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to post/update product.");
    }
  };

  return (
    <div className="sell-container">
      
      <div className="nav-buttons">
        <button className="nav-button" onClick={handleBack}>
          {step === 1 ? 'Back to Home' : 'Back to Categories'}
        </button>
      </div>
      <div className='header-content'>
        <h2>POST YOUR PRODUCT</h2>
      </div>

      {step === 1 && (
        <div className="step">
          <h3>CHOOSE A CATEGORY</h3>
          <div className="category-grid">
            <div className="category-column">
              {Object.keys(categories).map((cat) => (
                <div
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`category-item ${category === cat ? "selected" : ""}`}
                >
                  {cat}
                </div>
              ))}
            </div>
            
            {category && (
              <div className="subcategory-column">
                <h4>Subcategories</h4>
                {categories[category].map((sub) => (
                  <div
                    key={sub}
                    onClick={() => setSubcategory(sub)}
                    className={`subcategory-item ${subcategory === sub ? "selected" : ""}`}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="next-button"
            onClick={handleNext}
            disabled={!category || !subcategory}
          >
            Next
          </button>
        </div>
      )}

      {step === 2 && (
        <form className="product-form" onSubmit={handleSubmit}>
          <h3>Enter Product Details</h3>
          <input className="form-input" placeholder="Seller Name" required value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} />
          <input className="form-input" placeholder="Phone Number" required value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
          <input className="form-input" placeholder="Brand" required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
          <input className="form-input" placeholder="Product Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="form-input" placeholder="Description" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
          <input className="form-input" placeholder="Price" type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input className="form-input" placeholder="State" required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
          
          <label>Upload up to 12 Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />

          {existingImages.length > 0 && (
            <div className="existing-images">
              <label>Existing Images:</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {existingImages.map((img, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    <img
                      src={`http://localhost:5000/${img}`}
                      alt={`Existing ${idx + 1}`}
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute", top: 0, right: 0, background: "red", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer"
                      }}
                      onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                      title="Remove"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="form-submit">Post Now</button>
        </form>
      )}
    </div>
  );
}

export default Sell;