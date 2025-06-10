/**
 * GRID OS: Main Entry Point
 * 
 * This is the main entry point for the GRID OS Integration Core.
 * It imports and initializes all necessary components.
 */

import { exportToWindow } from './integration/windowExports';
import { gridOS } from './integration/gridOSBackend';
import './core/index'; // Import core modules

// Initialize only once
if (typeof window !== 'undefined' && !window.gridOSExportsInitialized) {
  // Export components to window
  exportToWindow();
  
  // Initialize GRID OS
  if (!window.gridOSInitialized) {
    console.log('🚀 Starting Grid OS initialization...');
    
    gridOS.initialize()
      .then(() => {
        window.gridOSInitialized = true;
        console.log('GRID OS initialized successfully from main entry point');
      })
      .catch(error => {
        console.error('GRID OS initialization failed:', error);
      });
  }
}

// Log initialization
console.log('GRID OS: Main entry point loaded');
