import React, { useRef, useState, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiMoreVertical, FiSearch, FiPhone, FiVideo } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import { getSocket } from '../../services/socket';
import webrtcService from '../../services/webrtc';
import MessageList from './MessageList';
import VoiceCall from './VoiceCall';
import VideoCall from './VideoCall';
import toast from 'react-hot-toast';

const ChatWindow = () => {
  const { user } = useAuthStore();
  const { activeConversation, messages, sendMessage, uploadFile, typingUsers } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
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
      onIncomingCall: async (from, offer, hasVideo) => {
        const caller = activeConversation?.participants.find(p => p._id === from);
        setCallInfo({
          name: caller?.username || 'Unknown',
          avatar: caller?.avatar,
          userId: from,
          offer,
          hasVideo: hasVideo || false
        });
        setIsVideoCall(hasVideo || false);
        setIsIncomingCall(true);
        setShowCall(true);
      },
      onCallAnswered: () => {
        setIsIncomingCall(false);
        // Update remote stream
        const remote = webrtcService.getRemoteStream();
        if (remote) {
          setRemoteStream(remote);
        }
        toast.success('Call connected!');
      },
      onCallEnded: () => {
        setShowCall(false);
        setCallInfo(null);
        setLocalStream(null);
        setRemoteStream(null);
        setPeerConnection(null);
        setIsVideoCall(false);
        toast.info('Call ended');
      },
      onCallRejected: () => {
        setShowCall(false);
        setCallInfo(null);
        setIsVideoCall(false);
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

      const { localStream: stream, peerConnection: pc, remoteStream: remote } = await webrtcService.startCall(otherUserId, false);
      
      setLocalStream(stream);
      setPeerConnection(pc);
      setRemoteStream(remote);
      setCallInfo({
        name: otherUser.username,
        avatar: otherUser.avatar,
        userId: otherUserId
      });
      setIsVideoCall(false);
      setIsIncomingCall(false);
      setShowCall(true);
      
      toast.success('Calling...');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call. Please check microphone permissions.');
    }
  };

  const handleAcceptCall = async () => {
    try {
      const { localStream: stream, peerConnection: pc, remoteStream: remote } = await webrtcService.answerCall(
        callInfo.offer, 
        isVideoCall,
        callInfo.userId
      );
      
      setLocalStream(stream);
      setPeerConnection(pc);
      setRemoteStream(remote);
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
    setShowCall(false);
    setCallInfo(null);
    setIsVideoCall(false);
  };

  const handleEndCall = () => {
    webrtcService.endCall();
    const socket = getSocket();
    if (socket) {
      socket.emit('call:end', { to: callInfo.userId });
    }
    setShowCall(false);
    setCallInfo(null);
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setIsVideoCall(false);
  };

  const handleVideoCall = async () => {
    if (activeConversation?.type !== 'private') {
      toast.error('Video calls are only available in private conversations');
      return;
    }

    try {
      const otherUserId = otherUser?._id;
      if (!otherUserId) {
        toast.error('Could not find recipient');
        return;
      }

      const { localStream: stream, peerConnection: pc, remoteStream: remote } = await webrtcService.startCall(otherUserId, true);
      
      setLocalStream(stream);
      setPeerConnection(pc);
      setRemoteStream(remote);
      setCallInfo({
        name: otherUser.username,
        avatar: otherUser.avatar,
        userId: otherUserId
      });
      setIsVideoCall(true);
      setIsIncomingCall(false);
      setShowCall(true);
      
      toast.success('Starting video call...');
    } catch (error) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call. Please check camera/microphone permissions.');
    }
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50">
      {/* Header with gradient */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4">
          {typeof conversationAvatar === 'string' && conversationAvatar.startsWith('http') ? (
            <div className="relative">
              <img
                src={conversationAvatar}
                alt={conversationName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-primary-100"
              />
              {otherUser?.status === 'online' && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-xl text-white border-2 border-white shadow-md ring-2 ring-primary-100">
              {conversationAvatar}
            </div>
          )}
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{conversationName}</h2>
            {typingUsersList.length > 0 ? (
              <p className="text-sm text-primary-600 flex items-center gap-1.5 font-medium">
                <span className="inline-flex gap-0.5">
                  <span className="inline-block w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce"></span>
                  <span className="inline-block w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="inline-block w-1.5 h-1.5 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </span>
                <span>{typingUsersList.join(', ')} typing...</span>
              </p>
            ) : otherUser?.status === 'online' ? (
              <p className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
        <div className="flex items-center gap-1">
          {/* Voice Call Button */}
          <button 
            onClick={handleVoiceCall}
            className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all group"
            title="Voice call"
          >
            <FiPhone className="w-5 h-5 text-gray-600 group-hover:text-green-600 group-hover:scale-110 transition-all" />
          </button>
          
          {/* Video Call Button */}
          <button 
            onClick={handleVideoCall}
            className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all group"
            title="Video call"
          >
            <FiVideo className="w-5 h-5 text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
          </button>
          
          <button className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all group">
            <FiSearch className="w-5 h-5 text-gray-600 group-hover:text-primary-600 group-hover:scale-110 transition-all" />
          </button>
          <button className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl transition-all group">
            <FiMoreVertical className="w-5 h-5 text-gray-600 group-hover:text-primary-600 group-hover:scale-110 transition-all" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input with gradient background */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-white via-blue-50/20 to-purple-50/20">
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-lg overflow-hidden">
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
            className="p-3 hover:bg-white rounded-xl transition-all text-gray-600 hover:text-primary-600 hover:shadow-sm group"
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 hover:bg-white rounded-xl transition-all text-gray-600 hover:text-yellow-500 hover:shadow-sm group"
            title="Add emoji"
          >
            <FiSmile className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex-1 bg-white rounded-2xl border-2 border-gray-200 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-100 transition-all shadow-sm">
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message..."
              className="w-full px-5 py-3.5 bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white p-3.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-blue-600 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            title="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Voice/Video Call Modal */}
      {showCall && (
        isVideoCall ? (
          <VideoCall
            isIncoming={isIncomingCall}
            callerInfo={callInfo}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
            onEnd={handleEndCall}
            peerConnection={peerConnection}
            localStream={localStream}
            remoteStream={remoteStream}
          />
        ) : (
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
        )
      )}
    </div>
  );
};

export default ChatWindow;
