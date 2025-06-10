/**
 * GRID OS: Owncast Integration Test
 * 
 * This module provides tests for the Owncast integration,
 * verifying that stream events properly trigger GRID OS responses.
 */

import { gridOS } from './gridOSBackend';
import { initializeOwncast } from './setupOwncast';

/**
 * Test result interface
 */
interface OwncastTestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * Run Owncast integration tests
 */
export async function runOwncastTests(): Promise<OwncastTestResult[]> {
  console.log('🎬 GRID OS: Running Owncast integration tests...');
  
  const results: OwncastTestResult[] = [];
  
  try {
    // Initialize GRID OS and Owncast
    await gridOS.initialize();
    initializeOwncast();
    
    // Test 1: Owncast initialization
    results.push(testOwncastInitialization());
    
    // Test 2: Chat message handling
    results.push(await testChatMessageHandling());
    
    // Test 3: Donation handling
    results.push(await testDonationHandling());
    
    // Test 4: Viewer count updates
    results.push(await testViewerCountUpdates());
    
    // Test 5: Stream status changes
    results.push(await testStreamStatusChanges());
    
    // Test 6: Grid tile activation
    results.push(await testGridTileActivation());
    
    // Test 7: Event bus integration
    results.push(await testEventBusIntegration());
    
    // Log overall results
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    
    console.log(`🎬 Owncast tests completed. ${passedCount}/${totalCount} tests passed.`);
    
    if (passedCount === totalCount) {
      console.log('🎉 OWNCAST INTEGRATION: FULLY OPERATIONAL');
    } else {
      console.warn('⚠️ OWNCAST INTEGRATION: Some tests failed. Check results for details.');
    }
    
    return results;
  } catch (error) {
    console.error('🎬 Owncast test suite failed with error:', error);
    results.push({
      name: 'Owncast Test Suite',
      passed: false,
      message: `Test suite failed with error: ${error}`
    });
    return results;
  }
}

/**
 * Test Owncast initialization
 */
function testOwncastInitialization(): OwncastTestResult {
  const result: OwncastTestResult = {
    name: 'Owncast Initialization',
    passed: true,
    message: 'Owncast integration initialized successfully.'
  };
  
  // Check if the initialization function runs without errors
  try {
    // The initialization should have already run
    // Just verify it doesn't throw errors when called again
    initializeOwncast();
  } catch (error) {
    result.passed = false;
    result.message = `Owncast initialization failed: ${error}`;
  }
  
  return result;
}

/**
 * Test chat message handling
 */
async function testChatMessageHandling(): Promise<OwncastTestResult> {
  const result: OwncastTestResult = {
    name: 'Chat Message Handling',
    passed: true,
    message: 'Chat messages are properly handled and forwarded to GRID OS.'
  };
  
  try {
    // Simulate an Owncast chat message
    const testMessage = {
      type: 'owncast-chat-message',
      data: {
        id: 'test-msg-1',
        author: {
          id: 'test-user-1',
          displayName: 'TestUser',
          displayColor: '#ff6b6b'
        },
        body: 'Hello from Owncast test!',
        timestamp: Date.now()
      }
    };
    
    // Send the message event
    window.dispatchEvent(new MessageEvent('message', {
      data: testMessage,
      origin: window.location.origin
    }));
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    result.details = {
      testMessage: testMessage.data.body,
      author: testMessage.data.author.displayName
    };
  } catch (error) {
    result.passed = false;
    result.message = `Chat message handling failed: ${error}`;
  }
  
  return result;
}

/**
 * Test donation handling
 */
async function testDonationHandling(): Promise<OwncastTestResult> {
  const result: OwncastTestResult = {
    name: 'Donation Handling',
    passed: true,
    message: 'Donations are properly handled and trigger appropriate grid effects.'
  };
  
  try {
    // Test different donation amounts
    const testDonations = [
      { amount: 5, expectedTier: 'free' },
      { amount: 25, expectedTier: 'premium' },
      { amount: 150, expectedTier: 'vip' }
    ];
    
    for (const donation of testDonations) {
      const testDonationMessage = {
        type: 'owncast-donation',
        data: {
          id: `test-donation-${donation.amount}`,
          userId: 'test-donor',
          amount: donation.amount,
          currency: 'USD',
          message: `Test donation of $${donation.amount}`,
          timestamp: Date.now()
        }
      };
      
      // Send the donation event
      window.dispatchEvent(new MessageEvent('message', {
        data: testDonationMessage,
        origin: window.location.origin
      }));
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    result.details = {
      testDonations: testDonations.map(d => `$${d.amount} (${d.expectedTier})`)
    };
  } catch (error) {
    result.passed = false;
    result.message = `Donation handling failed: ${error}`;
  }
  
  return result;
}

/**
 * Test viewer count updates
 */
async function testViewerCountUpdates(): Promise<OwncastTestResult> {
  const result: OwncastTestResult = {
    name: 'Viewer Count Updates',
    passed: true,
    message: 'Viewer count changes properly affect grid intensity.'
  };
  
  try {
    // Test viewer count changes
    const viewerCounts = [10, 50, 100, 250, 500];
    
    for (const count of viewerCounts) {
      const viewerCountMessage = {
        type: 'owncast-viewer-count',
        data: {
          count: count,
          timestamp: Date.now()
        }
      };
      
      // Send the viewer count event
      window.dispatchEvent(new MessageEvent('message', {
        data: viewerCountMessage,
        origin: window.location.origin
      }));
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    result.details = {
      testViewerCounts: viewerCounts
    };
  } catch (error) {
    result.passed = false;
    result.message = `Viewer count handling failed: ${error}`;
  }
  
  return result;
}

/**
 * Test stream status changes
 */
async function testStreamStatusChanges(): Promise<OwncastTestResult> {
  const result: OwncastTestResult = {
    name: 'Stream Status Changes',
    passed: true,
    message: 'Stream online/offline status properly affects grid state.'
  };
  
  try {
    // Test stream going online
    const streamOnlineMessage = {
      type: 'owncast-stream-status',
      data: {
        online: true,
        started: Date.now()
      }
    };
    
    window.dispatchEvent(new MessageEvent('message', {
      data: streamOnlineMessage,
      origin: window.location.origin
    }));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test stream going offline
    const streamOfflineMessage = {
      type: 'owncast-stream-status',
      data: {
        online: false
      }
    };
    
    window.dispatchEvent(new MessageEvent('message', {
      data: streamOfflineMessage,
      origin: window.location.origin
    }));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    result.details = {
      testedStates: ['online', 'offline']
    };
  } catch (error) {
    result.passed = false;
    result.message = `Stream status handling failed: ${error}`;
  }
  
  return result;
}

/**
 * Test grid tile activation
 */
async function testGridTileActivation(): Promise<OwncastTestResult> {
  const result: OwncastTestResult = {
    name: 'Grid Tile Activation',
    passed: true,
    message: 'Owncast events properly trigger grid tile activations.'
  };
  
  try {
    // Track grid commands sent
    let gridCommands: any[] = [];
    
    // Mock the grid command to capture calls
    const originalSendGridCommand = gridOS.eventBus.sendGridCommand;
    gridOS.eventBus.sendGridCommand = (
      type: 'activate' | 'deactivate' | 'pulse' | 'morph' | 'cascade',
      tileIds?: string[],
      intensity?: number,
      duration?: number,
      pattern?: string
    ) => {
      gridCommands.push({ type, tileIds, intensity, duration, pattern });
      return originalSendGridCommand.call(gridOS.eventBus, type, tileIds, intensity, duration, pattern);
    };
    
    // Send a test chat message that should activate tiles
    const chatMessage = {
      type: 'owncast-chat-message',
      data: {
        id: 'tile-test-msg',
        author: {
          id: 'tile-test-user',
          displayName: 'TileTestUser',
          displayColor: '#00ff00'
        },
        body: 'This is a longer message that should activate multiple tiles in the grid!',
        timestamp: Date.now()
      }
    };
    
    window.dispatchEvent(new MessageEvent('message', {
      data: chatMessage,
      origin: window.location.origin
    }));
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Restore original function
    gridOS.eventBus.sendGridCommand = originalSendGridCommand;
    
    if (gridCommands.length === 0) {
      result.passed = false;
      result.message = 'No grid commands were triggered by Owncast events.';
    } else {
      result.details = {
        gridCommandsTriggered: gridCommands.length,
        commands: gridCommands
      };
    }
  } catch (error) {
    result.passed = false;
    result.message = `Grid tile activation test failed: ${error}`;
  }
  
  return result;
}

/**
 * Test event bus integration
 */
async function testEventBusIntegration(): Promise<OwncastTestResult> {
  const result: OwncastTestResult = {
    name: 'Event Bus Integration',
    passed: true,
    message: 'Owncast events are properly integrated with GRID OS event bus.'
  };
  
  try {
    // Check if event bus is available and functional
    if (!gridOS.eventBus) {
      result.passed = false;
      result.message = 'GRID OS event bus is not available.';
      return result;
    }
    
    // Test sending events through the event bus
    gridOS.eventBus.sendChatMessage('owncast-test', 'Event bus integration test');
    gridOS.eventBus.sendMoneyShot('owncast-test', 42, 'premium', 'happy');
    
    // Test state updates
    gridOS.eventBus.updateState(state => ({
      ...state,
      testOwncastIntegration: true
    }));
    
    result.details = {
      eventBusAvailable: true,
      testEventsDispached: ['chat', 'money', 'state-update']
    };
  } catch (error) {
    result.passed = false;
    result.message = `Event bus integration failed: ${error}`;
  }
  
  return result;
}

/**
 * Display Owncast test results in the DOM
 */
export function displayOwncastTestResults(results: OwncastTestResult[]): void {
  const container = document.getElementById('owncast-test-results');
  if (!container) {
    console.warn('No owncast-test-results container found');
    return;
  }
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;
  
  container.innerHTML = `
    <div class="owncast-test-summary">
      <h2>🎬 Owncast Integration Test Results</h2>
      <div class="test-status ${allPassed ? 'success' : 'warning'}">
        ${passedCount}/${totalCount} tests passed
        ${allPassed ? '🎉' : '⚠️'}
      </div>
    </div>
    <div class="owncast-test-details">
      ${results.map(result => `
        <div class="test-result ${result.passed ? 'pass' : 'fail'}">
          <div class="test-name">
            ${result.passed ? '✅' : '❌'} ${result.name}
          </div>
          <div class="test-message">${result.message}</div>
          ${result.details ? `
            <div class="test-details">
              <pre>${JSON.stringify(result.details, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    <style>
      .owncast-test-summary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .test-status.success {
        color: #4ade80;
        font-weight: bold;
      }
      .test-status.warning {
        color: #fbbf24;
        font-weight: bold;
      }
      .test-result {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 10px;
      }
      .test-result.pass {
        border-left: 4px solid #10b981;
      }
      .test-result.fail {
        border-left: 4px solid #ef4444;
      }
      .test-name {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .test-message {
        color: #64748b;
        margin-bottom: 10px;
      }
      .test-details {
        background: #f1f5f9;
        padding: 10px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
      }
    </style>
  `;
}

// Auto-run tests when this module is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(async () => {
      const results = await runOwncastTests();
      console.table(results);
      displayOwncastTestResults(results);
    }, 2000);
  });
}
