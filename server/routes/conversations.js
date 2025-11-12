const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { authenticateJWT } = require('../middleware/auth');

// Get all conversations for current user
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username email avatar status lastSeen')
      .populate('lastMessage')
      .populate('admin', 'username email avatar')
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new conversation (private or group)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { type, participantIds, groupName, groupAvatar } = req.body;

    // Validate
    if (!type || !participantIds || !participantIds.length) {
      return res.status(400).json({ error: 'Type and participants are required' });
    }

    // Add current user to participants
    const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];

    // Check if private conversation already exists
    if (type === 'private' && allParticipants.length === 2) {
      const existing = await Conversation.findOne({
        type: 'private',
        participants: { $all: allParticipants, $size: 2 }
      })
        .populate('participants', 'username email avatar status lastSeen')
        .populate('lastMessage');

      if (existing) {
        return res.json({ success: true, conversation: existing });
      }
    }

    // Create new conversation
    const conversation = await Conversation.create({
      type,
      participants: allParticipants,
      groupName: type === 'group' ? groupName : undefined,
      groupAvatar: type === 'group' ? groupAvatar : undefined,
      admin: type === 'group' ? req.user._id : undefined
    });

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'username email avatar status lastSeen')
      .populate('admin', 'username email avatar');

    res.status(201).json({ success: true, conversation: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    })
      .populate('participants', 'username email avatar status lastSeen')
      .populate('admin', 'username email avatar');

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update group conversation
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { groupName, groupAvatar, participantIds } = req.body;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      type: 'group',
      admin: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Group not found or you are not admin' });
    }

    if (groupName) conversation.groupName = groupName;
    if (groupAvatar) conversation.groupAvatar = groupAvatar;
    if (participantIds) {
      conversation.participants = [...new Set([req.user._id.toString(), ...participantIds])];
    }

    await conversation.save();

    const updated = await Conversation.findById(conversation._id)
      .populate('participants', 'username email avatar status lastSeen')
      .populate('admin', 'username email avatar');

    res.json({ success: true, conversation: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete conversation
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Only group admin can delete group conversations
    if (conversation.type === 'group' && conversation.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only admin can delete group' });
    }

    await Conversation.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ conversation: req.params.id });

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
