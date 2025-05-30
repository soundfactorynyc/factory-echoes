import React, { useState } from 'react';

const DevTools = () => {
  const [isActive, setIsActive] = useState(true);

  const handleTrigger = (action) => {
    console.log(`DevChaosTester triggered: ${action}`);
    // Add any specific functionality for each button here
    switch(action) {
      case 'viewers':
        console.log('Adding 1k viewers');
        break;
      case 'spam':
        console.log('Spamming chat');
        break;
      case 'blast':
        console.log('Triggering all visual effects');
        break;
      case 'alert':
        console.log('Triggering alert');
        break;
      case 'tip':
        console.log('Generating fake tips');
        break;
      default:
        console.log('Unknown action');
    }
  };

  const buttons = [
    { key: 'viewers', label: '+1k Viewers' },
    { key: 'spam', label: 'Spam Chat' },
    { key: 'blast', label: 'All Blasts' },
    { key: 'alert', label: 'Trigger Alert' },
    { key: 'tip', label: 'Fake Tips' },
  ];

  if (!isActive) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(127, 29, 29, 0.8)',
      backdropFilter: 'blur(16px)',
      padding: '0.75rem',
      borderRadius: '9999px',
      display: 'flex',
      gap: '0.5rem',
      zIndex: 1000,
      border: '1px solid rgba(239, 68, 68, 0.3)',
      boxShadow: '0 10px 25px rgba(127, 29, 29, 0.3)'
    }}>
      {buttons.map(b => (
        <button
          key={b.key}
          onClick={() => handleTrigger(b.key)}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: '#b91c1c',
            borderRadius: '0.5rem',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#dc2626';
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#b91c1c';
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {b.label}
        </button>
      ))}
      
      <button
        onClick={() => setIsActive(false)}
        style={{
          padding: '0.5rem',
          backgroundColor: '#7f1d1d',
          borderRadius: '0.5rem',
          color: 'white',
          fontSize: '0.75rem',
          border: 'none',
          cursor: 'pointer',
          marginLeft: '0.5rem'
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default DevTools;
