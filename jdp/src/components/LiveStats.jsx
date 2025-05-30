import React, { useEffect, useState } from 'react';

const statsConfig = [
  { label: 'Total Reach', key: 'reach', emoji: '👥', initial: 24500 },
  { label: 'Engagement',  key: 'engage', emoji: '💬', initial: 3200  },
  { label: 'Shares',      key: 'shares', emoji: '🔄', initial: 892   },
];

export default function LiveStats() {
  const [stats, setStats] = useState(
    statsConfig.reduce((o, s) => ({ ...o, [s.key]: s.initial }), {})
  );

  useEffect(() => {
    const intv = setInterval(() => {
      setStats(prev => ({
        reach:   prev.reach + Math.random() * 50,
        engage:  prev.engage + Math.random() * 5,
        shares:  prev.shares + Math.random() * 3,
      }));
    }, 5000);
    return () => clearInterval(intv);
  }, []);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem'
  };
  const cardStyle = {
    background: 'rgba(74, 85, 104, 0.5)',
    padding: '1rem',
    borderRadius: '0.75rem',
    textAlign: 'center'
  };
  const numberStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    background: 'linear-gradient(90deg, #81e6d9, #63b3ed)',
    WebkitBackgroundClip: 'text',
    color: 'transparent'
  };
  const labelStyle = { fontSize: '0.75rem', color: '#cbd5e0' };

  return (
    <div style={gridStyle}>
      {statsConfig.map(s => (
        <div key={s.key} style={cardStyle}>
          <div style={numberStyle}>
            {s.emoji} {Math.floor(stats[s.key]).toLocaleString()}
          </div>
          <div style={labelStyle}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
