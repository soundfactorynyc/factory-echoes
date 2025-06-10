/**
 * GRID OS Audio Analyzer
 * 
 * Real-time audio analysis with beat detection using Web Audio API
 * Integrates with the GRID OS event bus system for seamless audio-visual synchronization
 */

import { Subject, Observable, interval } from 'rxjs';
import { map, filter, distinctUntilChanged, throttleTime } from 'rxjs/operators';
import type { 
  AudioData, 
  BeatEvent, 
  BeatPredictionEvent, 
  SystemEvent 
} from '../types/integration';
import type { AudioVisualSync } from '../types/webgl';

/**
 * Configuration for the audio analyzer
 */
export interface AudioAnalyzerConfig {
  /** FFT size for frequency analysis (must be power of 2) */
  fftSize: number;
  /** Smoothing factor for frequency analysis (0-1) */
  smoothingTimeConstant: number;
  /** Beat detection threshold (0-1) */
  beatThreshold: number;
  /** Minimum time between beats in milliseconds */
  minBeatInterval: number;
  /** BPM detection window size in seconds */
  bpmWindowSize: number;
  /** Audio analysis update interval in milliseconds */
  updateInterval: number;
}

/**
 * Default configuration for the audio analyzer
 */
export const DEFAULT_AUDIO_CONFIG: AudioAnalyzerConfig = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  beatThreshold: 0.3,
  minBeatInterval: 300, // 300ms = 200 BPM max
  bpmWindowSize: 10, // 10 seconds
  updateInterval: 16 // ~60fps
};

/**
 * Beat detection state
 */
interface BeatDetectionState {
  lastBeatTime: number;
  energyHistory: number[];
  bpmHistory: number[];
  currentBPM: number;
  beatPhase: number;
  lastEnergy: number;
  peakThreshold: number;
}

/**
 * Real-time audio analyzer with beat detection
 */
export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  
  private frequencyData: Uint8Array | null = null;
  private timeDomainData: Uint8Array | null = null;
  private frequencyDataFloat: Float32Array | null = null;
  
  private animationFrame: number | null = null;
  private isRunning = false;
  private config: AudioAnalyzerConfig;
  
  // Beat detection state
  private beatState: BeatDetectionState = {
    lastBeatTime: 0,
    energyHistory: [],
    bpmHistory: [],
    currentBPM: 120,
    beatPhase: 0,
    lastEnergy: 0,
    peakThreshold: 0.3
  };
  
  // Observable streams
  private readonly _audioData$ = new Subject<AudioData>();
  private readonly _beatEvent$ = new Subject<BeatEvent>();
  private readonly _beatPrediction$ = new Subject<BeatPredictionEvent>();
  private readonly _systemEvent$ = new Subject<SystemEvent>();
  
  /**
   * Audio data stream
   */
  public readonly audioData$: Observable<AudioData> = this._audioData$.asObservable();
  
  /**
   * Beat event stream
   */
  public readonly beatEvent$: Observable<BeatEvent> = this._beatEvent$.asObservable();
  
  /**
   * Beat prediction stream
   */
  public readonly beatPrediction$: Observable<BeatPredictionEvent> = this._beatPrediction$.asObservable();
  
  /**
   * System event stream
   */
  public readonly systemEvent$: Observable<SystemEvent> = this._systemEvent$.asObservable();

  constructor(config: Partial<AudioAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_AUDIO_CONFIG, ...config };
    console.log('🎵 Audio Analyzer initialized with config:', this.config);
  }

  /**
   * Initialize the audio analyzer with microphone access
   */
  public async initAudioAnalyzer(): Promise<void> {
    try {
      console.log('🎤 Requesting microphone access...');
      
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });
      
      // Create audio context
      this.audioContext = new AudioContext();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
      
      // Create media stream source
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.source.connect(this.analyser);
      
      // Initialize data arrays
      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencyData = new Uint8Array(new ArrayBuffer(bufferLength));
      this.timeDomainData = new Uint8Array(new ArrayBuffer(bufferLength));
      this.frequencyDataFloat = new Float32Array(new ArrayBuffer(bufferLength * 4));
      
      console.log('✅ Audio analyzer initialized successfully');
      console.log(`📊 Buffer length: ${bufferLength}, Sample rate: ${this.audioContext.sampleRate}Hz`);
      
      // Emit system event
      this._systemEvent$.next({
        type: 'audio_analyzer_initialized',
        source: 'AudioAnalyzer',
        data: {
          sampleRate: this.audioContext.sampleRate,
          bufferLength,
          fftSize: this.config.fftSize
        },
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize audio analyzer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Audio analyzer initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Start real-time audio analysis and beat detection
   */
  public start(): void {
    if (!this.analyser || !this.frequencyData || !this.timeDomainData) {
      throw new Error('Audio analyzer not initialized. Call initAudioAnalyzer() first.');
    }
    
    if (this.isRunning) {
      console.warn('⚠️ Audio analyzer is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🎵 Starting audio analysis and beat detection...');
    
    // Start the beat detection loop
    this.detectBeats();
    
    // Emit system event
    this._systemEvent$.next({
      type: 'audio_analysis_started',
      source: 'AudioAnalyzer',
      data: { timestamp: Date.now() },
      timestamp: Date.now()
    });
  }

  /**
   * Stop audio analysis
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    console.log('⏹️ Audio analysis stopped');
    
    // Emit system event
    this._systemEvent$.next({
      type: 'audio_analysis_stopped',
      source: 'AudioAnalyzer',
      data: { timestamp: Date.now() },
      timestamp: Date.now()
    });
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stop();
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    this.analyser = null;
    this.frequencyData = null;
    this.timeDomainData = null;
    this.frequencyDataFloat = null;
    
    console.log('🧹 Audio analyzer destroyed');
  }

  /**
   * Main beat detection loop
   */
  private detectBeats(): void {
    if (!this.isRunning || !this.analyser || !this.frequencyData || !this.timeDomainData) {
      return;
    }
    
    // Create fresh arrays for Web Audio API compatibility
    const frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);
    const timeDomainArray = new Uint8Array(this.analyser.frequencyBinCount);
    const frequencyFloatArray = new Float32Array(this.analyser.frequencyBinCount);
    
    // Get frequency and time domain data
    this.analyser.getByteFrequencyData(frequencyArray);
    this.analyser.getByteTimeDomainData(timeDomainArray);
    this.analyser.getFloatFrequencyData(frequencyFloatArray);
    
    // Copy to instance variables for other methods to access
    this.frequencyData.set(frequencyArray);
    this.timeDomainData.set(timeDomainArray);
    this.frequencyDataFloat!.set(frequencyFloatArray);
    
    const now = Date.now();
    
    // Calculate energy in different frequency bands
    const bassEnergy = this.calculateBandEnergy(this.frequencyData, 0, 8); // ~0-86Hz
    const midEnergy = this.calculateBandEnergy(this.frequencyData, 8, 32); // ~86-344Hz
    const highEnergy = this.calculateBandEnergy(this.frequencyData, 32, 128); // ~344-1.3kHz
    const totalEnergy = bassEnergy + midEnergy + highEnergy;
    
    // Beat detection algorithm
    const beatDetected = this.detectBeat(bassEnergy, now);
    
    // Update BPM if beat detected
    if (beatDetected) {
      this.updateBPM(now);
      this.emitBeatEvent(now, bassEnergy);
    }
    
    // Calculate beat phase and predictions
    this.updateBeatPhase(now);
    this.emitBeatPrediction(now);
    
    // Emit audio data
    this._audioData$.next({
      samples: new Float32Array(this.timeDomainData),
      sampleRate: this.audioContext!.sampleRate,
      channelCount: 1,
      frequencyData: new Uint8Array(this.frequencyData),
      timeDomainData: new Uint8Array(this.timeDomainData),
      timestamp: now
    });
    
    // Continue the loop
    this.animationFrame = requestAnimationFrame(() => this.detectBeats());
  }

  /**
   * Calculate energy in a frequency band
   */
  private calculateBandEnergy(frequencyData: Uint8Array, startBin: number, endBin: number): number {
    let energy = 0;
    for (let i = startBin; i < Math.min(endBin, frequencyData.length); i++) {
      energy += frequencyData[i] * frequencyData[i];
    }
    return Math.sqrt(energy / (endBin - startBin)) / 255;
  }

  /**
   * Detect beats using energy-based algorithm
   */
  private detectBeat(energy: number, timestamp: number): boolean {
    const timeSinceLastBeat = timestamp - this.beatState.lastBeatTime;
    
    // Minimum interval check
    if (timeSinceLastBeat < this.config.minBeatInterval) {
      return false;
    }
    
    // Update energy history
    this.beatState.energyHistory.push(energy);
    if (this.beatState.energyHistory.length > 43) { // ~0.7 seconds at 60fps
      this.beatState.energyHistory.shift();
    }
    
    // Calculate average energy
    const avgEnergy = this.beatState.energyHistory.reduce((sum, e) => sum + e, 0) / this.beatState.energyHistory.length;
    
    // Dynamic threshold based on recent energy
    const dynamicThreshold = avgEnergy * (1 + this.config.beatThreshold);
    
    // Beat detection criteria
    const isEnergySpike = energy > dynamicThreshold;
    const isEnergyIncrease = energy > this.beatState.lastEnergy * 1.1;
    
    this.beatState.lastEnergy = energy;
    
    if (isEnergySpike && isEnergyIncrease) {
      this.beatState.lastBeatTime = timestamp;
      return true;
    }
    
    return false;
  }

  /**
   * Update BPM calculation
   */
  private updateBPM(timestamp: number): void {
    if (this.beatState.bpmHistory.length > 0) {
      const lastBeatTime = this.beatState.bpmHistory[this.beatState.bpmHistory.length - 1];
      const interval = timestamp - lastBeatTime;
      const bpm = 60000 / interval; // Convert ms to BPM
      
      // Filter reasonable BPM values
      if (bpm >= 60 && bpm <= 200) {
        this.beatState.bpmHistory.push(timestamp);
        
        // Keep only recent beats for BPM calculation
        const windowStart = timestamp - (this.config.bpmWindowSize * 1000);
        this.beatState.bpmHistory = this.beatState.bpmHistory.filter(time => time > windowStart);
        
        // Calculate average BPM
        if (this.beatState.bpmHistory.length >= 2) {
          const intervals = [];
          for (let i = 1; i < this.beatState.bpmHistory.length; i++) {
            intervals.push(this.beatState.bpmHistory[i] - this.beatState.bpmHistory[i - 1]);
          }
          const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
          this.beatState.currentBPM = 60000 / avgInterval;
        }
      }
    } else {
      this.beatState.bpmHistory.push(timestamp);
    }
  }

  /**
   * Update beat phase calculation
   */
  private updateBeatPhase(timestamp: number): void {
    if (this.beatState.lastBeatTime > 0) {
      const beatInterval = 60000 / this.beatState.currentBPM; // ms per beat
      const timeSinceLastBeat = timestamp - this.beatState.lastBeatTime;
      this.beatState.beatPhase = (timeSinceLastBeat % beatInterval) / beatInterval;
    }
  }

  /**
   * Emit beat event
   */
  private emitBeatEvent(timestamp: number, intensity: number): void {
    const beatEvent: BeatEvent = {
      bpm: Math.round(this.beatState.currentBPM),
      phase: this.beatState.beatPhase,
      timestamp,
      intensity: Math.min(intensity * 2, 1) // Normalize and boost intensity
    };
    
    this._beatEvent$.next(beatEvent);
    
    console.log(`🥁 Beat detected: ${beatEvent.bpm} BPM, intensity: ${beatEvent.intensity.toFixed(2)}`);
  }

  /**
   * Emit beat prediction event
   */
  private emitBeatPrediction(timestamp: number): void {
    const beatInterval = 60000 / this.beatState.currentBPM;
    const timeUntilNextBeat = beatInterval - (timestamp - this.beatState.lastBeatTime) % beatInterval;
    
    // Generate future predictions
    const futurePredictions = [];
    for (let i = 1; i <= 4; i++) {
      const futureTime = timeUntilNextBeat + (beatInterval * (i - 1));
      futurePredictions.push({
        time: futureTime / 1000, // Convert to seconds
        intensity: 0.7 + (Math.sin(i) * 0.3), // Simulated intensity variation
        confidence: Math.max(0.5, 1 - (i * 0.1)) // Decreasing confidence
      });
    }
    
    const prediction: BeatPredictionEvent = {
      bpm: this.beatState.currentBPM,
      phase: this.beatState.beatPhase,
      confidence: this.beatState.bpmHistory.length >= 4 ? 0.9 : 0.6,
      timeUntilNextBeat: timeUntilNextBeat / 1000, // Convert to seconds
      intensity: this.beatState.lastEnergy,
      pattern: this.detectBeatPattern(),
      futurePredictions
    };
    
    this._beatPrediction$.next(prediction);
  }

  /**
   * Detect beat pattern (basic implementation)
   */
  private detectBeatPattern(): string {
    if (this.beatState.currentBPM > 140) return 'fast';
    if (this.beatState.currentBPM < 90) return 'slow';
    if (this.beatState.bpmHistory.length >= 8) return 'steady';
    return 'variable';
  }

  /**
   * Get current audio visual sync data
   */
  public getAudioVisualSync(): AudioVisualSync | null {
    if (!this.audioContext || !this.analyser || !this.frequencyDataFloat) {
      return null;
    }
    
    return {
      audioContext: this.audioContext,
      frequencyData: this.frequencyDataFloat,
      beatDetection: {
        threshold: this.config.beatThreshold,
        smoothing: this.config.smoothingTimeConstant,
        lastBeat: this.beatState.lastBeatTime
      },
      visualizers: [] // To be populated by visual components
    };
  }

  /**
   * Get current audio analysis state
   */
  public getState() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      beatState: { ...this.beatState },
      audioContext: this.audioContext ? {
        state: this.audioContext.state,
        sampleRate: this.audioContext.sampleRate
      } : null
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<AudioAnalyzerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
    }
    
    console.log('🔧 Audio analyzer configuration updated:', this.config);
  }
}

/**
 * Create and initialize an audio analyzer instance
 */
export async function createAudioAnalyzer(config?: Partial<AudioAnalyzerConfig>): Promise<AudioAnalyzer> {
  const analyzer = new AudioAnalyzer(config);
  await analyzer.initAudioAnalyzer();
  return analyzer;
}

export default AudioAnalyzer;
