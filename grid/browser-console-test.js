// Grid OS Browser Console Test Script
// Copy and paste this into the browser console on http://localhost:3002/

console.log('🔧 Grid OS Browser Console Test Starting...');

// Test 1: Check if Grid OS is available
if (typeof window.gridOS !== 'undefined') {
    console.log('✅ Grid OS is available on window object');
    
    // Test 2: Check system health
    console.log('\n🏥 Testing System Health:');
    try {
        const health = window.gridOS.getSystemHealth();
        console.log('System Health Result:', health);
        
        // Analyze the result
        if (health.status === 'degraded') {
            console.warn('⚠️ System still showing DEGRADED status - this should be fixed!');
        } else if (health.status === 'healthy') {
            console.log('✅ System showing HEALTHY status - fix successful!');
        } else if (health.status === 'initializing' || health.status === 'pending') {
            console.log('🔄 System showing INITIALIZING status - this is good progress!');
        } else {
            console.log(`ℹ️ System showing unexpected status: ${health.status}`);
        }
        
        // Show subsystems detail
        if (health.subsystems) {
            console.log('\n🔧 Subsystems Status:');
            Object.entries(health.subsystems).forEach(([name, subsystem]) => {
                const emoji = subsystem.status === 'healthy' ? '✅' : 
                             subsystem.status === 'pending' || subsystem.status === 'initializing' ? '🔄' :
                             subsystem.status === 'degraded' ? '⚠️' : '❌';
                console.log(`  ${emoji} ${name}: ${subsystem.status}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error getting system health:', error);
    }
    
    // Test 3: Check shader system specifically
    console.log('\n🎨 Testing Shader System:');
    try {
        if (typeof window.gridOS.isShaderSystemReady === 'function') {
            const shaderReady = window.gridOS.isShaderSystemReady();
            console.log('Shader System Ready:', shaderReady);
        } else {
            console.warn('⚠️ isShaderSystemReady method not available');
        }
        
        if (typeof window.gridOS.getShaderSystem === 'function') {
            const shaderSystem = window.gridOS.getShaderSystem();
            console.log('Shader System Object:', shaderSystem);
            
            if (shaderSystem && typeof shaderSystem.isReady === 'function') {
                console.log('Shader System isReady():', shaderSystem.isReady());
            }
        } else {
            console.warn('⚠️ getShaderSystem method not available');
        }
        
    } catch (error) {
        console.error('❌ Error testing shader system:', error);
    }
    
    // Test 4: Run system tests
    console.log('\n🧪 Running System Tests:');
    try {
        if (typeof window.gridSystemTest !== 'undefined' && typeof window.gridSystemTest.runAllTests === 'function') {
            const testResults = window.gridSystemTest.runAllTests();
            console.log('Test Results:', testResults);
            
            const passed = testResults.filter(t => t.passed).length;
            const total = testResults.length;
            console.log(`Tests Summary: ${passed}/${total} passed`);
            
            if (passed === total) {
                console.log('✅ All tests passed!');
            } else if (passed > total / 2) {
                console.log('⚠️ Most tests passed, some issues remain');
            } else {
                console.log('❌ Many tests failed, significant issues present');
            }
        } else {
            console.warn('⚠️ gridSystemTest not available');
        }
    } catch (error) {
        console.error('❌ Error running system tests:', error);
    }
    
} else {
    console.error('❌ Grid OS not found on window object');
    console.log('Possible reasons:');
    console.log('1. Grid OS not yet initialized (wait a few seconds and try again)');
    console.log('2. Export to window failed');
    console.log('3. Initialization error occurred');
}

console.log('\n🔧 Grid OS Browser Console Test Complete');
console.log('Expected: System health should show "healthy" or "initializing" instead of always "degraded"');
