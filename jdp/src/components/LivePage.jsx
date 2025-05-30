import React, { useState, useEffect } from 'react';
import ChatPanel from './ChatPanel.jsx';
import ReactionBarReact from './ReactionBarReact.jsx';
import FloatingEmojis from './FloatingEmojis.jsx';
import LiveReactionsFeed from './LiveReactionsFeed.jsx';
import CustomReactions from './CustomReactions.jsx';

function LivePage() {
  const [messages, setMessages] = useState([
    { user: 'StreamBot', text: 'Welcome to the live stream! 🎮' },
    { user: 'Viewer123', text: 'Hey everyone!' }
  ]);
  const [showReactions, setShowReactions] = useState(false);
  const [showCustomReactions, setShowCustomReactions] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [emojis, setEmojis] = useState([]);
  const [reactions, setReactions] = useState([]);

  // Listen for custom reactions from CustomReactions component
  useEffect(() => {
    const handleCustomReaction = (event) => {
      const { reaction } = event.detail;
      console.log('Custom reaction used:', reaction);
      
      // Use the same handler as regular reactions
      handleReact(reaction.emoji);
      
      // Add a specific message for custom reactions
      setMessages(prev => [...prev, { 
        user: 'System', 
        text: `Someone used custom reaction: ${reaction.name} ${reaction.emoji}` 
      }]);
    };

    window.addEventListener('customReaction', handleCustomReaction);
    return () => window.removeEventListener('customReaction', handleCustomReaction);
  }, []);

  const addEmoji = (emoji) => {
    const id = Date.now();
    setEmojis(e => [
      ...e,
      {
        id,
        emoji,
        left: Math.random() * 80 + 10,
        duration: Math.random() * 2 + 3,
        size: Math.random() * 1.5 + 1
      }
    ]);
  };

  const handleReact = (emoji) => {
    // Add floating emoji effect, log to analytics, etc.
    console.log('Reacted with', emoji);
    setReactionCount(prev => prev + 1);
    
    // Add reaction as a message
    setMessages(prev => [...prev, { 
      user: 'System', 
      text: `Someone reacted with ${emoji}` 
    }]);
    
    // Add to reactions feed
    setReactions(r => [
      { id: Date.now(), emoji, user: '@viewer', timestamp: new Date().toLocaleTimeString() },
      ...r
    ]);
    
    // Hide reactions after selection
    setShowReactions(false);
    setShowCustomReactions(false);
    
    // Show floating emoji effect using new system
    addEmoji(emoji);
  };

  const handleSendMessage = (text) => {
    setMessages(prev => [...prev, { user: 'You', text }]);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '1.5rem',
      color: 'white',
      margin: '1rem 0',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      position: 'relative',
      minHeight: '400px'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
        🎮 Live Stream Interface Demo
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{messages.length}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>💬 Chat Messages</div>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{reactionCount}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>❤️ Reactions</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '1rem',
        fontSize: '0.9rem',
        marginBottom: '1rem'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          📱 <strong>Interactive Features:</strong>
        </p>
        <ul style={{ margin: '0', paddingLeft: '1rem' }}>
          <li>Click the ❤️ button (bottom-right) to show reaction bar</li>
          <li>Click the ⭐ button (bottom-left) to show custom reactions</li>
          <li>Use the chat panel at bottom to send messages</li>
          <li>Reactions create floating emoji effects</li>
          <li>All interactions are logged and counted</li>
        </ul>
      </div>

      {/* Main layout content would go here */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '100px' // Space for chat panel
      }}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#fff' }}>🔴 LIVE</h2>
        <p style={{ margin: '0', opacity: 0.8 }}>Stream content would appear here</p>
      </div>

      {/* Floating reaction button */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: showReactions ? '#ec4899' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
          transition: 'all 0.2s ease',
          zIndex: 1000
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)';
        }}
      >
        ❤️
      </button>

      {/* Custom reactions button */}
      <button
        onClick={() => setShowCustomReactions(!showCustomReactions)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: showCustomReactions ? '#f59e0b' : 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
          transition: 'all 0.2s ease',
          zIndex: 1000
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
        }}
      >
        ⭐
      </button>

      {/* Custom reactions button */}
      <button
        onClick={() => setShowCustomReactions(!showCustomReactions)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: showCustomReactions ? '#f59e0b' : 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '24px',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
          transition: 'all 0.2s ease',
          zIndex: 1000
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
        }}
      >
        ⭐
      </button>

      {/* Conditional reaction bar */}
      {showReactions && (
        <ReactionBarReact 
          onReact={handleReact}
          emojis={['👍', '❤️', '😂', '🔥', '🎉', '😮', '👏']}
        />
      )}

      {/* Custom reactions panel */}
      {showCustomReactions && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '20px',
          zIndex: 999
        }}>
          <CustomReactions />
        </div>
      )}

      {/* Custom reactions panel */}
      {showCustomReactions && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '20px',
          zIndex: 999
        }}>
          <CustomReactions />
        </div>
      )}

      {/* Chat panel */}
      <ChatPanel 
        messages={messages} 
        onSend={handleSendMessage}
        style={{
          // Custom positioning to avoid conflicts
          bottom: '0',
          maxHeight: '30%'
        }}
      />

      {/* Floating emoji animations */}
      <FloatingEmojis 
        emojis={emojis} 
        onComplete={() => setEmojis([])} 
      />

      {/* Live reactions feed */}
      <LiveReactionsFeed 
        reactions={reactions} 
        maxItems={3} 
      />
    </div>
  );
}

export default LivePage;
