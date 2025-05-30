import React from 'react';

const DevChaosTester = ({ actions = {}, active = true }) => {
  if (!active) return null;
  
  // Default actions if none provided
  const defaultActions = {
    viewers: { label: '+1k Viewers', onClick: () => console.log('Adding viewers') },
    spam: { label: 'Spam Chat', onClick: () => console.log('Spamming chat') },
    blast: { label: 'All Blasts', onClick: () => console.log('Triggering blasts') },
    alert: { label: 'Trigger Alert', onClick: () => console.log('Triggering alert') },
    tip: { label: 'Fake Tips', onClick: () => console.log('Generating tips') },
  };
  
  const finalActions = Object.keys(actions).length > 0 ? actions : defaultActions;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(127, 29, 29, 0.8)',
      backdropFilter: 'blur(12px)',
      padding: '0.5rem',
      display: 'flex',
      gap: '0.5rem',
      borderRadius: '0.5rem',
      zIndex: 50,
      border: '1px solid rgba(239, 68, 68, 0.3)',
      boxShadow: '0 10px 25px rgba(127, 29, 29, 0.3)'
    }}>
      {Object.entries(finalActions).map(([key, { label, onClick }]) => (
        <button
          key={key}
          onClick={onClick}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: '#dc2626',
            borderRadius: '0.375rem',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#b91c1c';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#dc2626';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default DevChaosTester;
