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

### Test Pages

- `public/owncast-tip-test.html` - Test page for the Owncast tip handler system

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

## Global Functions

The following functions are available globally:

- `window.activateAutonomousMode()` - Activates autonomous mode when Claude is disconnected
- `window.gridOS.getSystemHealth()` - Returns system health status
- `window.gridIntegration.testAllConnections()` - Tests all system connections
- `window.triggerReaction('fire')` - Triggers visual reactions
- `window.gridOS.eventBus.emit('moodChange', { mood: 'party' })` - Changes system mood

## Usage

1. Copy the files to their respective directories in your project
2. Import the necessary modules in your application
3. Initialize the tip handler and GRID OS integration
4. Use the provided functions to interact with the system

## Example

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

## Test Page

The test page (`public/owncast-tip-test.html`) provides a complete UI for testing all features:

- Tip simulation controls
- GRID OS control panel
- System status display
- Connection testing and monitoring

To use the test page, simply open it in a web browser:

```
open public/owncast-tip-test.html
