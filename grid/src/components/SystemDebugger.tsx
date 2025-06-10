import React, { useState, useEffect } from 'react';
import { gridOS } from '../integration/gridOSBackend';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

export const SystemDebugger: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  const addLog = (level: LogEntry['level'], message: string, data?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };
    setLogs(prev => [...prev.slice(-20), newLog]); // Keep last 20 logs
  };

  // Override console methods to capture logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      originalConsoleLog(...args);
      if (args[0]?.includes?.('🔧') || args[0]?.includes?.('✅') || args[0]?.includes?.('❌') || args[0]?.includes?.('⚠️')) {
        addLog('info', args.join(' '), args[1]);
      }
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      addLog('warn', args.join(' '), args[1]);
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      addLog('error', args.join(' '), args[1]);
    };

    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  // Test system periodically
  useEffect(() => {
    const testSystem = () => {
      try {
        if (window.gridOS) {
          const health = window.gridOS.getSystemHealth();
          setSystemHealth(health);
          addLog('success', 'System health updated', health);
        } else {
          addLog('error', 'window.gridOS not available');
        }
      } catch (error) {
        addLog('error', 'Error testing system', error);
      }
    };

    // Initial test
    setTimeout(testSystem, 1000);
    
    // Periodic tests
    const interval = setInterval(testSystem, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const testShaderSystem = () => {
    try {
      if (window.gridOS?.getShaderSystem) {
        const shaderSystem = window.gridOS.getShaderSystem();
        const info = {
          isReady: shaderSystem.isReady(),
          dimensions: shaderSystem.getDimensions(),
          activeShaders: Array.from(shaderSystem.activeShaders.keys()),
          canvasSize: shaderSystem.getCanvasSize()
        };
        addLog('info', 'Shader system test', info);
      } else {
        addLog('error', 'Shader system not available');
      }
    } catch (error) {
      addLog('error', 'Shader system test failed', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 10000,
          padding: '8px 12px',
          background: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Show Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 10000,
      overflow: 'auto',
      border: '1px solid #333'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>🔧 System Debugger</h3>
        <div>
          <button onClick={testShaderSystem} style={{ marginRight: '8px', padding: '4px 8px', fontSize: '10px' }}>
            Test Shader
          </button>
          <button onClick={clearLogs} style={{ marginRight: '8px', padding: '4px 8px', fontSize: '10px' }}>
            Clear
          </button>
          <button onClick={() => setIsVisible(false)} style={{ padding: '4px 8px', fontSize: '10px' }}>
            Hide
          </button>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <div style={{ marginBottom: '12px', padding: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}>
          <strong>System Health:</strong>
          <div>Status: <span style={{ color: systemHealth.status === 'healthy' ? '#4ade80' : '#f87171' }}>
            {systemHealth.status}
          </span></div>
          {systemHealth.subsystems && (
            <div style={{ marginTop: '4px' }}>
              <div>Shader: <span style={{ color: systemHealth.subsystems.shaderSystem?.status === 'healthy' ? '#4ade80' : '#f87171' }}>
                {systemHealth.subsystems.shaderSystem?.status}
              </span></div>
              <div>Event Bus: <span style={{ color: systemHealth.subsystems.eventBus?.status === 'healthy' ? '#4ade80' : '#f87171' }}>
                {systemHealth.subsystems.eventBus?.status}
              </span></div>
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <strong>Live Logs:</strong>
        {logs.length === 0 ? (
          <div style={{ padding: '8px', color: '#888' }}>No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '4px 0', 
                borderBottom: '1px solid #333',
                color: log.level === 'error' ? '#f87171' : 
                       log.level === 'warn' ? '#fbbf24' : 
                       log.level === 'success' ? '#4ade80' : '#e5e7eb'
              }}
            >
              <div style={{ fontSize: '10px', color: '#888' }}>{log.timestamp}</div>
              <div>{log.message}</div>
              {log.data && (
                <pre style={{ fontSize: '10px', color: '#888', margin: '2px 0', whiteSpace: 'pre-wrap' }}>
                  {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
