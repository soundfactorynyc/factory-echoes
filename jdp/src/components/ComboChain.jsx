import React, { useState, useEffect } from 'react';
import { Zap, Target, Award, Flame, Star, Crown, Trophy } from 'lucide-react';

const ComboChain = () => {
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [comboHistory, setComboHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [chainTimer, setChainTimer] = useState(0);
  const [particles, setParticles] = useState([]);

  const comboThresholds = [
    { count: 5, name: 'Getting Started', multiplier: 1.2, color: '#ffd700' },
    { count: 10, name: 'On Fire', multiplier: 1.5, color: '#ff8c00' },
    { count: 25, name: 'Blazing', multiplier: 2.0, color: '#ff4444' },
    { count: 50, name: 'Legendary', multiplier: 2.5, color: '#ff0066' },
    { count: 100, name: 'Godlike', multiplier: 3.0, color: '#9f00ff' },
    { count: 200, name: 'UNSTOPPABLE', multiplier: 4.0, color: '#00ffff' }
  ];

  useEffect(() => {
    let interval;
    if (isActive && chainTimer > 0) {
      interval = setInterval(() => {
        setChainTimer(prev => {
          if (prev <= 1) {
            resetCombo();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, chainTimer]);

  useEffect(() => {
    const threshold = getCurrentThreshold();
    if (threshold) {
      setMultiplier(threshold.multiplier);
    }
  }, [currentCombo]);

  const getCurrentThreshold = () => {
    return comboThresholds
      .slice()
      .reverse()
      .find(threshold => currentCombo >= threshold.count);
  };

  const addCombo = () => {
    const newCombo = currentCombo + 1;
    setCurrentCombo(newCombo);
    setMaxCombo(Math.max(maxCombo, newCombo));
    setIsActive(true);
    setChainTimer(10); // 10 seconds to maintain combo
    
    // Add to history
    setComboHistory(prev => [
      ...prev.slice(-20), // Keep last 20 combos
      {
        id: Date.now(),
        combo: newCombo,
        timestamp: new Date(),
        multiplier: multiplier
      }
    ]);

    // Create particle effect
    createParticle();

    // Check for achievements
    checkAchievements(newCombo);
  };

  const resetCombo = () => {
    if (currentCombo > 0) {
      setComboHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          combo: currentCombo,
          timestamp: new Date(),
          multiplier: multiplier,
          ended: true
        }
      ]);
    }
    
    setCurrentCombo(0);
    setMultiplier(1);
    setIsActive(false);
    setChainTimer(0);
    setParticles([]);
  };

  const createParticle = () => {
    const newParticle = {
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      life: 2000
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 2000);
  };

  const checkAchievements = (combo) => {
    const newAchievements = [];
    
    comboThresholds.forEach(threshold => {
      if (combo === threshold.count && !achievements.some(a => a.name === threshold.name)) {
        newAchievements.push({
          id: Date.now() + Math.random(),
          name: threshold.name,
          description: `Reached ${threshold.count} combo!`,
          timestamp: new Date(),
          color: threshold.color
        });
      }
    });
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const getComboRank = () => {
    if (currentCombo < 5) return { name: 'Rookie', color: '#718096' };
    if (currentCombo < 10) return { name: 'Rising', color: '#ffd700' };
    if (currentCombo < 25) return { name: 'Expert', color: '#ff8c00' };
    if (currentCombo < 50) return { name: 'Master', color: '#ff4444' };
    if (currentCombo < 100) return { name: 'Legend', color: '#ff0066' };
    return { name: 'GOD', color: '#9f00ff' };
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const rank = getComboRank();
  const threshold = getCurrentThreshold();

  return (
    <div className={`combo-chain ${isActive ? 'active' : ''}`}>
      <div className="combo-header">
        <div className="title-section">
          <Target className="combo-icon" />
          <h3>Combo Chain</h3>
          <span className="rank-badge" style={{ background: rank.color }}>
            {rank.name}
          </span>
        </div>
        
        {isActive && (
          <div className="timer-section">
            <div className="timer-bar">
              <div 
                className="timer-fill"
                style={{ width: `${(chainTimer / 10) * 100}%` }}
              />
            </div>
            <span className="timer-text">{chainTimer}s</span>
          </div>
        )}
      </div>

      <div className="combo-display">
        <div className="particle-container">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="combo-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                background: threshold?.color || '#ffd700'
              }}
            />
          ))}
        </div>
        
        <div className="combo-counter">
          <span className="combo-number" style={{ color: threshold?.color || '#ffd700' }}>
            {currentCombo}
          </span>
          <span className="combo-label">COMBO</span>
        </div>
        
        <div className="multiplier-display">
          <Zap className="multiplier-icon" />
          <span className="multiplier-text">{multiplier.toFixed(1)}x</span>
        </div>
      </div>

      <div className="combo-controls">
        <button className="combo-btn add" onClick={addCombo}>
          <Star className="btn-icon" />
          Hit Combo!
        </button>
        <button className="combo-btn reset" onClick={resetCombo}>
          <Target className="btn-icon" />
          Reset
        </button>
      </div>

      <div className="combo-stats">
        <div className="stat-row">
          <div className="stat-item">
            <Crown className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{maxCombo}</span>
              <span className="stat-label">Best</span>
            </div>
          </div>
          
          <div className="stat-item">
            <Award className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{achievements.length}</span>
              <span className="stat-label">Achievements</span>
            </div>
          </div>
        </div>
        
        {threshold && (
          <div className="threshold-info">
            <Flame className="threshold-icon" style={{ color: threshold.color }} />
            <span className="threshold-text" style={{ color: threshold.color }}>
              {threshold.name}
            </span>
          </div>
        )}
      </div>

      {achievements.length > 0 && (
        <div className="achievements-section">
          <h4>🏆 Recent Achievements</h4>
          <div className="achievements-list">
            {achievements.slice(-3).map(achievement => (
              <div 
                key={achievement.id} 
                className="achievement-item"
                style={{ borderColor: achievement.color }}
              >
                <Trophy size={16} style={{ color: achievement.color }} />
                <div className="achievement-content">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-desc">{achievement.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .combo-chain {
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border-radius: 16px;
          padding: 1.5rem;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .combo-chain.active {
          border-color: #ffd700;
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.3);
        }
        
        .combo-header {
          margin-bottom: 1.5rem;
        }
        
        .title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .combo-icon {
          color: #ffd700;
          animation: ${isActive ? 'targetSpin 3s linear infinite' : 'none'};
        }
        
        .title-section h3 {
          margin: 0;
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
        }
        
        .rank-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-left: auto;
        }
        
        .timer-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .timer-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .timer-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff4444, #ffd700);
          transition: width 1s linear;
        }
        
        .timer-text {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .combo-display {
          position: relative;
          text-align: center;
          margin-bottom: 1.5rem;
          padding: 2rem 0;
        }
        
        .particle-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .combo-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: particleFloat 2s ease-out forwards;
        }
        
        .combo-counter {
          margin-bottom: 1rem;
        }
        
        .combo-number {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
          text-shadow: 0 0 20px currentColor;
          animation: ${isActive ? 'comboGlow 1s infinite alternate' : 'none'};
        }
        
        .combo-label {
          display: block;
          color: #a0aec0;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 0.5rem;
        }
        
        .multiplier-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #00d4ff;
          font-size: 1.2rem;
          font-weight: 700;
        }
        
        .multiplier-icon {
          animation: ${isActive ? 'zapSpin 2s linear infinite' : 'none'};
        }
        
        .combo-controls {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .combo-btn {
          border: none;
          border-radius: 12px;
          padding: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .combo-btn.add {
          background: linear-gradient(135deg, #ffd700, #ff8c00);
          color: white;
        }
        
        .combo-btn.add:hover {
          background: linear-gradient(135deg, #ffed4e, #ff9500);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }
        
        .combo-btn.reset {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .combo-btn.reset:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .btn-icon {
          animation: ${isActive ? 'btnIconSpin 2s linear infinite' : 'none'};
        }
        
        .combo-stats {
          margin-bottom: 1rem;
        }
        
        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .stat-item {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .stat-icon {
          color: #ffd700;
        }
        
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        
        .stat-value {
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1;
        }
        
        .stat-label {
          color: #a0aec0;
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        
        .threshold-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .threshold-icon {
          animation: ${isActive ? 'flameDance 1.5s ease-in-out infinite alternate' : 'none'};
        }
        
        .achievements-section h4 {
          color: white;
          margin: 0 0 1rem 0;
          font-size: 1rem;
        }
        
        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .achievement-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          border-left: 3px solid;
          animation: achievementSlide 0.5s ease-out;
        }
        
        .achievement-content {
          display: flex;
          flex-direction: column;
        }
        
        .achievement-name {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .achievement-desc {
          color: #a0aec0;
          font-size: 0.8rem;
        }
        
        @keyframes targetSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes particleFloat {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes comboGlow {
          0% { filter: drop-shadow(0 0 10px currentColor); }
          100% { filter: drop-shadow(0 0 20px currentColor); }
        }
        
        @keyframes zapSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes btnIconSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes flameDance {
          0% { transform: scale(1) rotate(-5deg); }
          100% { transform: scale(1.1) rotate(5deg); }
        }
        
        @keyframes achievementSlide {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ComboChain;
