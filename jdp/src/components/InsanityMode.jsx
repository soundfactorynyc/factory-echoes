import React, { useState, useEffect, useRef } from 'react';
import { Zap, Flame, Star, Sparkles, Volume2, VolumeX } from 'lucide-react';

const InsanityMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [particles, setParticles] = useState([]);
  const [combo, setCombo] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (isActive && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const createParticle = () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 5 + 2,
        hue: Math.random() * 360,
        life: 1,
        decay: Math.random() * 0.02 + 0.01
      });

      const animate = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        setParticles(prev => {
          const newParticles = prev.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - particle.decay
          })).filter(particle => particle.life > 0);

          // Add new particles
          if (newParticles.length < intensity * 50) {
            newParticles.push(createParticle());
          }

          // Draw particles
          newParticles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = `hsl(${particle.hue}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          return newParticles;
        });

        if (isActive) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, intensity]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setIntensity(prev => Math.min(prev + 0.1, 10));
        setCombo(prev => prev + 1);
      }, 500);

      return () => clearInterval(interval);
    } else {
      setIntensity(0);
      setCombo(0);
      setParticles([]);
    }
  }, [isActive]);

  const toggleInsanity = () => {
    setIsActive(!isActive);
    if (soundEnabled) {
      // In a real implementation, you'd play sound effects here
      console.log('🔊 Insanity mode sound effect!');
    }
  };

  const getIntensityLevel = () => {
    if (intensity < 2) return 'Warming Up';
    if (intensity < 5) return 'Getting Crazy';
    if (intensity < 8) return 'INSANE!';
    return 'ABSOLUTELY MENTAL!';
  };

  const getIntensityColor = () => {
    if (intensity < 2) return '#ffd700';
    if (intensity < 5) return '#ff8c00';
    if (intensity < 8) return '#ff4444';
    return '#ff0066';
  };

  return (
    <div className={`insanity-mode ${isActive ? 'active' : ''}`}>
      <div className="insanity-header">
        <div className="title-section">
          <Zap className="insanity-icon" />
          <h3>INSANITY MODE</h3>
          <button 
            className="sound-toggle"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
        
        {isActive && (
          <div className="intensity-display">
            <div className="intensity-bar">
              <div 
                className="intensity-fill"
                style={{ 
                  width: `${(intensity / 10) * 100}%`,
                  background: getIntensityColor()
                }}
              />
            </div>
            <span className="intensity-label" style={{ color: getIntensityColor() }}>
              {getIntensityLevel()}
            </span>
          </div>
        )}
      </div>

      <div className="insanity-content">
        <canvas 
          ref={canvasRef}
          className="particle-canvas"
          style={{ opacity: isActive ? 1 : 0 }}
        />
        
        <div className="control-section">
          <button 
            className={`insanity-toggle ${isActive ? 'active' : ''}`}
            onClick={toggleInsanity}
          >
            {isActive ? (
              <>
                <Sparkles className="btn-icon" />
                STOP THE MADNESS
              </>
            ) : (
              <>
                <Flame className="btn-icon" />
                ACTIVATE INSANITY
              </>
            )}
          </button>
          
          {isActive && (
            <div className="stats-grid">
              <div className="stat-item">
                <Star className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{combo}</span>
                  <span className="stat-label">Combo</span>
                </div>
              </div>
              
              <div className="stat-item">
                <Zap className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{intensity.toFixed(1)}</span>
                  <span className="stat-label">Intensity</span>
                </div>
              </div>
              
              <div className="stat-item">
                <Flame className="stat-icon" />
                <div className="stat-content">
                  <span className="stat-value">{particles.length}</span>
                  <span className="stat-label">Particles</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .insanity-mode {
          background: linear-gradient(145deg, #1a0033, #330066);
          border-radius: 16px;
          padding: 1.5rem;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          transition: all 0.5s ease;
          min-height: 300px;
        }
        
        .insanity-mode.active {
          border-color: #ff0066;
          box-shadow: 0 0 30px rgba(255, 0, 102, 0.5);
          animation: insanityPulse 2s infinite alternate;
        }
        
        .insanity-header {
          margin-bottom: 1.5rem;
        }
        
        .title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        .insanity-icon {
          color: #ffd700;
          animation: ${isActive ? 'spin 2s linear infinite' : 'none'};
        }
        
        .title-section h3 {
          margin: 0;
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .sound-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-left: auto;
        }
        
        .sound-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .intensity-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .intensity-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .intensity-fill {
          height: 100%;
          transition: all 0.3s ease;
          animation: ${isActive ? 'intensityGlow 1s infinite alternate' : 'none'};
        }
        
        .intensity-label {
          font-weight: 600;
          font-size: 0.9rem;
          text-shadow: 0 0 10px currentColor;
        }
        
        .insanity-content {
          position: relative;
        }
        
        .particle-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          border-radius: 12px;
          transition: opacity 0.5s ease;
        }
        
        .control-section {
          position: relative;
          z-index: 10;
        }
        
        .insanity-toggle {
          width: 100%;
          background: linear-gradient(135deg, #ff0066, #ff6600);
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .insanity-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 0, 102, 0.4);
        }
        
        .insanity-toggle.active {
          background: linear-gradient(135deg, #cc0052, #cc5200);
          animation: buttonPulse 1.5s infinite;
        }
        
        .btn-icon {
          animation: ${isActive ? 'iconSpin 1s linear infinite' : 'none'};
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        
        .stat-item {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .stat-item:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        
        .stat-icon {
          color: #ffd700;
          animation: ${isActive ? 'statGlow 2s infinite alternate' : 'none'};
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
          letter-spacing: 0.5px;
        }
        
        @keyframes insanityPulse {
          0% { box-shadow: 0 0 20px rgba(255, 0, 102, 0.3); }
          100% { box-shadow: 0 0 40px rgba(255, 0, 102, 0.7); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes intensityGlow {
          0% { box-shadow: 0 0 5px currentColor; }
          100% { box-shadow: 0 0 15px currentColor; }
        }
        
        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes iconSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes statGlow {
          0% { filter: drop-shadow(0 0 3px currentColor); }
          100% { filter: drop-shadow(0 0 8px currentColor); }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .intensity-display {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default InsanityMode;
