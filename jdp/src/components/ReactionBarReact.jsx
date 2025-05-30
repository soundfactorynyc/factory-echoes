import React from 'react';

const ReactionBar = ({ emojis = ['👍','❤️','😂','🔥','🎉'], onReact = (e) => {} }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      padding: '8px 12px',
      borderRadius: '24px',
      display: 'flex',
      gap: '12px',
      zIndex: 998
    }}>
      {emojis.map((emoji, i) => (
        <button
          key={i}
          onClick={() => onReact(emoji)}
          style={{
            fontSize: '24px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(1.3)'}
          onMouseUp={e => e.currentTarget.style.transform = ''}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;
