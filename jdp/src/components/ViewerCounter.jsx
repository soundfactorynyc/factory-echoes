import React from 'react';

const ViewerCounter = ({ count = 1247 }) => (
  <div style={{
    position: 'fixed',
    top: '1rem',
    left: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    color: 'white',
    fontWeight: 'bold',
    zIndex: 999
  }}>
    <span style={{
      width: '0.5rem',
      height: '0.5rem',
      background: 'red',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    }} />
    {count.toLocaleString()} viewers
    <style>{`
      @keyframes pulse {
        0%,100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

export default ViewerCounter;
