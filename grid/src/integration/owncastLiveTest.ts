/**
 * GRID OS: Live Owncast Server Test
 * 
 * Tests the integration with the real Owncast server at 209.97.158.117:8080
 */

export interface OwncastServerStatus {
  online: boolean;
  serverTime: string;
  lastConnectTime?: string;
  lastDisconnectTime?: string;
  versionNumber: string;
  streamTitle: string;
}

export class OwncastLiveTest {
  private serverUrl = 'http://209.97.158.117:8080';
  private wsUrl = 'ws://209.97.158.117:8080/ws';
  private ws: WebSocket | null = null;
  private testResults: Record<string, boolean> = {};

  async runLiveTests(): Promise<void> {
    console.log('🧪 Starting GRID OS → Live Owncast Integration Tests');
    console.log(`📡 Server: ${this.serverUrl}`);
    
    // Test 1: Server connectivity
    await this.testServerConnectivity();
    
    // Test 2: API endpoints
    await this.testAPIEndpoints();
    
    // Test 3: WebSocket connection
    await this.testWebSocketConnection();
    
    // Test 4: GRID OS event integration
    await this.testGridOSIntegration();
    
    // Test 5: Simulate stream events
    await this.testEventSimulation();
    
    this.printTestResults();
  }

  private async testServerConnectivity(): Promise<void> {
    console.log('🔗 Testing server connectivity...');
    
    try {
      const response = await fetch(this.serverUrl);
      const success = response.ok;
      this.testResults['server_connectivity'] = success;
      
      if (success) {
        console.log('✅ Server is reachable');
      } else {
        console.log(`❌ Server returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Server connectivity failed:', error);
      this.testResults['server_connectivity'] = false;
    }
  }

  private async testAPIEndpoints(): Promise<void> {
    console.log('🔍 Testing API endpoints...');
    
    try {
      // Test status endpoint
      const statusResponse = await fetch(`${this.serverUrl}/api/status`);
      const statusData: OwncastServerStatus = await statusResponse.json();
      
      console.log('📊 Server Status:', {
        online: statusData.online,
        version: statusData.versionNumber,
        title: statusData.streamTitle || 'No title set'
      });
      
      this.testResults['api_status'] = statusResponse.ok;
      
      // Test config endpoint (may require auth)
      const configResponse = await fetch(`${this.serverUrl}/api/config`);
      this.testResults['api_config'] = configResponse.status !== 404;
      
      console.log('✅ API endpoints tested');
    } catch (error) {
      console.error('❌ API test failed:', error);
      this.testResults['api_status'] = false;
      this.testResults['api_config'] = false;
    }
  }

  private async testWebSocketConnection(): Promise<void> {
    console.log('🔌 Testing WebSocket connection...');
    
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        const timeout = setTimeout(() => {
          console.log('⏰ WebSocket connection timeout');
          this.testResults['websocket_connection'] = false;
          resolve();
        }, 5000);
        
        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          clearTimeout(timeout);
          this.testResults['websocket_connection'] = true;
          resolve();
        };
        
        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          clearTimeout(timeout);
          this.testResults['websocket_connection'] = false;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          console.log('📨 WebSocket message received:', event.data);
        };
        
      } catch (error) {
        console.error('❌ WebSocket setup failed:', error);
        this.testResults['websocket_connection'] = false;
        resolve();
      }
    });
  }

  private async testGridOSIntegration(): Promise<void> {
    console.log('🔗 Testing GRID OS integration...');
    
    try {
      // Check if GRID OS is available
      const gridOS = (window as any).gridOS;
      if (!gridOS) {
        console.error('❌ GRID OS not found on window object');
        this.testResults['grid_integration'] = false;
        return;
      }
      
      // Test system health
      const health = gridOS.getSystemHealth();
      console.log('💚 GRID OS Health:', health);
      
      // Test event emission
      if (gridOS.eventBus) {
        gridOS.eventBus.emit('owncast_test', {
          type: 'connection_test',
          timestamp: Date.now(),
          server: this.serverUrl
        });
        console.log('✅ Event emission test passed');
      }
      
      this.testResults['grid_integration'] = true;
    } catch (error) {
      console.error('❌ GRID OS integration failed:', error);
      this.testResults['grid_integration'] = false;
    }
  }

  private async testEventSimulation(): Promise<void> {
    console.log('🎭 Testing event simulation...');
    
    try {
      // Simulate chat message
      this.simulateOwncastEvent('chat', {
        id: 'test_msg_' + Date.now(),
        author: {
          id: 'test_user',
          displayName: 'Grid Tester',
          displayColor: '#00ff00'
        },
        body: 'Hello from GRID OS integration test!',
        timestamp: Date.now()
      });
      
      // Simulate viewer count change
      this.simulateOwncastEvent('viewer_count', {
        count: Math.floor(Math.random() * 100) + 1,
        timestamp: Date.now()
      });
      
      // Simulate donation (if supported)
      this.simulateOwncastEvent('donation', {
        id: 'test_donation_' + Date.now(),
        userId: 'test_donor',
        amount: 5.00,
        currency: 'USD',
        message: 'Great stream! Love the GRID OS integration!',
        timestamp: Date.now()
      });
      
      this.testResults['event_simulation'] = true;
      console.log('✅ Event simulation completed');
    } catch (error) {
      console.error('❌ Event simulation failed:', error);
      this.testResults['event_simulation'] = false;
    }
  }

  private simulateOwncastEvent(type: string, data: any): void {
    const gridOS = (window as any).gridOS;
    if (gridOS && gridOS.eventBus) {
      gridOS.eventBus.emit(`owncast_${type}`, data);
      console.log(`🎭 Simulated ${type} event:`, data);
    }
  }

  private printTestResults(): void {
    console.log('\n📋 GRID OS → Owncast Integration Test Results:');
    console.log('================================================');
    
    let passed = 0;
    let total = 0;
    
    Object.entries(this.testResults).forEach(([test, result]) => {
      const icon = result ? '✅' : '❌';
      const name = test.replace(/_/g, ' ').toUpperCase();
      console.log(`${icon} ${name}`);
      if (result) passed++;
      total++;
    });
    
    console.log('================================================');
    console.log(`🎯 OVERALL: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 GRID OS → Owncast Integration: FULLY OPERATIONAL');
    } else {
      console.log('⚠️  Some tests failed - check logs above for details');
    }
    
    // Store results globally for easy access
    (window as any).owncastTestResults = this.testResults;
  }

  // Cleanup method
  cleanup(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export for global access
(window as any).OwncastLiveTest = OwncastLiveTest;

// Auto-create instance for immediate testing
(window as any).owncastLiveTest = new OwncastLiveTest();

console.log('🚀 Owncast Live Test module loaded');
console.log('💡 Run: window.owncastLiveTest.runLiveTests()');
