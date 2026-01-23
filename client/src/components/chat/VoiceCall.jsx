import React, { useEffect, useRef, useState } from 'react';
import { FiPhone, FiPhoneOff, FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCall = ({ 
  isIncoming, 
  callerInfo, 
  onAccept, 
  onDecline, 
  onEnd, 
  peerConnection,
  localStream,
  remoteStream 
}) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? 'incoming' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus]);

  useEffect(() => {
    if (localStream && localAudioRef.current) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setCallStatus('connected');
    onAccept();
  };

  const handleDecline = () => {
    setCallStatus('ended');
    onDecline();
  };

  const handleEnd = () => {
    setCallStatus('ended');
    onEnd();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 0 : 1;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-96 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 p-8 text-white text-center relative overflow-hidden">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-28 h-28 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl"
            >
              {callerInfo?.avatar ? (
                <img
                  src={callerInfo.avatar}
                  alt={callerInfo.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold">
                  {callerInfo?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </motion.div>
            <h2 className="relative text-2xl font-bold mb-2">{callerInfo?.name}</h2>
            <p className="relative text-white/90 flex items-center justify-center gap-2">
              {callStatus === 'incoming' && (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Incoming voice call...
                </>
              )}
              {callStatus === 'calling' && (
                <>
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  Calling...
                </>
              )}
              {callStatus === 'connected' && (
                <>
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {formatDuration(callDuration)}
                </>
              )}
              {callStatus === 'ended' && 'Call ended'}
            </p>
          </div>

          {/* Audio Elements */}
          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />

          {/* Controls */}
          <div className="p-8 bg-gray-50 dark:bg-dark-900">
            {callStatus === 'incoming' && (
              <div className="flex gap-6 justify-center">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecline}
                  className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center text-white shadow-xl transition-all"
                >
                  <FiPhoneOff className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full flex items-center justify-center text-white shadow-xl transition-all"
                >
                  <FiPhone className="w-6 h-6" />
                </motion.button>
              </div>
            )}

            {(callStatus === 'calling' || callStatus === 'connected') && (
              <div className="space-y-4">
                {callStatus === 'connected' && (
                  <div className="flex gap-4 justify-center mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isMuted
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-dark-600'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleSpeaker}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        !isSpeakerOn
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-dark-600'
                      }`}
                      title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
                    >
                      {isSpeakerOn ? (
                        <FiVolume2 className="w-5 h-5" />
                      ) : (
                        <FiVolumeX className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnd}
                  className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl font-medium"
                >
                  <FiPhoneOff className="w-5 h-5" />
                  End Call
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCall;
