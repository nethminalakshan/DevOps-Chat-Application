import React, { useRef, useState, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiSearch, FiPhone, FiVideo } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import { getSocket } from '../../services/socket';
import webrtcService from '../../services/webrtc';
import MessageList from './MessageList';
import VoiceCall from './VoiceCall';
import toast from 'react-hot-toast';

const ChatWindow = () => {
  const { user } = useAuthStore();
  const { activeConversation, messages, sendMessage, uploadFile, typingUsers } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callInfo, setCallInfo] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Early return if no active conversation
  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Select a conversation
          </h2>
          <p className="text-gray-500">
            Choose a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Setup WebRTC call listeners
    webrtcService.setupCallListeners({
      onIncomingCall: async (from, offer) => {
        const caller = activeConversation?.participants.find(p => p._id === from);
        setCallInfo({
          name: caller?.username || 'Unknown',
          avatar: caller?.avatar,
          userId: from,
          offer
        });
        setIsIncomingCall(true);
        setShowVoiceCall(true);
      },
      onCallAnswered: () => {
        setIsIncomingCall(false);
        toast.success('Call connected!');
      },
      onCallEnded: () => {
        setShowVoiceCall(false);
        setCallInfo(null);
        setLocalStream(null);
        setRemoteStream(null);
        setPeerConnection(null);
        toast.info('Call ended');
      },
      onCallRejected: () => {
        setShowVoiceCall(false);
        setCallInfo(null);
        toast.error('Call was rejected');
      }
    });

    return () => {
      webrtcService.removeCallListeners();
    };
  }, [activeConversation]);

  const handleVoiceCall = async () => {
    if (activeConversation?.type !== 'private') {
      toast.error('Voice calls are only available in private conversations');
      return;
    }

    try {
      const otherUserId = otherUser?._id;
      if (!otherUserId) {
        toast.error('Could not find recipient');
        return;
      }

      const { localStream: stream, peerConnection: pc } = await webrtcService.startCall(otherUserId);
      
      setLocalStream(stream);
      setPeerConnection(pc);
      setCallInfo({
        name: otherUser.username,
        avatar: otherUser.avatar,
        userId: otherUserId
      });
      setIsIncomingCall(false);
      setShowVoiceCall(true);
      
      toast.success('Calling...');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call. Please check microphone permissions.');
    }
  };

  const handleAcceptCall = async () => {
    try {
      const { localStream: stream, peerConnection: pc } = await webrtcService.answerCall(callInfo.offer);
      
      setLocalStream(stream);
      setPeerConnection(pc);
      setIsIncomingCall(false);
      
      toast.success('Call connected!');
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
    }
  };

  const handleDeclineCall = () => {
    webrtcService.endCall();
    const socket = getSocket();
    if (socket) {
      socket.emit('call:reject', { to: callInfo.userId });
    }
    setShowVoiceCall(false);
    setCallInfo(null);
  };

  const handleEndCall = () => {
    webrtcService.endCall();
    const socket = getSocket();
    if (socket) {
      socket.emit('call:end', { to: callInfo.userId });
    }
    setShowVoiceCall(false);
    setCallInfo(null);
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
  };

  const handleVideoCall = () => {
    toast.success('Video call feature coming soon!');
    // TODO: Implement WebRTC video call
  };

  const otherUser =
    activeConversation?.type === 'private'
      ? activeConversation.participants.find((p) => p._id !== user._id)
      : null;

  const conversationName =
    activeConversation?.type === 'group'
      ? activeConversation.groupName
      : otherUser?.username;

  const conversationAvatar =
    activeConversation?.type === 'group'
      ? activeConversation.groupAvatar || '👥'
      : otherUser?.avatar;

  // Typing indicator
  const handleTyping = () => {
    const socket = getSocket();
    
    if (!socket) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', {
        conversationId: activeConversation._id,
        userId: user._id,
        username: user.username,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing:stop', {
        conversationId: activeConversation._id,
        userId: user._id,
      });
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    try {
      const socket = getSocket();
      
      if (!socket) {
        toast.error('Connection error. Please refresh the page.');
        return;
      }
      
      // Send via socket for real-time delivery
      socket.emit('message:send', {
        conversationId: activeConversation._id,
        content: messageText.trim(),
        type: 'text',
      });

      setMessageText('');
      setShowEmojiPicker(false);

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        socket.emit('typing:stop', {
          conversationId: activeConversation._id,
          userId: user._id,
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error(error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      toast.loading('Uploading file...');
      await uploadFile(activeConversation._id, file);
      toast.dismiss();
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to upload file');
      console.error(error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessageText((prev) => prev + emojiData.emoji);
  };

  // Get typing users for current conversation
  const currentTypingUsers = typingUsers[activeConversation?._id];
  const typingUsersList = currentTypingUsers
    ? Array.from(currentTypingUsers)
        .filter((userId) => userId !== user._id)
        .map((userId) => {
          const typingUser = activeConversation.participants.find((p) => p._id === userId);
          return typingUser?.username;
        })
        .filter(Boolean)
    : [];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {typeof conversationAvatar === 'string' && conversationAvatar.startsWith('http') ? (
            <img
              src={conversationAvatar}
              alt={conversationName}
              className="w-11 h-11 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-xl border-2 border-primary-200">
              {conversationAvatar}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{conversationName}</h2>
            {typingUsersList.length > 0 ? (
              <p className="text-sm text-primary-600 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></span>
                <span className="inline-block w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="inline-block w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="ml-1">{typingUsersList.join(', ')} typing...</span>
              </p>
            ) : otherUser?.status === 'online' ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                Online
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {activeConversation?.type === 'group'
                  ? `${activeConversation.participants.length} members`
                  : 'Offline'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice Call Button */}
          <button 
            onClick={handleVoiceCall}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Voice call"
          >
            <FiPhone className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
          </button>
          
          {/* Video Call Button */}
          <button 
            onClick={handleVideoCall}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
            title="Video call"
          >
            <FiVideo className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
          </button>
          
          <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group">
            <FiSearch className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group">
            <FiMoreVertical className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-primary-600"
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-primary-600"
            title="Add emoji"
          >
            <FiSmile className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-white rounded-xl border border-gray-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-transparent focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
            title="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Voice Call Modal */}
      {showVoiceCall && (
        <VoiceCall
          isIncoming={isIncomingCall}
          callerInfo={callInfo}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
          onEnd={handleEndCall}
          peerConnection={peerConnection}
          localStream={localStream}
          remoteStream={remoteStream}
        />
      )}
    </div>
  );
};

export default ChatWindow;
