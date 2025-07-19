import React, { useState } from 'react';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Signup.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await login(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.user._id || res.user.id);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      // Set user data in context/state if you're using global state management
      alert("Login successful");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
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
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="auth-link">
        New user? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}

export default Login;