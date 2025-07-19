import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleNewNotification = (e) => {
      const notif = e.detail;
      console.log("Received notification:", notif); // <-- Add this line
      if (!notif) return;
      setNotifications(prev => {
        const updated = [notif, ...prev];
        localStorage.setItem("notifications", JSON.stringify(updated));
        return updated;
      });
    };
    window.addEventListener("newNotification", handleNewNotification);
    return () => window.removeEventListener("newNotification", handleNewNotification);
  }, []);

  const handleNotificationClick = (notif) => {
    if (notif.chatId) {
      navigate("/chats", { state: { chatId: notif.chatId } });
    }
  };

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">Notifications</h2>
      <button
        className="clear-notifications-btn"
        onClick={() => {
          setNotifications([]);
          localStorage.removeItem("notifications");
        }}
      >
        Clear Notifications
      </button>
      {notifications.length === 0 ? (
        <div className="notifications-empty">No notifications yet.</div>
      ) : (
        <ul className="notifications-list">
          {notifications.map((notif, idx) => (
            <li
              key={idx}
              style={{ cursor: notif.chatId ? "pointer" : "default" }}
              onClick={() => handleNotificationClick(notif)}
            >
              You got a new message from <b>{notif.senderName || notif.message?.sender?.name || "Someone"}</b>
              {notif.productTitle && <> for <b>{notif.productTitle}</b></>}
              <br />
              <span className="notifications-time">
                {notif.message?.createdAt ? new Date(notif.message.createdAt).toLocaleString() : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;