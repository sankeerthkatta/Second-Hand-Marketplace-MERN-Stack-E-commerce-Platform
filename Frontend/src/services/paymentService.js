import axios from "axios";

export const createOrder = async (amount) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    "http://localhost:5000/api/payment/create-order",
    { amount },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};