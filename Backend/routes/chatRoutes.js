const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');

// Get all chats for current user
router.get('/', auth, async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id })
    .populate('participants', 'name email location')
    .populate('product');
  res.json(chats);
});

// Get messages for a chat
router.get('/:chatId/messages', auth, async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId }).populate('sender', 'name');
  res.json(messages);
});

// Start or get chat for a product and seller
router.post('/start', auth, async (req, res) => {
  const { sellerId, productId } = req.body;
  let chat = await Chat.findOne({
    participants: { $all: [req.user.id, sellerId] },
    product: productId
  });
  if (!chat) {
    chat = new Chat({
      participants: [req.user.id, sellerId],
      product: productId
    });
    await chat.save();
  }
  res.json(chat);
});

// Send a message
router.post('/:chatId/message', auth, async (req, res) => {
  const { text } = req.body;
  const message = new Message({
    chatId: req.params.chatId,
    sender: req.user.id,
    text
  });
  await message.save();
  // Update chat lastMessage and updatedAt
  await Chat.findByIdAndUpdate(req.params.chatId, {
    lastMessage: text,
    updatedAt: new Date()
  });
  res.json(message);
});

// Delete a chat and its messages
router.delete('/:chatId', auth, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ msg: "Chat not found" });
  // Only allow a participant to delete
  if (!chat.participants.map(String).includes(req.user.id)) {
    return res.status(403).json({ msg: "Not authorized" });
  }
  await Message.deleteMany({ chatId: chat._id });
  await chat.deleteOne();
  res.json({ msg: "Chat deleted" });
});

module.exports = router;