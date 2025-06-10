/**
 * Grid Visual Test Component
 * 
 * A quick visual verification layer for the Grid OS system.
 */

import React, { useEffect, useState } from 'react';
import { useGridState } from '../hooks/useGridState';

/**
 * Grid Visual Test Component
 * Provides a visual representation of the grid state
 */
const GridVisualTest: React.FC = () => {
  const { tiles } = useGridState();
  const [systemHealth, setSystemHealth] = useState<any>(null);
  
  // Initialize Grid OS when component mounts
  useEffect(() => {
    // Initialize Grid OS
    window.gridOS?.initialize?.();
    
    // Get system health
    if (window.gridOS?.getSystemHealth) {
      setSystemHealth(window.gridOS.getSystemHealth());
    }
  }, []);
  
  // Run tests when button is clicked
  const runTests = () => {
    if (window.gridSystemTest?.runAllTests) {
      window.gridSystemTest.runAllTests();
    }
  };
  
  return (
    <div className="grid-visual-test">
      {/* Grid Tiles Visualization */}
      <div className="grid grid-cols-8 gap-1 p-4">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={`
              w-12 h-12 rounded transition-all duration-300
              ${tile.active ? 'bg-cyan-500' : 'bg-gray-800'}
            `}
            style={{
              transform: `scale(${1 + tile.intensity * 0.2})`,
              opacity: 0.3 + tile.intensity * 0.7
            }}
          />
        ))}
      </div>
      
      {/* System Health Display */}
      {systemHealth && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h3 className="text-xl text-cyan-400 mb-2">System Health</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-300">Status:</div>
            <div className={`font-bold ${systemHealth.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
              {systemHealth.status}
            </div>
            
            {Object.entries(systemHealth.subsystems).map(([name, data]: [string, any]) => (
              <React.Fragment key={name}>
                <div className="text-gray-300">{name}:</div>
                <div className={`font-bold ${data.status === 'ok' || data.status === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                  {data.status}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      {/* Test Button */}
      <button 
        onClick={runTests}
        className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded"
      >
        Run System Tests
      </button>
    </div>
  );
};

export default GridVisualTest;
