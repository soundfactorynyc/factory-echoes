/**
 * Sound Factory Platform
 * 
 * A unified container that manages all Sound Factory components and systems.
 * This class serves as the main integration point for the Sound Factory platform
 * with the GRID OS and Owncast tip handler.
 */

import { gridOS } from './gridOSBackend.js';
import { gridIntegration } from './gridIntegration.js';

/**
 * Virtual Drinks System
 * Manages virtual drink interactions in the platform
 */
class VirtualDrinksSystem {
  constructor() {
    this.drinks = [];
    this.activeDrink = null;
    this.initialized = false;
  }
  
  initialize() {
    console.log('🍹 Initializing Virtual Drinks System...');
    this.initialized = true;
    return true;
  }
  
  createDrink(type, options = {}) {
    const drink = {
      id: `drink_${Date.now()}`,
      type,
      createdAt: Date.now(),
      options,
      status: 'created'
    };
    
    this.drinks.push(drink);
    console.log(`🍹 Created new ${type} drink`);
    return drink;
  }
  
  serveDrink(drinkId) {
    const drink = this.drinks.find(d => d.id === drinkId);
    if (!drink) return false;
    
    drink.status = 'served';
    this.activeDrink = drink;
    
    // Emit event to GRID OS
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('drink-served', drink);
    }
    
    console.log(`🍹 Served ${drink.type} drink`);
    return true;
  }
}

/**
 * Producer Support System
 * Provides tools and features for producers
 */
class ProducerSupportSystem {
  constructor() {
    this.scenes = [];
    this.activeScene = null;
    this.initialized = false;
  }
  
  initialize() {
    console.log('🎬 Initializing Producer Support System...');
    this.initialized = true;
    return true;
  }
  
  createScene(name, elements = []) {
    const scene = {
      id: `scene_${Date.now()}`,
      name,
      elements,
      createdAt: Date.now()
    };
    
    this.scenes.push(scene);
    console.log(`🎬 Created new scene: ${name}`);
    return scene;
  }
  
  activateScene(sceneId) {
    const scene = this.scenes.find(s => s.id === sceneId);
    if (!scene) return false;
    
    this.activeScene = scene;
    
    // Emit event to GRID OS
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('scene-activated', scene);
    }
    
    console.log(`🎬 Activated scene: ${scene.name}`);
    return true;
  }
}

/**
 * Haptic Bass System
 * Manages haptic feedback based on audio bass
 */
class HapticBassSystem {
  constructor() {
    this.intensity = 0.5;
    this.enabled = false;
    this.initialized = false;
  }
  
  initialize() {
    console.log('🔊 Initializing Haptic Bass System...');
    this.initialized = true;
    return true;
  }
  
  enable() {
    this.enabled = true;
    console.log('🔊 Haptic Bass System enabled');
    return true;
  }
  
  disable() {
    this.enabled = false;
    console.log('🔊 Haptic Bass System disabled');
    return true;
  }
  
  setIntensity(value) {
    this.intensity = Math.max(0, Math.min(1, value));
    console.log(`🔊 Haptic intensity set to ${this.intensity}`);
    
    // Emit event to GRID OS
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('haptic-intensity-changed', { intensity: this.intensity });
    }
    
    return true;
  }
}

/**
 * Liquid Sampler System
 * Manages audio sampling and liquid visualization
 */
class LiquidSamplerSystem {
  constructor() {
    this.samples = [];
    this.activeSample = null;
    this.initialized = false;
  }
  
  initialize() {
    console.log('💧 Initializing Liquid Sampler System...');
    this.initialized = true;
    return true;
  }
  
  createSample(source, options = {}) {
    const sample = {
      id: `sample_${Date.now()}`,
      source,
      createdAt: Date.now(),
      options,
      status: 'created'
    };
    
    this.samples.push(sample);
    console.log(`💧 Created new sample from ${source}`);
    return sample;
  }
  
  activateSample(sampleId) {
    const sample = this.samples.find(s => s.id === sampleId);
    if (!sample) return false;
    
    this.activeSample = sample;
    sample.status = 'active';
    
    // Emit event to GRID OS
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('sample-activated', sample);
    }
    
    console.log(`💧 Activated sample: ${sample.id}`);
    return true;
  }
}

/**
 * TikTok Clip System
 * Manages clip creation and sharing to TikTok
 */
class TikTokClipSystem {
  constructor() {
    this.clips = [];
    this.recording = false;
    this.initialized = false;
  }
  
  initialize() {
    console.log('📱 Initializing TikTok Clip System...');
    this.initialized = true;
    return true;
  }
  
  startRecording(options = {}) {
    if (this.recording) return false;
    
    this.recording = true;
    this.currentClip = {
      id: `clip_${Date.now()}`,
      startTime: Date.now(),
      options,
      status: 'recording'
    };
    
    // Emit event to GRID OS
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('clip-recording-started', this.currentClip);
    }
    
    console.log('📱 Started recording clip');
    return true;
  }
  
  stopRecording() {
    if (!this.recording) return false;
    
    this.recording = false;
    this.currentClip.endTime = Date.now();
    this.currentClip.duration = this.currentClip.endTime - this.currentClip.startTime;
    this.currentClip.status = 'recorded';
    
    this.clips.push(this.currentClip);
    
    // Emit event to GRID OS
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('clip-recording-stopped', this.currentClip);
    }
    
    console.log(`📱 Stopped recording clip (${this.currentClip.duration}ms)`);
    return this.currentClip;
  }
  
  shareClip(clipId, platform = 'tiktok') {
    const clip = this.clips.find(c => c.id === clipId);
    if (!clip) return false;
    
    clip.shared = true;
    clip.sharedTo = platform;
    clip.sharedAt = Date.now();
    
    // Emit event to GRID OS
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit('clip-shared', { clip, platform });
    }
    
    console.log(`📱 Shared clip to ${platform}`);
    return true;
  }
}

/**
 * Legendary Social Sharing
 * Manages social media sharing and interactions
 */
class LegendarySocialSharing {
  constructor() {
    this.platforms = ['twitter', 'instagram', 'tiktok', 'twitch'];
    this.shares = [];
    this.initialized = false;
  }
  
  initialize() {
    console.log('🌐 Initializing Legendary Social Sharing...');
    this.initialized = true;
    return true;
  }
  
  shareContent(content, platforms = ['twitter']) {
    const share = {
      id: `share_${Date.now()}`,
      content,
      platforms,
      timestamp: Date.now(),
      status: 'pending'
    };
    
    this.shares.push(share);
    
    // Process the share (simulate API calls)
    setTimeout(() => {
      share.status = 'completed';
      
      // Emit event to GRID OS
      if (gridOS?.eventBus) {
        gridOS.eventBus.emit('content-shared', share);
      }
      
      console.log(`🌐 Shared content to: ${platforms.join(', ')}`);
    }, 1500);
    
    return share;
  }
  
  getShareStats(shareId) {
    const share = this.shares.find(s => s.id === shareId);
    if (!share) return null;
    
    // Simulate stats
    return {
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 20),
      comments: Math.floor(Math.random() * 50)
    };
  }
}

/**
 * Sound Factory Platform
 * Main container class that manages all components and systems
 */
class SoundFactoryPlatform {
  constructor() {
    // Main layout areas
    this.layout = {
      mainFeed: document.querySelector('.main-feed'),
      chatSection: document.querySelector('.chat-section'),
      streamWindow: null, // Draggable
      gridOverlay: null   // 30 components
    };
    
    // Initialize all systems
    this.systems = {
      drinks: new VirtualDrinksSystem(),
      producer: new ProducerSupportSystem(),
      haptic: new HapticBassSystem(),
      sampler: new LiquidSamplerSystem(),
      clips: new TikTokClipSystem(),
      social: new LegendarySocialSharing()
    };
    
    // Integration with GRID OS
    this.gridOS = gridOS;
    this.gridIntegration = gridIntegration;
    
    // Tip handler integration
    this.tipHandlerInitialized = false;
    this.tipStats = {
      totalTips: 0,
      lastTip: 0,
      topTipper: '',
      goalProgress: 0,
      goal: 1000
    };
    
    this.initialized = false;
  }
  
  /**
   * Initialize the Sound Factory Platform
   */
  async initialize() {
    if (this.initialized) {
      console.log('Sound Factory Platform already initialized');
      return;
    }
    
    console.log('🎛️ Initializing Sound Factory Platform...');
    
    // Initialize GRID OS if available
    if (this.gridOS) {
      await this.gridOS.initialize();
      console.log('✅ GRID OS initialized');
    }
    
    // Initialize GRID Integration if available
    if (this.gridIntegration) {
      await this.gridIntegration.initialize();
      console.log('✅ GRID Integration initialized');
    }
    
    // Initialize all systems
    for (const [name, system] of Object.entries(this.systems)) {
      if (system.initialize) {
        await system.initialize();
        console.log(`✅ ${name} system initialized`);
      }
    }
    
    // Initialize tip handler
    this.initializeTipHandler();
    
    // Set up event listeners
    this.setupEventListeners();
    
    this.initialized = true;
    console.log('✅ Sound Factory Platform initialized successfully');
    
    return true;
  }
  
  /**
   * Initialize the tip handler
   */
  initializeTipHandler() {
    if (this.tipHandlerInitialized) return;
    
    // Create Owncast bridge if it doesn't exist
    if (!window.owncast) {
      window.owncast = {
        on: (eventType, callback) => {
          console.log(`Registered handler for Owncast ${eventType} events`);
          window.addEventListener(`owncast-${eventType}`, (event) => {
            callback(event.detail);
          });
        },
        emit: (eventType, data) => {
          const event = new CustomEvent(`owncast-${eventType}`, { detail: data });
          window.dispatchEvent(event);
        }
      };
    }
    
    // Set up tip event handler
    window.owncast.on('tip', (tip) => {
      console.log(`💰 Tip received: $${tip.amount} from ${tip.userName}`);
      
      // Update tip stats
      this.tipStats = {
        ...this.tipStats,
        lastTip: tip.amount,
        totalTips: this.tipStats.totalTips + tip.amount,
        goalProgress: Math.min((this.tipStats.totalTips + tip.amount) / this.tipStats.goal * 100, 100),
        topTipper: tip.amount > this.tipStats.lastTip ? tip.userName : this.tipStats.topTipper
      };
      
      // Emit tip event to GRID OS
      if (this.gridOS?.eventBus) {
        this.gridOS.eventBus.emit('tip-received', {
          ...tip,
          tipStats: this.tipStats
        });
      }
      
      // Trigger special effects based on tip amount
      this.handleTipEffects(tip);
    });
    
    this.tipHandlerInitialized = true;
    console.log('💰 Tip handler initialized');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for GRID OS events
    if (this.gridOS?.eventBus) {
      // Listen for mode changes
      this.gridOS.eventBus.on('mode-change', (data) => {
        console.log(`🔄 Mode changed to: ${data.mode}`);
        
        if (data.mode === 'autonomous') {
          // Handle autonomous mode
          console.log('🤖 Autonomous mode activated');
        }
      });
      
      // Listen for reactions
      this.gridOS.eventBus.on('reaction', (data) => {
        console.log(`🎭 Reaction triggered: ${data.type}`);
        this.handleReaction(data);
      });
    }
  }
  
  /**
   * Handle tip effects based on tip amount
   * @param {Object} tip Tip data
   */
  handleTipEffects(tip) {
    // Determine effect based on tip amount
    if (tip.amount >= 100) {
      // Major effect for big tips
      if (this.gridOS) {
        this.gridOS.triggerReaction('fire', { intensity: 1.0, duration: 5000 });
      }
      
      // Create a virtual drink
      if (this.systems.drinks) {
        const drink = this.systems.drinks.createDrink('legendary', { tipper: tip.userName });
        this.systems.drinks.serveDrink(drink.id);
      }
      
      // Change mood
      if (this.gridOS?.eventBus) {
        this.gridOS.eventBus.emit('moodChange', { mood: 'party' });
      }
    } else if (tip.amount >= 50) {
      // Medium effect
      if (this.gridOS) {
        this.gridOS.triggerReaction('water', { intensity: 0.8, duration: 3000 });
      }
      
      // Create a virtual drink
      if (this.systems.drinks) {
        const drink = this.systems.drinks.createDrink('premium', { tipper: tip.userName });
        this.systems.drinks.serveDrink(drink.id);
      }
    } else if (tip.amount >= 20) {
      // Small effect
      if (this.gridOS) {
        this.gridOS.triggerReaction('earth', { intensity: 0.6, duration: 2000 });
      }
    } else {
      // Minimal effect
      if (this.gridOS) {
        this.gridOS.triggerReaction('air', { intensity: 0.4, duration: 1000 });
      }
    }
  }
  
  /**
   * Handle reaction effects
   * @param {Object} reaction Reaction data
   */
  handleReaction(reaction) {
    // Apply reaction effects to the platform
    switch (reaction.type) {
      case 'fire':
        // Fire effect
        if (this.systems.haptic) {
          this.systems.haptic.setIntensity(reaction.intensity || 0.8);
          this.systems.haptic.enable();
        }
        break;
        
      case 'water':
        // Water effect
        if (this.systems.sampler) {
          const sample = this.systems.sampler.createSample('water', { intensity: reaction.intensity || 0.8 });
          this.systems.sampler.activateSample(sample.id);
        }
        break;
        
      case 'party':
        // Party mode
        if (this.systems.producer) {
          const scene = this.systems.producer.createScene('party', [
            { type: 'lights', color: 'rainbow', intensity: reaction.intensity || 0.8 },
            { type: 'particles', style: 'confetti', intensity: reaction.intensity || 0.8 }
          ]);
          this.systems.producer.activateScene(scene.id);
        }
        break;
        
      case 'chill':
        // Chill mode
        if (this.systems.producer) {
          const scene = this.systems.producer.createScene('chill', [
            { type: 'lights', color: 'blue', intensity: reaction.intensity || 0.5 },
            { type: 'fog', density: reaction.intensity || 0.5 }
          ]);
          this.systems.producer.activateScene(scene.id);
        }
        break;
        
      default:
        console.log(`Unknown reaction type: ${reaction.type}`);
    }
    
    // Disable effects after duration
    if (reaction.duration) {
      setTimeout(() => {
        // Disable haptic
        if (this.systems.haptic && this.systems.haptic.enabled) {
          this.systems.haptic.disable();
        }
      }, reaction.duration);
    }
  }
  
  /**
   * Get tip stats
   * @returns {Object} Tip statistics
   */
  getTipStats() {
    return this.tipStats;
  }
  
  /**
   * Set tip goal
   * @param {number} goal Goal amount
   */
  setTipGoal(goal) {
    if (isNaN(goal) || goal <= 0) return false;
    
    this.tipStats.goal = goal;
    this.tipStats.goalProgress = Math.min((this.tipStats.totalTips / goal) * 100, 100);
    
    console.log(`💰 Tip goal set to $${goal}`);
    return true;
  }
  
  /**
   * Reset tip stats
   */
  resetTipStats() {
    this.tipStats = {
      totalTips: 0,
      lastTip: 0,
      topTipper: '',
      goalProgress: 0,
      goal: this.tipStats.goal || 1000
    };
    
    console.log('💰 Tip stats reset');
    return true;
  }
  
  /**
   * Simulate a tip (for testing)
   * @param {number} amount Tip amount
   * @param {string} userName User name
   * @param {string} message Tip message
   */
  simulateTip(amount = 25, userName = 'TestUser', message = 'Test tip') {
    if (window.owncast) {
      window.owncast.emit('tip', {
        amount,
        userName,
        message,
        timestamp: Date.now()
      });
      
      console.log(`💰 Simulated tip: $${amount} from ${userName}`);
      return true;
    }
    
    console.log('❌ Owncast bridge not initialized');
    return false;
  }
}

// Create singleton instance
export const soundFactoryPlatform = new SoundFactoryPlatform();

// Add to window for global access
if (typeof window !== 'undefined') {
  window.soundFactoryPlatform = soundFactoryPlatform;
}
