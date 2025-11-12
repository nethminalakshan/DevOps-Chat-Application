import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiUsers } from 'react-icons/fi';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Group Toggle */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="isGroup"
              checked={isGroup}
              onChange={(e) => setIsGroup(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isGroup" className="flex items-center gap-2 cursor-pointer">
              <FiUsers />
              <span>Create Group Chat</span>
            </label>
          </div>

          {/* Group Name */}
          {isGroup && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="input"
              />
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* User List */}
          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u._id}
                onClick={() => toggleUserSelection(u._id)}
                className={`w-full p-3 flex items-center gap-3 rounded-lg transition-colors ${
                  selectedUsers.includes(u._id)
                    ? 'bg-primary-100 border-2 border-primary-600'
                    : 'hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <img
                  src={u.avatar}
                  alt={u.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium">{u.username}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                {selectedUsers.includes(u._id) && (
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateConversation}
            className="btn btn-primary flex-1"
            disabled={isLoading || selectedUsers.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
