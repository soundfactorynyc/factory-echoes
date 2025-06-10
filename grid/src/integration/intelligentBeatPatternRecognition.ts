/**
 * GRID OS Intelligent Beat Pattern Recognition
 * 
 * Advanced pattern recognition system that learns and adapts to different music styles
 * Uses machine learning techniques to improve beat detection accuracy over time
 */

import { Subject, Observable, BehaviorSubject } from 'rxjs';
import type { BeatEvent, BeatPredictionEvent } from '../types/integration';

export interface MusicPattern {
  id: string;
  name: string;
  genre: string;
  timeSignature: string;
  averageBPM: number;
  bpmVariance: number;
  rhythmComplexity: number; // 0-1
  syncopation: number; // 0-1
  downbeatEmphasis: number; // 0-1
  characteristics: string[];
  confidence: number; // 0-1
  sampleCount: number;
  lastUpdated: number;
}

export interface PatternMatch {
  pattern: MusicPattern;
  confidence: number;
  matchedFeatures: string[];
  adaptationSuggestions: string[];
}

export interface BeatFeatures {
  timestamp: number;
  intensity: number;
  frequency: number;
  duration: number;
  intervalToPrevious: number;
  intervalToNext?: number;
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  mfcc: number[]; // Mel-frequency cepstral coefficients
}

export interface RhythmAnalysis {
  timeSignature: { numerator: number; denominator: number };
  subdivision: number; // 1, 2, 4, 8, 16 (note subdivision)
  swing: number; // 0-1 (amount of swing feel)
  syncopation: number; // 0-1 (rhythmic complexity)
  polyrhythm: boolean;
  crossRhythm: boolean;
  patterns: string[]; // Identified rhythm patterns
}

/**
 * Intelligent Beat Pattern Recognition System
 */
export class IntelligentBeatPatternRecognition {
  private knownPatterns: Map<string, MusicPattern> = new Map();
  private currentPattern: MusicPattern | null = null;
  private recentBeats: BeatFeatures[] = [];
  private rhythmBuffer: number[] = [];
  
  // Learning parameters
  private learningRate = 0.1;
  private confidenceThreshold = 0.7;
  private adaptationWindow = 50; // Number of beats to analyze
  
  // Feature extraction
  private spectralAnalyzer: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  
  // Observable streams
  private readonly _patternDetected$ = new Subject<PatternMatch>();
  private readonly _rhythmAnalysis$ = new Subject<RhythmAnalysis>();
  private readonly _adaptationSuggestion$ = new Subject<string[]>();
  private readonly _learningProgress$ = new BehaviorSubject<number>(0);
  
  public readonly patternDetected$: Observable<PatternMatch> = this._patternDetected$.asObservable();
  public readonly rhythmAnalysis$: Observable<RhythmAnalysis> = this._rhythmAnalysis$.asObservable();
  public readonly adaptationSuggestion$: Observable<string[]> = this._adaptationSuggestion$.asObservable();
  public readonly learningProgress$: Observable<number> = this._learningProgress$.asObservable();
  
  constructor() {
    this.initializeDefaultPatterns();
    console.log('🧠 Intelligent Beat Pattern Recognition initialized');
  }
  
  /**
   * Initialize default music patterns
   */
  private initializeDefaultPatterns(): void {
    const defaultPatterns: MusicPattern[] = [
      {
        id: 'four-on-floor',
        name: 'Four on the Floor',
        genre: 'Electronic',
        timeSignature: '4/4',
        averageBPM: 128,
        bpmVariance: 10,
        rhythmComplexity: 0.2,
        syncopation: 0.1,
        downbeatEmphasis: 0.9,
        characteristics: ['steady', 'driving', 'simple'],
        confidence: 0.9,
        sampleCount: 1000,
        lastUpdated: Date.now()
      },
      {
        id: 'swing-jazz',
        name: 'Swing Jazz',
        genre: 'Jazz',
        timeSignature: '4/4',
        averageBPM: 140,
        bpmVariance: 20,
        rhythmComplexity: 0.7,
        syncopation: 0.8,
        downbeatEmphasis: 0.6,
        characteristics: ['swung', 'syncopated', 'complex'],
        confidence: 0.8,
        sampleCount: 500,
        lastUpdated: Date.now()
      },
      {
        id: 'latin-clave',
        name: 'Latin Clave',
        genre: 'Latin',
        timeSignature: '4/4',
        averageBPM: 110,
        bpmVariance: 15,
        rhythmComplexity: 0.8,
        syncopation: 0.9,
        downbeatEmphasis: 0.7,
        characteristics: ['polyrhythmic', 'clave', 'syncopated'],
        confidence: 0.7,
        sampleCount: 300,
        lastUpdated: Date.now()
      },
      {
        id: 'breakbeat',
        name: 'Breakbeat',
        genre: 'Electronic',
        timeSignature: '4/4',
        averageBPM: 140,
        bpmVariance: 30,
        rhythmComplexity: 0.9,
        syncopation: 0.8,
        downbeatEmphasis: 0.5,
        characteristics: ['broken', 'complex', 'irregular'],
        confidence: 0.6,
        sampleCount: 200,
        lastUpdated: Date.now()
      },
      {
        id: 'waltz',
        name: 'Waltz',
        genre: 'Classical',
        timeSignature: '3/4',
        averageBPM: 120,
        bpmVariance: 25,
        rhythmComplexity: 0.3,
        syncopation: 0.2,
        downbeatEmphasis: 0.8,
        characteristics: ['triple', 'flowing', 'waltz'],
        confidence: 0.9,
        sampleCount: 400,
        lastUpdated: Date.now()
      }
    ];
    
    defaultPatterns.forEach(pattern => {
      this.knownPatterns.set(pattern.id, pattern);
    });
    
    console.log(`📚 Loaded ${defaultPatterns.length} default patterns`);
  }
  
  /**
   * Set audio context for spectral analysis
   */
  public setAudioContext(audioContext: AudioContext, analyser: AnalyserNode): void {
    this.audioContext = audioContext;
    this.spectralAnalyzer = analyser;
    console.log('🎵 Audio context set for pattern recognition');
  }
  
  /**
   * Process a new beat event for pattern recognition
   */
  public processBeat(beatEvent: BeatEvent, frequencyData?: Uint8Array): void {
    // Extract features from the beat
    const features = this.extractBeatFeatures(beatEvent, frequencyData);
    
    // Add to recent beats buffer
    this.recentBeats.push(features);
    if (this.recentBeats.length > this.adaptationWindow) {
      this.recentBeats.shift();
    }
    
    // Update rhythm buffer
    this.rhythmBuffer.push(beatEvent.timestamp);
    if (this.rhythmBuffer.length > 32) { // Keep 32 beat window
      this.rhythmBuffer.shift();
    }
    
    // Analyze pattern if we have enough data
    if (this.recentBeats.length >= 8) {
      this.analyzeCurrentPattern();
    }
    
    // Perform rhythm analysis
    if (this.rhythmBuffer.length >= 8) {
      this.performRhythmAnalysis();
    }
  }
  
  /**
   * Extract features from a beat event
   */
  private extractBeatFeatures(beatEvent: BeatEvent, frequencyData?: Uint8Array): BeatFeatures {
    const features: BeatFeatures = {
      timestamp: beatEvent.timestamp,
      intensity: beatEvent.intensity,
      frequency: 0,
      duration: 0,
      intervalToPrevious: 0,
      spectralCentroid: 0,
      spectralRolloff: 0,
      zeroCrossingRate: 0,
      mfcc: []
    };
    
    // Calculate interval to previous beat
    if (this.recentBeats.length > 0) {
      const previousBeat = this.recentBeats[this.recentBeats.length - 1];
      features.intervalToPrevious = beatEvent.timestamp - previousBeat.timestamp;
    }
    
    // Extract spectral features if frequency data is available
    if (frequencyData && this.audioContext) {
      features.spectralCentroid = this.calculateSpectralCentroid(frequencyData);
      features.spectralRolloff = this.calculateSpectralRolloff(frequencyData);
      features.mfcc = this.calculateMFCC(frequencyData);
    }
    
    return features;
  }
  
  /**
   * Calculate spectral centroid
   */
  private calculateSpectralCentroid(frequencyData: Uint8Array): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = frequencyData[i];
      const frequency = i * (this.audioContext!.sampleRate / 2) / frequencyData.length;
      
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }
  
  /**
   * Calculate spectral rolloff
   */
  private calculateSpectralRolloff(frequencyData: Uint8Array, threshold: number = 0.85): number {
    const totalEnergy = frequencyData.reduce((sum, val) => sum + val * val, 0);
    const rolloffEnergy = totalEnergy * threshold;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      cumulativeEnergy += frequencyData[i] * frequencyData[i];
      if (cumulativeEnergy >= rolloffEnergy) {
        return i * (this.audioContext!.sampleRate / 2) / frequencyData.length;
      }
    }
    
    return (this.audioContext!.sampleRate / 2);
  }
  
  /**
   * Calculate simplified MFCC features
   */
  private calculateMFCC(frequencyData: Uint8Array): number[] {
    // Simplified MFCC calculation (normally requires mel-scale filterbank)
    const mfcc: number[] = [];
    const numCoeffs = 12;
    const binStep = Math.floor(frequencyData.length / numCoeffs);
    
    for (let i = 0; i < numCoeffs; i++) {
      const startBin = i * binStep;
      const endBin = Math.min((i + 1) * binStep, frequencyData.length);
      
      let energy = 0;
      for (let j = startBin; j < endBin; j++) {
        energy += frequencyData[j] * frequencyData[j];
      }
      
      mfcc.push(Math.log(energy + 1)); // Log energy in mel band
    }
    
    return mfcc;
  }
  
  /**
   * Analyze current pattern against known patterns
   */
  private analyzeCurrentPattern(): void {
    const matches: PatternMatch[] = [];
    
    // Calculate current rhythm features
    const currentFeatures = this.calculateRhythmFeatures();
    
    // Compare against known patterns
    for (const [patternId, pattern] of this.knownPatterns) {
      const confidence = this.calculatePatternSimilarity(currentFeatures, pattern);
      
      if (confidence > 0.3) { // Minimum threshold for consideration
        matches.push({
          pattern,
          confidence,
          matchedFeatures: this.getMatchedFeatures(currentFeatures, pattern),
          adaptationSuggestions: this.generateAdaptationSuggestions(currentFeatures, pattern)
        });
      }
    }
    
    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Update current pattern if we have a good match
    if (matches.length > 0 && matches[0].confidence > this.confidenceThreshold) {
      const bestMatch = matches[0];
      
      if (!this.currentPattern || bestMatch.pattern.id !== this.currentPattern.id) {
        this.currentPattern = bestMatch.pattern;
        this._patternDetected$.next(bestMatch);
        console.log(`🎯 Pattern detected: ${bestMatch.pattern.name} (${(bestMatch.confidence * 100).toFixed(1)}%)`);
        
        // Adapt the pattern based on current data
        this.adaptPattern(bestMatch.pattern, currentFeatures);
      }
    }
    
    // If no good match, create a new pattern
    else if (this.recentBeats.length >= this.adaptationWindow) {
      const newPattern = this.createNewPattern(currentFeatures);
      if (newPattern) {
        this.knownPatterns.set(newPattern.id, newPattern);
        this.currentPattern = newPattern;
        console.log(`✨ New pattern learned: ${newPattern.name}`);
      }
    }
  }
  
  /**
   * Calculate rhythm features from recent beats
   */
  private calculateRhythmFeatures(): {
    averageBPM: number;
    bpmVariance: number;
    rhythmComplexity: number;
    syncopation: number;
    downbeatEmphasis: number;
    timeSignature: string;
  } {
    if (this.recentBeats.length < 4) {
      return {
        averageBPM: 120,
        bpmVariance: 0,
        rhythmComplexity: 0,
        syncopation: 0,
        downbeatEmphasis: 0,
        timeSignature: '4/4'
      };
    }
    
    // Calculate intervals
    const intervals = this.recentBeats.slice(1).map((beat, i) => 
      beat.intervalToPrevious
    ).filter(interval => interval > 0);
    
    // Calculate BPM
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const averageBPM = 60000 / avgInterval;
    
    // Calculate BPM variance
    const intervalVariance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const bpmVariance = Math.sqrt(intervalVariance) / avgInterval;
    
    // Calculate rhythm complexity (based on interval variety)
    const uniqueIntervals = new Set(intervals.map(i => Math.round(i / 10) * 10)).size;
    const rhythmComplexity = Math.min(1, uniqueIntervals / 8);
    
    // Calculate syncopation (based on off-beat emphasis)
    const syncopation = this.calculateSyncopation();
    
    // Calculate downbeat emphasis
    const downbeatEmphasis = this.calculateDownbeatEmphasis();
    
    // Detect time signature
    const timeSignature = this.detectTimeSignature();
    
    return {
      averageBPM,
      bpmVariance,
      rhythmComplexity,
      syncopation,
      downbeatEmphasis,
      timeSignature
    };
  }
  
  /**
   * Calculate syncopation level
   */
  private calculateSyncopation(): number {
    if (this.rhythmBuffer.length < 8) return 0;
    
    // Analyze beat placement relative to expected grid
    const intervals = [];
    for (let i = 1; i < this.rhythmBuffer.length; i++) {
      intervals.push(this.rhythmBuffer[i] - this.rhythmBuffer[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    
    // Count beats that fall off the regular grid
    let offBeatCount = 0;
    for (let i = 1; i < this.rhythmBuffer.length; i++) {
      const expectedTime = this.rhythmBuffer[0] + (i * avgInterval);
      const actualTime = this.rhythmBuffer[i];
      const deviation = Math.abs(actualTime - expectedTime);
      
      if (deviation > avgInterval * 0.15) { // 15% deviation threshold
        offBeatCount++;
      }
    }
    
    return Math.min(1, offBeatCount / intervals.length);
  }
  
  /**
   * Calculate downbeat emphasis
   */
  private calculateDownbeatEmphasis(): number {
    if (this.recentBeats.length < 8) return 0;
    
    // Assume 4/4 time and check intensity on beats 1 and 3
    const intensities = this.recentBeats.map(beat => beat.intensity);
    const beatPositions = this.recentBeats.length;
    
    let downbeatIntensity = 0;
    let offbeatIntensity = 0;
    let downbeatCount = 0;
    let offbeatCount = 0;
    
    for (let i = 0; i < intensities.length; i++) {
      const beatPosition = i % 4;
      if (beatPosition === 0 || beatPosition === 2) { // Downbeats
        downbeatIntensity += intensities[i];
        downbeatCount++;
      } else { // Offbeats
        offbeatIntensity += intensities[i];
        offbeatCount++;
      }
    }
    
    const avgDownbeat = downbeatCount > 0 ? downbeatIntensity / downbeatCount : 0;
    const avgOffbeat = offbeatCount > 0 ? offbeatIntensity / offbeatCount : 0;
    
    return avgOffbeat > 0 ? Math.min(1, avgDownbeat / avgOffbeat) : 1;
  }
  
  /**
   * Detect time signature
   */
  private detectTimeSignature(): string {
    if (this.rhythmBuffer.length < 12) return '4/4';
    
    // Analyze grouping patterns
    const intervals = [];
    for (let i = 1; i < this.rhythmBuffer.length; i++) {
      intervals.push(this.rhythmBuffer[i] - this.rhythmBuffer[i - 1]);
    }
    
    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    
    // Look for recurring patterns
    const patterns = [3, 4, 6, 8]; // Common time signatures
    let bestPattern = 4;
    let bestScore = 0;
    
    for (const pattern of patterns) {
      let score = 0;
      for (let i = 0; i < intervals.length - pattern; i += pattern) {
        const groupInterval = intervals.slice(i, i + pattern).reduce((sum, val) => sum + val, 0);
        const expectedInterval = avgInterval * pattern;
        const accuracy = 1 - Math.abs(groupInterval - expectedInterval) / expectedInterval;
        score += Math.max(0, accuracy);
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestPattern = pattern;
      }
    }
    
    return `${bestPattern}/4`;
  }
  
  /**
   * Calculate similarity between current features and a known pattern
   */
  private calculatePatternSimilarity(currentFeatures: any, pattern: MusicPattern): number {
    let similarity = 0;
    let featureCount = 0;
    
    // BPM similarity
    const bpmDiff = Math.abs(currentFeatures.averageBPM - pattern.averageBPM);
    const bpmSimilarity = Math.max(0, 1 - (bpmDiff / pattern.averageBPM));
    similarity += bpmSimilarity * 0.3;
    featureCount++;
    
    // Time signature match
    if (currentFeatures.timeSignature === pattern.timeSignature) {
      similarity += 0.2;
    }
    featureCount++;
    
    // Rhythm complexity similarity
    const complexityDiff = Math.abs(currentFeatures.rhythmComplexity - pattern.rhythmComplexity);
    similarity += (1 - complexityDiff) * 0.2;
    featureCount++;
    
    // Syncopation similarity
    const syncopationDiff = Math.abs(currentFeatures.syncopation - pattern.syncopation);
    similarity += (1 - syncopationDiff) * 0.15;
    featureCount++;
    
    // Downbeat emphasis similarity
    const emphasisDiff = Math.abs(currentFeatures.downbeatEmphasis - pattern.downbeatEmphasis);
    similarity += (1 - emphasisDiff) * 0.15;
    featureCount++;
    
    return similarity / featureCount;
  }
  
  /**
   * Get matched features between current and pattern
   */
  private getMatchedFeatures(currentFeatures: any, pattern: MusicPattern): string[] {
    const matched: string[] = [];
    
    if (currentFeatures.timeSignature === pattern.timeSignature) {
      matched.push('time_signature');
    }
    
    if (Math.abs(currentFeatures.averageBPM - pattern.averageBPM) < 10) {
      matched.push('tempo');
    }
    
    if (Math.abs(currentFeatures.syncopation - pattern.syncopation) < 0.2) {
      matched.push('syncopation');
    }
    
    if (Math.abs(currentFeatures.rhythmComplexity - pattern.rhythmComplexity) < 0.2) {
      matched.push('complexity');
    }
    
    return matched;
  }
  
  /**
   * Generate adaptation suggestions
   */
  private generateAdaptationSuggestions(currentFeatures: any, pattern: MusicPattern): string[] {
    const suggestions: string[] = [];
    
    const bpmDiff = currentFeatures.averageBPM - pattern.averageBPM;
    if (Math.abs(bpmDiff) > 10) {
      suggestions.push(`Adjust tempo by ${bpmDiff > 0 ? '+' : ''}${bpmDiff.toFixed(0)} BPM`);
    }
    
    const complexityDiff = currentFeatures.rhythmComplexity - pattern.rhythmComplexity;
    if (complexityDiff > 0.2) {
      suggestions.push('Consider simplifying rhythm pattern');
    } else if (complexityDiff < -0.2) {
      suggestions.push('Consider adding rhythmic variation');
    }
    
    const syncopationDiff = currentFeatures.syncopation - pattern.syncopation;
    if (syncopationDiff > 0.2) {
      suggestions.push('Reduce syncopation for better pattern match');
    } else if (syncopationDiff < -0.2) {
      suggestions.push('Add syncopation for better pattern match');
    }
    
    return suggestions;
  }
  
  /**
   * Adapt an existing pattern based on current data
   */
  private adaptPattern(pattern: MusicPattern, currentFeatures: any): void {
    // Use learning rate to gradually adapt pattern
    const lr = this.learningRate;
    
    pattern.averageBPM = pattern.averageBPM * (1 - lr) + currentFeatures.averageBPM * lr;
    pattern.rhythmComplexity = pattern.rhythmComplexity * (1 - lr) + currentFeatures.rhythmComplexity * lr;
    pattern.syncopation = pattern.syncopation * (1 - lr) + currentFeatures.syncopation * lr;
    pattern.downbeatEmphasis = pattern.downbeatEmphasis * (1 - lr) + currentFeatures.downbeatEmphasis * lr;
    
    pattern.sampleCount++;
    pattern.lastUpdated = Date.now();
    
    // Update confidence based on consistency
    const consistency = this.calculatePatternConsistency(pattern);
    pattern.confidence = Math.min(0.95, pattern.confidence * 0.95 + consistency * 0.05);
    
    this._learningProgress$.next(pattern.confidence);
  }
  
  /**
   * Create a new pattern from current features
   */
  private createNewPattern(currentFeatures: any): MusicPattern | null {
    if (this.recentBeats.length < this.adaptationWindow) return null;
    
    const id = `custom_${Date.now()}`;
    const characteristics = this.identifyCharacteristics(currentFeatures);
    
    const newPattern: MusicPattern = {
      id,
      name: `Custom Pattern ${characteristics.join(', ')}`,
      genre: 'Unknown',
      timeSignature: currentFeatures.timeSignature,
      averageBPM: currentFeatures.averageBPM,
      bpmVariance: currentFeatures.bpmVariance,
      rhythmComplexity: currentFeatures.rhythmComplexity,
      syncopation: currentFeatures.syncopation,
      downbeatEmphasis: currentFeatures.downbeatEmphasis,
      characteristics,
      confidence: 0.5, // Start with medium confidence
      sampleCount: this.recentBeats.length,
      lastUpdated: Date.now()
    };
    
    return newPattern;
  }
  
  /**
   * Identify characteristics of current rhythm
   */
  private identifyCharacteristics(features: any): string[] {
    const characteristics: string[] = [];
    
    if (features.averageBPM > 140) characteristics.push('fast');
    else if (features.averageBPM < 90) characteristics.push('slow');
    else characteristics.push('moderate');
    
    if (features.rhythmComplexity > 0.7) characteristics.push('complex');
    else if (features.rhythmComplexity < 0.3) characteristics.push('simple');
    
    if (features.syncopation > 0.6) characteristics.push('syncopated');
    if (features.downbeatEmphasis > 0.8) characteristics.push('steady');
    
    if (features.timeSignature !== '4/4') characteristics.push('irregular');
    
    return characteristics.length > 0 ? characteristics : ['neutral'];
  }
  
  /**
   * Calculate pattern consistency
   */
  private calculatePatternConsistency(pattern: MusicPattern): number {
    // This would analyze how consistently the pattern matches recent data
    // For now, return a simplified calculation
    return Math.min(1, pattern.sampleCount / 100);
  }
  
  /**
   * Perform rhythm analysis
   */
  private performRhythmAnalysis(): void {
    const features = this.calculateRhythmFeatures();
    
    const analysis: RhythmAnalysis = {
      timeSignature: this.parseTimeSignature(features.timeSignature),
      subdivision: this.detectSubdivision(),
      swing: this.detectSwing(),
      syncopation: features.syncopation,
      polyrhythm: this.detectPolyrhythm(),
      crossRhythm: this.detectCrossRhythm(),
      patterns: this.identifyRhythmPatterns()
    };
    
    this._rhythmAnalysis$.next(analysis);
  }
  
  /**
   * Parse time signature string
   */
  private parseTimeSignature(timeSignature: string): { numerator: number; denominator: number } {
    const parts = timeSignature.split('/');
    return {
      numerator: parseInt(parts[0]) || 4,
      denominator: parseInt(parts[1]) || 4
    };
  }
  
  /**
   * Detect subdivision level
   */
  private detectSubdivision(): number {
    // Analyze beat subdivisions
    return 4; // Default to quarter notes
  }
  
  /**
   * Detect swing feel
   */
  private detectSwing(): number {
    // Analyze timing between beats for swing feel
    return 0; // Default to straight feel
  }
  
  /**
   * Detect polyrhythm
   */
  private detectPolyrhythm(): boolean {
    // Look for multiple simultaneous rhythmic patterns
    return false; // Simplified
  }
  
  /**
   * Detect cross rhythm
   */
  private detectCrossRhythm(): boolean {
    // Look for rhythms that cross bar lines
    return false; // Simplified
  }
  
  /**
   * Identify specific rhythm patterns
   */
  private identifyRhythmPatterns(): string[] {
    const patterns: string[] = [];
    
    if (this.currentPattern) {
      patterns.push(...this.currentPattern.characteristics);
    }
    
    return patterns;
  }
  
  /**
   * Get current pattern information
   */
  public getCurrentPattern(): MusicPattern | null {
    return this.currentPattern;
  }
  
  /**
   * Get all known patterns
   */
  public getKnownPatterns(): MusicPattern[] {
    return Array.from(this.knownPatterns.values());
  }
  
  /**
   * Export learned patterns
   */
  public exportPatterns(): MusicPattern[] {
    return this.getKnownPatterns().filter(pattern => pattern.id.startsWith('custom_'));
  }
  
  /**
   * Import patterns
   */
  public importPatterns(patterns: MusicPattern[]): void {
    patterns.forEach(pattern => {
      this.knownPatterns.set(pattern.id, pattern);
    });
    console.log(`📥 Imported ${patterns.length} patterns`);
  }
  
  /**
   * Reset learning system
   */
  public reset(): void {
    this.currentPattern = null;
    this.recentBeats = [];
    this.rhythmBuffer = [];
    
    // Keep only default patterns
    const customPatterns = Array.from(this.knownPatterns.entries())
      .filter(([id]) => id.startsWith('custom_'));
    
    customPatterns.forEach(([id]) => {
      this.knownPatterns.delete(id);
    });
    
    console.log('🔄 Pattern recognition system reset');
  }
}

export default IntelligentBeatPatternRecognition;
