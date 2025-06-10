// Grid OS System Test Script
// Run this in the browser console on http://localhost:3001/

console.log('🔬 Starting comprehensive Grid OS system test...');

// Test 1: Check if gridOS exists
console.log('\n=== Test 1: Grid OS Object ===');
if (typeof window.gridOS !== 'undefined') {
    console.log('✅ window.gridOS exists');
    console.log('📊 gridOS type:', typeof window.gridOS);
    console.log('📊 gridOS constructor:', window.gridOS.constructor.name);
    console.log('📊 gridOS methods:', Object.getOwnPropertyNames(window.gridOS));
} else {
    console.error('❌ window.gridOS is undefined');
}

// Test 2: Check if gridSystemTest exists
console.log('\n=== Test 2: Grid System Test ===');
if (typeof window.gridSystemTest !== 'undefined') {
    console.log('✅ window.gridSystemTest exists');
    console.log('📊 gridSystemTest methods:', Object.getOwnPropertyNames(window.gridSystemTest));
} else {
    console.error('❌ window.gridSystemTest is undefined');
}

// Test 3: System Health Check
console.log('\n=== Test 3: System Health ===');
try {
    if (window.gridOS && window.gridOS.getSystemHealth) {
        const health = window.gridOS.getSystemHealth();
        console.log('💊 System Health:', health);
        
        console.log(`📊 Overall Status: ${health.status}`);
        if (health.subsystems) {
            console.log('📊 Subsystem Status:');
            for (const [name, subsystem] of Object.entries(health.subsystems)) {
                console.log(`  - ${name}: ${subsystem.status}`);
                if (subsystem.diagnostics && subsystem.diagnostics.length > 0) {
                    console.log(`    Diagnostics: ${subsystem.diagnostics.join(', ')}`);
                }
            }
        }
    } else {
        console.error('❌ getSystemHealth method not available');
    }
} catch (error) {
    console.error('❌ System health check failed:', error);
}

// Test 4: Shader System Check
console.log('\n=== Test 4: Shader System ===');
try {
    if (window.gridOS && window.gridOS.getShaderSystem) {
        const shaderSystem = window.gridOS.getShaderSystem();
        console.log('🎨 Shader System Object:', shaderSystem);
        
        console.log('📊 Shader System Ready:', shaderSystem.isReady());
        console.log('📊 Shader System Dimensions:', shaderSystem.getDimensions());
        console.log('📊 Active Shaders:', Array.from(shaderSystem.activeShaders.keys()));
        console.log('📊 Material Presets:', Object.keys(shaderSystem.materialPresets));
        console.log('📊 Post-processing Effects:', shaderSystem.getActivePostProcessingEffects());
        
        // Test shader operations if ready
        if (shaderSystem.isReady()) {
            console.log('🧪 Testing shader operations...');
            try {
                shaderSystem.applyMaterial('test', 'cyanGlow');
                console.log('✅ Material application successful');
            } catch (error) {
                console.error('❌ Material application failed:', error);
            }
            
            try {
                shaderSystem.setPostProcessing('bloom', true);
                console.log('✅ Post-processing update successful');
            } catch (error) {
                console.error('❌ Post-processing update failed:', error);
            }
        } else {
            console.warn('⚠️ Shader system not ready, skipping operations test');
        }
    } else {
        console.error('❌ getShaderSystem method not available');
    }
} catch (error) {
    console.error('❌ Shader system check failed:', error);
}

// Test 5: Check if shader system is ready
console.log('\n=== Test 5: Shader System Readiness ===');
try {
    if (window.gridOS && window.gridOS.isShaderSystemReady) {
        const isReady = window.gridOS.isShaderSystemReady();
        console.log('📊 isShaderSystemReady():', isReady);
    } else {
        console.error('❌ isShaderSystemReady method not available');
    }
} catch (error) {
    console.error('❌ Shader system readiness check failed:', error);
}

// Test 6: Run system tests
console.log('\n=== Test 6: System Tests ===');
try {
    if (window.gridSystemTest && window.gridSystemTest.runAllTests) {
        console.log('🧪 Running all system tests...');
        const testResults = window.gridSystemTest.runAllTests();
        console.log('📊 Test Results:', testResults);
        
        const passedTests = testResults.filter(t => t.passed);
        const failedTests = testResults.filter(t => !t.passed);
        
        console.log(`📊 Summary: ${passedTests.length}/${testResults.length} tests passed`);
        
        if (failedTests.length > 0) {
            console.log('❌ Failed tests:');
            failedTests.forEach(test => {
                console.log(`  - ${test.name}: ${test.message}`);
            });
        }
    } else {
        console.error('❌ runAllTests method not available');
    }
} catch (error) {
    console.error('❌ System tests failed:', error);
}

// Test 7: Check Three.js components
console.log('\n=== Test 7: Three.js Components ===');
try {
    // Look for Three.js renderer in the page
    const threeCanvas = document.querySelector('canvas');
    if (threeCanvas) {
        console.log('✅ Three.js canvas found');
        console.log('📊 Canvas dimensions:', {
            width: threeCanvas.width,
            height: threeCanvas.height,
            clientWidth: threeCanvas.clientWidth,
            clientHeight: threeCanvas.clientHeight
        });
    } else {
        console.warn('⚠️ No Three.js canvas found in DOM');
    }
    
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        console.log('✅ Three.js library loaded');
        console.log('📊 Three.js version:', THREE.REVISION);
    } else {
        console.warn('⚠️ Three.js library not found in global scope');
    }
} catch (error) {
    console.error('❌ Three.js components check failed:', error);
}

// Test 8: Performance Check
console.log('\n=== Test 8: Performance ===');
try {
    const performanceIndicator = document.querySelector('.performance-indicator');
    if (performanceIndicator) {
        console.log('✅ Performance indicator found');
        console.log('📊 Performance text:', performanceIndicator.textContent);
    } else {
        console.warn('⚠️ Performance indicator not found');
    }
} catch (error) {
    console.error('❌ Performance check failed:', error);
}

console.log('\n🏁 Grid OS system test completed!');
console.log('💡 If any tests failed, check the error messages above for debugging information.');
