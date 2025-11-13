const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const upload = require('../middleware/upload');
const { authenticateJWT } = require('../middleware/auth');
const path = require('path');

// Get messages for a conversation
router.get('/conversation/:conversationId', authenticateJWT, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    let query = { conversation: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send text message
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ error: 'Conversation ID and content are required' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      type: 'text'
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send file/image message
router.post('/upload', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId || !req.file) {
      return res.status(400).json({ error: 'Conversation ID and file are required' });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      type: fileType,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search messages
router.get('/search', authenticateJWT, async (req, res) => {
  try {
    const { query, conversationId } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    let searchQuery = {
      content: { $regex: query, $options: 'i' }
    };

    if (conversationId) {
      // Verify user is part of conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user._id
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      searchQuery.conversation = conversationId;
    } else {
      // Search in all user's conversations
      const conversations = await Conversation.find({
        participants: req.user._id
      }).select('_id');

      searchQuery.conversation = { $in: conversations.map(c => c._id) };
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'username avatar')
      .populate('conversation')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/read/:conversationId', authenticateJWT, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
