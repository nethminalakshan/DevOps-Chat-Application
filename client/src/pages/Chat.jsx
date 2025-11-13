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
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Sidebar />
      {activeConversation ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20">
          <div className="text-center max-w-md px-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
              </div>
              <div className="relative text-8xl mb-6 animate-bounce-slow">💬</div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Welcome to DevOps Chat
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Connect with your team and start collaborating
            </p>
            <div className="flex flex-col gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2 justify-center">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Real-time messaging</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Voice & Video calls</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>File sharing</span>
              </div>
            </div>
            <div className="mt-8 text-xs text-gray-400">
              Select a conversation from the sidebar to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
