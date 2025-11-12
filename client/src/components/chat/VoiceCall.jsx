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
          className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-white text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
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
            </div>
            <h2 className="text-2xl font-bold mb-2">{callerInfo?.name}</h2>
            <p className="text-white/90">
              {callStatus === 'incoming' && 'Incoming voice call...'}
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'connected' && formatDuration(callDuration)}
              {callStatus === 'ended' && 'Call ended'}
            </p>
          </div>

          {/* Audio Elements */}
          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />

          {/* Controls */}
          <div className="p-8">
            {callStatus === 'incoming' && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleDecline}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110"
                >
                  <FiPhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={handleAccept}
                  className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110"
                >
                  <FiPhone className="w-6 h-6" />
                </button>
              </div>
            )}

            {(callStatus === 'calling' || callStatus === 'connected') && (
              <div className="space-y-4">
                {callStatus === 'connected' && (
                  <div className="flex gap-4 justify-center mb-6">
                    <button
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        isMuted
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={toggleSpeaker}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                        !isSpeakerOn
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={isSpeakerOn ? 'Mute speaker' : 'Unmute speaker'}
                    >
                      {isSpeakerOn ? (
                        <FiVolume2 className="w-5 h-5" />
                      ) : (
                        <FiVolumeX className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleEnd}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <FiPhoneOff className="w-5 h-5" />
                  End Call
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceCall;
