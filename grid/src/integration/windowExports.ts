/**
 * GRID OS: Window Exports
 * 
 * This module exports GRID OS components to the window object for global access.
 */

import { gridOS } from './gridOSBackend';
import { getSystemHealth } from './systemHealth';
import gridSystemTest from './gridSystemTest';

/**
 * Export GRID OS components to window
 */
export function exportToWindow(): void {
  if (typeof window !== 'undefined') {
    // Set flag to prevent multiple initializations
    (window as any).gridOSExportsInitialized = true;
    
    // Export gridOS with all methods including shader system initialization
    const gridOSExport = {
      ...gridOS,
      getSystemHealth,
      // Explicitly include shader system methods
      initializeShaderSystem: (renderer: any) => gridOS.initializeShaderSystem(renderer),
      isShaderSystemReady: () => gridOS.isShaderSystemReady(),
      getShaderSystem: () => gridOS.getShaderSystem(),
      initialize: async (): Promise<boolean> => {
        try {
          await gridOS.initialize();
          (window as any).gridOSInitialized = true;
          return true;
        } catch (error) {
          console.error('Error initializing GRID OS:', error);
          return false;
        }
      }
    };
    
    (window as any).gridOS = gridOSExport;
    
    // Export gridSystemTest
    (window as any).gridSystemTest = gridSystemTest;
    
    console.log('GRID OS components exported to window');
  } else {
    console.warn('Window object not available, skipping exports');
  }
}

// No auto-initialization here - let index.ts control when exportToWindow is called
