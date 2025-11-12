import React, { useState } from 'react';
import { FiSearch, FiPlus, FiLogOut, FiBell } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import useNotificationStore from '../../store/notificationStore';
import ConversationList from './ConversationList';
import NewConversationModal from './NewConversationModal';
import NotificationPanel from './NotificationPanel';
import UserProfile from './UserProfile';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { conversations } = useChatStore();
  const { unreadCount } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                title="Notifications"
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowNewConversation(true)}
                className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                title="New conversation"
              >
                <FiPlus className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Logout"
              >
                <FiLogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ConversationList conversations={filteredConversations} />

        {/* User Profile at bottom */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 p-2.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
          >
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-10 h-10 rounded-full border-2 border-gray-200"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </button>
        </div>
      </div>

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
    </>
  );
};

export default Sidebar;
