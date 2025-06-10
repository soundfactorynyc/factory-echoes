/**
 * GRID OS Audio System Verification
 * 
 * Comprehensive verification suite for the real-time beat detection system
 * Tests all major components and integration points
 */

import { createGridOSBackend } from './gridOSBackend';
import { AudioAnalyzer, type AudioAnalyzerConfig } from './audioAnalyzer';
import type { BeatEvent, AudioData, SystemEvent } from '../types/integration';

/**
 * Verification configuration
 */
const VERIFICATION_CONFIG: Partial<AudioAnalyzerConfig> = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  beatThreshold: 0.3,
  minBeatInterval: 300,
  bpmWindowSize: 10,
  updateInterval: 16
};

/**
 * Audio system verification class
 */
export class AudioSystemVerification {
  private gridOS: any = null;
  private verificationResults: {
    initialization: boolean;
    audioAccess: boolean;
    beatDetection: boolean;
    eventStreams: boolean;
    performance: boolean;
    integration: boolean;
  } = {
    initialization: false,
    audioAccess: false,
    beatDetection: false,
    eventStreams: false,
    performance: false,
    integration: false
  };

  private metrics = {
    beatCount: 0,
    audioDataCount: 0,
    systemEventCount: 0,
    avgLatency: 0,
    maxLatency: 0,
    minLatency: Infinity
  };

  /**
   * Run complete system verification
   */
  public async runVerification(): Promise<void> {
    console.log('🧪 Starting GRID OS Audio System Verification...');
    console.log('=' .repeat(60));

    try {
      await this.verifyInitialization();
      await this.verifyAudioAccess();
      await this.verifyEventStreams();
      await this.verifyBeatDetection();
      await this.verifyPerformance();
      await this.verifyIntegration();

      this.printResults();
    } catch (error) {
      console.error('❌ Verification failed:', error);
    }
  }

  /**
   * Test 1: System Initialization
   */
  private async verifyInitialization(): Promise<void> {
    console.log('\n📋 Test 1: System Initialization');
    console.log('-'.repeat(40));

    try {
      // Create GRID OS backend with audio configuration
      this.gridOS = createGridOSBackend(VERIFICATION_CONFIG);
      
      if (this.gridOS && this.gridOS.eventBus && this.gridOS.eventBus.audioAnalyzer) {
        console.log('✅ GRID OS backend created successfully');
        console.log('✅ Event bus system initialized');
        console.log('✅ Audio analyzer component initialized');
        this.verificationResults.initialization = true;
      } else {
        throw new Error('GRID OS components not properly initialized');
      }

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.verificationResults.initialization = false;
    }
  }

  /**
   * Test 2: Audio Access and Context
   */
  private async verifyAudioAccess(): Promise<void> {
    console.log('\n📋 Test 2: Audio Access and Context');
    console.log('-'.repeat(40));

    try {
      console.log('🎤 Testing microphone access...');
      
      // Start audio analysis
      await this.gridOS.startAudioAnalysis();
      
      // Wait a moment for initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const state = this.gridOS.getAudioAnalyzerState();
      
      if (state.isRunning && state.audioContext) {
        console.log('✅ Microphone access granted');
        console.log(`✅ Audio context created (${state.audioContext.state})`);
        console.log(`✅ Sample rate: ${state.audioContext.sampleRate}Hz`);
        this.verificationResults.audioAccess = true;
      } else {
        throw new Error('Audio access or context creation failed');
      }

    } catch (error) {
      console.error('❌ Audio access failed:', error);
      console.log('💡 Note: This may require user permission for microphone access');
      this.verificationResults.audioAccess = false;
    }
  }

  /**
   * Test 3: Event Stream Verification
   */
  private async verifyEventStreams(): Promise<void> {
    console.log('\n📋 Test 3: Event Stream Verification');
    console.log('-'.repeat(40));

    try {
      console.log('📡 Setting up event stream monitoring...');

      // Monitor audio data stream
      const audioDataSubscription = this.gridOS.eventBus.audioData$.subscribe((data: AudioData) => {
        this.metrics.audioDataCount++;
        if (this.metrics.audioDataCount === 1) {
          console.log('✅ Audio data stream active');
        }
      });

      // Monitor beat events
      const beatSubscription = this.gridOS.eventBus.beats$.subscribe((beat: BeatEvent) => {
        this.metrics.beatCount++;
        if (this.metrics.beatCount === 1) {
          console.log('✅ Beat event stream active');
        }
      });

      // Monitor system events
      const systemSubscription = this.gridOS.eventBus.systemEvents$.subscribe((event: SystemEvent) => {
        this.metrics.systemEventCount++;
        if (this.metrics.systemEventCount === 1) {
          console.log('✅ System event stream active');
        }
      });

      // Wait for events
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if we received events
      if (this.metrics.audioDataCount > 0 && this.metrics.systemEventCount > 0) {
        console.log(`✅ Received ${this.metrics.audioDataCount} audio data events`);
        console.log(`✅ Received ${this.metrics.systemEventCount} system events`);
        this.verificationResults.eventStreams = true;
      } else {
        throw new Error('Event streams not functioning properly');
      }

      // Clean up subscriptions
      audioDataSubscription.unsubscribe();
      beatSubscription.unsubscribe();
      systemSubscription.unsubscribe();

    } catch (error) {
      console.error('❌ Event stream verification failed:', error);
      this.verificationResults.eventStreams = false;
    }
  }

  /**
   * Test 4: Beat Detection Functionality
   */
  private async verifyBeatDetection(): Promise<void> {
    console.log('\n📋 Test 4: Beat Detection Functionality');
    console.log('-'.repeat(40));

    try {
      console.log('🥁 Testing beat detection system...');
      console.log('   Note: Play music or make rhythmic sounds for best results');

      // Monitor for beats for 15 seconds
      let beatDetected = false;
      const beatSubscription = this.gridOS.eventBus.beats$.subscribe((beat: BeatEvent) => {
        if (!beatDetected) {
          console.log(`✅ Beat detected! BPM: ${beat.bpm}, Intensity: ${beat.intensity.toFixed(2)}`);
          beatDetected = true;
        }
      });

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (beatDetected) {
            console.log(`✅ Beat detection working (${this.metrics.beatCount} beats total)`);
            this.verificationResults.beatDetection = true;
          } else {
            console.log('⚠️ No beats detected (try playing music or making rhythmic sounds)');
            this.verificationResults.beatDetection = false;
          }
          resolve();
        }, 15000);
      });

      beatSubscription.unsubscribe();

    } catch (error) {
      console.error('❌ Beat detection verification failed:', error);
      this.verificationResults.beatDetection = false;
    }
  }

  /**
   * Test 5: Performance Metrics
   */
  private async verifyPerformance(): Promise<void> {
    console.log('\n📋 Test 5: Performance Metrics');
    console.log('-'.repeat(40));

    try {
      console.log('⚡ Measuring performance metrics...');

      const startTime = performance.now();
      let frameCount = 0;
      const latencies: number[] = [];

      // Monitor performance for 5 seconds
      const performanceSubscription = this.gridOS.eventBus.audioData$.subscribe((data: AudioData) => {
        const currentTime = performance.now();
        const latency = currentTime - data.timestamp;
        latencies.push(latency);
        frameCount++;
      });

      await new Promise(resolve => setTimeout(resolve, 5000));
      performanceSubscription.unsubscribe();

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const fps = (frameCount / totalTime) * 1000;

      if (latencies.length > 0) {
        this.metrics.avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
        this.metrics.maxLatency = Math.max(...latencies);
        this.metrics.minLatency = Math.min(...latencies);

        console.log(`✅ Average FPS: ${fps.toFixed(1)}`);
        console.log(`✅ Average latency: ${this.metrics.avgLatency.toFixed(2)}ms`);
        console.log(`✅ Max latency: ${this.metrics.maxLatency.toFixed(2)}ms`);
        console.log(`✅ Min latency: ${this.metrics.minLatency.toFixed(2)}ms`);

        // Performance thresholds
        if (fps > 30 && this.metrics.avgLatency < 50) {
          this.verificationResults.performance = true;
          console.log('✅ Performance metrics within acceptable range');
        } else {
          console.log('⚠️ Performance metrics below optimal thresholds');
          this.verificationResults.performance = false;
        }
      } else {
        throw new Error('No performance data collected');
      }

    } catch (error) {
      console.error('❌ Performance verification failed:', error);
      this.verificationResults.performance = false;
    }
  }

  /**
   * Test 6: Full Integration Test
   */
  private async verifyIntegration(): Promise<void> {
    console.log('\n📋 Test 6: Full Integration Test');
    console.log('-'.repeat(40));

    try {
      console.log('🔗 Testing full system integration...');

      // Test audio visual sync
      const audioVisualSync = this.gridOS.getAudioVisualSync();
      if (audioVisualSync && audioVisualSync.audioContext && audioVisualSync.frequencyData) {
        console.log('✅ Audio visual sync interface working');
      } else {
        throw new Error('Audio visual sync not available');
      }

      // Test configuration updates
      const originalConfig = this.gridOS.getAudioAnalyzerState().config;
      this.gridOS.updateAudioConfig({ beatThreshold: 0.5 });
      const updatedConfig = this.gridOS.getAudioAnalyzerState().config;
      
      if (updatedConfig.beatThreshold === 0.5) {
        console.log('✅ Configuration updates working');
        // Restore original config
        this.gridOS.updateAudioConfig({ beatThreshold: originalConfig.beatThreshold });
      } else {
        throw new Error('Configuration updates not working');
      }

      // Test stop/restart functionality
      this.gridOS.stopAudioAnalysis();
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.gridOS.startAudioAnalysis();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const restartedState = this.gridOS.getAudioAnalyzerState();
      if (restartedState.isRunning) {
        console.log('✅ Stop/restart functionality working');
        this.verificationResults.integration = true;
      } else {
        throw new Error('Restart functionality failed');
      }

    } catch (error) {
      console.error('❌ Integration verification failed:', error);
      this.verificationResults.integration = false;
    }
  }

  /**
   * Print verification results
   */
  private printResults(): void {
    console.log('\n🎯 VERIFICATION RESULTS');
    console.log('=' .repeat(60));

    const tests = [
      { name: 'System Initialization', result: this.verificationResults.initialization },
      { name: 'Audio Access', result: this.verificationResults.audioAccess },
      { name: 'Event Streams', result: this.verificationResults.eventStreams },
      { name: 'Beat Detection', result: this.verificationResults.beatDetection },
      { name: 'Performance', result: this.verificationResults.performance },
      { name: 'Integration', result: this.verificationResults.integration }
    ];

    tests.forEach(test => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.name.padEnd(25)} ${status}`);
    });

    const passedTests = tests.filter(t => t.result).length;
    const totalTests = tests.length;
    const successRate = (passedTests / totalTests) * 100;

    console.log('\n📊 SUMMARY');
    console.log('-'.repeat(40));
    console.log(`Tests Passed: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);
    console.log(`Beat Events: ${this.metrics.beatCount}`);
    console.log(`Audio Events: ${this.metrics.audioDataCount}`);
    console.log(`System Events: ${this.metrics.systemEventCount}`);

    if (this.metrics.avgLatency > 0) {
      console.log(`Avg Latency: ${this.metrics.avgLatency.toFixed(2)}ms`);
    }

    if (successRate === 100) {
      console.log('\n🎉 ALL TESTS PASSED! Your real-time beat detection system is fully operational!');
    } else if (successRate >= 75) {
      console.log('\n✨ MOSTLY WORKING! Some minor issues detected, but core functionality is operational.');
    } else {
      console.log('\n⚠️ NEEDS ATTENTION! Several issues detected that may affect functionality.');
    }

    console.log('\n🎵 Next Steps:');
    console.log('• Test with various music genres and BPM ranges');
    console.log('• Integrate with your visual effects system');
    console.log('• Optimize performance for your specific use case');
    console.log('• Add pattern recognition for complex rhythms');
    console.log('• Implement beat prediction for visual synchronization');
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.gridOS) {
      this.gridOS.stopAudioAnalysis();
    }
  }
}

/**
 * Run the verification when this module is loaded
 */
export async function runAudioSystemVerification(): Promise<void> {
  const verification = new AudioSystemVerification();
  
  try {
    await verification.runVerification();
  } finally {
    verification.cleanup();
  }
}

// Auto-run verification in browser environment
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAudioSystemVerification);
  } else {
    runAudioSystemVerification();
  }
}

export { AudioSystemVerification };
