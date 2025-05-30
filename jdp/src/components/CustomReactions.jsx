import React, { useState, useEffect } from 'react';

const CustomReactions = () => {
  const [customReactions, setCustomReactions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReaction, setNewReaction] = useState({ emoji: '', name: '', shortcut: '' });
  const [recentReactions, setRecentReactions] = useState([]);

  // Default emoji options for quick selection
  const defaultEmojis = ['😂', '❤️', '🔥', '👏', '😍', '🤯', '💯', '🎉', '😢', '😮', '🤔', '👍', '👎', '🙌', '💪', '🎮'];

  // Load custom reactions from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('customReactions');
    if (saved) {
      setCustomReactions(JSON.parse(saved));
    }
  }, []);

  // Save custom reactions to localStorage
  const saveCustomReactions = (reactions) => {
    localStorage.setItem('customReactions', JSON.stringify(reactions));
    setCustomReactions(reactions);
  };

  // Add a new custom reaction
  const addCustomReaction = () => {
    if (!newReaction.emoji || !newReaction.name) return;

    const reaction = {
      id: Date.now(),
      emoji: newReaction.emoji,
      name: newReaction.name,
      shortcut: newReaction.shortcut || newReaction.name.toLowerCase(),
      usageCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [...customReactions, reaction];
    saveCustomReactions(updated);
    setNewReaction({ emoji: '', name: '', shortcut: '' });
    setShowCreateModal(false);
  };

  // Use a reaction (increment usage count and add to recent)
  const useReaction = (reaction) => {
    // Update usage count
    const updated = customReactions.map(r => 
      r.id === reaction.id ? { ...r, usageCount: r.usageCount + 1 } : r
    );
    saveCustomReactions(updated);

    // Add to recent reactions
    setRecentReactions(prev => {
      const filtered = prev.filter(r => r.id !== reaction.id);
      return [reaction, ...filtered].slice(0, 6);
    });

    // Trigger reaction animation (could be connected to other components)
    const event = new CustomEvent('customReaction', { 
      detail: { reaction, timestamp: Date.now() } 
    });
    window.dispatchEvent(event);
  };

  // Delete a custom reaction
  const deleteReaction = (id) => {
    const updated = customReactions.filter(r => r.id !== id);
    saveCustomReactions(updated);
  };

  // Sort reactions by usage count
  const sortedReactions = [...customReactions].sort((a, b) => b.usageCount - a.usageCount);

  return (
    <div className="custom-reactions">
      <div className="reactions-header">
        <h3>Custom Reactions</h3>
        <button 
          className="create-btn"
          onClick={() => setShowCreateModal(true)}
          title="Create Custom Reaction"
        >
          ➕
        </button>
      </div>

      {/* Recent Reactions */}
      {recentReactions.length > 0 && (
        <div className="recent-section">
          <h4>Recent</h4>
          <div className="reactions-grid recent-grid">
            {recentReactions.map(reaction => (
              <button
                key={`recent-${reaction.id}`}
                className="reaction-btn recent"
                onClick={() => useReaction(reaction)}
                title={reaction.name}
              >
                <span className="emoji">{reaction.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Reactions */}
      <div className="custom-section">
        <h4>My Reactions ({customReactions.length})</h4>
        <div className="reactions-grid">
          {sortedReactions.map(reaction => (
            <div key={reaction.id} className="reaction-item">
              <button
                className="reaction-btn"
                onClick={() => useReaction(reaction)}
                title={`${reaction.name} (${reaction.usageCount} uses)`}
              >
                <span className="emoji">{reaction.emoji}</span>
                <span className="usage-count">{reaction.usageCount}</span>
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteReaction(reaction.id)}
                title="Delete Reaction"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Custom Reaction</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Choose Emoji</label>
                <div className="emoji-picker">
                  {defaultEmojis.map(emoji => (
                    <button
                      key={emoji}
                      className={`emoji-option ${newReaction.emoji === emoji ? 'selected' : ''}`}
                      onClick={() => setNewReaction(prev => ({ ...prev, emoji }))}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type custom emoji..."
                  value={newReaction.emoji}
                  onChange={e => setNewReaction(prev => ({ ...prev, emoji: e.target.value }))}
                  className="emoji-input"
                />
              </div>

              <div className="form-group">
                <label>Reaction Name</label>
                <input
                  type="text"
                  placeholder="e.g., Epic Win"
                  value={newReaction.name}
                  onChange={e => setNewReaction(prev => ({ ...prev, name: e.target.value }))}
                  className="text-input"
                />
              </div>

              <div className="form-group">
                <label>Shortcut (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., epic, win"
                  value={newReaction.shortcut}
                  onChange={e => setNewReaction(prev => ({ ...prev, shortcut: e.target.value }))}
                  className="text-input"
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="create-btn-modal"
                  onClick={addCustomReaction}
                  disabled={!newReaction.emoji || !newReaction.name}
                >
                  Create Reaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-reactions {
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border-radius: 15px;
          padding: 1.5rem;
          color: white;
          width: 100%;
          max-width: 400px;
        }

        .reactions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .reactions-header h3 {
          margin: 0;
          color: #00d4aa;
          font-size: 1.2rem;
        }

        .create-btn {
          background: linear-gradient(45deg, #00d4aa, #00b894);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .create-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
        }

        .recent-section, .custom-section {
          margin-bottom: 1.5rem;
        }

        .recent-section h4, .custom-section h4 {
          margin: 0 0 0.8rem 0;
          color: #bdc3c7;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .reactions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
          gap: 0.5rem;
        }

        .recent-grid {
          grid-template-columns: repeat(6, 1fr);
        }

        .reaction-item {
          position: relative;
        }

        .reaction-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .reaction-btn:hover {
          background: rgba(0, 212, 170, 0.2);
          border-color: #00d4aa;
          transform: translateY(-2px);
        }

        .reaction-btn.recent {
          background: rgba(0, 212, 170, 0.15);
          border-color: #00d4aa;
        }

        .emoji {
          font-size: 1.5rem;
          margin-bottom: 0.2rem;
        }

        .usage-count {
          font-size: 0.7rem;
          color: #00d4aa;
          font-weight: bold;
        }

        .delete-btn {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #e74c3c;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          color: white;
          cursor: pointer;
          font-size: 0.8rem;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .reaction-item:hover .delete-btn {
          display: flex;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border-radius: 15px;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h3 {
          margin: 0;
          color: #00d4aa;
        }

        .close-btn {
          background: none;
          border: none;
          color: #bdc3c7;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #ecf0f1;
          font-weight: 500;
        }

        .emoji-picker {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .emoji-option {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 0.5rem;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .emoji-option:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .emoji-option.selected {
          border-color: #00d4aa;
          background: rgba(0, 212, 170, 0.2);
        }

        .text-input, .emoji-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 8px;
          color: white;
          font-size: 1rem;
        }

        .text-input:focus, .emoji-input:focus {
          outline: none;
          border-color: #00d4aa;
          background: rgba(255, 255, 255, 0.15);
        }

        .text-input::placeholder, .emoji-input::placeholder {
          color: #bdc3c7;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .cancel-btn, .create-btn-modal {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .cancel-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #bdc3c7;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .create-btn-modal {
          background: linear-gradient(45deg, #00d4aa, #00b894);
          color: white;
        }

        .create-btn-modal:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
        }

        .create-btn-modal:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .custom-reactions {
            padding: 1rem;
          }
          
          .reactions-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .recent-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          
          .emoji-picker {
            grid-template-columns: repeat(6, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default CustomReactions;
