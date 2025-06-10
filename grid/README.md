# GRID OS Integration Core

The GRID OS Integration Core serves as the central nervous system for the GRID OS application, providing a robust and flexible architecture for event-driven, reactive programming.

## Overview

The Integration Core is designed to facilitate seamless communication between various components of the GRID OS, including:

- Real-time event processing
- WebGL shader management
- Audio-visual synchronization
- Haptic feedback
- Network communication
- AI integration

## Architecture

The Integration Core is built around several key components:

### Event Bus

The Event Bus is the central communication hub of the Integration Core, allowing components to publish and subscribe to events without direct coupling. It provides:

- Input streams for raw events (WebSocket messages, device motion, touch gestures, etc.)
- Processed streams for enhanced events (chat analysis, beat prediction, money flow, etc.)
- Output streams for commands (grid commands, haptic commands, shader commands, etc.)

### Shader System

The Shader System manages WebGL shaders and materials, providing:

- Shader loading and unloading
- Material presets (carbon fiber, gold accent, cyan glow, studio metal)
- Post-processing effects (bloom, motion blur, chromatic aberration, film grain)

### Lifecycle Manager

The Lifecycle Manager handles the initialization, shutdown, and error recovery of the Integration Core, providing:

- Initialization and shutdown procedures
- Error recovery strategies for network failures, Claude timeouts, memory pressure, and thermal throttling

### Integration Types

The Integration Core provides a rich set of type definitions for:

- Event types (WebSocket messages, device motion, touch gestures, etc.)
- Command types (grid commands, haptic commands, shader commands, etc.)
- Network types (exponential backoff, duplex streams, CRDTs, etc.)
- AI types (Claude agents, mood analysis, beat prediction, etc.)

## Usage

Here's a simple example of how to use the Integration Core:

```typescript
import { createIntegrationCore } from './integration';
import { createShaderSystem } from './integration/shaderSystem';

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
  } catch (error) {
    console.error('Failed to initialize GRID OS Integration Core:', error);
  }
}

// Set up event subscriptions
function setupEventSubscriptions() {
  // Subscribe to WebSocket messages
  core.eventBus.inputs.websocket$.subscribe(message => {
    console.log('Received WebSocket message:', message);
  });
  
  // Subscribe to beat prediction events
  core.eventBus.processed.beatPrediction$.subscribe(prediction => {
    console.log('Beat prediction:', prediction);
    
    // Apply visual effects based on the beat
    if (prediction.intensity > 0.8) {
      // Trigger a shader effect
      core.eventBus.outputs.shaderCommands$.next({
        type: 'apply',
        shader: 'beatReactive',
        data: {
          intensity: prediction.intensity,
          color: [0, 1, 1]
        },
        priority: 'high'
      });
    }
  });
}

// Initialize the core
initializeCore();
```

## Components

### Event Bus

The Event Bus provides a central hub for all system events, allowing components to communicate with each other without direct coupling.

```typescript
// Publish an event
core.eventBus.publish('customEvent', { data: 'value' });

// Subscribe to an event
const subscription = core.eventBus.subscribe('customEvent', data => {
  console.log('Received custom event:', data);
});

// Unsubscribe when done
subscription.unsubscribe();
```

### Shader System

The Shader System manages WebGL shaders and materials, providing a high-level API for shader operations.

```typescript
// Load a shader
const shader = shaderSystem.loadShader('myShader', vertexSource, fragmentSource);

// Apply a material
shaderSystem.applyMaterial('myShader', 'cyanGlow');

// Enable post-processing effects
shaderSystem.setPostProcessing('bloom', true);
```

### Lifecycle Manager

The Lifecycle Manager handles the initialization, shutdown, and error recovery of the Integration Core.

```typescript
// Initialize the core
await core.lifecycle.initialize();

// Shutdown the core
await core.lifecycle.shutdown();

// Recover from a network failure
await core.lifecycle.errorRecovery.networkFailure();
```

## Advanced Features

### Claude AI Integration

The Integration Core provides seamless integration with Claude AI agents for advanced features like:

- Mood analysis
- Beat prediction
- Chat enhancement
- Visual direction
- Safety intervention
- Creative idea generation
- Personality adaptation

### Reactive Programming

The Integration Core is built around reactive programming principles, using RxJS for event streams and operators.

```typescript
// Create a custom flow
const customFlow = pipe(
  filter(event => event.type === 'custom'),
  map(event => ({ ...event, processed: true })),
  scan((acc, event) => [...acc, event], [])
);

// Apply the flow
const processed$ = source$.pipe(customFlow);
```

### Network Communication

The Integration Core provides robust network communication features, including:

- WebSocket connections
- Peer-to-peer mesh networks
- Duplex streams
- Conflict-free replicated data types (CRDTs)
- Jitter buffers
- Packet scheduling

### Sensor Fusion

The Integration Core provides sensor fusion capabilities for combining data from multiple sensors:

- Motion sensors (accelerometer, gyroscope, magnetometer)
- Audio sensors (microphone, system audio)
- Touch sensors (raw touch, gestures, pressure, hover)
- Camera sensors (frames, face detection, hand detection, environment detection, depth)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
