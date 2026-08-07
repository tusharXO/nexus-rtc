// src/renderer/src/App.tsx
import { useState } from 'react';
import { useWebRTC } from './hooks/useWebRTC';
import { ScreenPickerModal } from './components/ScreenPickerModal';

export default function App() {
  const [roomId, setRoomId] = useState('room1');
  const [showScreenPicker, setShowScreenPicker] = useState(false);

  const {
    localVideoRef,
    remoteVideoRef,
    status,
    isConnected,
    joinRoom,
    startScreenShare
  } = useWebRTC();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#1e1e2e', color: '#fff', minHeight: '100vh' }}>
      <h2>NexusRTC Collaboration Client</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#313244', color: '#fff' }}
        />
        <button
          onClick={() => joinRoom(roomId)}
          style={{ padding: '8px 16px', background: '#89b4fa', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Join Room
        </button>

        {/* 4. Share Screen Button */}
        <button
          onClick={() => setShowScreenPicker(true)}
          disabled={!isConnected}
          style={{
            padding: '8px 16px',
            background: isConnected ? '#a6e3a1' : '#585b70',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            color: '#11111b'
          }}
        >
          Share Screen
        </button>
      </div>

      <p style={{ color: '#a6adc8' }}>Status: {status}</p>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h4>Local Stream</h4>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '360px', height: '270px', background: '#000', borderRadius: '8px', border: '1px solid #45475a' }} />
        </div>
        <div>
          <h4>Remote Stream</h4>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '360px', height: '270px', background: '#000', borderRadius: '8px', border: '1px solid #45475a' }} />
        </div>
      </div>

      {showScreenPicker && (
        <ScreenPickerModal
          onSelectSource={(sourceId) => startScreenShare(sourceId)}
          onClose={() => setShowScreenPicker(false)}
        />
      )}
    </div>
  );
}