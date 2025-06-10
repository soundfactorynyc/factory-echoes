# Owncast Tip Handler System for GRID OS

This backup contains all the files for the Owncast Tip Handler system with GRID OS integration. The system processes tip events from Owncast streams, updates tip data state, provides visual display of this information, and integrates with the GRID OS event bus to trigger visual effects based on tip amounts.

## File Structure

### Components

- `src/components/OwncastTipDisplay.tsx` - React component for displaying tip information
- `src/components/OwncastTipDisplay.css` - CSS styles for the tip display component

### Integration

- `src/integration/owncastTipHandler.ts` - TypeScript implementation of the tip handler
- `src/integration/owncastTipHandler.js` - JavaScript version of the tip handler for direct browser use
- `src/integration/gridOSBackend.js` - GRID OS backend implementation with event bus and system health monitoring
- `src/integration/gridIntegration.js` - GRID OS integration system for connection testing
- `src/integration/soundFactoryPlatform.js` - Sound Factory Platform integration with Owncast and GRID OS

### Test Pages

- `public/owncast-tip-test.html` - Test page for the Owncast tip handler system
- `public/sound-factory-platform-test.html` - Test page for the Sound Factory Platform integration

## Features

### Owncast Tip Handler

- Processes tip events from Owncast streams
- Updates tip data state (last tip, total tips, goal progress, top tipper)
- Provides visual display of tip information
- Integrates with GRID OS event bus for visual effects

### GRID OS Integration

- System health monitoring
- Event bus for communication between components
- Connection testing for external services
- Autonomous mode for when Claude is disconnected
- Reaction system for visual effects
- Mood change functionality

### Sound Factory Platform

- Unified container for all Sound Factory components and systems
- Integrates with Owncast tip handler and GRID OS
- Provides a comprehensive UI for testing and demonstration
- Includes multiple subsystems:
  - Virtual Drinks System - Manages virtual drink interactions
  - Producer Support System - Provides tools for producers
  - Haptic Bass System - Manages haptic feedback based on audio
  - Liquid Sampler System - Manages audio sampling and visualization
  - TikTok Clip System - Manages clip creation and sharing
  - Legendary Social Sharing - Manages social media interactions

## Global Functions

The following functions are available globally:

- `window.activateAutonomousMode()` - Activates autonomous mode when Claude is disconnected
- `window.gridOS.getSystemHealth()` - Returns system health status
- `window.gridIntegration.testAllConnections()` - Tests all system connections
- `window.triggerReaction('fire')` - Triggers visual reactions
- `window.gridOS.eventBus.emit('moodChange', { mood: 'party' })` - Changes system mood
- `window.soundFactoryPlatform.simulateTip()` - Simulates an Owncast tip event

## Usage

1. Copy the files to their respective directories in your project
2. Import the necessary modules in your application
3. Initialize the tip handler and GRID OS integration
4. Use the provided functions to interact with the system

## Examples

### Basic Owncast Tip Handler

```javascript
// Import the necessary modules
import { useOwncastTipHandler } from '/src/integration/owncastTipHandler.js';
import { gridOS } from '/src/integration/gridOSBackend.js';
import { gridIntegration } from '/src/integration/gridIntegration.js';

// Initialize GRID OS
gridOS.initialize().then(() => {
  console.log('GRID OS initialized');
});

// Initialize GRID Integration
gridIntegration.initialize().then(() => {
  console.log('GRID Integration initialized');
});

// Set up tip event handler
window.owncast.on('tip', (tip) => {
  console.log(`Tip received: $${tip.amount} from ${tip.userName}`);
});

// Trigger a reaction
window.triggerReaction('fire', {
  intensity: 0.8,
  duration: 3000
});

// Change mood
window.gridOS.eventBus.emit('moodChange', { mood: 'party' });
```

### Sound Factory Platform

```javascript
// Import the Sound Factory Platform
import { soundFactoryPlatform } from '/src/integration/soundFactoryPlatform.js';

// Initialize the platform (this will also initialize GRID OS and other systems)
await soundFactoryPlatform.initialize();

// Simulate a tip
soundFactoryPlatform.simulateTip(50, 'SoundFactoryFan', 'Great stream!');

// Get tip stats
const tipStats = soundFactoryPlatform.getTipStats();
console.log(`Total tips: $${tipStats.totalTips}, Goal progress: ${tipStats.goalProgress}%`);

// Create and serve a virtual drink
const drink = soundFactoryPlatform.systems.drinks.createDrink('premium');
soundFactoryPlatform.systems.drinks.serveDrink(drink.id);

// Trigger a reaction through GRID OS
soundFactoryPlatform.gridOS.triggerReaction('party', { 
  intensity: 0.8, 
  duration: 5000 
});

// Change the mood
soundFactoryPlatform.gridOS.eventBus.emit('moodChange', { mood: 'euphoric' });
```

## Test Pages

### Owncast Tip Test

The Owncast tip test page (`public/owncast-tip-test.html`) provides a UI for testing the basic tip handler:

- Tip simulation controls
- GRID OS control panel
- System status display
- Connection testing and monitoring

To use the test page, simply open it in a web browser:

```
open public/owncast-tip-test.html
```

### Sound Factory Platform Test

The Sound Factory Platform test page (`public/sound-factory-platform-test.html`) provides a comprehensive UI for testing all features:

- Tip simulation and display
- Virtual drink creation
- Reaction triggering
- Mood changing
- System status monitoring
- Chat simulation
- Platform systems overview

To use the test page, open it in a web browser:

```
open public/sound-factory-platform-test.html
