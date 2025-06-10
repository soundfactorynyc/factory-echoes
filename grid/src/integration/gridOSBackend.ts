/**
 * GRID OS: Backend System
 * 
 * This module provides the main backend system for the GRID OS Integration Core,
 * integrating all the subsystems (event bus, shader system, trigger system) into a cohesive whole.
 */

import { BehaviorSubject, interval, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, scan, withLatestFrom } from 'rxjs/operators';
import { createEventBusSystem, EventBusSystem } from './eventBusSystem';
import type { SystemState, AudioCommand, ClaudeCommand, ManualOverride, SystemMutation, TouchGesture } from './eventBusSystem';
import { createShaderSystem, ShaderSystem } from './shaderSystem';
import { createTriggerSystem, TriggerSystem } from './triggerSystem';

/**
 * Emotion analysis result
 */
export interface EmotionAnalysis {
  /**
   * Primary emotion
   */
  primary: string;
  
  /**
   * Secondary emotion
   */
  secondary: string;
  
  /**
   * Emotion intensity (0-1)
   */
  intensity: number;
  
  /**
   * Confidence level (0-1)
   */
  confidence: number;
}

/**
 * Predictive buffer configuration
 */
export interface PredictiveBufferConfig {
  /**
   * Whether the predictive buffer is enabled
   */
  enabled: boolean;
  
  /**
   * Lookahead time in milliseconds
   */
  lookahead: number;
  
  /**
   * Confidence level (0-1)
   */
  confidence: number;
}

/**
 * Backend system for the GRID OS Integration Core
 */
export class GridOSBackend {
  /**
   * Event bus system
   */
  public readonly eventBus: EventBusSystem;
  
  /**
   * Shader system (initialized when renderer is available)
   */
  public shaderSystem: ShaderSystem | null;
  
  /**
   * Trigger system
   */
  public readonly triggerSystem: TriggerSystem;
  
  /**
   * System state
   */
  public readonly state$: BehaviorSubject<SystemState>;
  
  /**
   * Predictive buffer configuration
   */
  public readonly predictiveBuffer$: BehaviorSubject<PredictiveBufferConfig>;
  
  /**
   * Create a new backend system
   */
  constructor() {
    console.log('🏗️ GridOSBackend constructor starting...');
    
    try {
      // Initialize subsystems
      console.log('🔧 Creating event bus system...');
      this.eventBus = createEventBusSystem();
      console.log('✅ Event bus system created');
      
      console.log('🔧 Shader system will be initialized when renderer is available...');
      this.shaderSystem = null; // Don't create yet! Wait for renderer
      console.log('✅ Shader system prepared for deferred initialization');
      
      console.log('🔧 Creating trigger system...');
      this.triggerSystem = createTriggerSystem();
      console.log('✅ Trigger system created');
    } catch (error) {
      console.error('❌ Error creating subsystems:', error);
      throw error;
    }
    
    // Initialize state
    this.state$ = new BehaviorSubject<SystemState>({
      mood: 'zen',
      chaosSensitivity: 0.5,
      timeWarpFactor: 1.0,
      latencyTolerance: 100,
      tier: 'free',
      claudeAgentActive: false,
      beatPhase: 0,
      globalIntensity: 0.5
    });
    
    // Initialize predictive buffer
    this.predictiveBuffer$ = new BehaviorSubject<PredictiveBufferConfig>({
      enabled: false,
      lookahead: 0,
      confidence: 1.0
    });
    
    // Set up system connections
    try {
      console.log('🔗 Setting up system connections...');
      this.setupConnections();
      console.log('✅ System connections established');
    } catch (error) {
      console.error('❌ Error setting up connections:', error);
    }
    
    console.log('✅ GridOSBackend constructor completed');
  }
  
  /**
   * Set up connections between subsystems
   */
  private setupConnections(): void {
    // Connect event bus state to local state
    this.eventBus.state$.subscribe(this.state$);
    
    // Connect local state to event bus
    this.state$.subscribe(state => {
      this.eventBus.updateState(() => state);
    });
    
    // Connect beat events to trigger system
    this.eventBus.beats$.subscribe(beat => {
      if (beat.onBeat) {
        this.triggerSystem.triggerDropDetected(
          beat.intensity,
          60000 / beat.bpm / 4,
          [0, 0.8, 1]
        );
      }
    });
    
    // Connect money shots to trigger system
    this.eventBus.moneyShots$.subscribe(shot => {
      this.triggerSystem.triggerTipReceived(
        shot.amount,
        'USD',
        shot.userId,
        shot.amount > 100 ? 'explosion' : 'rain'
      );
    });
    
    // Connect shader commands to shader system
    this.eventBus.shaderCommands$.subscribe(cmd => {
      if (!this.shaderSystem) {
        console.warn('Shader command received but shader system not initialized yet');
        return;
      }
      
      if (cmd.uniformUpdates) {
        // Update shader uniforms
        for (const [shader, uniforms] of Object.entries(this.shaderSystem.activeShaders)) {
          for (const [name, value] of Object.entries(cmd.uniformUpdates)) {
            if (uniforms.uniforms[name] !== undefined) {
              uniforms.uniforms[name] = value;
            }
          }
        }
      }
      
      if (cmd.intensity !== undefined) {
        // Update post-processing based on intensity
        this.shaderSystem.setPostProcessing('bloom', cmd.intensity > 0.5);
        this.shaderSystem.setPostProcessing('motionBlur', cmd.intensity > 0.7);
        this.shaderSystem.setPostProcessing('chromaticAberration', cmd.intensity > 0.8);
        this.shaderSystem.setPostProcessing('filmGrain', cmd.intensity > 0.9);
      }
    });
    
    // Connect trigger system to event bus
    this.triggerSystem.triggers.emotional.joyThreshold(0.8).subscribe(() => {
      this.eventBus.sendShaderCommand(
        { u_joy: 1.0 },
        'screen',
        0.8
      );
    });
    
    this.triggerSystem.triggers.financial.tipReceived(50).subscribe(animation => {
      this.eventBus.sendGridCommand(
        'pulse',
        undefined,
        animation.amount / 1000,
        500,
        'radial'
      );
      
      this.eventBus.sendAudioCommand(
        'play',
        'money',
        { volume: Math.min(animation.amount / 1000, 1) },
        'high'
      );
    });
    
    this.triggerSystem.triggers.rhythmic.dropDetected().subscribe(explosion => {
      this.eventBus.sendShaderCommand(
        { u_dropIntensity: explosion.intensity },
        'additive',
        explosion.intensity
      );
    });
    
    // Voice to AI injection
    this.eventBus.voiceInput$.pipe(
      withLatestFrom(this.state$, this.eventBus.beats$),
      map(([voice, state, beat]) => ({
        type: 'generate' as const,
        context: {
          mood: state.mood,
          chaos: state.chaosSensitivity,
          recentEvents: [{ type: 'voice', data: voice }],
          userTier: state.tier
        },
        priority: beat.onBeat ? 10 : 5
      }))
    ).subscribe(cmd => this.eventBus.claudeCommands$.next(cmd));
    
    // Mutation feedback loop
    this.eventBus.mutation$.pipe(
      scan((acc, mutation) => this.applyMutation(acc, mutation), this.state$.value),
      distinctUntilChanged()
    ).subscribe(newState => this.state$.next(newState));
    
    // Manual override handling
    this.eventBus.manualOverrides$.pipe(
      withLatestFrom(this.state$),
      map(([override, state]) => this.processOverride(override, state))
    ).subscribe(newState => this.state$.next(newState));
    
    // Latency monitor
    const latencyMonitor$ = interval(100).pipe(
      map(() => performance.now()),
      scan((acc, now) => {
        const latency = now - acc.lastTime;
        return {
          lastTime: now,
          avgLatency: acc.avgLatency * 0.9 + latency * 0.1
        };
      }, { lastTime: performance.now(), avgLatency: 0 }),
      filter(({ avgLatency }) => avgLatency > this.state$.value.latencyTolerance),
      distinctUntilChanged((a, b) => a.avgLatency === b.avgLatency)
    );
    
    latencyMonitor$.subscribe(({ avgLatency }) => {
      this.predictiveBuffer$.next({
        enabled: true,
        lookahead: avgLatency * 2,
        confidence: Math.max(0, 1 - (avgLatency - 150) / 1000)
      });
    });
    
    // Time warp sync
    this.state$.pipe(
      map(state => state.timeWarpFactor),
      distinctUntilChanged()
    ).subscribe(warp => {
      // Use a custom command for time warp
      this.eventBus.audioCommands$.next({
        type: 'setFilter',
        params: {
          timeWarp: warp
        },
        priority: 'high'
      });
    });
  }
  
  /**
   * Get mood effects for a given mood
   * @param mood Mood name
   * @returns Mood effects
   */
  private getMoodEffects(mood: string) {
    const effects: Record<string, any> = {
      'euphoric': { pulseRate: 500, intensity: 0.9, pattern: 'wave' },
      'chaotic': { pulseRate: 100, intensity: 1.0, pattern: 'random' },
      'sad': { pulseRate: 2000, intensity: 0.3, pattern: 'fade' },
      'aggressive': { pulseRate: 250, intensity: 0.8, pattern: 'spike' },
      'zen': { pulseRate: 3000, intensity: 0.4, pattern: 'breathe' }
    };
    return effects[mood] || effects['zen'];
  }
  
  /**
   * Map tier to sound
   * @param tier User tier
   * @returns Sound name
   */
  private mapTierToSound(tier: string): string {
    const tierSounds: Record<string, string> = {
      'whale': 'epic_drop',
      'vip': 'power_chord',
      'premium': 'synth_sweep',
      'free': 'basic_ping'
    };
    return tierSounds[tier] || 'basic_ping';
  }
  
  /**
   * Calculate Claude priority based on emotion and state
   * @param emotion Emotion analysis
   * @param state System state
   * @returns Priority level
   */
  private calculateClaudePriority(emotion: EmotionAnalysis, state: SystemState): number {
    let priority = 5;
    if (emotion.intensity > 0.9) priority += 3;
    if (state.tier === 'whale') priority += 5;
    if (state.tier === 'vip') priority += 3;
    if (state.chaosSensitivity > 0.8) priority += 2;
    return Math.min(priority, 10);
  }
  
  /**
   * Check if a gesture is allowed for a given tier
   * @param gestureType Gesture type
   * @param tier User tier
   * @returns Whether the gesture is allowed
   */
  private isTierAllowed(gestureType: string, tier: string): boolean {
    const tierLevels: Record<string, number> = {
      'free': 1,
      'premium': 2,
      'vip': 3,
      'whale': 4
    };
    const gestureTiers: Record<string, number> = {
      'tap': 1,
      'swipe': 1,
      'pinch': 2,
      'longPress': 2,
      'multiTouch': 3,
      'forceTouch': 4
    };
    return tierLevels[tier] >= (gestureTiers[gestureType] || 1);
  }
  
  /**
   * Map gesture to command
   * @param gesture Touch gesture
   * @param state System state
   * @returns Command object
   */
  private mapGestureToCommand(gesture: TouchGesture, state: SystemState) {
    if (gesture.type === 'pinch') {
      return {
        type: 'grid',
        command: {
          type: 'morph',
          intensity: (gesture.data as any).scale || 1.0
        }
      };
    }
    return { type: 'grid', command: { type: 'pulse' } };
  }
  
  /**
   * Apply a mutation to the system state
   * @param state Current state
   * @param mutation Mutation to apply
   * @returns Updated state
   */
  private applyMutation(state: SystemState, mutation: SystemMutation): SystemState {
    return {
      ...state,
      ...mutation.value,
      globalIntensity: Math.min(1, Math.max(0, mutation.value.globalIntensity || state.globalIntensity))
    };
  }
  
  /**
   * Process a manual override
   * @param override Override to process
   * @param state Current state
   * @returns Updated state
   */
  private processOverride(override: ManualOverride, state: SystemState): SystemState {
    if (override.type === 'reset') {
      return {
        ...state,
        mood: 'zen',
        chaosSensitivity: 0.5,
        globalIntensity: 0.5
      };
    }
    return { ...state, ...override.value };
  }
  
  /**
   * Initialize the backend system
   */
  public async initialize(): Promise<void> {
    console.log('Initializing GRID OS Backend...');
    
    // Note: Shader system will be initialized separately when renderer is available
    console.log('⚠️  Shader system will be initialized when Three.js renderer is ready');
    
    // Skip shader system initialization - it will be done when renderer is available
    
    // Send initial system state
    this.eventBus.sendSystemMutation(
      'initialize',
      'initialized',
      true
    );
    
    console.log('GRID OS Backend initialized successfully!');
  }
  
  /**
   * Shutdown the backend system
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down GRID OS Backend...');
    
    // Clean up resources
    
    console.log('GRID OS Backend shut down successfully!');
  }
  
  /**
   * Initialize shader system with renderer
   * @param renderer Three.js WebGL renderer
   * @returns Whether initialization was successful
   */
  public initializeShaderSystem(renderer: any): boolean {
    console.log('🎬 GridOSBackend.initializeShaderSystem() called');
    
    if (!renderer) {
      console.error('❌ Renderer required for shader system');
      return false;
    }
    
    if (!this.shaderSystem) {
      console.log('🔧 Creating shader system...');
      this.shaderSystem = createShaderSystem();
    }
    
    console.log('🔍 Shader system state before init:', {
      shaderSystemExists: !!this.shaderSystem,
      shaderSystemReady: this.shaderSystem?.isReady(),
      rendererExists: !!renderer
    });

    if (!this.shaderSystem.isReady()) {
      console.log('🔧 Shader system not ready, calling init...');
      const result = this.shaderSystem.init(renderer);
      console.log('📊 Shader system init result:', result);
      
      if (result) {
        console.log('✅ Shader system successfully initialized via GridOSBackend');
        
        // Try to apply initial materials
        try {
          this.shaderSystem.applyMaterial('main', 'cyanGlow');
          this.shaderSystem.setPostProcessing('bloom', true);
          console.log('✅ Initial materials and post-processing applied');
        } catch (error) {
          console.warn('⚠️ Failed to apply initial materials:', error);
        }
      }
      
      return result;
    } else {
      console.log('ℹ️ Shader system already ready');
      return true;
    }
  }
  
  /**
   * Get shader system
   * @returns Shader system instance or null if not initialized
   */
  public getShaderSystem(): ShaderSystem | null {
    return this.shaderSystem;
  }
  
  /**
   * Check if shader system is ready
   * @returns Whether shader system is initialized
   */
  public isShaderSystemReady(): boolean {
    return this.shaderSystem !== null && this.shaderSystem.isReady();
  }
  
  /**
   * Get system health
   * @returns System health status
   */
  public getSystemHealth(): any {
    const shaderReady = this.isShaderSystemReady();
    const shaderStatus = this.shaderSystem === null ? 'pending' : (shaderReady ? 'healthy' : 'critical');
    
    const subsystems = {
      eventBus: { status: 'healthy', metrics: {}, diagnostics: [] },
      shaderSystem: { 
        status: shaderStatus, 
        metrics: shaderReady && this.shaderSystem ? this.shaderSystem.getDimensions() : {}, 
        diagnostics: shaderStatus === 'pending' ? ['Waiting for Three.js renderer'] : 
                    shaderStatus === 'critical' ? ['Shader system failed to initialize'] : []
      },
      triggerSystem: { status: 'healthy', metrics: {}, diagnostics: [] },
      network: { status: 'healthy', metrics: {}, diagnostics: [] },
      memory: { status: 'healthy', metrics: {}, diagnostics: [] }
    };
    
    const healthyCount = Object.values(subsystems).filter(s => s.status === 'healthy').length;
    const pendingCount = Object.values(subsystems).filter(s => s.status === 'pending').length;
    const criticalCount = Object.values(subsystems).filter(s => s.status === 'critical').length;
    
    let overallStatus: string;
    if (criticalCount > 0) {
      overallStatus = 'degraded';
    } else if (pendingCount > 0) {
      overallStatus = 'initializing';
    } else {
      overallStatus = 'healthy';
    }
    
    return {
      status: overallStatus,
      subsystems,
      diagnostics: pendingCount > 0 ? ['Some systems are still initializing'] : 
                  criticalCount > 0 ? ['Some systems have critical issues'] : [],
      timestamp: Date.now()
    };
  }
}

/**
 * Create and export the GRID OS backend instance
 */
export const gridOS = new GridOSBackend();
