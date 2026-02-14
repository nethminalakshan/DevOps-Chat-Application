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
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 transition-colors duration-500">
      <Sidebar />
      {activeConversation ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-dark-900 dark:via-dark-800/50 dark:to-dark-900 transition-colors duration-500">
          <div className="text-center max-w-md px-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full opacity-20 dark:opacity-30 blur-3xl animate-pulse"></div>
              </div>
              <div className="relative text-8xl mb-6 floating">💬</div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 animate-gradient bg-[length:200%_auto]">
              Nethmina Lakshan Herath -EG/2022/5069
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Connect with your team and start collaborating
            </p>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center gap-3 justify-center p-3 bg-white/50 dark:bg-dark-800/50 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover-lift">
                <span className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Real-time messaging</span>
              </div>
              <div className="flex items-center gap-3 justify-center p-3 bg-white/50 dark:bg-dark-800/50 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover-lift">
                <span className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Voice & Video calls</span>
              </div>
              <div className="flex items-center gap-3 justify-center p-3 bg-white/50 dark:bg-dark-800/50 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover-lift">
                <span className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">File sharing</span>
              </div>
              <div className="flex items-center gap-3 justify-center p-3 bg-white/50 dark:bg-dark-800/50 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover-lift">
                <span className="w-3 h-3 bg-pink-500 rounded-full shadow-lg shadow-pink-500/50 animate-pulse"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Enigma AI Assistant</span>
              </div>
            </div>
            <div className="mt-10 text-sm text-gray-400 dark:text-gray-500">
              ✨ Select a conversation from the sidebar to get started
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
