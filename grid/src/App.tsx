/**
 * GRID OS: Main Application
 * 
 * This is the main application component that integrates all GRID OS components
 * and provides the user interface for the application.
 */

import React, { useEffect } from 'react';
import { LegendaryGrid } from './components/LegendaryGrid';
import { GridDebugOverlay } from './components/GridDebugOverlay';
import { gridOS } from './integration/gridOSBackend';

/**
 * Main application component
 */
const App: React.FC = () => {
  // Initialize Grid OS
  useEffect(() => {
    // Run system tests
    setTimeout(() => {
      console.log('Running GRID OS system tests...');
      if (window.gridSystemTest) {
        window.gridSystemTest.runAllTests();
      }
      
      console.log('Checking system health...');
      if (window.gridOS) {
        const health = window.gridOS.getSystemHealth();
        console.log('System health:', health);
      }
    }, 2000);
  }, []);
  
  return (
    <div className="app bg-black text-white min-h-screen flex flex-col">
      <header className="p-4">
        <h1 className="text-2xl font-bold">GRID OS Visualization</h1>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="grid-container w-full max-w-full overflow-hidden">
          {/* Grid visualization */}
          <LegendaryGrid 
            width={800} 
            height={800} 
            className="overflow-hidden w-full"
          />
          
          {/* Debug overlay */}
          <GridDebugOverlay />
        </div>
      </main>
    </div>
  );
};

export default App;
