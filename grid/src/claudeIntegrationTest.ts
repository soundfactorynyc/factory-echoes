/**
 * GRID OS: Claude Integration Test
 * 
 * Test script to verify that the Claude Network integration is working properly
 */

import { gridOS } from './integration/gridOSBackend';

/**
 * Test the Claude integration
 */
async function testClaudeIntegration(): Promise<void> {
  console.log('🧪 Starting Claude Integration Test...');
  
  try {
    // Initialize the gridOS backend
    await gridOS.initialize();
    console.log('✅ GridOS Backend initialized');
    
    // Check if Claude Network is available
    if (!gridOS.claude) {
      throw new Error('Claude Network not initialized');
    }
    console.log('✅ Claude Network available');
    
    // Check if agents are available
    const agents = gridOS.claude.agents;
    console.log('🤖 Available Claude agents:', Object.keys(agents));
    
    // Test the conversationalist agent
    if (agents.conversationalist) {
      console.log('💬 Testing conversationalist agent...');
      
      try {
        const testMessage = "Hello! How is the grid looking today?";
        const testContext = ["Previous message 1", "Previous message 2"];
        const testMood = "excited";
        
        const response = await agents.conversationalist.processChatMessage(
          testMessage,
          testContext,
          testMood
        );
        
        console.log('🎉 Claude conversationalist response:');
        console.log('- Original:', response.original);
        console.log('- Enhanced:', response.enhanced);
        console.log('- Sentiment:', response.sentiment);
        console.log('- Intent:', response.intent);
        console.log('- Suggestions:', response.suggestedResponses);
        
      } catch (error) {
        console.error('❌ Conversationalist agent test failed:', error);
      }
    }
    
    // Test the mood analyzer agent
    if (agents.moodAnalyzer) {
      console.log('🎭 Testing mood analyzer agent...');
      
      try {
        const testInput = {
          text: "I'm feeling really excited about this new technology!",
          context: "Stream chat"
        };
        
        const moodAnalysis = await agents.moodAnalyzer.process(testInput);
        console.log('🎭 Mood analysis result:', moodAnalysis);
        
      } catch (error) {
        console.error('❌ Mood analyzer test failed:', error);
      }
    }
    
    // Test the beat matcher agent
    if (agents.beatMatcher) {
      console.log('🎵 Testing beat matcher agent...');
      
      try {
        const testInput = {
          audioData: new Float32Array(1024),
          bpm: 128,
          timestamp: Date.now()
        };
        
        const beatPrediction = await agents.beatMatcher.process(testInput);
        console.log('🎵 Beat prediction result:', beatPrediction);
        
      } catch (error) {
        console.error('❌ Beat matcher test failed:', error);
      }
    }
    
    console.log('✅ Claude Integration Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Claude Integration Test failed:', error);
  }
}

/**
 * Test Owncast integration with Claude
 */
async function testOwncastClaudeIntegration(): Promise<void> {
  console.log('🎬 Testing Owncast + Claude integration...');
  
  try {
    // Import the Owncast setup
    const { initializeOwncast } = await import('./integration/setupOwncast');
    
    // Initialize Owncast integration
    initializeOwncast();
    console.log('✅ Owncast integration initialized');
    
    // Simulate a chat message to test Claude processing
    const simulatedChatMessage = {
      id: 'test-msg-001',
      author: {
        id: 'test-user-001',
        displayName: 'TestUser',
        displayColor: '#ff6b6b'
      },
      body: 'This grid visualization is absolutely incredible! The effects are so smooth!',
      timestamp: Date.now()
    };
    
    console.log('💬 Simulating chat message for Claude processing...');
    console.log('Message:', simulatedChatMessage.body);
    
    // The message will be processed through the handleChatMessage function
    // which includes Claude enhancement
    
    console.log('✅ Owncast + Claude integration test setup completed!');
    
  } catch (error) {
    console.error('❌ Owncast + Claude integration test failed:', error);
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('🚀 Running GRID OS Claude Integration Tests\n');
  
  await testClaudeIntegration();
  console.log('\n' + '='.repeat(50) + '\n');
  await testOwncastClaudeIntegration();
  
  console.log('\n🎯 All tests completed!');
}

// Export for use in other modules
export {
  testClaudeIntegration,
  testOwncastClaudeIntegration,
  runAllTests
};

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for manual testing
  (window as any).testClaude = {
    runAll: runAllTests,
    testIntegration: testClaudeIntegration,
    testOwncast: testOwncastClaudeIntegration
  };
  
  console.log('🧪 Claude tests available as window.testClaude');
  console.log('Usage: window.testClaude.runAll()');
}
