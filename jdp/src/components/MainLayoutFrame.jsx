import React, { useState, useEffect } from 'react';
import { Monitor, Users, Settings, Maximize2 } from 'lucide-react';

const MainLayoutFrame = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewers, setViewers] = useState(1247);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate real-time viewer count updates
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10) - 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const styles = {
    container: {
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 100
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    brandText: {
      fontSize: '1.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #00d4ff, #ff6b9d)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    liveIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      background: isLive ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      border: isLive ? '1px solid #ff4444' : 'none',
      fontWeight: '600',
      fontSize: '0.9rem'
    },
    content: {
      flex: 1,
      overflow: 'auto',
      position: 'relative'
    },
    controlBtn: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <Monitor style={{ color: '#00d4ff' }} />
          <span style={styles.brandText}>JDP Stream Hub</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={styles.liveIndicator}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isLive ? '#ff4444' : '#666'
            }}></div>
            {isLive ? 'LIVE' : 'OFFLINE'}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00d4ff', fontWeight: '600' }}>
            <Users size={16} />
            <span>{viewers.toLocaleString()}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={styles.controlBtn} onClick={toggleFullscreen}>
            <Maximize2 size={18} />
          </button>
          <button style={styles.controlBtn}>
            <Settings size={18} />
          </button>
        </div>
      </header>
      
      <main style={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default MainLayoutFrame;
