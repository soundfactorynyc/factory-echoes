import React, { useState, useEffect } from 'react';

const LiveInteractiveDemo = () => {
  const [viewers, setViewers] = useState(1247);
  const [likes, setLikes] = useState(892);
  const [messages, setMessages] = useState([
    'Welcome to the stream! 🎮',
    'This React component updates in real-time',
    'Click the buttons to test interactivity!'
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
      if (Math.random() > 0.7) {
        setLikes(prev => prev + 1);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addMessage = () => {
    const newMessages = [
      'React components are so smooth! ⚛️',
      'Love the real-time updates! 🔄',
      'Interactive features are amazing! ⭐',
      'This livestream hub is professional! 🏆'
    ];
    const randomMessage = newMessages[Math.floor(Math.random() * newMessages.length)];
    setMessages(prev => [...prev.slice(-2), randomMessage]);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '1.5rem',
      color: 'white',
      margin: '1rem 0',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
        🎮 Live Interactive Demo (React)
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem' 
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{viewers.toLocaleString()}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>👥 Live Viewers</div>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{likes.toLocaleString()}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>❤️ Likes</div>
        </div>
      </div>
      
      <div style={{ margin: '1rem 0' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>💬 Live Chat</h4>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          padding: '1rem',
          height: '120px',
          overflowY: 'auto'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              marginBottom: '0.5rem', 
              fontSize: '0.9rem',
              opacity: i === messages.length - 1 ? 1 : 0.7
            }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={addMessage}
        style={{
          background: '#ff6b9d',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        📝 Add Chat Message
      </button>
    </div>
  );
};

export default LiveInteractiveDemo;
