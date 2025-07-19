import axios from "axios";

const API_URL = "http://localhost:5000/api/cart";

export const getCart = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const addToCart = async (productId) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_URL}/add/${productId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const removeFromCart = async (productId) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_URL}/remove/${productId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};