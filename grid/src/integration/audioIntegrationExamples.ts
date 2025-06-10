/**
 * GRID OS Audio Integration Usage Example
 * 
 * This example demonstrates how to integrate real-time audio analysis and beat detection
 * with the GRID OS event bus system for creating reactive visual experiences.
 */

import { createGridOSBackend } from './gridOSBackend';
import type { AudioAnalyzerConfig } from './audioAnalyzer';
import type { BeatEvent, AudioData, SystemEvent, BeatPredictionEvent } from '../types/integration';

/**
 * Example: DJ Controller Application
 * 
 * This example shows how to create a DJ controller application that responds to
 * real-time audio input with synchronized visual effects.
 */
class DJControllerExample {
  private gridOS: any;
  private isActive = false;
  private currentTrack = {
    bpm: 128,
    key: 'Am',
    intensity: 0.5,
    genre: 'house'
  };

  constructor() {
    // Configure audio analyzer for DJ use case
    const djAudioConfig: Partial<AudioAnalyzerConfig> = {
      fftSize: 4096, // Higher resolution for better frequency analysis
      smoothingTimeConstant: 0.85, // Smooth transitions
      beatThreshold: 0.25, // Sensitive beat detection
      minBeatInterval: 250, // Allow up to 240 BPM
      bpmWindowSize: 8, // 8 second BPM calculation window
      updateInterval: 16 // 60fps updates for smooth visuals
    };

    // Initialize GRID OS with DJ configuration
    this.gridOS = createGridOSBackend(djAudioConfig);
    
    this.setupDJEventHandlers();
  }

  /**
   * Start the DJ controller
   */
  public async start(): Promise<void> {
    try {
      console.log('🎧 Starting DJ Controller...');
      
      // Request microphone access and start audio analysis
      await this.gridOS.startAudioAnalysis();
      
      this.isActive = true;
      console.log('🎵 DJ Controller active - mix some beats!');
      
      // Set up initial visual state
      this.setupInitialVisuals();
      
    } catch (error) {
      console.error('❌ Failed to start DJ Controller:', error);
      throw error;
    }
  }

  /**
   * Stop the DJ controller
   */
  public stop(): void {
    if (this.isActive) {
      this.gridOS.stopAudioAnalysis();
      this.isActive = false;
      console.log('⏹️ DJ Controller stopped');
    }
  }

  /**
   * Set up DJ-specific event handlers
   */
  private setupDJEventHandlers(): void {
    // Beat Detection - Trigger visual drops and effects
    this.gridOS.eventBus.beats$.subscribe((beat: BeatEvent) => {
      this.handleBeatEvent(beat);
    });

    // Beat Prediction - Prepare upcoming visual effects
    this.gridOS.eventBus.beatPrediction$.subscribe((prediction: BeatPredictionEvent) => {
      this.handleBeatPrediction(prediction);
    });

    // Audio Data - Real-time frequency analysis
    this.gridOS.eventBus.audioData$.subscribe((audioData: AudioData) => {
      this.handleAudioData(audioData);
    });

    // System State Changes - Monitor mood and energy
    this.gridOS.eventBus.state$.subscribe((state: any) => {
      this.handleSystemStateChange(state);
    });
  }

  /**
   * Handle beat events for DJ drops and sync
   */
  private handleBeatEvent(beat: BeatEvent): void {
    console.log(`🥁 Beat: ${beat.bpm} BPM | Intensity: ${beat.intensity.toFixed(2)} | Phase: ${beat.phase.toFixed(2)}`);
    
    // Update track BPM
    this.currentTrack.bpm = beat.bpm;

    // Trigger visual effects based on beat intensity
    if (beat.intensity > 0.8) {
      // High energy drop
      this.triggerDrop('massive', beat);
    } else if (beat.intensity > 0.6) {
      // Medium energy hit
      this.triggerDrop('heavy', beat);
    } else if (beat.intensity > 0.3) {
      // Regular beat
      this.triggerDrop('regular', beat);
    }

    // Sync strobes and effects to beat phase
    this.syncStrobeToPhase(beat.phase);
  }

  /**
   * Handle beat predictions for pre-loading effects
   */
  private handleBeatPrediction(prediction: BeatPredictionEvent): void {
    console.log(`🔮 Next beat in ${(prediction.timeUntilNextBeat * 1000).toFixed(0)}ms | Confidence: ${(prediction.confidence * 100).toFixed(0)}%`);
    
    // Pre-load visual effects based on prediction
    prediction.futurePredictions.forEach((futureBeat, index) => {
      if (futureBeat.intensity > 0.7) {
        // Prepare for upcoming high-energy moment
        this.preloadEffect('explosion', futureBeat.time);
      }
    });

    // Adjust tempo-based effects
    this.adjustTempoEffects(prediction.bpm);
  }

  /**
   * Handle real-time audio data for spectrum analysis
   */
  private handleAudioData(audioData: AudioData): void {
    // Analyze frequency spectrum
    const spectrum = this.analyzeFrequencySpectrum(audioData.frequencyData);
    
    // Update visual equalizer
    this.updateVisualEqualizer(spectrum);
    
    // Detect transitions and breakdowns
    this.detectMusicTransitions(spectrum);
  }

  /**
   * Handle system state changes
   */
  private handleSystemStateChange(state: any): void {
    if (state.mood !== this.currentTrack.genre) {
      console.log(`🎭 Mood change detected: ${state.mood}`);
      this.adaptVisualsToMood(state.mood);
    }

    if (state.globalIntensity !== this.currentTrack.intensity) {
      this.currentTrack.intensity = state.globalIntensity;
      this.adjustGlobalIntensity(state.globalIntensity);
    }
  }

  /**
   * Trigger visual drops based on intensity
   */
  private triggerDrop(type: 'regular' | 'heavy' | 'massive', beat: BeatEvent): void {
    const effects = {
      regular: {
        color: '#00ffff',
        duration: 100,
        size: 0.5,
        shader: 'pulse'
      },
      heavy: {
        color: '#ff0080',
        duration: 200,
        size: 0.8,
        shader: 'explosion'
      },
      massive: {
        color: '#ffff00',
        duration: 400,
        size: 1.2,
        shader: 'supernova'
      }
    };

    const effect = effects[type];
    
    // Send shader command
    this.gridOS.eventBus.sendShaderCommand({
      u_dropIntensity: effect.size,
      u_dropColor: this.hexToRgb(effect.color),
      u_time: Date.now() / 1000
    }, effect.shader, beat.intensity);

    // Send grid command
    this.gridOS.eventBus.sendGridCommand(
      'explosion',
      undefined,
      beat.intensity,
      effect.duration,
      'radial'
    );

    console.log(`💥 ${type.toUpperCase()} drop triggered at ${beat.bpm} BPM`);
  }

  /**
   * Sync strobe effects to beat phase
   */
  private syncStrobeToPhase(phase: number): void {
    // Create strobe effect synchronized to beat phase
    const strobeIntensity = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
    
    this.gridOS.eventBus.sendShaderCommand({
      u_strobePhase: phase,
      u_strobeIntensity: strobeIntensity
    }, 'strobe', strobeIntensity);
  }

  /**
   * Analyze frequency spectrum for enhanced visual feedback
   */
  private analyzeFrequencySpectrum(frequencyData: Uint8Array): any {
    const bass = this.calculateBandEnergy(frequencyData, 0, 8);
    const mids = this.calculateBandEnergy(frequencyData, 8, 32);
    const highs = this.calculateBandEnergy(frequencyData, 32, 128);
    const presence = this.calculateBandEnergy(frequencyData, 128, 256);

    return {
      bass: bass / 255,
      mids: mids / 255,
      highs: highs / 255,
      presence: presence / 255,
      overall: (bass + mids + highs + presence) / (4 * 255)
    };
  }

  /**
   * Calculate energy in frequency band
   */
  private calculateBandEnergy(frequencyData: Uint8Array, startBin: number, endBin: number): number {
    let energy = 0;
    for (let i = startBin; i < Math.min(endBin, frequencyData.length); i++) {
      energy += frequencyData[i] * frequencyData[i];
    }
    return Math.sqrt(energy / (endBin - startBin));
  }

  /**
   * Update visual equalizer with spectrum data
   */
  private updateVisualEqualizer(spectrum: any): void {
    // Send spectrum data to shader system for EQ visualization
    this.gridOS.eventBus.sendShaderCommand({
      u_bass: spectrum.bass,
      u_mids: spectrum.mids,
      u_highs: spectrum.highs,
      u_presence: spectrum.presence
    }, 'equalizer', spectrum.overall);
  }

  /**
   * Detect music transitions and breakdowns
   */
  private detectMusicTransitions(spectrum: any): void {
    // Simple breakdown detection based on energy drop
    if (spectrum.overall < 0.2 && this.currentTrack.intensity > 0.5) {
      console.log('🎵 Breakdown detected - reducing visual intensity');
      this.triggerBreakdown();
    }
    
    // Build-up detection
    if (spectrum.overall > 0.8 && this.currentTrack.intensity < 0.7) {
      console.log('🎵 Build-up detected - preparing for drop');
      this.triggerBuildUp();
    }
  }

  /**
   * Pre-load visual effects based on timing
   */
  private preloadEffect(effectType: string, delay: number): void {
    setTimeout(() => {
      console.log(`🎬 Pre-loaded effect: ${effectType}`);
      // Pre-load shader or prepare GPU resources
    }, delay * 1000);
  }

  /**
   * Adjust tempo-based effects
   */
  private adjustTempoEffects(bpm: number): void {
    // Adjust effect timing based on BPM
    const beatInterval = 60000 / bpm; // ms per beat
    
    this.gridOS.eventBus.sendShaderCommand({
      u_beatInterval: beatInterval / 1000, // Convert to seconds
      u_bpm: bpm
    }, 'tempo', 0.7);
  }

  /**
   * Set up initial visual state
   */
  private setupInitialVisuals(): void {
    // Apply DJ-themed visual style
    this.gridOS.eventBus.sendShaderCommand({
      u_colorScheme: [1.0, 0.0, 0.5], // DJ pink
      u_ambientLevel: 0.2,
      u_contrast: 1.2
    }, 'main', 0.5);

    console.log('🎨 DJ visual theme activated');
  }

  /**
   * Adapt visuals to detected mood
   */
  private adaptVisualsToMood(mood: string): void {
    const moodColors = {
      'house': [0.0, 1.0, 1.0], // Cyan
      'techno': [1.0, 0.0, 1.0], // Magenta
      'trance': [0.5, 0.0, 1.0], // Purple
      'dubstep': [1.0, 1.0, 0.0], // Yellow
      'ambient': [0.0, 1.0, 0.5]  // Green
    };

    const color = moodColors[mood] || [1.0, 1.0, 1.0];
    
    this.gridOS.eventBus.sendShaderCommand({
      u_moodColor: color
    }, 'mood', 0.6);

    console.log(`🎭 Visual mood adapted to: ${mood}`);
  }

  /**
   * Adjust global visual intensity
   */
  private adjustGlobalIntensity(intensity: number): void {
    this.gridOS.eventBus.sendShaderCommand({
      u_globalIntensity: intensity
    }, 'global', intensity);
  }

  /**
   * Trigger breakdown visual effect
   */
  private triggerBreakdown(): void {
    this.gridOS.eventBus.sendShaderCommand({
      u_breakdown: 1.0,
      u_filterCutoff: 0.3
    }, 'breakdown', 0.3);
  }

  /**
   * Trigger build-up visual effect
   */
  private triggerBuildUp(): void {
    this.gridOS.eventBus.sendShaderCommand({
      u_buildUp: 1.0,
      u_energy: 0.8
    }, 'buildup', 0.8);
  }

  /**
   * Convert hex color to RGB array
   */
  private hexToRgb(hex: string): number[] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  }

  /**
   * Get current track info
   */
  public getTrackInfo(): any {
    return { ...this.currentTrack };
  }

  /**
   * Update track metadata
   */
  public updateTrack(track: Partial<typeof this.currentTrack>): void {
    this.currentTrack = { ...this.currentTrack, ...track };
    console.log('🎵 Track updated:', this.currentTrack);
  }
}

/**
 * Example: Live Streaming Application
 * 
 * This example shows how to integrate audio analysis with live streaming
 * for creating reactive stream overlays and effects.
 */
class LiveStreamExample {
  private gridOS: any;
  private streamMetrics = {
    viewers: 0,
    donations: 0,
    totalBits: 0,
    streamDuration: 0
  };

  constructor() {
    // Configure for streaming use case
    const streamAudioConfig: Partial<AudioAnalyzerConfig> = {
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      beatThreshold: 0.35, // Moderate sensitivity
      minBeatInterval: 300,
      bpmWindowSize: 15, // Longer window for stability
      updateInterval: 33 // 30fps for streaming optimization
    };

    this.gridOS = createGridOSBackend(streamAudioConfig);
    this.setupStreamEventHandlers();
  }

  /**
   * Start live streaming mode
   */
  public async startStream(): Promise<void> {
    try {
      console.log('📺 Starting Live Stream mode...');
      
      await this.gridOS.startAudioAnalysis();
      
      // Set up stream-optimized visuals
      this.setupStreamVisuals();
      
      console.log('🎬 Live Stream mode active!');
      
    } catch (error) {
      console.error('❌ Failed to start Live Stream mode:', error);
      throw error;
    }
  }

  /**
   * Set up streaming-specific event handlers
   */
  private setupStreamEventHandlers(): void {
    // React to beats with subtle effects suitable for streaming
    this.gridOS.eventBus.beats$.subscribe((beat: BeatEvent) => {
      this.handleStreamBeat(beat);
    });

    // Create donation-triggered effects
    this.gridOS.eventBus.moneyShots$.subscribe((donation: any) => {
      this.handleDonation(donation);
    });

    // Monitor chat for viewer engagement
    this.gridOS.eventBus.chat$.subscribe((message: any) => {
      this.handleChatMessage(message);
    });
  }

  /**
   * Handle beats with stream-appropriate effects
   */
  private handleStreamBeat(beat: BeatEvent): void {
    // Subtle visual response that won't distract from content
    if (beat.intensity > 0.6) {
      this.gridOS.eventBus.sendShaderCommand({
        u_rimLighting: beat.intensity * 0.3, // Subtle rim lighting
        u_pulseIntensity: beat.intensity * 0.2
      }, 'stream_overlay', beat.intensity * 0.5);
    }
  }

  /**
   * Handle donations with celebration effects
   */
  private handleDonation(donation: any): void {
    this.streamMetrics.donations += donation.amount;
    
    // Scale effect intensity based on donation amount
    const intensity = Math.min(donation.amount / 100, 1.0);
    
    this.gridOS.eventBus.sendShaderCommand({
      u_celebration: intensity,
      u_goldGlow: intensity * 0.8
    }, 'donation_effect', intensity);

    console.log(`💰 Donation effect: $${donation.amount} (${intensity.toFixed(2)} intensity)`);
  }

  /**
   * Handle chat messages for engagement visualization
   */
  private handleChatMessage(message: any): void {
    // Create subtle chat activity visualization
    this.gridOS.eventBus.sendShaderCommand({
      u_chatActivity: 0.1,
      u_messageEnergy: message.energy || 0.3
    }, 'chat_activity', 0.2);
  }

  /**
   * Set up stream-optimized visual effects
   */
  private setupStreamVisuals(): void {
    this.gridOS.eventBus.sendShaderCommand({
      u_streamMode: 1.0,
      u_overlayOpacity: 0.7,
      u_backgroundDim: 0.8
    }, 'stream_setup', 0.5);
  }

  /**
   * Update stream metrics
   */
  public updateStreamMetrics(metrics: Partial<typeof this.streamMetrics>): void {
    this.streamMetrics = { ...this.streamMetrics, ...metrics };
  }

  /**
   * Get current stream state
   */
  public getStreamState(): any {
    return {
      metrics: this.streamMetrics,
      audioState: this.gridOS.getAudioAnalyzerState(),
      isActive: true
    };
  }
}

/**
 * Usage Examples Export
 */
export {
  DJControllerExample,
  LiveStreamExample
};

/**
 * Quick start function for testing
 */
export async function quickStartAudioIntegration(): Promise<DJControllerExample> {
  console.log('🎵 Quick Start: GRID OS Audio Integration');
  console.log('=====================================');
  
  const djController = new DJControllerExample();
  
  try {
    await djController.start();
    
    // Set up demo controls
    (window as any).djController = djController;
    console.log('🎮 DJ Controller available at window.djController');
    console.log('🎵 Try these commands:');
    console.log('  window.djController.updateTrack({ genre: "techno", bpm: 135 })');
    console.log('  window.djController.getTrackInfo()');
    console.log('  window.djController.stop()');
    
    return djController;
    
  } catch (error) {
    console.error('❌ Quick start failed:', error);
    throw error;
  }
}

/**
 * Initialize examples when DOM is ready
 */
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      quickStartAudioIntegration().catch(console.error);
    });
  } else {
    quickStartAudioIntegration().catch(console.error);
  }
}
