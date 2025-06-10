/**
 * GRID OS Audio Analyzer Demo
 * 
 * This demo showcases the real-time audio analysis and beat detection integration
 * with the GRID OS event bus system.
 */

import { createGridOSBackend } from './gridOSBackend';
import type { AudioAnalyzerConfig } from './audioAnalyzer';

/**
 * Demo configuration for the audio analyzer
 */
const DEMO_AUDIO_CONFIG: Partial<AudioAnalyzerConfig> = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  beatThreshold: 0.3,
  minBeatInterval: 300, // Allow up to 200 BPM
  bpmWindowSize: 10, // 10 second window for BPM calculation
  updateInterval: 16 // 60fps updates
};

/**
 * Initialize and run the audio analyzer demo
 */
async function runAudioAnalyzerDemo(): Promise<void> {
  console.log('🎵 Starting GRID OS Audio Analyzer Demo...');
  
  try {
    // Create GRID OS backend with audio configuration
    const gridOS = createGridOSBackend(DEMO_AUDIO_CONFIG);
    
    // Set up event subscriptions to monitor audio analysis
    setupEventSubscriptions(gridOS);
    
    // Start audio analysis
    console.log('🎤 Requesting microphone access...');
    await gridOS.startAudioAnalysis();
    
    console.log('✅ Audio analyzer demo started successfully!');
    console.log('🎵 Play some music or make sounds to see beat detection in action');
    console.log('📊 Check the console for real-time beat detection events');
    
    // Set up demo controls
    setupDemoControls(gridOS);
    
  } catch (error) {
    console.error('❌ Failed to start audio analyzer demo:', error);
    
    if (error.message.includes('Permission denied')) {
      console.log('🔇 Microphone access denied. Please allow microphone access to use audio analysis.');
    } else if (error.message.includes('not supported')) {
      console.log('🚫 Audio analysis not supported in this browser environment.');
    }
  }
}

/**
 * Set up event subscriptions to monitor audio analysis
 */
function setupEventSubscriptions(gridOS: any): void {
  // Monitor beat events
  gridOS.eventBus.beats$.subscribe((beat: any) => {
    console.log(`🥁 Beat detected: ${beat.bpm} BPM, intensity: ${beat.intensity.toFixed(2)}, phase: ${beat.phase.toFixed(2)}`);
    
    // Trigger visual effects based on beat intensity
    if (beat.intensity > 0.7) {
      console.log('💥 High intensity beat - triggering strong visual effect');
      simulateVisualEffect('strong', beat);
    } else if (beat.intensity > 0.4) {
      console.log('✨ Medium intensity beat - triggering medium visual effect');
      simulateVisualEffect('medium', beat);
    } else {
      console.log('💫 Low intensity beat - triggering subtle visual effect');
      simulateVisualEffect('subtle', beat);
    }
  });
  
  // Monitor system state changes
  gridOS.eventBus.state$.subscribe((state: any) => {
    console.log('🌟 System state updated:', {
      mood: state.mood,
      globalIntensity: state.globalIntensity.toFixed(2),
      beatPhase: state.beatPhase.toFixed(2)
    });
  });
  
  // Monitor audio commands
  gridOS.eventBus.audioCommands$.subscribe((command: any) => {
    console.log('🔊 Audio command:', command);
  });
  
  console.log('📡 Event subscriptions established');
}

/**
 * Simulate visual effects based on beat detection
 */
function simulateVisualEffect(intensity: 'subtle' | 'medium' | 'strong', beat: any): void {
  const effects = {
    subtle: { color: '#4A90E2', duration: 200 },
    medium: { color: '#F5A623', duration: 400 },
    strong: { color: '#D0021B', duration: 600 }
  };
  
  const effect = effects[intensity];
  
  // Simulate sending shader commands
  console.log(`🎨 Triggering ${intensity} visual effect:`, {
    color: effect.color,
    duration: effect.duration,
    bpm: beat.bpm,
    phase: beat.phase
  });
  
  // In a real implementation, this would trigger actual shader effects
  // gridOS.eventBus.sendShaderCommand({ ... });
}

/**
 * Set up demo controls for testing
 */
function setupDemoControls(gridOS: any): void {
  console.log('🎛️ Setting up demo controls...');
  
  // Add controls to the window for manual testing
  (window as any).audioDemo = {
    // Get current audio state
    getState: () => {
      const state = gridOS.getAudioAnalyzerState();
      console.log('📊 Current audio analyzer state:', state);
      return state;
    },
    
    // Get audio visual sync data
    getVisualSync: () => {
      const sync = gridOS.getAudioVisualSync();
      console.log('🎵 Audio visual sync data:', sync);
      return sync;
    },
    
    // Update configuration
    updateConfig: (config: Partial<AudioAnalyzerConfig>) => {
      gridOS.updateAudioConfig(config);
      console.log('🔧 Configuration updated:', config);
    },
    
    // Stop audio analysis
    stop: () => {
      gridOS.stopAudioAnalysis();
      console.log('⏹️ Audio analysis stopped');
    },
    
    // Restart audio analysis
    restart: async () => {
      try {
        gridOS.stopAudioAnalysis();
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
        await gridOS.startAudioAnalysis();
        console.log('🔄 Audio analysis restarted');
      } catch (error) {
        console.error('❌ Failed to restart audio analysis:', error);
      }
    },
    
    // Test beat sensitivity
    testSensitivity: (threshold: number) => {
      gridOS.updateAudioConfig({ beatThreshold: threshold });
      console.log(`🎯 Beat threshold updated to: ${threshold}`);
    },
    
    // Test different BPM ranges
    testBPMRange: (minInterval: number) => {
      gridOS.updateAudioConfig({ minBeatInterval: minInterval });
      const maxBPM = 60000 / minInterval;
      console.log(`🎵 Max BPM updated to: ${maxBPM.toFixed(1)}`);
    }
  };
  
  console.log('✅ Demo controls available at window.audioDemo');
  console.log('🎮 Try these commands:');
  console.log('  window.audioDemo.getState() - Get current state');
  console.log('  window.audioDemo.testSensitivity(0.5) - Adjust beat sensitivity');
  console.log('  window.audioDemo.testBPMRange(250) - Allow up to 240 BPM');
  console.log('  window.audioDemo.stop() - Stop audio analysis');
  console.log('  window.audioDemo.restart() - Restart audio analysis');
}

/**
 * Initialize demo when DOM is ready
 */
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAudioAnalyzerDemo);
  } else {
    runAudioAnalyzerDemo();
  }
} else {
  // Node.js environment - run immediately
  runAudioAnalyzerDemo();
}

export { runAudioAnalyzerDemo, DEMO_AUDIO_CONFIG };
