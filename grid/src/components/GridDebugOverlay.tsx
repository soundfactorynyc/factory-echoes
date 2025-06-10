/**
 * GridDebugOverlay Component
 * 
 * This component provides a debug overlay for the grid system,
 * showing information about the grid state and allowing for interaction.
 * It also displays performance metrics for monitoring system health.
 */

import React, { useState, useEffect } from 'react';
import { useGridState } from '../hooks/useGridState';
import { gridOS } from '../integration/gridOSBackend';

// Define PerformanceMetrics type locally to avoid dependency
interface PerformanceMetrics {
  fps: number;
  eventLatency: number;
  claudeResponseTime: number;
  gridUpdateTime: number;
}

export const GridDebugOverlay: React.FC = () => {
  // Initialize with default empty tiles
  const defaultTiles = Array(64).fill(0).map((_, i) => ({ 
    id: i, 
    active: false, 
    intensity: 0 
  }));
  
  // Try to use the grid state hook, but fall back to default tiles if it fails
  let tiles = defaultTiles;
  try {
    const gridState = useGridState();
    tiles = gridState.tiles || defaultTiles;
  } catch (error) {
    console.warn('Error using grid state:', error);
  }
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<string>('random');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    eventLatency: 0,
    claudeResponseTime: 0,
    gridUpdateTime: 0
  });
  const [showPerformance, setShowPerformance] = useState(false);
  
  const activeTileCount = tiles ? tiles.filter(tile => tile.active).length : 0;
  const averageIntensity = tiles && tiles.length > 0 ? 
    tiles.reduce((sum, tile) => sum + tile.intensity, 0) / tiles.length : 0;
  
  // Mock performance monitoring data update
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        ...prev,
        fps: 55 + Math.random() * 10,
        eventLatency: Math.random() * 5,
        claudeResponseTime: 100 + Math.random() * 50,
        gridUpdateTime: Math.random() * 10
      }));
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, []);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const activateRandomTiles = () => {
    try {
      if (window.gridOS && window.gridOS.eventBus && window.gridOS.eventBus.sendGridCommand) {
        const randomTiles = [];
        const count = Math.floor(Math.random() * 20) + 5; // 5-25 random tiles
        
        for (let i = 0; i < count; i++) {
          randomTiles.push(Math.floor(Math.random() * 64).toString());
        }
        
        gridOS.eventBus.sendGridCommand('activate', randomTiles);
      } else {
        console.warn('Grid OS event bus not available');
      }
    } catch (error) {
      console.warn('Error activating random tiles:', error);
    }
  };
  
  const pulseTiles = () => {
    try {
      if (window.gridOS && window.gridOS.eventBus && window.gridOS.eventBus.sendGridCommand) {
        gridOS.eventBus.sendGridCommand('pulse', undefined, 0.8);
      } else {
        console.warn('Grid OS event bus not available');
      }
    } catch (error) {
      console.warn('Error pulsing tiles:', error);
    }
  };
  
  const clearTiles = () => {
    try {
      if (window.gridOS && window.gridOS.eventBus && window.gridOS.eventBus.sendGridCommand) {
        gridOS.eventBus.sendGridCommand('activate', []);
      } else {
        console.warn('Grid OS event bus not available');
      }
    } catch (error) {
      console.warn('Error clearing tiles:', error);
    }
  };
  
  const activatePattern = (pattern: string) => {
    setSelectedPattern(pattern);
    
    try {
      if (window.gridOS && window.gridOS.eventBus && window.gridOS.eventBus.sendGridCommand) {
        let tileIds: string[] = [];
        
        switch (pattern) {
          case 'checkerboard':
            // Create a checkerboard pattern
            for (let i = 0; i < 64; i++) {
              if ((Math.floor(i / 8) + i % 8) % 2 === 0) {
                tileIds.push(i.toString());
              }
            }
            break;
            
          case 'border':
            // Create a border pattern
            for (let i = 0; i < 64; i++) {
              const row = Math.floor(i / 8);
              const col = i % 8;
              
              if (row === 0 || row === 7 || col === 0 || col === 7) {
                tileIds.push(i.toString());
              }
            }
            break;
            
          case 'cross':
            // Create a cross pattern
            for (let i = 0; i < 64; i++) {
              const row = Math.floor(i / 8);
              const col = i % 8;
              
              if (row === 3 || row === 4 || col === 3 || col === 4) {
                tileIds.push(i.toString());
              }
            }
            break;
            
          case 'diagonal':
            // Create a diagonal pattern
            for (let i = 0; i < 64; i++) {
              const row = Math.floor(i / 8);
              const col = i % 8;
              
              if (row === col || row === 7 - col) {
                tileIds.push(i.toString());
              }
            }
            break;
            
          default:
            // Random pattern (handled by activateRandomTiles)
            activateRandomTiles();
            return;
        }
        
        gridOS.eventBus.sendGridCommand('activate', tileIds);
      } else {
        console.warn('Grid OS event bus not available');
      }
    } catch (error) {
      console.warn('Error activating pattern:', error);
    }
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 text-white shadow-lg overflow-hidden z-50 border-t border-gray-700">
      <div 
        className="px-4 py-3 bg-gray-800 flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <h3 className="text-sm font-semibold">Grid Debug</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-cyan-500 text-black px-2 py-1 rounded">
            {activeTileCount} active
          </span>
          <span className="text-xs bg-green-500 text-black px-2 py-1 rounded">
            {Math.round(performanceMetrics.fps)} FPS
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 overflow-auto max-h-[80vh]">
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Active Tiles</div>
              <div className="font-mono">{activeTileCount} / 64</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Avg Intensity</div>
              <div className="font-mono">{averageIntensity.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-1">Patterns</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button 
                className={`text-xs py-1 px-2 rounded ${selectedPattern === 'random' ? 'bg-cyan-500 text-black' : 'bg-gray-700'}`}
                onClick={() => activatePattern('random')}
              >
                Random
              </button>
              <button 
                className={`text-xs py-1 px-2 rounded ${selectedPattern === 'checkerboard' ? 'bg-cyan-500 text-black' : 'bg-gray-700'}`}
                onClick={() => activatePattern('checkerboard')}
              >
                Checkerboard
              </button>
              <button 
                className={`text-xs py-1 px-2 rounded ${selectedPattern === 'border' ? 'bg-cyan-500 text-black' : 'bg-gray-700'}`}
                onClick={() => activatePattern('border')}
              >
                Border
              </button>
              <button 
                className={`text-xs py-1 px-2 rounded ${selectedPattern === 'cross' ? 'bg-cyan-500 text-black' : 'bg-gray-700'}`}
                onClick={() => activatePattern('cross')}
              >
                Cross
              </button>
              <button 
                className={`text-xs py-1 px-2 rounded ${selectedPattern === 'diagonal' ? 'bg-cyan-500 text-black' : 'bg-gray-700'}`}
                onClick={() => activatePattern('diagonal')}
              >
                Diagonal
              </button>
              <button 
                className="text-xs py-1 px-2 rounded bg-gray-700"
                onClick={clearTiles}
              >
                Clear All
              </button>
            </div>
            
            <div className="text-xs text-gray-400 mb-1 mt-3">Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="text-xs py-1 px-2 rounded bg-gray-700"
                onClick={pulseTiles}
              >
                Pulse Tiles
              </button>
              <button 
                className="text-xs py-1 px-2 rounded bg-gray-700"
                onClick={() => {
                  try {
                    if (window.gridOS && window.gridOS.eventBus && window.gridOS.eventBus.sendBeatEvent) {
                      gridOS.eventBus.sendBeatEvent(120, 0.8, true, 4, 0);
                    } else {
                      console.warn('Grid OS event bus not available');
                    }
                  } catch (error) {
                    console.warn('Error triggering beat:', error);
                  }
                }}
              >
                Trigger Beat
              </button>
            </div>
            
            <div className="text-xs text-gray-400 mb-1 mt-3 flex justify-between items-center">
              <span>Performance</span>
              <button 
                className="text-xs py-0.5 px-1 rounded bg-gray-700"
                onClick={() => setShowPerformance(!showPerformance)}
              >
                {showPerformance ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showPerformance && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">FPS</div>
                  <div className="font-mono">{Math.round(performanceMetrics.fps)}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Event Latency</div>
                  <div className="font-mono">{performanceMetrics.eventLatency.toFixed(1)} ms</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">Grid Update</div>
                  <div className="font-mono">{performanceMetrics.gridUpdateTime.toFixed(1)} ms</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-400">System Health</div>
                  <div className="font-mono">
                    {performanceMetrics.fps > 50 ? 'Good' : performanceMetrics.fps > 30 ? 'Fair' : 'Poor'}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="grid grid-cols-8 gap-1 max-w-[300px] mx-auto">
                {tiles.map((tile, i) => (
                  <div
                    key={i}
                    className={`
                      w-3 h-3 rounded-sm transition-all duration-300
                      ${tile.active ? 'bg-cyan-500' : 'bg-gray-800'}
                    `}
                    style={{
                      opacity: 0.3 + tile.intensity * 0.7
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
