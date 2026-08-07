import { useState, useRef, useCallback } from 'react';

const SIGNALING_SERVER_URL = 'ws://localhost:8080';
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export const useWebRTC = () => {
  const [status, setStatus] = useState<string>('Disconnected');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(RTC_CONFIG);

    // Attach local camera tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Capture incoming remote stream
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Forward local ICE candidates to peer
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(
          JSON.stringify({ type: 'ice-candidate', payload: event.candidate })
        );
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const joinRoom = async (roomId: string) => {
    try {
      setStatus('Accessing media devices...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setStatus('Connecting to signaling server...');
      const ws = new WebSocket(SIGNALING_SERVER_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus(`Joined room: ${roomId}`);
        ws.send(JSON.stringify({ type: 'join', roomId }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'ready': {
            setStatus('Peer connected! Initializing offer...');
            const pc = createPeerConnection();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: 'offer', payload: offer }));
            break;
          }

          case 'offer': {
            setStatus('Incoming call... Connected');
            const pc = createPeerConnection();
            await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', payload: answer }));
            setIsConnected(true);
            break;
          }

          case 'answer': {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(data.payload)
              );
              setStatus('Call Active');
              setIsConnected(true);
            }
            break;
          }

          case 'ice-candidate': {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(data.payload)
              );
            }
            break;
          }

          case 'peer-disconnected': {
            setStatus('Peer disconnected.');
            setIsConnected(false);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            break;
          }
        }
      };
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const startScreenShare = async (sourceId: string) => {
    try {
      // 1. Capture screen video stream using Electron's desktop constraint
      const screenStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId
          }
        } as any
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // 2. Update local preview element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // 3. Replace the active video track sent over WebRTC to the remote peer
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find((sender) => sender.track?.kind === 'video');

        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }
      }

      // 4. Handle user stopping screen share from OS controls
      screenTrack.onended = async () => {
        stopScreenShare();
      };

    } catch (err: any) {
      console.error('Failed to share screen:', err.message);
    }
  };

  const stopScreenShare = async () => {
    // Revert back to original webcam stream
    const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const webcamTrack = webcamStream.getVideoTracks()[0];

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = webcamStream;
    }

    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find((sender) => sender.track?.kind === 'video');
      if (videoSender) {
        await videoSender.replaceTrack(webcamTrack);
      }
    }
  };

  return { localVideoRef, remoteVideoRef, status, isConnected, joinRoom, startScreenShare };
};