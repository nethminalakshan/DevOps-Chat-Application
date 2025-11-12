import React, { useRef, useEffect } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import useAuthStore from '../../store/authStore';

const MessageList = ({ messages }) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, 'HH:mm');
    } else if (isYesterday(messageDate)) {
      return 'Yesterday ' + format(messageDate, 'HH:mm');
    } else {
      return format(messageDate, 'MMM d, HH:mm');
    }
  };

  const renderMessage = (message) => {
    const isSentByMe = message.sender._id === user._id;

    return (
      <div
        key={message._id}
        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-4 message-slide-in`}
      >
        <div className={`flex gap-2 max-w-[70%] ${isSentByMe ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isSentByMe && (
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          )}

          <div>
            {!isSentByMe && (
              <p className="text-xs text-gray-500 mb-1 px-3">
                {message.sender.username}
              </p>
            )}

            <div
              className={`rounded-lg px-4 py-2 ${
                isSentByMe
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {message.type === 'text' && (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}

              {message.type === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt="Shared image"
                    className="max-w-full rounded-lg mb-1"
                    style={{ maxHeight: '300px' }}
                  />
                  {message.content && (
                    <p className="whitespace-pre-wrap break-words mt-2">
                      {message.content}
                    </p>
                  )}
                </div>
              )}

              {message.type === 'file' && (
                <div className="flex items-center gap-2">
                  <div className="text-2xl">📎</div>
                  <div>
                    <p className="font-medium">{message.fileName}</p>
                    <p className="text-xs opacity-75">
                      {(message.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <a
                    href={message.fileUrl}
                    download
                    className="ml-2 px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>

            <p className={`text-xs text-gray-500 mt-1 px-3 ${isSentByMe ? 'text-right' : 'text-left'}`}>
              {formatMessageDate(message.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
