import React, { useEffect, useRef, useState } from 'react';
import { 
  FiPhone, 
  FiPhoneOff, 
  FiMic, 
  FiMicOff, 
  FiVideo, 
  FiVideoOff,
  FiMaximize2,
  FiMinimize2 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const VideoCall = ({ 
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
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
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
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
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

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-gray-900 rounded-2xl shadow-2xl overflow-hidden ${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl h-[600px]'}`}
        >
          {/* Video Container */}
          <div className="relative w-full h-full">
            {/* Remote Video (Main) */}
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center border-4 border-white/30">
                    {callerInfo?.avatar ? (
                      <img
                        src={callerInfo.avatar}
                        alt={callerInfo.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-white">
                        {callerInfo?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{callerInfo?.name}</h2>
                  <p className="text-white/80">
                    {callStatus === 'incoming' && 'Incoming video call...'}
                    {callStatus === 'calling' && 'Calling...'}
                    {callStatus === 'connected' && formatDuration(callDuration)}
                    {callStatus === 'ended' && 'Call ended'}
                  </p>
                </div>
              )}
            </div>

            {/* Local Video (Picture-in-Picture) */}
            {localStream && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover mirror"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                    <FiVideoOff className="w-8 h-8 text-white/50" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Call Info Overlay (top-left) */}
            {callStatus === 'connected' && (
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                <p className="text-white font-semibold">{formatDuration(callDuration)}</p>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
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
                    <div className="flex gap-3 justify-center mb-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          isMuted
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          isVideoOff
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                        }`}
                        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                      >
                        {isVideoOff ? <FiVideoOff className="w-5 h-5" /> : <FiVideo className="w-5 h-5" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleFullscreen}
                        className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all shadow-lg"
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                      >
                        {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEnd}
                    className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl font-medium"
                  >
                    <FiPhoneOff className="w-5 h-5" />
                    End Call
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </AnimatePresence>
  );
};

export default VideoCall;
