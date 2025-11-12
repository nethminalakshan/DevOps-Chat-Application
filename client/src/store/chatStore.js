import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: new Set(),
  typingUsers: {},
  isLoadingConversations: false,
  isLoadingMessages: false,

  // Conversations
  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const response = await api.get('/conversations');
      set({ conversations: response.data.conversations, isLoadingConversations: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ isLoadingConversations: false });
    }
  },

  setActiveConversation: async (conversation) => {
    console.log('setActiveConversation called with:', conversation);
    set({ activeConversation: conversation, messages: [], isLoadingMessages: true });
    
    if (conversation) {
      try {
        console.log('Fetching messages for conversation:', conversation._id);
        const response = await api.get(`/messages/conversation/${conversation._id}`);
        console.log('Messages fetched:', response.data.messages);
        set({ messages: response.data.messages, isLoadingMessages: false });
      } catch (error) {
        console.error('Error fetching messages:', error);
        set({ isLoadingMessages: false });
      }
    }
  },

  createConversation: async (data) => {
    try {
      const response = await api.post('/conversations', data);
      const newConversation = response.data.conversation;
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        activeConversation: newConversation,
      }));
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  updateConversation: (conversationId, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
    }));
  },

  deleteConversation: async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      set((state) => ({
        conversations: state.conversations.filter((conv) => conv._id !== conversationId),
        activeConversation: state.activeConversation?._id === conversationId ? null : state.activeConversation,
      }));
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Messages
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));

    // Update last message in conversation
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === message.conversation
          ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
          : conv
      ),
    }));
  },

  sendMessage: async (data) => {
    try {
      const response = await api.post('/messages', data);
      const message = response.data.message;
      get().addMessage(message);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  uploadFile: async (conversationId, file) => {
    try {
      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('file', file);

      const response = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const message = response.data.message;
      get().addMessage(message);
      return message;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  markMessagesAsRead: async (conversationId) => {
    try {
      await api.put(`/messages/read/${conversationId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  searchMessages: async (query, conversationId = null) => {
    try {
      const params = { query };
      if (conversationId) params.conversationId = conversationId;
      
      const response = await api.get('/messages/search', { params });
      return response.data.messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw error;
    }
  },

  // Online users
  setUserOnline: (userId) => {
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId]),
    }));
  },

  setUserOffline: (userId) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    });
  },

  // Typing indicators
  setTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const typingUsers = { ...state.typingUsers };
      if (isTyping) {
        if (!typingUsers[conversationId]) {
          typingUsers[conversationId] = new Set();
        }
        typingUsers[conversationId].add(userId);
      } else {
        if (typingUsers[conversationId]) {
          typingUsers[conversationId].delete(userId);
          if (typingUsers[conversationId].size === 0) {
            delete typingUsers[conversationId];
          }
        }
      }
      return { typingUsers };
    });
  },
}));

export default useChatStore;
