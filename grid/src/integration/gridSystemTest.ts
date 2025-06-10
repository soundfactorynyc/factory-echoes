/**
 * GRID OS: System Test
 * 
 * This module provides a comprehensive test suite for the GRID OS Integration Core,
 * verifying that all components are working correctly.
 */

import { gridOS } from './gridOSBackend';
import { getSystemHealth } from './systemHealth';

/**
 * Test result
 */
export interface TestResult {
  /**
   * Test name
   */
  name: string;
  
  /**
   * Whether the test passed
   */
  passed: boolean;
  
  /**
   * Test message
   */
  message: string;
}

/**
 * Grid System Test
 */
class GridSystemTest {
  /**
   * Run all tests
   * @returns Test results
   */
  public async runAllTests(): Promise<TestResult[]> {
    console.log('GRID OS: Running all tests...');
    
    const results: TestResult[] = [];
    
    try {
      // Test 1: Verify subsystems are initialized
      results.push(this.testSubsystemsInitialized());
      
      // Test 2: Verify event bus
      results.push(this.testEventBus());
      
      // Test 3: Verify shader system
      results.push(this.testShaderSystem());
      
      // Test 4: Verify trigger system
      results.push(this.testTriggerSystem());
      
      // Test 5: Verify system health
      results.push(this.testSystemHealth());
      
      // Test 6: Verify window exports
      results.push(this.testWindowExports());
      
      // Log overall results
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      
      console.log(`GRID OS: Tests completed. ${passedCount}/${totalCount} tests passed.`);
      
      if (passedCount === totalCount) {
        console.log('GRID OS: FULLY INTEGRATED AND ALIVE');
      } else {
        console.warn('GRID OS: Some tests failed. Check results for details.');
      }
      
      return results;
    } catch (error) {
      console.error('GRID OS: Test suite failed with error:', error);
      results.push({
        name: 'Test Suite',
        passed: false,
        message: `Test suite failed with error: ${error}`
      });
      return results;
    }
  }
  
  /**
   * Test that all subsystems are initialized
   * @returns Test result
   */
  private testSubsystemsInitialized(): TestResult {
    const result: TestResult = {
      name: 'Subsystems Initialized',
      passed: true,
      message: 'All subsystems are properly initialized.'
    };
    
    if (!gridOS.eventBus) {
      result.passed = false;
      result.message = 'Event bus is not initialized.';
      return result;
    }
    
    if (!gridOS.shaderSystem) {
      result.passed = false;
      result.message = 'Shader system is not initialized.';
      return result;
    }
    
    if (!gridOS.triggerSystem) {
      result.passed = false;
      result.message = 'Trigger system is not initialized.';
      return result;
    }
    
    return result;
  }
  
  /**
   * Test the event bus
   * @returns Test result
   */
  private testEventBus(): TestResult {
    const result: TestResult = {
      name: 'Event Bus',
      passed: true,
      message: 'Event bus is working correctly.'
    };
    
    try {
      // Test state updates
      const initialState = gridOS.state$.getValue();
      gridOS.eventBus.updateState(state => ({
        ...state,
        mood: 'euphoric'
      }));
      const updatedState = gridOS.state$.getValue();
      
      if (updatedState.mood !== 'euphoric') {
        result.passed = false;
        result.message = 'Event bus state update failed.';
        return result;
      }
      
      // Reset state
      gridOS.eventBus.updateState(() => initialState);
      
      // Test event subscription
      let eventReceived = false;
      const subscription = gridOS.eventBus.beats$.subscribe(() => {
        eventReceived = true;
      });
      
      // Send a beat event
      gridOS.eventBus.sendBeatEvent(120, 0.8, true, 4, 0);
      
      // Check if event was received
      if (!eventReceived) {
        result.passed = false;
        result.message = 'Event bus subscription failed.';
        return result;
      }
      
      // Clean up subscription
      subscription.unsubscribe();
    } catch (error) {
      result.passed = false;
      result.message = `Event bus test failed: ${error}`;
    }
    
    return result;
  }
  
  /**
   * Test the shader system
   * @returns Test result
   */
  private testShaderSystem(): TestResult {
    const result: TestResult = {
      name: 'Shader System',
      passed: true,
      message: 'Shader system is working correctly.'
    };
    
    try {
      // Test shader loading
      const shaderSystem = gridOS.getShaderSystem();
      const shaderName = 'test-shader';
      
      shaderSystem.loadShader(
        shaderName,
        `
          attribute vec4 position;
          attribute vec2 texcoord;
          varying vec2 v_texcoord;
          
          void main() {
            gl_Position = position;
            v_texcoord = texcoord;
          }
        `,
        `
          precision mediump float;
          varying vec2 v_texcoord;
          uniform float u_time;
          uniform float u_intensity;
          
          void main() {
            vec2 uv = v_texcoord;
            vec3 color = vec3(uv.x, uv.y, sin(u_time * 0.1) * 0.5 + 0.5);
            color *= u_intensity;
            gl_FragColor = vec4(color, 1.0);
          }
        `
      );
      
      // Verify shader was loaded
      if (!shaderSystem.activeShaders[shaderName]) {
        result.passed = false;
        result.message = 'Shader loading failed.';
        return result;
      }
      
      // Test uniform updates
      shaderSystem.updateUniforms(shaderName, {
        u_time: 1.0,
        u_intensity: 0.8
      });
      
      // Verify uniforms were updated
      if (
        shaderSystem.activeShaders[shaderName].uniforms.u_time !== 1.0 ||
        shaderSystem.activeShaders[shaderName].uniforms.u_intensity !== 0.8
      ) {
        result.passed = false;
        result.message = 'Shader uniform updates failed.';
        return result;
      }
      
      // Test post-processing
      shaderSystem.setPostProcessing('bloom', true, 0.8);
      
      // Verify post-processing was updated
      if (
        !shaderSystem.postProcessing['bloom'].enabled ||
        shaderSystem.postProcessing['bloom'].intensity !== 0.8
      ) {
        result.passed = false;
        result.message = 'Post-processing updates failed.';
        return result;
      }
    } catch (error) {
      result.passed = false;
      result.message = `Shader system test failed: ${error}`;
    }
    
    return result;
  }
  
  /**
   * Test the trigger system
   * @returns Test result
   */
  private testTriggerSystem(): TestResult {
    const result: TestResult = {
      name: 'Trigger System',
      passed: true,
      message: 'Trigger system is working correctly.'
    };
    
    try {
      // Test trigger subscription
      let triggerReceived = false;
      const subscription = gridOS.triggerSystem.triggers.financial.tipReceived(10).subscribe(() => {
        triggerReceived = true;
      });
      
      // Trigger a tip
      gridOS.triggerSystem.triggerTipReceived(20, 'USD', 'test-user', 'rain');
      
      // Check if trigger was received
      if (!triggerReceived) {
        result.passed = false;
        result.message = 'Trigger subscription failed.';
        return result;
      }
      
      // Clean up subscription
      subscription.unsubscribe();
    } catch (error) {
      result.passed = false;
      result.message = `Trigger system test failed: ${error}`;
    }
    
    return result;
  }
  
  /**
   * Test system health
   * @returns Test result
   */
  private testSystemHealth(): TestResult {
    const result: TestResult = {
      name: 'System Health',
      passed: true,
      message: 'System health is working correctly.'
    };
    
    try {
      // Get system health
      const health = getSystemHealth();
      
      // Verify health object structure
      if (
        !health.status ||
        !health.subsystems ||
        !health.diagnostics ||
        !health.timestamp
      ) {
        result.passed = false;
        result.message = 'System health object is incomplete.';
        return result;
      }
      
      // Verify subsystems
      const requiredSubsystems = ['eventBus', 'shaderSystem', 'triggerSystem', 'network', 'memory'];
      for (const subsystem of requiredSubsystems) {
        if (!health.subsystems[subsystem]) {
          result.passed = false;
          result.message = `System health is missing subsystem: ${subsystem}`;
          return result;
        }
      }
      
      // Verify subsystem structure
      for (const [name, subsystem] of Object.entries(health.subsystems)) {
        if (
          !subsystem.status ||
          !subsystem.metrics ||
          !subsystem.diagnostics
        ) {
          result.passed = false;
          result.message = `Subsystem ${name} health object is incomplete.`;
          return result;
        }
      }
    } catch (error) {
      result.passed = false;
      result.message = `System health test failed: ${error}`;
    }
    
    return result;
  }
  
  /**
   * Test window exports
   * @returns Test result
   */
  private testWindowExports(): TestResult {
    const result: TestResult = {
      name: 'Window Exports',
      passed: true,
      message: 'Window exports are working correctly.'
    };
    
    try {
      // Check if window object exists
      if (typeof window === 'undefined') {
        result.passed = false;
        result.message = 'Window object is not available.';
        return result;
      }
      
      // Check if gridOS is exported
      if (!window.gridOS) {
        result.passed = false;
        result.message = 'gridOS is not exported to window.';
        return result;
      }
      
      // Check if getSystemHealth is exported
      if (!window.gridOS.getSystemHealth) {
        result.passed = false;
        result.message = 'getSystemHealth is not exported to window.gridOS.';
        return result;
      }
      
      // Check if gridSystemTest is exported
      if (!window.gridSystemTest) {
        result.passed = false;
        result.message = 'gridSystemTest is not exported to window.';
        return result;
      }
      
      // Check if runAllTests is exported
      if (!window.gridSystemTest.runAllTests) {
        result.passed = false;
        result.message = 'runAllTests is not exported to window.gridSystemTest.';
        return result;
      }
    } catch (error) {
      result.passed = false;
      result.message = `Window exports test failed: ${error}`;
    }
    
    return result;
  }
}

// Export the GridSystemTest class
export default new GridSystemTest();
