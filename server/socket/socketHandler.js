const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Notification = require('../models/Notification');

const socketHandler = (io) => {
  // Store connected users
  const connectedUsers = new Map(); // userId -> socketId
  const typingUsers = new Map(); // conversationId -> Set of userIds

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // User joins
    socket.on('user:join', async (userId) => {
      try {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;

        // Update user status to online
        await User.findByIdAndUpdate(userId, { status: 'online' });

        // Notify all users
        io.emit('user:status', { userId, status: 'online' });

        console.log(`User ${userId} joined`);
      } catch (error) {
        console.error('Error in user:join:', error);
      }
    });

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, content, type, fileUrl, fileName, fileSize } = data;
        const userId = socket.userId;

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content,
          type: type || 'text',
          fileUrl,
          fileName,
          fileSize
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        // Send to all users in conversation
        io.to(conversationId).emit('message:new', populated);

        // Get conversation to send notifications
        const conversation = await Conversation.findById(conversationId);
        const recipientIds = conversation.participants.filter(
          id => id.toString() !== userId
        );

        // Create notifications for offline users
        const sender = await User.findById(userId).select('username');
        for (const recipientId of recipientIds) {
          const recipientSocketId = connectedUsers.get(recipientId.toString());
          
          // Create notification
          const notification = await Notification.create({
            user: recipientId,
            type: 'message',
            title: 'New Message',
            message: `${sender.username} sent you a message`,
            data: {
              conversationId,
              messageId: message._id,
              senderId: userId
            }
          });

          // Send notification to user if online
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('notification:new', notification);
          }
        }

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error('Error in message:send:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ conversationId, userId, username }) => {
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId).add(userId);

      socket.to(conversationId).emit('typing:update', {
        conversationId,
        userId,
        username,
        isTyping: true
      });
    });

    socket.on('typing:stop', ({ conversationId, userId }) => {
      if (typingUsers.has(conversationId)) {
        typingUsers.get(conversationId).delete(userId);
      }

      socket.to(conversationId).emit('typing:update', {
        conversationId,
        userId,
        isTyping: false
      });
    });

    // Message read
    socket.on('message:read', async ({ conversationId, userId }) => {
      try {
        // Mark messages as read
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: userId },
            'readBy.user': { $ne: userId }
          },
          {
            $push: {
              readBy: {
                user: userId,
                readAt: new Date()
              }
            }
          }
        );

        // Notify other users in conversation
        socket.to(conversationId).emit('message:read', { conversationId, userId });
      } catch (error) {
        console.error('Error in message:read:', error);
      }
    });

    // User status update
    socket.on('user:status:update', async ({ userId, status }) => {
      try {
        await User.findByIdAndUpdate(userId, { 
          status,
          lastSeen: status === 'offline' ? new Date() : undefined
        });

        io.emit('user:status', { userId, status });
      } catch (error) {
        console.error('Error in user:status:update:', error);
      }
    });

    // Voice Call Handlers
    socket.on('call:start', ({ to, offer }) => {
      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call:incoming', {
          from: socket.userId,
          offer
        });
      }
    });

    socket.on('call:answer', ({ to, answer }) => {
      const callerSocketId = connectedUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:answered', { answer });
      }
    });

    socket.on('call:ice-candidate', ({ to, candidate }) => {
      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call:ice-candidate', { candidate });
      }
    });

    socket.on('call:reject', ({ to }) => {
      const callerSocketId = connectedUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:rejected');
      }
    });

    socket.on('call:end', ({ to }) => {
      const recipientSocketId = connectedUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call:ended');
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        const userId = socket.userId;

        if (userId) {
          connectedUsers.delete(userId);

          // Update user status to offline
          await User.findByIdAndUpdate(userId, {
            status: 'offline',
            lastSeen: new Date()
          });

          // Notify all users
          io.emit('user:status', { userId, status: 'offline' });

          // Clear typing indicators
          typingUsers.forEach((users, conversationId) => {
            if (users.has(userId)) {
              users.delete(userId);
              io.to(conversationId).emit('typing:update', {
                conversationId,
                userId,
                isTyping: false
              });
            }
          });

          console.log(`User ${userId} disconnected`);
        }

        console.log(`❌ Socket disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });

  return io;
};

module.exports = socketHandler;
