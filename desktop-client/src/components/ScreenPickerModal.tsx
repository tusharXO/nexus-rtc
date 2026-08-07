import React, { useEffect, useState } from 'react'

interface Source {
  id: string,
  name: string,
  thumbnail: string,
}

interface Props {
  onSelectSource: (sourceId: string) => void;
  onClose: () => void;
}

export const ScreenPickerModal: React.FC<Props> = ({ onSelectSource, onClose }) => {
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    async function fetchSources() {
      const availableSources = await window.electronAPI.getScreenSources();
      setSources(availableSources)
    }
    fetchSources();
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#2b2b3b', padding: '20px', borderRadius: '12px', maxWidth: '700px', width: '90%' }}>
        <h3>Select Window or Screen to Share</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto' }}>
          {sources.map((src) => (
            <div
              key={src.id}
              onClick={() => { onSelectSource(src.id); onClose(); }}
              style={{ cursor: 'pointer', border: '2px solid #444', borderRadius: '8px', padding: '8px', textAlign: 'center' }}
            >
              <img src={src.thumbnail} alt={src.name} style={{ width: '100%', borderRadius: '4px' }} />
              <p style={{ fontSize: '12px', margin: '5px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {src.name}
              </p>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: '15px', padding: '8px 16px', background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )

}