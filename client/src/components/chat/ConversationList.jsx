import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';

const ConversationList = ({ conversations }) => {
  const { user } = useAuthStore();
  const { activeConversation, setActiveConversation, onlineUsers } = useChatStore();

  const getConversationDisplay = (conversation) => {
    if (conversation.type === 'group') {
      return {
        name: conversation.groupName,
        avatar: conversation.groupAvatar || '👥',
        isOnline: false,
      };
    } else {
      const otherUser = conversation.participants.find((p) => p._id !== user._id);
      return {
        name: otherUser?.username || 'Unknown',
        avatar: otherUser?.avatar,
        isOnline: onlineUsers.has(otherUser?._id),
      };
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const msg = conversation.lastMessage;
    if (msg.type === 'image') return '📷 Image';
    if (msg.type === 'file') return '📎 File';
    return msg.content?.substring(0, 40) + (msg.content?.length > 40 ? '...' : '');
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4">
          <FiMessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No conversations yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Start chatting with your friends and colleagues!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation, index) => {
        const { name, avatar, isOnline } = getConversationDisplay(conversation);
        const isActive = activeConversation?._id === conversation._id;

        return (
          <motion.button
            key={conversation._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              console.log('Clicking conversation:', conversation);
              setActiveConversation(conversation);
            }}
            className={`w-full px-5 py-3.5 flex items-center gap-3 transition-all border-b border-gray-100 dark:border-dark-700 ${
              isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-50 dark:hover:bg-primary-900/30 border-l-4 border-l-primary-600 dark:border-l-primary-400'
                : 'border-l-4 border-l-transparent hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <div className="relative flex-shrink-0">
              {typeof avatar === 'string' && avatar.startsWith('http') ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-dark-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl font-semibold text-primary-700 dark:text-primary-300 border-2 border-primary-200 dark:border-primary-700">
                  {avatar}
                </div>
              )}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-800 rounded-full animate-pulse"></div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold text-sm truncate ${
                  isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {name}
                </h3>
                {conversation.updatedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conversation.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {getLastMessagePreview(conversation)}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ConversationList;
