const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use('/api/auth', require('./routes/auth'));

const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

app.use("/uploads", express.static("uploads"));

const favouriteRoutes = require("./routes/favouriteRoutes");
app.use("/api/favourites", favouriteRoutes);

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

const profileRoutes = require("./routes/profileRoutes");
app.use("/api/users", profileRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chats", chatRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// Socket.io user map
const userSocketMap = {};

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    userSocketMap[userId] = socket.id;
  });

  socket.on('send_message', ({ chatId, toUserId, message, product, sender }) => {
    console.log("send_message event:", { chatId, toUserId, message, product, sender });
    if (userSocketMap[toUserId]) {
      io.to(userSocketMap[toUserId]).emit('receive_message', { chatId, message });
      io.to(userSocketMap[toUserId]).emit('new_notification', {
        senderName: sender.name,
        productTitle: product.title,
        chatId: chatId,
        message: { ...message }
      });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});