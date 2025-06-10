import { createIntegrationCore } from './integration';
import { ShaderSystem, createShaderSystem } from './integration/shaderSystem';
import type {
  WSMessage,
  DeviceMotionEvent,
  BeatPredictionEvent,
  EnhancedMoneyEvent,
  GridCommand,
  ShaderCommand,
  HapticCommand,
  AudioCommand
} from './types/integration';

/**
 * GRID OS: Integration Core Demo
 * 
 * This file demonstrates how to use the GRID OS Integration Core.
 */

// Create the integration core
const core = createIntegrationCore();

// Create the shader system
const shaderSystem = createShaderSystem();

// Initialize the integration core
async function initializeCore() {
  try {
    console.log('Initializing GRID OS Integration Core...');
    await core.lifecycle.initialize();
    console.log('GRID OS Integration Core initialized successfully!');
    
    // Set up event subscriptions
    setupEventSubscriptions();
    
    // Simulate some events
    simulateEvents();
  } catch (error: unknown) {
    console.error('Failed to initialize GRID OS Integration Core:', error);
    
    // Try to recover from the error
    if (error instanceof Error) {
      if (error.name === 'NetworkError') {
        await core.lifecycle.errorRecovery.networkFailure();
      } else if (error.name === 'TimeoutError' && 'source' in error && error.source === 'claude') {
        await core.lifecycle.errorRecovery.claudeTimeout();
      } else if (error.name === 'MemoryError') {
        await core.lifecycle.errorRecovery.memoryPressure();
      } else if (error.name === 'ThermalError') {
        await core.lifecycle.errorRecovery.thermalThrottle();
      }
    }
  }
}

// Set up event subscriptions
function setupEventSubscriptions() {
  // Subscribe to WebSocket messages
  core.eventBus.inputs.websocket$.subscribe((message: WSMessage) => {
    console.log('Received WebSocket message:', message);
  });
  
  // Subscribe to beat prediction events
  core.eventBus.processed.beatPrediction$.subscribe((prediction: BeatPredictionEvent) => {
    console.log('Beat prediction:', prediction);
    
    // Apply visual effects based on the beat
    if (prediction.intensity > 0.8) {
      // Trigger a shader effect
      const shaderCommand: ShaderCommand = {
        type: 'apply',
        shader: 'beatReactive',
        data: {
          intensity: prediction.intensity,
          color: [0, 1, 1]
        },
        priority: 'high'
      };
      core.eventBus.outputs.shaderCommands$.next(shaderCommand);
      
      // Trigger a haptic effect
      const hapticCommand: HapticCommand = {
        type: 'impact',
        intensity: prediction.intensity,
        duration: 50,
        pattern: [0, 50]
      };
      core.eventBus.outputs.hapticCommands$.next(hapticCommand);
    }
  });
  
  // Subscribe to money flow events
  core.eventBus.processed.moneyFlow$.subscribe((moneyEvent: EnhancedMoneyEvent) => {
    console.log('Money flow event:', moneyEvent);
    
    // Apply visual effects based on the transaction significance
    if (moneyEvent.significance === 'exceptional') {
      // Use the cyan glow material
      shaderSystem.applyMaterial('mainEffect', 'cyanGlow');
      
      // Enable bloom effect
      shaderSystem.setPostProcessing('bloom', true);
      
      // Trigger a haptic effect
      const hapticCommand: HapticCommand = {
        type: 'success',
        intensity: 1.0,
        duration: 500
      };
      core.eventBus.outputs.hapticCommands$.next(hapticCommand);
      
      // Play a sound effect
      const audioCommand: AudioCommand = {
        type: 'play',
        source: 'moneyShot',
        data: {
          volume: 1.0,
          pitch: 1.0
        },
        priority: 'high'
      };
      core.eventBus.outputs.audioCommands$.next(audioCommand);
    }
  });
  
  // Subscribe to grid commands
  core.eventBus.outputs.gridCommands$.subscribe((command: GridCommand) => {
    console.log('Grid command:', command);
  });
}

// Simulate some events
function simulateEvents() {
  // Simulate a WebSocket message
  setTimeout(() => {
    core.eventBus.inputs.websocket$.next({
      type: 'chat',
      payload: {
        userId: 'user123',
        message: 'Hello, GRID OS!'
      },
      id: 'msg1',
      timestamp: Date.now()
    });
  }, 1000);
  
  // Simulate a beat prediction event
  setTimeout(() => {
    core.eventBus.processed.beatPrediction$.next({
      bpm: 128,
      phase: 0.5,
      confidence: 0.95,
      timeUntilNextBeat: 0.2,
      intensity: 0.9,
      pattern: 'drop',
      futurePredictions: [
        { time: 0.2, intensity: 0.9, confidence: 0.95 },
        { time: 0.7, intensity: 0.8, confidence: 0.9 },
        { time: 1.2, intensity: 0.85, confidence: 0.85 }
      ]
    });
  }, 2000);
  
  // Simulate a money flow event
  setTimeout(() => {
    core.eventBus.processed.moneyFlow$.next({
      original: {
        type: 'tip',
        amount: 1000,
        currency: 'USD',
        sender: 'whale123',
        recipient: 'creator456',
        timestamp: Date.now(),
        metadata: {
          message: 'Amazing work!'
        }
      },
      significance: 'exceptional',
      suggestedEffects: ['explosion', 'confetti', 'spotlight'],
      suggestedAudio: ['cashRegister', 'applause', 'airhorn'],
      suggestedHaptics: ['success', 'impact'],
      userHistory: {
        totalSpent: 5000,
        transactionCount: 10,
        firstTransaction: Date.now() - 86400000, // 1 day ago
        tier: 'whale'
      }
    });
  }, 3000);
  
  // Simulate a device motion event
  setTimeout(() => {
    core.eventBus.inputs.deviceMotion$.next({
      accelerationIncludingGravity: {
        x: 0.1,
        y: 0.2,
        z: 9.8
      },
      acceleration: {
        x: 0.1,
        y: 0.2,
        z: 0.3
      },
      rotationRate: {
        alpha: 0.1,
        beta: 0.2,
        gamma: 0.3
      },
      interval: 16
    });
  }, 4000);
}

// Shutdown the integration core
async function shutdownCore() {
  try {
    console.log('Shutting down GRID OS Integration Core...');
    await core.lifecycle.shutdown();
    console.log('GRID OS Integration Core shut down successfully!');
  } catch (error: unknown) {
    console.error('Failed to shut down GRID OS Integration Core:', error);
  }
}

// Initialize the core
initializeCore();

// Shutdown the core after 10 seconds
setTimeout(() => {
  shutdownCore();
}, 10000);
