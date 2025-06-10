/**
 * Grid OS Core: Main Entry Point
 * 
 * This is the main entry point for the Grid OS Core.
 * It exports the core modules for use in the application.
 */

import { gridOS } from './GridOSBackend';
import { gridSystemTest } from './GridSystemTest';

// Export core modules
export { gridOS, gridSystemTest };

// Export to window if available
if (typeof window !== 'undefined') {
  // Only set if not already defined
  if (!window.gridOS) {
    window.gridOS = gridOS;
  }
  
  if (!window.gridSystemTest) {
    window.gridSystemTest = gridSystemTest;
  }
  
  console.log('Grid OS Core modules exported');
}
