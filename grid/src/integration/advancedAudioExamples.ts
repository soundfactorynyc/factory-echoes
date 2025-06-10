/**
 * GRID OS Real-Time Beat Detection: Advanced Usage Examples
 * 
 * This file demonstrates advanced usage patterns for the real-time beat detection system,
 * including integration with visual effects, music analysis, and live performance scenarios.
 */

import { createGridOSBackend } from './gridOSBackend';
import type { AudioAnalyzerConfig } from './audioAnalyzer';
import type { BeatEvent, AudioData, BeatPredictionEvent } from '../types/integration';

/**
 * Advanced Music Visualizer Example
 * Demonstrates how to create sophisticated visual effects synchronized to beats
 */
export class AdvancedMusicVisualizer {
  private gridOS: any;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private beatHistory: BeatEvent[] = [];
  private isRunning = false;

  constructor(canvasId: string, config?: Partial<AudioAnalyzerConfig>) {
    this.gridOS = createGridOSBackend(config);
    this.setupCanvas(canvasId);
    this.setupEventListeners();
  }

  private setupCanvas(canvasId: string): void {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  private setupEventListeners(): void {
    // React to beat events
    this.gridOS.eventBus.beats$.subscribe((beat: BeatEvent) => {
      this.onBeat(beat);
      this.beatHistory.push(beat);
      
      // Keep only recent beats
      if (this.beatHistory.length > 50) {
        this.beatHistory.shift();
      }
    });

    // React to audio data for real-time visualization
    this.gridOS.eventBus.audioData$.subscribe((data: AudioData) => {
      this.updateVisualization(data);
    });

    // React to beat predictions for smooth animations
    this.gridOS.eventBus.beatPredictions$.subscribe((prediction: BeatPredictionEvent) => {
      this.prepareBeatAnimation(prediction);
    });
  }

  private onBeat(beat: BeatEvent): void {
    if (!this.canvas || !this.ctx) return;

    // Create particles based on beat intensity
    const particleCount = Math.floor(beat.intensity * 50) + 10;
    const hue = (beat.bpm * 3) % 360;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(
        this.canvas.width / 2,
        this.canvas.height / 2,
        hue,
        beat.intensity
      ));
    }

    // Trigger screen flash effect based on intensity
    if (beat.intensity > 0.7) {
      this.flashEffect(hue, beat.intensity);
    }

    console.log(`🎨 Beat visualized: ${beat.bpm} BPM, ${particleCount} particles created`);
  }

  private updateVisualization(data: AudioData): void {
    if (!this.canvas || !this.ctx || !this.isRunning) return;

    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw frequency spectrum
    this.drawFrequencySpectrum(data.frequencyData);

    // Update and draw particles
    this.updateParticles();

    // Draw beat history visualization
    this.drawBeatHistory();
  }

  private drawFrequencySpectrum(frequencyData: Uint8Array): void {
    if (!this.ctx || !this.canvas) return;

    const barWidth = this.canvas.width / frequencyData.length;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const barHeight = (frequencyData[i] / 255) * this.canvas.height * 0.5;
      const hue = (i / frequencyData.length) * 360;
      
      this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
      this.ctx.fillRect(
        i * barWidth,
        this.canvas.height - barHeight,
        barWidth - 1,
        barHeight
      );
    }
  }

  private updateParticles(): void {
    if (!this.ctx) return;

    this.particles = this.particles.filter(particle => {
      particle.update();
      particle.draw(this.ctx!);
      return particle.life > 0;
    });
  }

  private drawBeatHistory(): void {
    if (!this.ctx || !this.canvas || this.beatHistory.length < 2) return;

    this.ctx.strokeStyle = '#00ffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const now = Date.now();
    const timeSpan = 10000; // 10 seconds
    const width = this.canvas.width * 0.8;
    const startX = this.canvas.width * 0.1;
    const baseY = this.canvas.height * 0.9;

    this.beatHistory.forEach((beat, index) => {
      const age = now - beat.timestamp;
      if (age < timeSpan) {
        const x = startX + ((timeSpan - age) / timeSpan) * width;
        const y = baseY - (beat.intensity * 50);
        
        if (index === 0) {
          this.ctx!.moveTo(x, y);
        } else {
          this.ctx!.lineTo(x, y);
        }
      }
    });

    this.ctx.stroke();
  }

  private flashEffect(hue: number, intensity: number): void {
    if (!this.canvas || !this.ctx) return;

    const alpha = intensity * 0.3;
    this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private prepareBeatAnimation(prediction: BeatPredictionEvent): void {
    // Pre-load animations based on predictions
    console.log(`🔮 Next beat predicted in ${prediction.timeUntilNextBeat.toFixed(2)}s`);
  }

  public async start(): Promise<void> {
    await this.gridOS.startAudioAnalysis();
    this.isRunning = true;
    this.animate();
    console.log('🎨 Advanced music visualizer started');
  }

  public stop(): void {
    this.gridOS.stopAudioAnalysis();
    this.isRunning = false;
    console.log('🎨 Advanced music visualizer stopped');
  }

  private animate(): void {
    if (this.isRunning) {
      requestAnimationFrame(() => this.animate());
    }
  }
}

/**
 * Particle class for visual effects
 */
class Particle {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public life: number;
  public maxLife: number;
  public hue: number;
  public size: number;

  constructor(x: number, y: number, hue: number, intensity: number) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 10 * intensity;
    this.vy = (Math.random() - 0.5) * 10 * intensity;
    this.maxLife = this.life = 60 + (intensity * 60);
    this.hue = hue;
    this.size = 2 + (intensity * 5);
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Live DJ Controller Integration
 * Demonstrates integration with DJ software and live performance tools
 */
export class LiveDJController {
  private gridOS: any;
  private trackAnalysis: Map<string, TrackAnalysis> = new Map();
  private currentTrack: string | null = null;
  private mixPoints: MixPoint[] = [];

  constructor(config?: Partial<AudioAnalyzerConfig>) {
    this.gridOS = createGridOSBackend({
      ...config,
      beatThreshold: 0.25, // More sensitive for DJ use
      minBeatInterval: 200, // Allow higher BPM
      bpmWindowSize: 8 // Faster BPM adaptation
    });

    this.setupDJEventHandlers();
  }

  private setupDJEventHandlers(): void {
    this.gridOS.eventBus.beats$.subscribe((beat: BeatEvent) => {
      this.analyzeTrack(beat);
      this.detectMixOpportunities(beat);
    });

    this.gridOS.eventBus.beatPredictions$.subscribe((prediction: BeatPredictionEvent) => {
      this.updateMixTiming(prediction);
    });
  }

  private analyzeTrack(beat: BeatEvent): void {
    if (!this.currentTrack) {
      this.currentTrack = `track_${Date.now()}`;
      this.trackAnalysis.set(this.currentTrack, new TrackAnalysis());
    }

    const analysis = this.trackAnalysis.get(this.currentTrack)!;
    analysis.addBeat(beat);

    // Detect key changes in the track
    if (analysis.isKeyChange()) {
      console.log('🎵 Key change detected - good mix point opportunity');
    }

    // Detect breakdown/drop sections
    if (analysis.isBreakdown()) {
      console.log('🎧 Breakdown section detected');
    } else if (analysis.isDrop()) {
      console.log('💥 Drop section detected - high energy mix point');
    }
  }

  private detectMixOpportunities(beat: BeatEvent): void {
    const analysis = this.trackAnalysis.get(this.currentTrack!);
    if (!analysis) return;

    // Look for good mix points (consistent BPM, phrase boundaries)
    if (analysis.isPhraseBoundary() && analysis.isStableBPM()) {
      const mixPoint = new MixPoint(
        beat.timestamp,
        beat.bpm,
        beat.phase,
        analysis.getEnergyLevel()
      );

      this.mixPoints.push(mixPoint);
      console.log(`🎚️ Mix point detected: ${beat.bpm} BPM, Energy: ${analysis.getEnergyLevel()}`);

      // Keep only recent mix points
      const fiveMinutesAgo = Date.now() - 300000;
      this.mixPoints = this.mixPoints.filter(mp => mp.timestamp > fiveMinutesAgo);
    }
  }

  private updateMixTiming(prediction: BeatPredictionEvent): void {
    // Use predictions to time mix transitions perfectly
    if (prediction.timeUntilNextBeat < 0.1 && prediction.confidence > 0.8) {
      // Perfect timing for a mix transition
      this.triggerMixCue();
    }
  }

  private triggerMixCue(): void {
    console.log('🔥 Perfect mix timing - trigger crossfader cue!');
    // This would integrate with actual DJ software APIs
  }

  public getTrackAnalysis(trackId?: string): TrackAnalysis | null {
    const id = trackId || this.currentTrack;
    return id ? this.trackAnalysis.get(id) || null : null;
  }

  public getMixPoints(): MixPoint[] {
    return [...this.mixPoints];
  }

  public newTrack(): void {
    this.currentTrack = null;
    console.log('🎵 New track started - resetting analysis');
  }

  public async start(): Promise<void> {
    await this.gridOS.startAudioAnalysis();
    console.log('🎧 Live DJ controller started');
  }

  public stop(): void {
    this.gridOS.stopAudioAnalysis();
    console.log('🎧 Live DJ controller stopped');
  }
}

/**
 * Track analysis helper class
 */
class TrackAnalysis {
  private beats: BeatEvent[] = [];
  private energyHistory: number[] = [];
  private bpmHistory: number[] = [];

  addBeat(beat: BeatEvent): void {
    this.beats.push(beat);
    this.energyHistory.push(beat.intensity);
    this.bpmHistory.push(beat.bpm);

    // Keep last 32 beats for analysis
    if (this.beats.length > 32) {
      this.beats.shift();
      this.energyHistory.shift();
      this.bpmHistory.shift();
    }
  }

  isKeyChange(): boolean {
    // Simplified key change detection based on energy patterns
    if (this.energyHistory.length < 16) return false;
    
    const recent = this.energyHistory.slice(-8);
    const previous = this.energyHistory.slice(-16, -8);
    
    const recentAvg = recent.reduce((sum, e) => sum + e, 0) / recent.length;
    const previousAvg = previous.reduce((sum, e) => sum + e, 0) / previous.length;
    
    return Math.abs(recentAvg - previousAvg) > 0.3;
  }

  isBreakdown(): boolean {
    if (this.energyHistory.length < 8) return false;
    const recent = this.energyHistory.slice(-8);
    const avgEnergy = recent.reduce((sum, e) => sum + e, 0) / recent.length;
    return avgEnergy < 0.3;
  }

  isDrop(): boolean {
    if (this.energyHistory.length < 4) return false;
    const recent = this.energyHistory.slice(-4);
    const avgEnergy = recent.reduce((sum, e) => sum + e, 0) / recent.length;
    return avgEnergy > 0.8;
  }

  isPhraseBoundary(): boolean {
    // Musical phrases are typically 8, 16, or 32 beats
    return this.beats.length % 8 === 0;
  }

  isStableBPM(): boolean {
    if (this.bpmHistory.length < 8) return false;
    
    const recent = this.bpmHistory.slice(-8);
    const avg = recent.reduce((sum, bpm) => sum + bpm, 0) / recent.length;
    const variance = recent.reduce((sum, bpm) => sum + Math.pow(bpm - avg, 2), 0) / recent.length;
    
    return Math.sqrt(variance) < 2; // BPM stable within 2 BPM
  }

  getEnergyLevel(): 'low' | 'medium' | 'high' {
    if (this.energyHistory.length === 0) return 'medium';
    
    const recent = this.energyHistory.slice(-4);
    const avgEnergy = recent.reduce((sum, e) => sum + e, 0) / recent.length;
    
    if (avgEnergy < 0.4) return 'low';
    if (avgEnergy > 0.7) return 'high';
    return 'medium';
  }
}

/**
 * Mix point data structure
 */
class MixPoint {
  constructor(
    public timestamp: number,
    public bpm: number,
    public phase: number,
    public energyLevel: 'low' | 'medium' | 'high'
  ) {}
}

/**
 * Game Audio Synchronization
 * Demonstrates integration with rhythm games and interactive applications
 */
export class GameAudioSync {
  private gridOS: any;
  private gameState: {
    score: number;
    combo: number;
    perfectHits: number;
    goodHits: number;
    missedBeats: number;
  } = {
    score: 0,
    combo: 0,
    perfectHits: 0,
    goodHits: 0,
    missedBeats: 0
  };

  constructor(config?: Partial<AudioAnalyzerConfig>) {
    this.gridOS = createGridOSBackend({
      ...config,
      beatThreshold: 0.2, // Very sensitive for game timing
      minBeatInterval: 150, // Allow very fast rhythms
      updateInterval: 8 // High frequency updates for precise timing
    });

    this.setupGameEventHandlers();
  }

  private setupGameEventHandlers(): void {
    this.gridOS.eventBus.beats$.subscribe((beat: BeatEvent) => {
      this.createBeatTarget(beat);
    });

    this.gridOS.eventBus.beatPredictions$.subscribe((prediction: BeatPredictionEvent) => {
      this.prepareNextTarget(prediction);
    });
  }

  private createBeatTarget(beat: BeatEvent): void {
    const target = {
      id: Date.now(),
      beat,
      hitWindow: this.calculateHitWindow(beat.intensity),
      perfect: false,
      hit: false
    };

    console.log(`🎯 Beat target created: ${beat.bpm} BPM, hit window: ${target.hitWindow}ms`);
    
    // In a real game, this would create a visual target that moves toward a hit zone
    this.scheduleTargetTimeout(target);
  }

  private calculateHitWindow(intensity: number): number {
    // Stronger beats get larger hit windows
    return 100 + (intensity * 100); // 100-200ms hit window
  }

  private scheduleTargetTimeout(target: any): void {
    setTimeout(() => {
      if (!target.hit) {
        this.onMissedBeat();
      }
    }, target.hitWindow);
  }

  private prepareNextTarget(prediction: BeatPredictionEvent): void {
    // Pre-generate visual effects for predicted beats
    console.log(`🎮 Preparing for next beat in ${prediction.timeUntilNextBeat.toFixed(2)}s`);
  }

  public onPlayerInput(): void {
    // Called when player hits the input button/key
    const currentTime = Date.now();
    
    // Check if there's a beat target within the hit window
    // This is simplified - in a real game you'd track all active targets
    
    const timing = this.calculateTiming(currentTime);
    
    if (timing.perfect) {
      this.onPerfectHit();
    } else if (timing.good) {
      this.onGoodHit();
    } else {
      this.onMiss();
    }
  }

  private calculateTiming(inputTime: number): { perfect: boolean; good: boolean; timing: number } {
    // Simplified timing calculation
    // In a real game, you'd check against all active beat targets
    
    const lastBeat = this.gridOS.getAudioAnalyzerState().beatState.lastBeatTime;
    const timeDiff = Math.abs(inputTime - lastBeat);
    
    return {
      perfect: timeDiff < 50, // Perfect within 50ms
      good: timeDiff < 100,   // Good within 100ms
      timing: timeDiff
    };
  }

  private onPerfectHit(): void {
    this.gameState.score += 1000;
    this.gameState.combo++;
    this.gameState.perfectHits++;
    console.log('🌟 PERFECT! Score:', this.gameState.score, 'Combo:', this.gameState.combo);
  }

  private onGoodHit(): void {
    this.gameState.score += 500;
    this.gameState.combo++;
    this.gameState.goodHits++;
    console.log('✨ Good! Score:', this.gameState.score, 'Combo:', this.gameState.combo);
  }

  private onMiss(): void {
    this.gameState.combo = 0;
    console.log('❌ Miss! Combo broken');
  }

  private onMissedBeat(): void {
    this.gameState.combo = 0;
    this.gameState.missedBeats++;
    console.log('💔 Missed beat! Combo broken');
  }

  public getGameState() {
    return { ...this.gameState };
  }

  public resetGame(): void {
    this.gameState = {
      score: 0,
      combo: 0,
      perfectHits: 0,
      goodHits: 0,
      missedBeats: 0
    };
    console.log('🎮 Game reset');
  }

  public async start(): Promise<void> {
    await this.gridOS.startAudioAnalysis();
    console.log('🎮 Game audio sync started');
  }

  public stop(): void {
    this.gridOS.stopAudioAnalysis();
    console.log('🎮 Game audio sync stopped');
  }
}

// Export all classes for use in other modules
export {
  AdvancedMusicVisualizer,
  LiveDJController, 
  GameAudioSync,
  Particle,
  TrackAnalysis,
  MixPoint
};
