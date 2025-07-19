import React, { useState } from 'react';
import { signup } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './signup.css';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signup(form);
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input 
          name="name" 
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} 
          placeholder="Name" 
          required
        />
        <input 
          name="email" 
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} 
          placeholder="Email" 
          required
        />
        <input 
          name="password" 
          type="password" 
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} 
          placeholder="Password" 
          required
          minLength="6"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <div className="auth-link">
        Already have account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Signup;