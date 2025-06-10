/**
 * Window Exports
 * 
 * This module exports Grid OS objects to the window object for global access.
 */

import { gridOS } from './GridOSBackend';
import { gridSystemTest } from './GridSystemTest';

/**
 * Export Grid OS objects to window
 */
export function exportToWindow(): void {
  if (typeof window !== 'undefined') {
    // Export gridOS
    window.gridOS = gridOS;
    
    // Export gridSystemTest
    window.gridSystemTest = gridSystemTest;
    
    console.log('Grid OS objects exported to window');
  }
}

// Auto-export when this module is loaded
exportToWindow();

/**
 * Declare global window interface
 */
declare global {
  interface Window {
    gridOS?: typeof gridOS;
    gridSystemTest?: typeof gridSystemTest;
  }
}
