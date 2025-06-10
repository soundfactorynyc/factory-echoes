/**
 * GRID OS: Backend System
 * 
 * This module provides the core GRID OS backend functionality,
 * including event bus, system health, and other core services.
 */

/**
 * GRID OS Event Bus
 */
class EventBus {
  constructor() {
    this.listeners = {};
    this.state = {};
  }

  /**
   * Add event listener
   * @param {string} event Event name
   * @param {Function} callback Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Remove event listener
   * @param {string} event Event name
   * @param {Function} callback Callback function
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit event
   * @param {string} event Event name
   * @param {any} data Event data
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Send chat message
   * @param {string} userName User name
   * @param {string} message Message text
   */
  sendChatMessage(userName, message) {
    this.emit('chat', { userName, message, timestamp: Date.now() });
  }

  /**
   * Send money shot event
   * @param {string} userName User name
   * @param {number} amount Amount
   * @param {string} tier User tier
   * @param {string} mood Mood
   */
  sendMoneyShot(userName, amount, tier, mood) {
    this.emit('money-shot', { userName, amount, tier, mood, timestamp: Date.now() });
  }

  /**
   * Send grid command
   * @param {string} type Command type
   * @param {string[]} tileIds Tile IDs
   * @param {number} intensity Intensity
   * @param {number} duration Duration
   * @param {string} pattern Pattern
   */
  sendGridCommand(type, tileIds, intensity, duration, pattern) {
    this.emit('grid-command', { type, tileIds, intensity, duration, pattern });
  }

  /**
   * Update state
   * @param {Function|Object} updater State updater function or object
   */
  updateState(updater) {
    if (typeof updater === 'function') {
      this.state = updater(this.state);
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.emit('state-update', this.state);
  }
}

/**
 * GRID OS Backend
 */
class GridOSBackend {
  constructor() {
    this.initialized = false;
    this.eventBus = new EventBus();
    this.systemHealth = {
      status: 'initializing',
      mood: 'neutral',
      claudeMode: 'connected',
      fallbackActive: false,
      lastClaudeContact: Date.now(),
      memory: {
        used: 0,
        total: 100,
        percentage: 0
      },
      cpu: {
        usage: 0,
        cores: navigator?.hardwareConcurrency || 4
      },
      uptime: 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Initialize GRID OS
   */
  async initialize() {
    if (this.initialized) {
      console.log('GRID OS already initialized');
      return;
    }

    console.log('🚀 Initializing GRID OS...');
    
    // Simulate initialization
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.systemHealth.status = 'operational';
    this.systemHealth.lastUpdated = Date.now();
    this.initialized = true;
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    console.log('✅ GRID OS initialized successfully');
    
    return true;
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    setInterval(() => {
      // Simulate system health updates
      this.systemHealth.uptime += 5;
      this.systemHealth.memory.used = Math.floor(Math.random() * 80) + 10;
      this.systemHealth.memory.percentage = this.systemHealth.memory.used;
      this.systemHealth.cpu.usage = Math.floor(Math.random() * 60) + 10;
      this.systemHealth.lastUpdated = Date.now();
      
      // Emit health update event
      this.eventBus.emit('health-update', this.systemHealth);
    }, 5000);
  }

  /**
   * Get system health
   * @returns {Object} System health
   */
  getSystemHealth() {
    return this.systemHealth;
  }
  
  /**
   * Activate autonomous mode when Claude is disconnected
   */
  activateAutonomousMode() {
    console.log('🤖 Activating autonomous mode...');
    this.systemHealth.claudeMode = 'disconnected';
    this.systemHealth.fallbackActive = true;
    this.eventBus.emit('mode-change', { mode: 'autonomous' });
    return true;
  }
  
  /**
   * Trigger a specific reaction
   * @param {string} reactionType Type of reaction to trigger
   * @param {Object} options Optional parameters
   * @returns {boolean} Success status
   */
  triggerReaction(reactionType, options = {}) {
    console.log(`🎭 Triggering reaction: ${reactionType}`);
    const validReactions = ['fire', 'water', 'earth', 'air', 'party', 'chill', 'euphoric', 'intense'];
    
    if (!validReactions.includes(reactionType)) {
      console.warn(`Invalid reaction type: ${reactionType}. Valid types are: ${validReactions.join(', ')}`);
      return false;
    }
    
    const reactionData = {
      type: reactionType,
      intensity: options.intensity || 0.8,
      duration: options.duration || 3000,
      ...options
    };
    
    this.eventBus.emit('reaction', reactionData);
    return true;
  }
}

// Create singleton instance
export const gridOS = new GridOSBackend();

// Add to window for global access
if (typeof window !== 'undefined') {
  window.gridOS = gridOS;
  window.activateAutonomousMode = () => gridOS.activateAutonomousMode();
  window.triggerReaction = (type, options) => gridOS.triggerReaction(type, options);
}
