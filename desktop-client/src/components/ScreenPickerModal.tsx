import React, { useEffect, useState } from 'react';

interface Source {
  id: string;
  name: string;
  thumbnail: string;
}

interface Props {
  onSelectSource: (sourceId: string) => void;
  onClose: () => void;
}

export const ScreenPickerModal: React.FC<Props> = ({ onSelectSource, onClose }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchSources() {
      try {
        if (window.electronAPI && window.electronAPI.getScreenSources) {
          const availableSources = await window.electronAPI.getScreenSources();
          setSources(availableSources);
        } else {
          console.error('electronAPI is not defined on window');
        }
      } catch (err) {
        console.error('Error fetching screen sources:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1e1e2e', padding: '24px', borderRadius: '12px',
        maxWidth: '700px', width: '90%', border: '1px solid #45475a'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#cdd6f4' }}>Select Window or Screen to Share</h3>
        
        {loading ? (
          <p style={{ color: '#a6adc8' }}>Scanning available screens...</p>
        ) : sources.length === 0 ? (
          <p style={{ color: '#f38ba8' }}>No screens or windows detected. Make sure permissions are granted.</p>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px'
          }}>
            {sources.map((src) => (
              <div
                key={src.id}
                onClick={() => { onSelectSource(src.id); onClose(); }}
                style={{
                  cursor: 'pointer', border: '2px solid #313244', borderRadius: '8px',
                  padding: '10px', textAlign: 'center', background: '#181825',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#89b4fa')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#313244')}
              >
                <img src={src.thumbnail} alt={src.name} style={{ width: '100%', borderRadius: '4px', height: '110px', objectFit: 'cover' }} />
                <p style={{
                  fontSize: '12px', margin: '8px 0 0 0', textOverflow: 'ellipsis',
                  overflow: 'hidden', whiteSpace: 'nowrap', color: '#cdd6f4'
                }}>
                  {src.name}
                </p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '20px', padding: '10px 20px', background: '#f38ba8',
            border: 'none', color: '#11111b', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};