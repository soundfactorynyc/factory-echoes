import React, { useState } from 'react';
import ComponentTogglePanel from './ComponentTogglePanel.jsx';
import FloatingActionButton from './FloatingActionButton.jsx';

const InteractiveControlsDemo = () => {
  const [toggles, setToggles] = useState({
    viewer: { label: 'Viewers', active: true },
    chat: { label: 'Chat', active: true },
    share: { label: 'Share', active: false },
    blast: { label: 'Blast', active: true },
  });

  // Simple icons using SVG since we're avoiding external dependencies
  const icons = {
    viewer: ({ style }) => (
      <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    chat: ({ style }) => (
      <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    share: ({ style }) => (
      <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    blast: ({ style }) => (
      <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
      </svg>
    )
  };

  // Add icons to toggles
  const togglesWithIcons = Object.entries(toggles).reduce((acc, [key, value]) => {
    acc[key] = { ...value, Icon: icons[key] };
    return acc;
  }, {});

  const handleToggle = (key) => {
    setToggles(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
    console.log(`Toggled ${key}:`, !toggles[key].active);
  };

  const handleFloatingAction = () => {
    console.log('Floating Action Button clicked!');
    // You could trigger a special effect, open a modal, etc.
    alert('🚀 Floating Action Triggered!');
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '1.5rem',
      color: 'white',
      margin: '1rem 0',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      position: 'relative'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
        🎛️ Interactive Controls Demo
      </h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Toggle States:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {Object.entries(toggles).map(([key, { label, active }]) => (
            <div
              key={key}
              style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <strong>{label}:</strong> {active ? '✅ Active' : '❌ Inactive'}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.875rem'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          📍 <strong>Toggle Panel:</strong> Bottom of screen with interactive buttons
        </p>
        <p style={{ margin: '0' }}>
          ⚡ <strong>Floating Action:</strong> Bottom-right corner with lightning bolt
        </p>
      </div>

      {/* Render the actual components */}
      <ComponentTogglePanel 
        toggles={togglesWithIcons} 
        onToggle={handleToggle} 
      />
      
      <FloatingActionButton 
        onClick={handleFloatingAction}
      />
    </div>
  );
};

export default InteractiveControlsDemo;
