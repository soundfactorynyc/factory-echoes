/**
 * GRID OS Enhanced Audio System Integration
 * 
 * Complete integration of audio analysis, performance monitoring, and intelligent pattern recognition
 * Provides a unified interface for advanced real-time beat detection with learning capabilities
 */

import { Observable, Subject, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { map, filter, throttleTime, distinctUntilChanged } from 'rxjs/operators';
import AudioAnalyzer, { type AudioAnalyzerConfig } from './audioAnalyzer';
import AudioPerformanceMonitor, { type PerformanceMetrics, type PerformanceAlert } from './audioPerformanceMonitor';
import IntelligentBeatPatternRecognition, { type MusicPattern, type PatternMatch } from './intelligentBeatPatternRecognition';
import type { BeatEvent, BeatPredictionEvent, AudioData, SystemEvent } from '../types/integration';

export interface EnhancedAudioConfig extends AudioAnalyzerConfig {
  // Performance monitoring
  enablePerformanceMonitoring: boolean;
  performanceAlertThreshold: number;
  
  // Pattern recognition
  enablePatternRecognition: boolean;
  patternLearningRate: number;
  patternConfidenceThreshold: number;
  
  // Integration features
  enableAdaptiveOptimization: boolean;
  autoAdjustThresholds: boolean;
  enablePredictiveBeats: boolean;
  
  // Visualization
  enableRealTimeVisuals: boolean;
  visualUpdateRate: number;
}

export const DEFAULT_ENHANCED_CONFIG: EnhancedAudioConfig = {
  // Audio analyzer settings
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  beatThreshold: 0.3,
  minBeatInterval: 300,
  bpmWindowSize: 10,
  updateInterval: 16,
  
  // Performance monitoring
  enablePerformanceMonitoring: true,
  performanceAlertThreshold: 0.7,
  
  // Pattern recognition
  enablePatternRecognition: true,
  patternLearningRate: 0.1,
  patternConfidenceThreshold: 0.7,
  
  // Integration features
  enableAdaptiveOptimization: true,
  autoAdjustThresholds: true,
  enablePredictiveBeats: true,
  
  // Visualization
  enableRealTimeVisuals: true,
  visualUpdateRate: 60
};

export interface EnhancedAudioState {
  // Core state
  isRunning: boolean;
  currentBPM: number;
  beatPhase: number;
  
  // Pattern recognition
  currentPattern: MusicPattern | null;
  patternConfidence: number;
  learnedPatterns: number;
  
  // Performance
  currentPerformance: PerformanceMetrics | null;
  performanceScore: number; // 0-1
  optimizationSuggestions: string[];
  
  // Real-time data
  audioLevel: number;
  frequencyPeaks: number[];
  beatIntensity: number;
  
  // System health
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  activeAlerts: PerformanceAlert[];
}

export interface EnhancedBeatEvent extends BeatEvent {
  // Enhanced beat information
  patternMatch?: PatternMatch;
  confidence: number;
  predictive: boolean;
  adaptationLevel: number;
  
  // Contextual information
  musicalContext: {
    measurePosition: number;
    beatInMeasure: number;
    timeSignature: string;
    keySignature?: string;
  };
  
  // Performance data
  processingLatency: number;
  detectionAccuracy: number;
}

/**
 * Enhanced Audio System with integrated components
 */
export class EnhancedAudioSystem {
  private audioAnalyzer: AudioAnalyzer;
  private performanceMonitor: AudioPerformanceMonitor;
  private patternRecognition: IntelligentBeatPatternRecognition;
  
  private config: EnhancedAudioConfig;
  private isInitialized = false;
  private isRunning = false;
  
  // Adaptive optimization
  private adaptiveOptimizer: AdaptiveOptimizer;
  private optimizationHistory: Array<{ timestamp: number; config: Partial<EnhancedAudioConfig>; score: number }> = [];
  
  // State management
  private currentState: EnhancedAudioState = {
    isRunning: false,
    currentBPM: 0,
    beatPhase: 0,
    currentPattern: null,
    patternConfidence: 0,
    learnedPatterns: 0,
    currentPerformance: null,
    performanceScore: 0,
    optimizationSuggestions: [],
    audioLevel: 0,
    frequencyPeaks: [],
    beatIntensity: 0,
    systemHealth: 'good',
    activeAlerts: []
  };
  
  // Observable streams
  private readonly _enhancedBeat$ = new Subject<EnhancedBeatEvent>();
  private readonly _systemState$ = new BehaviorSubject<EnhancedAudioState>(this.currentState);
  private readonly _optimizationApplied$ = new Subject<{ type: string; improvement: number }>();
  
  public readonly enhancedBeat$: Observable<EnhancedBeatEvent> = this._enhancedBeat$.asObservable();
  public readonly systemState$: Observable<EnhancedAudioState> = this._systemState$.asObservable();
  public readonly optimizationApplied$: Observable<{ type: string; improvement: number }> = this._optimizationApplied$.asObservable();
  
  // Passthrough observables
  public readonly audioData$: Observable<AudioData>;
  public readonly beatEvent$: Observable<BeatEvent>;
  public readonly beatPrediction$: Observable<BeatPredictionEvent>;
  public readonly performanceMetrics$: Observable<PerformanceMetrics | null>;
  public readonly performanceAlerts$: Observable<PerformanceAlert>;
  public readonly patternDetected$: Observable<PatternMatch>;
  
  constructor(config: Partial<EnhancedAudioConfig> = {}) {
    this.config = { ...DEFAULT_ENHANCED_CONFIG, ...config };
    
    // Initialize components
    this.audioAnalyzer = new AudioAnalyzer(this.config);
    this.performanceMonitor = new AudioPerformanceMonitor();
    this.patternRecognition = new IntelligentBeatPatternRecognition();
    this.adaptiveOptimizer = new AdaptiveOptimizer(this.config);
    
    // Set up passthrough observables
    this.audioData$ = this.audioAnalyzer.audioData$;
    this.beatEvent$ = this.audioAnalyzer.beatEvent$;
    this.beatPrediction$ = this.audioAnalyzer.beatPrediction$;
    this.performanceMetrics$ = this.performanceMonitor.metrics$;
    this.performanceAlerts$ = this.performanceMonitor.alerts$;
    this.patternDetected$ = this.patternRecognition.patternDetected$;
    
    this.setupIntegrations();\n    console.log('🎼 Enhanced Audio System initialized');\n  }\n  \n  /**\n   * Setup integrations between components\n   */\n  private setupIntegrations(): void {\n    // Connect audio analyzer to pattern recognition\n    this.audioAnalyzer.beatEvent$.subscribe(beat => {\n      if (this.config.enablePatternRecognition) {\n        this.patternRecognition.processBeat(beat);\n      }\n    });\n    \n    // Connect to performance monitoring\n    if (this.config.enablePerformanceMonitoring) {\n      this.audioAnalyzer.beatEvent$.subscribe(beat => {\n        this.performanceMonitor.recordBeatDetection(beat.timestamp);\n      });\n      \n      this.audioAnalyzer.audioData$.subscribe(() => {\n        this.performanceMonitor.recordFrame();\n      });\n    }\n    \n    // Enhanced beat events\n    combineLatest([\n      this.audioAnalyzer.beatEvent$,\n      this.patternRecognition.patternDetected$,\n      this.performanceMonitor.metrics$\n    ]).pipe(\n      map(([beat, pattern, performance]) => \n        this.createEnhancedBeatEvent(beat, pattern, performance)\n      )\n    ).subscribe(enhancedBeat => {\n      this._enhancedBeat$.next(enhancedBeat);\n    });\n    \n    // State updates\n    interval(100).subscribe(() => {\n      this.updateSystemState();\n    });\n    \n    // Adaptive optimization\n    if (this.config.enableAdaptiveOptimization) {\n      this.performanceMonitor.metrics$.pipe(\n        filter(metrics => metrics !== null),\n        throttleTime(5000) // Every 5 seconds\n      ).subscribe(metrics => {\n        this.adaptiveOptimizer.analyzePerformance(metrics!);\n        const suggestions = this.adaptiveOptimizer.generateOptimizations();\n        this.applyOptimizations(suggestions);\n      });\n    }\n    \n    // Performance alerts\n    this.performanceMonitor.alerts$.subscribe(alert => {\n      this.handlePerformanceAlert(alert);\n    });\n  }\n  \n  /**\n   * Initialize the enhanced audio system\n   */\n  public async initialize(): Promise<void> {\n    if (this.isInitialized) return;\n    \n    try {\n      console.log('🚀 Initializing Enhanced Audio System...');\n      \n      // Initialize audio analyzer\n      await this.audioAnalyzer.initAudioAnalyzer();\n      \n      // Set audio context for pattern recognition\n      const audioVisualSync = this.audioAnalyzer.getAudioVisualSync();\n      if (audioVisualSync?.audioContext) {\n        // Create a temporary analyser for pattern recognition\n        const analyser = audioVisualSync.audioContext.createAnalyser();\n        this.patternRecognition.setAudioContext(audioVisualSync.audioContext, analyser);\n      }\n      \n      // Start performance monitoring\n      if (this.config.enablePerformanceMonitoring) {\n        this.performanceMonitor.startMonitoring();\n      }\n      \n      this.isInitialized = true;\n      console.log('✅ Enhanced Audio System initialized successfully');\n      \n    } catch (error) {\n      console.error('❌ Failed to initialize Enhanced Audio System:', error);\n      throw error;\n    }\n  }\n  \n  /**\n   * Start the enhanced audio system\n   */\n  public start(): void {\n    if (!this.isInitialized) {\n      throw new Error('System not initialized. Call initialize() first.');\n    }\n    \n    if (this.isRunning) return;\n    \n    console.log('🎵 Starting Enhanced Audio System...');\n    \n    // Start core components\n    this.audioAnalyzer.start();\n    \n    this.isRunning = true;\n    this.updateSystemState();\n    \n    console.log('🎼 Enhanced Audio System started successfully');\n  }\n  \n  /**\n   * Stop the enhanced audio system\n   */\n  public stop(): void {\n    if (!this.isRunning) return;\n    \n    console.log('⏹️ Stopping Enhanced Audio System...');\n    \n    this.audioAnalyzer.stop();\n    this.performanceMonitor.stopMonitoring();\n    \n    this.isRunning = false;\n    this.updateSystemState();\n    \n    console.log('⏹️ Enhanced Audio System stopped');\n  }\n  \n  /**\n   * Destroy the enhanced audio system\n   */\n  public destroy(): void {\n    this.stop();\n    this.audioAnalyzer.destroy();\n    this.isInitialized = false;\n    console.log('🧹 Enhanced Audio System destroyed');\n  }\n  \n  /**\n   * Create enhanced beat event\n   */\n  private createEnhancedBeatEvent(\n    beat: BeatEvent, \n    pattern: PatternMatch | null, \n    performance: PerformanceMetrics | null\n  ): EnhancedBeatEvent {\n    const currentPattern = this.patternRecognition.getCurrentPattern();\n    \n    const enhancedBeat: EnhancedBeatEvent = {\n      ...beat,\n      patternMatch: pattern || undefined,\n      confidence: pattern?.confidence || 0.5,\n      predictive: false,\n      adaptationLevel: this.calculateAdaptationLevel(),\n      musicalContext: {\n        measurePosition: this.calculateMeasurePosition(beat),\n        beatInMeasure: this.calculateBeatInMeasure(beat),\n        timeSignature: currentPattern?.timeSignature || '4/4'\n      },\n      processingLatency: performance?.audioLatency || 0,\n      detectionAccuracy: performance?.beatDetectionAccuracy || 0\n    };\n    \n    return enhancedBeat;\n  }\n  \n  /**\n   * Calculate adaptation level\n   */\n  private calculateAdaptationLevel(): number {\n    const currentPattern = this.patternRecognition.getCurrentPattern();\n    return currentPattern ? currentPattern.confidence : 0;\n  }\n  \n  /**\n   * Calculate measure position\n   */\n  private calculateMeasurePosition(beat: BeatEvent): number {\n    // Simplified calculation based on BPM and time signature\n    const beatsPerMeasure = 4; // Default to 4/4 time\n    const beatInterval = 60000 / beat.bpm; // ms per beat\n    const measureInterval = beatInterval * beatsPerMeasure;\n    \n    return (beat.timestamp % measureInterval) / measureInterval;\n  }\n  \n  /**\n   * Calculate beat in measure\n   */\n  private calculateBeatInMeasure(beat: BeatEvent): number {\n    const beatsPerMeasure = 4; // Default to 4/4 time\n    const beatInterval = 60000 / beat.bpm;\n    const measureInterval = beatInterval * beatsPerMeasure;\n    const positionInMeasure = beat.timestamp % measureInterval;\n    \n    return Math.floor(positionInMeasure / beatInterval) + 1;\n  }\n  \n  /**\n   * Update system state\n   */\n  private updateSystemState(): void {\n    const analyzerState = this.audioAnalyzer.getState();\n    const performanceSummary = this.performanceMonitor.getPerformanceSummary();\n    const currentPattern = this.patternRecognition.getCurrentPattern();\n    const knownPatterns = this.patternRecognition.getKnownPatterns();\n    \n    this.currentState = {\n      isRunning: this.isRunning,\n      currentBPM: analyzerState.beatState.currentBPM,\n      beatPhase: analyzerState.beatState.beatPhase,\n      currentPattern,\n      patternConfidence: currentPattern?.confidence || 0,\n      learnedPatterns: knownPatterns.filter(p => p.id.startsWith('custom_')).length,\n      currentPerformance: this.performanceMonitor.metrics$.value,\n      performanceScore: this.calculatePerformanceScore(performanceSummary),\n      optimizationSuggestions: this.adaptiveOptimizer.getLastSuggestions(),\n      audioLevel: this.calculateAudioLevel(),\n      frequencyPeaks: this.calculateFrequencyPeaks(),\n      beatIntensity: analyzerState.beatState.lastEnergy,\n      systemHealth: this.calculateSystemHealth(performanceSummary),\n      activeAlerts: this.getActiveAlerts()\n    };\n    \n    this._systemState$.next(this.currentState);\n  }\n  \n  /**\n   * Calculate performance score\n   */\n  private calculatePerformanceScore(summary: any): number {\n    const latencyScore = Math.max(0, 1 - (summary.avgLatency / 100));\n    const frameRateScore = Math.min(1, summary.avgFrameRate / 60);\n    const accuracyScore = summary.avgAccuracy;\n    const cpuScore = Math.max(0, 1 - summary.avgCPUUsage);\n    \n    return (latencyScore + frameRateScore + accuracyScore + cpuScore) / 4;\n  }\n  \n  /**\n   * Calculate audio level\n   */\n  private calculateAudioLevel(): number {\n    const audioVisualSync = this.audioAnalyzer.getAudioVisualSync();\n    if (!audioVisualSync?.frequencyData) return 0;\n    \n    const data = audioVisualSync.frequencyData;\n    let sum = 0;\n    for (let i = 0; i < data.length; i++) {\n      sum += Math.abs(data[i]);\n    }\n    return sum / data.length;\n  }\n  \n  /**\n   * Calculate frequency peaks\n   */\n  private calculateFrequencyPeaks(): number[] {\n    const audioVisualSync = this.audioAnalyzer.getAudioVisualSync();\n    if (!audioVisualSync?.frequencyData) return [];\n    \n    const data = audioVisualSync.frequencyData;\n    const peaks: number[] = [];\n    const threshold = -60; // dB threshold\n    \n    for (let i = 1; i < data.length - 1; i++) {\n      if (data[i] > threshold && data[i] > data[i-1] && data[i] > data[i+1]) {\n        peaks.push(i);\n      }\n    }\n    \n    return peaks.slice(0, 10); // Return top 10 peaks\n  }\n  \n  /**\n   * Calculate system health\n   */\n  private calculateSystemHealth(summary: any): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {\n    const score = this.calculatePerformanceScore(summary);\n    \n    if (score > 0.9) return 'excellent';\n    if (score > 0.75) return 'good';\n    if (score > 0.6) return 'fair';\n    if (score > 0.4) return 'poor';\n    return 'critical';\n  }\n  \n  /**\n   * Get active alerts\n   */\n  private getActiveAlerts(): PerformanceAlert[] {\n    // This would maintain a list of active alerts\n    return [];\n  }\n  \n  /**\n   * Handle performance alert\n   */\n  private handlePerformanceAlert(alert: PerformanceAlert): void {\n    console.warn(`⚠️ Performance Alert: ${alert.message}`);\n    \n    // Auto-apply optimizations for critical alerts\n    if (alert.severity === 'critical' && this.config.enableAdaptiveOptimization) {\n      this.applyEmergencyOptimizations(alert);\n    }\n  }\n  \n  /**\n   * Apply optimizations\n   */\n  private applyOptimizations(suggestions: Array<{ type: string; config: Partial<EnhancedAudioConfig>; improvement: number }>): void {\n    for (const suggestion of suggestions) {\n      if (suggestion.improvement > 0.1) { // Only apply significant improvements\n        this.updateConfig(suggestion.config);\n        this._optimizationApplied$.next({\n          type: suggestion.type,\n          improvement: suggestion.improvement\n        });\n        \n        console.log(`🔧 Applied optimization: ${suggestion.type} (${(suggestion.improvement * 100).toFixed(1)}% improvement)`);\n      }\n    }\n  }\n  \n  /**\n   * Apply emergency optimizations\n   */\n  private applyEmergencyOptimizations(alert: PerformanceAlert): void {\n    const emergencyConfig: Partial<EnhancedAudioConfig> = {};\n    \n    switch (alert.type) {\n      case 'latency':\n        emergencyConfig.fftSize = Math.max(512, this.config.fftSize / 2);\n        emergencyConfig.updateInterval = Math.min(33, this.config.updateInterval * 1.5);\n        break;\n      case 'cpu':\n        emergencyConfig.updateInterval = this.config.updateInterval * 2;\n        emergencyConfig.smoothingTimeConstant = Math.min(0.95, this.config.smoothingTimeConstant + 0.1);\n        break;\n      case 'memory':\n        emergencyConfig.bpmWindowSize = Math.max(5, this.config.bpmWindowSize / 2);\n        break;\n    }\n    \n    if (Object.keys(emergencyConfig).length > 0) {\n      this.updateConfig(emergencyConfig);\n      console.log('🚨 Emergency optimizations applied');\n    }\n  }\n  \n  /**\n   * Update configuration\n   */\n  public updateConfig(newConfig: Partial<EnhancedAudioConfig>): void {\n    this.config = { ...this.config, ...newConfig };\n    \n    // Update component configurations\n    this.audioAnalyzer.updateConfig(newConfig);\n    this.adaptiveOptimizer.updateConfig(this.config);\n    \n    console.log('🔧 Enhanced Audio System configuration updated');\n  }\n  \n  /**\n   * Get current configuration\n   */\n  public getConfig(): EnhancedAudioConfig {\n    return { ...this.config };\n  }\n  \n  /**\n   * Get current state\n   */\n  public getCurrentState(): EnhancedAudioState {\n    return { ...this.currentState };\n  }\n  \n  /**\n   * Export system data\n   */\n  public exportSystemData(): {\n    config: EnhancedAudioConfig;\n    patterns: any[];\n    performance: any[];\n    optimizations: any[];\n  } {\n    return {\n      config: this.config,\n      patterns: this.patternRecognition.exportPatterns(),\n      performance: this.performanceMonitor.exportMetrics(),\n      optimizations: this.optimizationHistory\n    };\n  }\n  \n  /**\n   * Import system data\n   */\n  public importSystemData(data: {\n    config?: Partial<EnhancedAudioConfig>;\n    patterns?: any[];\n  }): void {\n    if (data.config) {\n      this.updateConfig(data.config);\n    }\n    \n    if (data.patterns) {\n      this.patternRecognition.importPatterns(data.patterns);\n    }\n    \n    console.log('📥 System data imported successfully');\n  }\n}\n\n/**\n * Adaptive Optimizer for automatic performance tuning\n */\nclass AdaptiveOptimizer {\n  private config: EnhancedAudioConfig;\n  private performanceHistory: PerformanceMetrics[] = [];\n  private lastSuggestions: string[] = [];\n  \n  constructor(config: EnhancedAudioConfig) {\n    this.config = config;\n  }\n  \n  analyzePerformance(metrics: PerformanceMetrics): void {\n    this.performanceHistory.push(metrics);\n    if (this.performanceHistory.length > 100) {\n      this.performanceHistory.shift();\n    }\n  }\n  \n  generateOptimizations(): Array<{ type: string; config: Partial<EnhancedAudioConfig>; improvement: number }> {\n    const suggestions: Array<{ type: string; config: Partial<EnhancedAudioConfig>; improvement: number }> = [];\n    \n    if (this.performanceHistory.length < 10) return suggestions;\n    \n    const recent = this.performanceHistory.slice(-10);\n    const avgLatency = recent.reduce((sum, m) => sum + m.audioLatency, 0) / recent.length;\n    const avgFrameRate = recent.reduce((sum, m) => sum + m.analysisFrameRate, 0) / recent.length;\n    const avgCPU = recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length;\n    \n    // Latency optimization\n    if (avgLatency > 30) {\n      suggestions.push({\n        type: 'latency_reduction',\n        config: { \n          fftSize: Math.max(512, this.config.fftSize / 2),\n          updateInterval: this.config.updateInterval * 1.2\n        },\n        improvement: Math.min(0.5, avgLatency / 50)\n      });\n    }\n    \n    // Frame rate optimization\n    if (avgFrameRate < 50) {\n      suggestions.push({\n        type: 'framerate_optimization',\n        config: { \n          updateInterval: this.config.updateInterval * 1.5,\n          smoothingTimeConstant: Math.min(0.95, this.config.smoothingTimeConstant + 0.1)\n        },\n        improvement: Math.min(0.4, (60 - avgFrameRate) / 60)\n      });\n    }\n    \n    // CPU optimization\n    if (avgCPU > 0.7) {\n      suggestions.push({\n        type: 'cpu_optimization',\n        config: { \n          fftSize: Math.max(512, this.config.fftSize / 2),\n          bpmWindowSize: Math.max(5, this.config.bpmWindowSize - 2)\n        },\n        improvement: Math.min(0.3, avgCPU - 0.5)\n      });\n    }\n    \n    return suggestions;\n  }\n  \n  updateConfig(config: EnhancedAudioConfig): void {\n    this.config = config;\n  }\n  \n  getLastSuggestions(): string[] {\n    return this.lastSuggestions;\n  }\n}\n\n/**\n * Create and initialize an enhanced audio system\n */\nexport async function createEnhancedAudioSystem(config?: Partial<EnhancedAudioConfig>): Promise<EnhancedAudioSystem> {\n  const system = new EnhancedAudioSystem(config);\n  await system.initialize();\n  return system;\n}\n\nexport default EnhancedAudioSystem;
