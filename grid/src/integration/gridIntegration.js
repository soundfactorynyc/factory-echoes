/**
 * GRID OS: Integration System
 * 
 * This module provides integration functionality for GRID OS,
 * including connection testing, system diagnostics, and external service integration.
 */

import { gridOS } from './gridOSBackend.js';

/**
 * GRID Integration System
 */
class GridIntegration {
  constructor() {
    this.connections = {
      owncast: { status: 'unknown', lastChecked: null },
      claude: { status: 'unknown', lastChecked: null },
      rtmp: { status: 'unknown', lastChecked: null },
      soundFactory: { status: 'unknown', lastChecked: null },
      eventBus: { status: 'unknown', lastChecked: null }
    };
    
    this.initialized = false;
  }
  
  /**
   * Initialize the integration system
   */
  async initialize() {
    if (this.initialized) {
      console.log('GRID Integration already initialized');
      return;
    }
    
    console.log('🔌 Initializing GRID Integration...');
    
    // Simulate initialization
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Set event bus connection to active since it's internal
    this.connections.eventBus = { 
      status: 'active', 
      lastChecked: Date.now(),
      latency: 0
    };
    
    this.initialized = true;
    console.log('✅ GRID Integration initialized successfully');
    
    return true;
  }
  
  /**
   * Test all connections
   * @returns {Object} Connection test results
   */
  async testAllConnections() {
    console.log('🔄 Testing all connections...');
    
    // Test each connection
    const results = {
      timestamp: Date.now(),
      connections: {}
    };
    
    // Test Owncast connection
    results.connections.owncast = await this.testOwncastConnection();
    
    // Test Claude connection
    results.connections.claude = await this.testClaudeConnection();
    
    // Test RTMP connection
    results.connections.rtmp = await this.testRTMPConnection();
    
    // Test Sound Factory connection
    results.connections.soundFactory = await this.testSoundFactoryConnection();
    
    // Test Event Bus (always active since it's internal)
    results.connections.eventBus = {
      status: 'active',
      latency: 0,
      timestamp: Date.now()
    };
    
    // Update connections state
    this.connections = {
      owncast: { 
        status: results.connections.owncast.status,
        lastChecked: results.connections.owncast.timestamp
      },
      claude: { 
        status: results.connections.claude.status,
        lastChecked: results.connections.claude.timestamp
      },
      rtmp: { 
        status: results.connections.rtmp.status,
        lastChecked: results.connections.rtmp.timestamp
      },
      soundFactory: { 
        status: results.connections.soundFactory.status,
        lastChecked: results.connections.soundFactory.timestamp
      },
      eventBus: { 
        status: results.connections.eventBus.status,
        lastChecked: results.connections.eventBus.timestamp
      }
    };
    
    // Emit connection test results
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('connection-test', results);
    }
    
    console.log('✅ Connection tests completed');
    return results;
  }
  
  /**
   * Test Owncast connection
   * @returns {Object} Connection test result
   */
  async testOwncastConnection() {
    console.log('🔄 Testing Owncast connection...');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check if Owncast bridge exists
    const isConnected = typeof window !== 'undefined' && window.owncast !== undefined;
    
    const result = {
      status: isConnected ? 'active' : 'inactive',
      latency: isConnected ? Math.floor(Math.random() * 50) + 10 : null,
      timestamp: Date.now(),
      details: isConnected ? 'Owncast bridge is available' : 'Owncast bridge not found'
    };
    
    console.log(`Owncast connection: ${result.status}`);
    return result;
  }
  
  /**
   * Test Claude connection
   * @returns {Object} Connection test result
   */
  async testClaudeConnection() {
    console.log('🔄 Testing Claude connection...');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get Claude mode from system health
    const claudeMode = gridOS?.systemHealth?.claudeMode || 'unknown';
    const isConnected = claudeMode === 'connected';
    
    const result = {
      status: isConnected ? 'active' : 'inactive',
      latency: isConnected ? Math.floor(Math.random() * 200) + 50 : null,
      timestamp: Date.now(),
      details: isConnected ? 'Claude is connected' : 'Claude is disconnected'
    };
    
    console.log(`Claude connection: ${result.status}`);
    return result;
  }
  
  /**
   * Test RTMP connection
   * @returns {Object} Connection test result
   */
  async testRTMPConnection() {
    console.log('🔄 Testing RTMP connection...');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 250));
    
    // Simulate RTMP connection (50% chance of success for demo)
    const isConnected = Math.random() > 0.5;
    
    const result = {
      status: isConnected ? 'active' : 'inactive',
      latency: isConnected ? Math.floor(Math.random() * 100) + 20 : null,
      timestamp: Date.now(),
      details: isConnected ? 'RTMP stream is active' : 'RTMP stream not detected'
    };
    
    console.log(`RTMP connection: ${result.status}`);
    return result;
  }
  
  /**
   * Test Sound Factory connection
   * @returns {Object} Connection test result
   */
  async testSoundFactoryConnection() {
    console.log('🔄 Testing Sound Factory connection...');
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Simulate Sound Factory connection (70% chance of success for demo)
    const isConnected = Math.random() > 0.3;
    
    const result = {
      status: isConnected ? 'active' : 'inactive',
      latency: isConnected ? Math.floor(Math.random() * 30) + 5 : null,
      timestamp: Date.now(),
      details: isConnected ? 'Sound Factory is connected' : 'Sound Factory not detected'
    };
    
    console.log(`Sound Factory connection: ${result.status}`);
    return result;
  }
  
  /**
   * Get connection status
   * @returns {Object} Connection status
   */
  getConnectionStatus() {
    return this.connections;
  }
}

// Create singleton instance
export const gridIntegration = new GridIntegration();

// Add to window for global access
if (typeof window !== 'undefined') {
  window.gridIntegration = gridIntegration;
}
