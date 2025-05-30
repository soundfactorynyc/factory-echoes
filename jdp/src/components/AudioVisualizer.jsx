import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ barCount = 30, updateInterval = 100 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const bars = Array.from(container.children);

    const tick = () => {
      bars.forEach(bar => {
        bar.style.height = `${Math.random() * 80 + 20}%`;
      });
    };
    const iv = setInterval(tick, updateInterval);
    return () => clearInterval(iv);
  }, [updateInterval]);

  return (
    <div ref={containerRef} style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '100px',
      display: 'flex',
      alignItems: 'flex-end',
      pointerEvents: 'none',
      zIndex: 990
    }}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            margin: '0 1px',
            background: 'linear-gradient(to top, #7f00ff, #e100ff)',
            borderRadius: '2px',
            transition: 'height 0.1s ease'
          }}
        />
      ))}
    </div>
  );
};
    <div ref={containerRef} style={containerStyle}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{ ...barStyle, height: '10px' }} />
      ))}
    </div>
  );
}
