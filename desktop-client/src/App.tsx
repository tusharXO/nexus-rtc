// desktop-client/src/renderer/src/App.tsx
import { useState } from 'react';
import { useWebRTC } from './useWebRTC';

export default function App() {
  const [roomId, setRoomId] = useState('room1');
  const { localVideoRef, remoteVideoRef, status, joinRoom } = useWebRTC();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#1e1e2e', color: '#fff', minHeight: '100vh' }}>
      <h2>NexusRTC Collaboration Client</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={roomId} 
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444' }}
        />
        <button 
          onClick={() => joinRoom(roomId)}
          style={{ padding: '8px 16px', background: '#89b4fa', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Join Room
        </button>
      </div>

      <p style={{ color: '#a6adc8' }}>Status: {status}</p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h4>Local Video</h4>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '360px', height: '270px', background: '#000', borderRadius: '8px' }} />
        </div>
        <div>
          <h4>Remote Video</h4>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '360px', height: '270px', background: '#000', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
}