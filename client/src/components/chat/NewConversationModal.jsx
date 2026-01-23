import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiUsers, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const NewConversationModal = ({ onClose }) => {
  const { user } = useAuthStore();
  const { createConversation, setActiveConversation } = useChatStore();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', { params: { search: searchQuery } });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (isGroup && !groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setIsLoading(true);
    try {
      const conversation = await createConversation({
        type: isGroup || selectedUsers.length > 1 ? 'group' : 'private',
        participantIds: selectedUsers,
        groupName: isGroup ? groupName : undefined,
      });

      setActiveConversation(conversation);
      toast.success('Conversation created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create conversation');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">New Conversation</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/50 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Group Toggle */}
            <div className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="isGroup"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
                className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400"
              />
              <label htmlFor="isGroup" className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                <FiUsers className="w-5 h-5" />
                <span className="font-medium">Create Group Chat</span>
              </label>
            </div>

            {/* Group Name */}
            <AnimatePresence>
              {isGroup && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <input
                    type="text"
                    placeholder="Group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Selected Users Count */}
            {selectedUsers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
              >
                <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </p>
              </motion.div>
            )}

            {/* User List */}
            <div className="space-y-2">
              {users.map((u, index) => (
                <motion.button
                  key={u._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => toggleUserSelection(u._id)}
                  className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${
                    selectedUsers.includes(u._id)
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500 dark:border-primary-400'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-700 border-2 border-transparent'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.username}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 dark:border-dark-600"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{u.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                  </div>
                  {selectedUsers.includes(u._id) && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-7 h-7 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <FiCheck className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-700 flex gap-3 bg-gray-50 dark:bg-dark-900/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 dark:border-dark-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all font-medium"
              disabled={isLoading}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateConversation}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || selectedUsers.length === 0}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : 'Create'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewConversationModal;
