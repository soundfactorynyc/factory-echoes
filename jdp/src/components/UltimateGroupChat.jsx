import React, { useState, useEffect } from 'react';
import { Send, Heart, MessageCircle, Share, Crown, Star, Zap } from 'lucide-react';

const UltimateGroupChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Sample users with different roles
  const users = [
    { name: 'StreamerBot', role: 'bot', color: '#00d4ff' },
    { name: 'ModeratorX', role: 'mod', color: '#ff6b9d' },
    { name: 'VIPGamer', role: 'vip', color: '#ffd700' },
    { name: 'RegularViewer', role: 'viewer', color: '#a0aec0' }
  ];

  const messageTypes = [
    { type: 'chat', content: 'This stream is amazing! 🔥' },
    { type: 'donation', content: 'donated $5.00', amount: 5 },
    { type: 'follow', content: 'just followed!' },
    { type: 'chat', content: 'GG that was epic!' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMessage = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      
      const newMsg = {
        id: Date.now(),
        user: randomUser,
        ...randomMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev.slice(-20), newMsg]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMsg = {
        id: Date.now(),
        user: { name: 'You', role: 'viewer', color: '#00d4ff' },
        type: 'chat',
        content: newMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMsg]);
      setNewMessage('');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'mod': return <Crown size={14} />;
      case 'vip': return <Star size={14} />;
      case 'bot': return <Zap size={14} />;
      default: return null;
    }
  };

  const styles = {
    container: {
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.05)'
    },
    messages: {
      flex: 1,
      overflowY: 'auto',
      padding: '0.5rem'
    },
    message: {
      marginBottom: '1rem',
      padding: '0.75rem',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)'
    },
    messageHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.25rem'
    },
    chatInput: {
      display: 'flex',
      padding: '1rem',
      gap: '0.5rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.05)'
    },
    input: {
      flex: 1,
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '8px',
      outline: 'none'
    },
    button: {
      background: '#00d4ff',
      border: 'none',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>💬 Live Chat</h3>
        <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>
          {messages.length} messages
        </div>
      </div>
      
      <div style={styles.messages}>
        {messages.map((message) => (
          <div key={message.id} style={styles.message}>
            <div style={styles.messageHeader}>
              <span style={{ color: message.user.color }}>
                {getRoleIcon(message.user.role)}
              </span>
              <span style={{ color: message.user.color, fontWeight: '600', fontSize: '0.9rem' }}>
                {message.user.name}
              </span>
              <span style={{ color: '#a0aec0', fontSize: '0.7rem', marginLeft: 'auto' }}>
                {message.timestamp.toLocaleTimeString().slice(0, 5)}
              </span>
            </div>
            
            <div style={{ color: 'white', lineHeight: 1.4, wordWrap: 'break-word' }}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <form style={styles.chatInput} onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          style={styles.input}
        />
        <button type="submit" disabled={!newMessage.trim()} style={styles.button}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default UltimateGroupChat;
