import { getSocket } from './socket';
import toast from 'react-hot-toast';

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };
  }

  async initializeLocalStream(includeVideo = false) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: includeVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
      });
      this.hasVideo = includeVideo;
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);
    this.remoteStream = new MediaStream();

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming tracks
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        getSocket().emit('call:ice-candidate', {
          candidate: event.candidate,
          to: this.remoteUserId
        });
      }
    };

    return this.peerConnection;
  }

  async startCall(userId, includeVideo = false) {
    try {
      await this.initializeLocalStream(includeVideo);
      this.createPeerConnection();
      this.remoteUserId = userId;

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      getSocket().emit('call:start', {
        to: userId,
        offer: offer,
        hasVideo: includeVideo
      });

      console.log(includeVideo ? '📹 Video call started to user:' : '📞 Voice call started to user:', userId);
      return { localStream: this.localStream, peerConnection: this.peerConnection, remoteStream: this.remoteStream };
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async answerCall(offer, includeVideo = false, fromUserId = null) {
    try {
      await this.initializeLocalStream(includeVideo);
      this.createPeerConnection();
      this.remoteUserId = fromUserId;

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      getSocket().emit('call:answer', {
        answer: answer,
      });

      console.log('✅ Call answered with', includeVideo ? 'video' : 'audio only');
      return { localStream: this.localStream, peerConnection: this.peerConnection, remoteStream: this.remoteStream };
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      throw error;
    }
  }

  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.hasVideo = false;

    // Emit with remote user ID if available
    const socket = getSocket();
    if (socket) {
      socket.emit('call:end', { to: this.remoteUserId });
    }
    this.remoteUserId = null;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  setupCallListeners(callbacks) {
    try {
      const socket = getSocket();
      if (!socket) {
        console.warn('Socket not available for WebRTC call listeners');
        return;
      }

      socket.on('call:incoming', (data) => {
        const { from, offer, hasVideo } = data;
        console.log('📞 Incoming call from:', from, 'hasVideo:', hasVideo);
        if (callbacks.onIncomingCall) {
          callbacks.onIncomingCall(from, offer, hasVideo);
        }
      });

      socket.on('call:answered', ({ answer }) => {
        console.log('✅ Call answered');
        this.handleAnswer(answer);
        if (callbacks.onCallAnswered) {
          callbacks.onCallAnswered();
        }
      });

      socket.on('call:ice-candidate', ({ candidate }) => {
        console.log('🧊 Received ICE candidate');
        this.handleIceCandidate(candidate);
      });

      socket.on('call:ended', () => {
        console.log('📞 Call ended by remote user');
        this.endCall();
        if (callbacks.onCallEnded) {
          callbacks.onCallEnded();
        }
      });

      socket.on('call:rejected', () => {
        console.log('❌ Call rejected by remote user');
        this.endCall();
        if (callbacks.onCallRejected) {
          callbacks.onCallRejected();
        }
      });

      socket.on('call:user-unavailable', () => {
        console.log('📵 User unavailable');
        toast.error('User is not available');
        if (callbacks.onCallEnded) {
          callbacks.onCallEnded();
        }
      });
    } catch (error) {
      console.warn('Error setting up call listeners:', error);
    }
  }

  removeCallListeners() {
    try {
      const socket = getSocket();
      if (!socket) {
        console.warn('Socket not available to remove call listeners');
        return;
      }
      
      socket.off('call:incoming');
      socket.off('call:answered');
      socket.off('call:ice-candidate');
      socket.off('call:ended');
      socket.off('call:rejected');
    } catch (error) {
      console.warn('Error removing call listeners:', error);
    }
  }
}

export default new WebRTCService();
