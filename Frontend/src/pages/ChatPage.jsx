import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import './ChatPage.css';

const socket = io("http://localhost:5000");

function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const location = useLocation();

  // Register user with socket.io
  if (userId) {
    socket.emit("register", userId);
  }

  // Listen for real-time messages
  useEffect(() => {
    socket.on("receive_message", ({ chatId, message }) => {
      if (selectedChat && chatId === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => socket.off("receive_message");
  }, [selectedChat]);

  // Listen for notifications
  useEffect(() => {
    socket.on("new_notification", (data) => {
      window.dispatchEvent(new CustomEvent("newNotification", { detail: data }));
    });
    return () => socket.off("new_notification");
  }, []);

  // Fetch all chats for user
  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/chats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(res.data);
    };
    fetchChats();
  }, []);

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/chats/${selectedChat._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      setLoading(false);
    };
    fetchMessages();
  }, [selectedChat]);

  // Select chat if chatId is passed in location.state
  useEffect(() => {
    if (location.state?.chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === location.state.chatId);
      if (chat) setSelectedChat(chat);
    }
  }, [location.state, chats]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `http://localhost:5000/api/chats/${selectedChat._id}/message`,
      { text: input },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setInput("");
    setMessages((prev) => [...prev, res.data]);
    // Find recipient
    const toUserId = selectedChat.participants.find(u => u._id !== userId)._id;
    socket.emit("send_message", {
      chatId: selectedChat._id,
      toUserId,
      message: res.data,
      product: selectedChat.product,
      sender: selectedChat.participants.find(u => u._id === userId)
    });
  };

  return (
    <div className="chatpage-root">
      {/* Sidebar with chats */}
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {chats.map(chat => (
          <div
            key={chat._id}
            className={`chat-list-item${selectedChat && selectedChat._id === chat._id ? " selected" : ""}`}
            onClick={() => setSelectedChat(chat)}
          >
            <div><b>{chat.product?.title}</b></div>
            <div className="chat-meta">
              With: {chat.participants.filter(u => u._id !== userId).map(u => u.name).join(", ")}
            </div>
            <div className="chat-last">{chat.lastMessage}</div>
          </div>
        ))}
      </div>
      {/* Main chat area */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-main-header">
              <b>{selectedChat.product?.title}</b>
              <div style={{ fontSize: 13, color: "#666" }}>
                Seller: {selectedChat.participants.find(u => u._id === selectedChat.product.userId)?.name}
              </div>
            </div>
            <div className="chat-messages">
              {loading ? <div>Loading...</div> : (
                messages.map(msg => {
                  const isSent = msg.sender._id === userId || msg.sender === userId;
                  return (
                    <div
                      key={msg._id}
                      className={`chat-message-row${isSent ? " sent" : ""}`}
                    >
                      <div className="chat-message-bubble">
                        {msg.text}
                      </div>
                      <div className="chat-message-time">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={sendMessage} className="chat-input-form">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                className="chat-input"
                placeholder="Type a message..."
              />
              <button type="submit" className="chat-send-btn">Send</button>
            </form>
          </>
        ) : (
          <div style={{ padding: 40, color: "#888" }}>Select a chat to start messaging</div>
        )}
      </div>
      {/* Sidebar with seller/product details */}
      <div className="chat-details-sidebar">
        {selectedChat && (
          <div className="chat-details-header">
            <div>
              <b>{selectedChat.product?.title}</b>
              <div style={{ fontSize: 13, color: "#666" }}>
                Seller: {selectedChat.participants.find(u => u._id === selectedChat.product.userId)?.name}
              </div>
            </div>
            <button
              className="chat-delete-btn"
              onClick={async () => {
                if (window.confirm("Delete this chat and all its messages?")) {
                  const token = localStorage.getItem("token");
                  await axios.delete(`http://localhost:5000/api/chats/${selectedChat._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  setChats(chats.filter(c => c._id !== selectedChat._id));
                  setSelectedChat(null);
                  setMessages([]);
                }
              }}
            >
              Delete Chat
            </button>
          </div>
        )}
        {selectedChat && (
          <>
            <h4>Product Details</h4>
            <div><b>{selectedChat.product?.title}</b></div>
            <div>Brand: {selectedChat.product?.brand}</div>
            <div>Price: ₹{selectedChat.product?.price}</div>
            <div>Location: {selectedChat.product?.state}</div>
            <img src={`http://localhost:5000/${selectedChat.product?.images?.[0]}`} alt="" className="chat-details-product-img" />
            <h4>Seller</h4>
            <div>{selectedChat.participants.find(u => u._id === selectedChat.product.userId)?.name}</div>
            <div>{selectedChat.participants.find(u => u._id === selectedChat.product.userId)?.email}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;