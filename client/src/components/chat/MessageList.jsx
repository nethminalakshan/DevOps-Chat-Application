import React, { useRef, useEffect, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiZoomIn, FiZoomOut, FiExternalLink } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

const MessageList = ({ messages }) => {
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset zoom when closing preview
  useEffect(() => {
    if (!previewFile) {
      setZoomLevel(1);
    }
  }, [previewFile]);

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

  const getFileType = (fileName, fileUrl) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return '🖼️';
    if (extension === 'pdf') return '📄';
    if (['doc', 'docx'].includes(extension)) return '📝';
    if (['xls', 'xlsx'].includes(extension)) return '📊';
    if (['ppt', 'pptx'].includes(extension)) return '📽️';
    if (['zip', 'rar', '7z'].includes(extension)) return '📦';
    if (['mp3', 'wav', 'ogg'].includes(extension)) return '🎵';
    if (['mp4', 'avi', 'mov', 'mkv'].includes(extension)) return '🎬';
    return '📎';
  };

  const handlePreview = (message) => {
    const fileType = getFileType(message.fileName, message.fileUrl);
    if (fileType === 'image' || fileType === 'pdf') {
      setPreviewFile({
        url: message.fileUrl,
        name: message.fileName,
        type: fileType,
        size: message.fileSize
      });
    }
  };

  const handleImagePreview = (imageUrl) => {
    setPreviewFile({
      url: imageUrl,
      name: 'Shared Image',
      type: 'image',
      size: null
    });
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

  const renderMessage = (message, index) => {
    const isSentByMe = message.sender._id === user._id;

    return (
      <motion.div
        key={message._id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-5`}
      >
        <div className={`flex gap-3 max-w-[75%] ${isSentByMe ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isSentByMe && (
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white dark:border-dark-600 shadow-md ring-2 ring-gray-100 dark:ring-dark-700"
            />
          )}

          <div>
            {!isSentByMe && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 px-3">
                {message.sender.username}
              </p>
            )}

            <div
              className={`rounded-2xl px-5 py-3.5 shadow-lg ${
                isSentByMe
                  ? 'bg-gradient-to-br from-primary-500 via-primary-600 to-blue-600 text-white rounded-br-md shadow-primary-500/30'
                  : 'bg-white dark:bg-dark-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-dark-600 rounded-bl-md shadow-gray-200/50 dark:shadow-dark-900/50'
              }`}
            >
              {message.type === 'text' && (
                <p className="whitespace-pre-wrap break-words text-base leading-relaxed">{message.content}</p>
              )}

              {message.type === 'image' && (
                <div>
                  <img
                    src={message.fileUrl}
                    alt="Shared image"
                    className="max-w-full rounded-xl mb-2 shadow-inner cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ maxHeight: '300px' }}
                    onClick={() => handleImagePreview(message.fileUrl)}
                  />
                  {message.content && (
                    <p className="whitespace-pre-wrap break-words mt-2 text-base leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>
              )}

              {message.type === 'file' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-md">
                      <span className="text-xl">{getFileIcon(message.fileName)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate">{message.fileName}</p>
                      <p className="text-sm opacity-75">
                        {(message.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getFileType(message.fileName, message.fileUrl) !== 'other' && (
                      <button
                        onClick={() => handlePreview(message)}
                        className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${
                          isSentByMe 
                            ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm' 
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60'
                        }`}
                      >
                        <FiExternalLink className="w-4 h-4" />
                        Preview
                      </button>
                    )}
                    <a
                      href={message.fileUrl}
                      download={message.fileName}
                      className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2 ${
                        isSentByMe 
                          ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm' 
                          : 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/60'
                      }`}
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>

            <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1.5 px-3 ${isSentByMe ? 'text-right' : 'text-left'}`}>
              {formatMessageDate(message.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 dark:from-dark-900 dark:via-dark-900 dark:to-dark-950">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center shadow-lg">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">No messages yet. Start the conversation!</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </>
      )}

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-900/90 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center">
                    <span className="text-lg">{previewFile.type === 'image' ? '🖼️' : '📄'}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold truncate max-w-xs">{previewFile.name}</p>
                    {previewFile.size && (
                      <p className="text-gray-400 text-sm">{(previewFile.size / 1024).toFixed(2)} KB</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {previewFile.type === 'image' && (
                    <>
                      <button
                        onClick={handleZoomOut}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Zoom out"
                      >
                        <FiZoomOut className="w-5 h-5" />
                      </button>
                      <span className="text-gray-400 text-sm min-w-[50px] text-center">{Math.round(zoomLevel * 100)}%</span>
                      <button
                        onClick={handleZoomIn}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="Zoom in"
                      >
                        <FiZoomIn className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Download"
                  >
                    <FiDownload className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all"
                    title="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-gray-900/70 rounded-b-2xl overflow-auto flex items-center justify-center p-4">
                {previewFile.type === 'image' ? (
                  <motion.img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                    style={{ transform: `scale(${zoomLevel})` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    draggable={false}
                  />
                ) : previewFile.type === 'pdf' ? (
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-[70vh] rounded-lg border-0"
                  />
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
