import React, { useState } from 'react';
import ComponentTogglePanel from './ComponentTogglePanel.jsx';
import FloatingActionButton from './FloatingActionButton.jsx';
import DevChaosTester from './DevChaosTester.jsx';

const InteractiveControlsManager = () => {
  // State for toggle panel
  const [toggles, setToggles] = useState([
    { id: 'viewer', label: 'Viewers', active: true },
    { id: 'chat', label: 'Chat', active: true },
    { id: 'share', label: 'Share', active: false },
    { id: 'blast', label: 'Blast', active: true },
  ]);

  // State for InsanityMode
  const [insanityActive, setInsanityActive] = useState(false);

  // Handle toggle changes
  const handleToggle = (id) => {
    setToggles(prevToggles =>
      prevToggles.map(toggle =>
        toggle.id === id ? { ...toggle, active: !toggle.active } : toggle
      )
    );
    console.log(`Toggled ${id}`);
  };

  // DevChaosTester actions
  const devActions = {
    viewers: {
      label: '+1k Viewers',
      onClick: () => {
        console.log('🚀 Adding 1k viewers!');
        // Trigger viewer count increase
        const event = new CustomEvent('addViewers', { detail: 1000 });
        document.dispatchEvent(event);
      }
    },
    spam: {
      label: 'Spam Chat',
      onClick: () => {
        console.log('💬 Spamming chat!');
        // Trigger chat spam
        const event = new CustomEvent('spamChat');
        document.dispatchEvent(event);
      }
    },
    blast: {
      label: 'All Blasts',
      onClick: () => {
        console.log('💥 Triggering all visual effects!');
        setInsanityActive(true);
        setTimeout(() => setInsanityActive(false), 3000);
        // Trigger visual effects
        const event = new CustomEvent('triggerBlasts');
        document.dispatchEvent(event);
      }
    },
    alert: {
      label: 'Trigger Alert',
      onClick: () => {
        console.log('🚨 Triggering alerts!');
        // Trigger subscriber alert
        const event = new CustomEvent('triggerAlert');
        document.dispatchEvent(event);
      }
    },
    tip: {
      label: 'Fake Tips',
      onClick: () => {
        console.log('💰 Generating fake tips!');
        // Trigger tip notifications
        const event = new CustomEvent('fakeTips');
        document.dispatchEvent(event);
      }
    }
  };

  // Floating action button handler
  const handleFloatingAction = () => {
    console.log('⚡ Floating action blast!');
    // Toggle insanity mode
    setInsanityActive(!insanityActive);
    
    // Trigger special effect
    const event = new CustomEvent('floatingBlast');
    document.dispatchEvent(event);
  };

  return (
    <>
      {/* Insanity Mode Overlay */}
      {insanityActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,0,0,0.3), rgba(255,255,0,0.3), rgba(0,255,0,0.3), rgba(0,0,255,0.3))',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'insanityPulse 0.5s ease-in-out infinite alternate'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '3rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            animation: 'bounce 0.5s ease-in-out infinite'
          }}>
            🔥 INSANITY MODE! 🔥
          </div>
        </div>
      )}

      {/* Toggle Panel */}
      <ComponentTogglePanel 
        toggles={toggles} 
        onToggle={handleToggle} 
      />

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={handleFloatingAction}
      />

      {/* Dev Chaos Tester */}
      <DevChaosTester 
        actions={devActions}
      />

      {/* Status Display */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.875rem',
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#60a5fa' }}>🎛️ Controls Status</h4>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Insanity Mode:</strong> {insanityActive ? '🔥 ACTIVE' : '💤 Inactive'}
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Active Toggles:</strong> {toggles.filter(t => t.active).length}/{toggles.length}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
          Use the controls at the bottom to interact!
        </div>
      </div>
    </>
  );
};

// Add CSS animations to document head when component mounts
React.useEffect(() => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes insanityPulse {
      0% { opacity: 0.3; }
      100% { opacity: 0.7; }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
}, []);

export default InteractiveControlsManager;
