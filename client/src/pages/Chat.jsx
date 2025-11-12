import React, { useEffect } from 'react';
import { initializeSocket, getSocket, disconnectSocket } from '../services/socket';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import useNotificationStore from '../store/notificationStore';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuthStore();
  const { 
    activeConversation, 
    addMessage, 
    setUserOnline, 
    setUserOffline, 
    setTyping,
    fetchConversations 
  } = useChatStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (token && user) {
      const socket = initializeSocket(token);

      // Join as user
      socket.emit('user:join', user._id);

      // Listen for new messages
      socket.on('message:new', (message) => {
        addMessage(message);
        
        // Show notification if not in active conversation
        if (!activeConversation || activeConversation._id !== message.conversation) {
          toast.success(`New message from ${message.sender.username}`);
        }
      });

      // Listen for user status changes
      socket.on('user:status', ({ userId, status }) => {
        if (status === 'online') {
          setUserOnline(userId);
        } else {
          setUserOffline(userId);
        }
      });

      // Listen for typing indicators
      socket.on('typing:update', ({ conversationId, userId, isTyping }) => {
        setTyping(conversationId, userId, isTyping);
      });

      // Listen for notifications
      socket.on('notification:new', (notification) => {
        addNotification(notification);
        toast.success(notification.message);
      });

      // Fetch conversations on mount
      fetchConversations();

      return () => {
        disconnectSocket();
      };
    }
  }, [user, activeConversation, addMessage, setUserOnline, setUserOffline, setTyping, addNotification, fetchConversations]);

  // Join/leave conversation rooms
  useEffect(() => {
    const socket = getSocket();
    
    if (activeConversation && socket) {
      socket.emit('conversation:join', activeConversation._id);

      return () => {
        socket.emit('conversation:leave', activeConversation._id);
      };
    }
  }, [activeConversation]);

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />
      {activeConversation ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome to Chat App
            </h2>
            <p className="text-gray-500">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
