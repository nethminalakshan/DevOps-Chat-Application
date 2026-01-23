import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiPlus, FiLogOut, FiBell, FiMenu } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import useNotificationStore from '../../store/notificationStore';
import ConversationList from './ConversationList';
import NewConversationModal from './NewConversationModal';
import NotificationPanel from './NotificationPanel';
import UserProfile from './UserProfile';
import EnigmaChat from './EnigmaChat';
import ThemeToggle from '../ui/ThemeToggle';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { conversations } = useChatStore();
  const { unreadCount } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEnigma, setShowEnigma] = useState(false);
  
  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? parseInt(saved) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const minWidth = 280;
  const maxWidth = 500;

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
        localStorage.setItem('sidebarWidth', newWidth.toString());
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const filteredConversations = conversations.filter((conv) => {
    if (conv.type === 'group') {
      return conv.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const otherUser = conv.participants.find((p) => p._id !== user._id);
      return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <>
      <motion.div 
        ref={sidebarRef}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-gray-800 flex flex-col relative"
        style={{ width: sidebarWidth, minWidth: minWidth }}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-900">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent"
            >
              Chats
            </motion.h1>
            
            {/* Action Buttons - Well organized */}
            <div className="flex items-center gap-1.5">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* New Conversation */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewConversation(true)}
                className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-all"
                title="New conversation"
              >
                <FiPlus className="w-5 h-5" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg transition-all"
                title="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 rounded-lg transition-all"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-dark-800 border border-transparent rounded-xl focus:outline-none focus:bg-white dark:focus:bg-dark-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList conversations={filteredConversations} />

        {/* Bottom Action Bar */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-800/50">
          {/* Enigma AI Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEnigma(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
            title="Chat with Enigma AI"
          >
            <RiRobot2Fill className="w-4 h-4" />
            <span>Chat with Enigma AI</span>
          </motion.button>

          {/* User Profile */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 p-2.5 hover:bg-white dark:hover:bg-dark-700 rounded-xl transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-800"
          >
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar}
                alt={user?.username}
                className="w-10 h-10 rounded-full border-2 border-primary-200 dark:border-primary-800 object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark-800 rounded-full"></span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </motion.button>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-primary-500 transition-colors ${
            isResizing ? 'bg-primary-500' : 'bg-transparent hover:bg-primary-400'
          }`}
        >
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      {showNewConversation && (
        <NewConversationModal onClose={() => setShowNewConversation(false)} />
      )}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
      {showEnigma && (
        <EnigmaChat onClose={() => setShowEnigma(false)} />
      )}
    </>
  );
};

export default Sidebar;
