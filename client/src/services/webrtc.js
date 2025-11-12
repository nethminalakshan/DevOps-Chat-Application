import { getSocket } from './socket';

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

  async initializeLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
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
        });
      }
    };

    return this.peerConnection;
  }

  async startCall(userId) {
    try {
      await this.initializeLocalStream();
      this.createPeerConnection();

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      getSocket().emit('call:start', {
        to: userId,
        offer: offer,
      });

      return { localStream: this.localStream, peerConnection: this.peerConnection };
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async answerCall(offer) {
    try {
      await this.initializeLocalStream();
      this.createPeerConnection();

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      getSocket().emit('call:answer', {
        answer: answer,
      });

      return { localStream: this.localStream, peerConnection: this.peerConnection };
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

    getSocket().emit('call:end');
  }

  setupCallListeners(callbacks) {
    try {
      const socket = getSocket();
      if (!socket) {
        console.warn('Socket not available for WebRTC call listeners');
        return;
      }

      socket.on('call:incoming', ({ from, offer }) => {
        if (callbacks.onIncomingCall) {
          callbacks.onIncomingCall(from, offer);
        }
      });

    socket.on('call:answered', ({ answer }) => {
      this.handleAnswer(answer);
      if (callbacks.onCallAnswered) {
        callbacks.onCallAnswered();
      }
    });

    socket.on('call:ice-candidate', ({ candidate }) => {
      this.handleIceCandidate(candidate);
    });

    socket.on('call:ended', () => {
      this.endCall();
      if (callbacks.onCallEnded) {
        callbacks.onCallEnded();
      }
    });

    socket.on('call:rejected', () => {
      this.endCall();
      if (callbacks.onCallRejected) {
        callbacks.onCallRejected();
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
