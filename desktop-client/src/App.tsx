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
    isAudioMuted,
    isVideoOff,
    joinRoom,
    startScreenShare,
    toggleAudio,
    toggleVideo
  } = useWebRTC();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      {/* Header Bar */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">NexusRTC Enterprise</h1>
          <p className="text-xs text-slate-400">Status: {status}</p>
        </div>

        {/* Room Entry Controls */}
        <div className="flex gap-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Room ID"
            className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => joinRoom(roomId)}
            className="bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Join Call
          </button>
        </div>
      </header>

      {/* Main Video Stream Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center justify-center">
        {/* Local Stream Card */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl h-72 md:h-96 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
          {isVideoOff && (
            <div className="flex flex-col items-center text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold mb-2">
                You
              </div>
              <span>Camera Off</span>
            </div>
          )}
          <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-xs px-3 py-1 rounded-full border border-slate-700">
            You {isAudioMuted && '(Muted)'}
          </span>
        </div>

        {/* Remote Stream Card */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl h-72 md:h-96 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-xs px-3 py-1 rounded-full border border-slate-700">
            Remote Participant
          </span>
        </div>
      </main>

      {/* Bottom Floating Control Bar */}
      <footer className="flex justify-center items-center gap-4 py-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 max-w-xl mx-auto w-full">
        {/* Mic Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full font-semibold text-sm transition-all cursor-pointer ${
            isAudioMuted
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
          }`}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? '🎤 Mic Off' : '🎤 Mic On'}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full font-semibold text-sm transition-all cursor-pointer ${
            isVideoOff
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
          }`}
          title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isVideoOff ? '📷 Cam Off' : '📷 Cam On'}
        </button>

        {/* Screen Share Button */}
        <button
          onClick={() => setShowScreenPicker(true)}
          disabled={!isConnected}
          className={`px-5 py-3 rounded-full font-semibold text-sm transition-all ${
            isConnected
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
              : 'bg-slate-800 text-slate-600 border border-slate-800 cursor-not-allowed'
          }`}
        >
          🖥️ Share Screen
        </button>
      </footer>

      {/* Screen Share Modal */}
      {showScreenPicker && (
        <ScreenPickerModal
          onSelectSource={(sourceId) => startScreenShare(sourceId)}
          onClose={() => setShowScreenPicker(false)}
        />
      )}
    </div>
  );
}