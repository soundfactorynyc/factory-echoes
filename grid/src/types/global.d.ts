/**
 * Global type definitions for GRID OS
 */

import { GridOSBackend } from '../integration/gridOSBackend';
import { SystemHealth } from '../integration/systemHealth';

declare global {
  interface Window {
    /**
     * GRID OS global object
     */
    gridOS: {
      /**
       * Event bus system
       */
      eventBus: any;
      
      /**
       * Shader system
       */
      shaderSystem: any;
      
      /**
       * Trigger system
       */
      triggerSystem: any;
      
      /**
       * System state
       */
      state$: any;
      
      /**
       * Predictive buffer
       */
      predictiveBuffer$: any;
      
      /**
       * Get system health
       */
      getSystemHealth: () => any;
      
      /**
       * Initialize GRID OS
       */
      initialize: () => Promise<boolean>;
      
      /**
       * Initialize shader system with renderer
       */
      initializeShaderSystem: (renderer: any) => boolean;
      
      /**
       * Check if shader system is ready
       */
      isShaderSystemReady: () => boolean;
      
      /**
       * Get shader system instance
       */
      getShaderSystem: () => any;
    };
    
    /**
     * GRID System Test global object
     */
    gridSystemTest: {
      /**
       * Run all system tests
       * @returns Test results
       */
      runAllTests: () => Promise<any[]>;
    };
    
    /**
     * Initialization flags
     */
    gridOSExportsInitialized?: boolean;
    gridOSInitialized?: boolean;
  }
  }
}
