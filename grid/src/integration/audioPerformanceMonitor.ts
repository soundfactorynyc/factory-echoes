/**
 * GRID OS Audio Performance Monitor
 * 
 * Real-time performance monitoring and optimization for audio beat detection
 * Tracks metrics, identifies bottlenecks, and provides automatic optimization
 */

import { Subject, Observable, interval, BehaviorSubject } from 'rxjs';
import { map, throttleTime, scan } from 'rxjs/operators';

export interface PerformanceMetrics {
  timestamp: number;
  
  // Audio Processing Metrics
  audioLatency: number; // ms
  analysisFrameRate: number; // fps
  beatDetectionAccuracy: number; // 0-1
  
  // System Metrics
  cpuUsage: number; // 0-1
  memoryUsage: number; // MB
  audioContextLatency: number; // ms
  
  // Detection Quality Metrics
  falsePositiveRate: number; // 0-1
  missedBeatsRate: number; // 0-1
  bpmStability: number; // 0-1 (variance)
  
  // Real-time Performance
  frameDrops: number;
  processingTime: number; // ms
  bufferUnderruns: number;
}

export interface OptimizationSuggestion {
  type: 'performance' | 'accuracy' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
  estimatedImprovement: number; // 0-1
}

export interface PerformanceAlert {
  timestamp: number;
  type: 'latency' | 'cpu' | 'memory' | 'accuracy' | 'stability';
  severity: 'warning' | 'error' | 'critical';
  message: string;
  currentValue: number;
  threshold: number;
  suggestions: OptimizationSuggestion[];
}

/**
 * Audio Performance Monitor
 */
export class AudioPerformanceMonitor {
  private isMonitoring = false;
  private metricsHistory: PerformanceMetrics[] = [];
  private performanceTimers: Map<string, number> = new Map();
  
  // Performance tracking
  private frameCount = 0;
  private lastFrameTime = 0;
  private frameRateBuffer: number[] = [];
  private latencyBuffer: number[] = [];
  
  // Beat detection tracking
  private beatTimestamps: number[] = [];
  private predictedBeats: number[] = [];
  private actualBeats: number[] = [];
  
  // Observable streams
  private readonly _metrics$ = new BehaviorSubject<PerformanceMetrics | null>(null);
  private readonly _alerts$ = new Subject<PerformanceAlert>();
  private readonly _suggestions$ = new Subject<OptimizationSuggestion[]>();
  
  public readonly metrics$: Observable<PerformanceMetrics | null> = this._metrics$.asObservable();
  public readonly alerts$: Observable<PerformanceAlert> = this._alerts$.asObservable();
  public readonly suggestions$: Observable<OptimizationSuggestion[]> = this._suggestions$.asObservable();
  
  constructor() {
    console.log('📊 Audio Performance Monitor initialized');
  }
  
  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = performance.now();
    
    // Start metrics collection interval
    interval(1000).subscribe(() => {
      if (this.isMonitoring) {
        this.collectMetrics();
      }
    });
    
    console.log('🚀 Performance monitoring started');
  }
  
  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('⏹️ Performance monitoring stopped');
  }
  
  /**
   * Start timing a performance operation
   */
  public startTimer(operation: string): void {
    this.performanceTimers.set(operation, performance.now());
  }
  
  /**
   * End timing a performance operation
   */
  public endTimer(operation: string): number {
    const startTime = this.performanceTimers.get(operation);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.performanceTimers.delete(operation);
    return duration;
  }
  
  /**
   * Record a frame for frame rate calculation
   */
  public recordFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    this.frameRateBuffer.push(1000 / frameTime);
    if (this.frameRateBuffer.length > 60) {
      this.frameRateBuffer.shift();
    }
    
    this.lastFrameTime = now;
    this.frameCount++;
  }
  
  /**
   * Record audio processing latency
   */
  public recordLatency(latency: number): void {
    this.latencyBuffer.push(latency);
    if (this.latencyBuffer.length > 100) {
      this.latencyBuffer.shift();
    }
  }
  
  /**
   * Record beat detection event
   */
  public recordBeatDetection(timestamp: number, predicted: boolean = false): void {
    if (predicted) {
      this.predictedBeats.push(timestamp);
    } else {
      this.actualBeats.push(timestamp);
    }
    
    // Keep only recent beats (last 30 seconds)
    const cutoff = timestamp - 30000;
    this.predictedBeats = this.predictedBeats.filter(t => t > cutoff);
    this.actualBeats = this.actualBeats.filter(t => t > cutoff);
  }
  
  /**
   * Collect comprehensive performance metrics
   */
  private async collectMetrics(): Promise<void> {
    const timestamp = Date.now();
    
    // Calculate frame rate
    const avgFrameRate = this.frameRateBuffer.length > 0 
      ? this.frameRateBuffer.reduce((sum, rate) => sum + rate, 0) / this.frameRateBuffer.length
      : 0;
    
    // Calculate average latency
    const avgLatency = this.latencyBuffer.length > 0
      ? this.latencyBuffer.reduce((sum, lat) => sum + lat, 0) / this.latencyBuffer.length
      : 0;
    
    // Calculate beat detection accuracy
    const accuracy = this.calculateBeatAccuracy();
    
    // Get system metrics
    const systemMetrics = await this.getSystemMetrics();
    
    // Calculate BPM stability
    const bpmStability = this.calculateBPMStability();
    
    const metrics: PerformanceMetrics = {
      timestamp,
      audioLatency: avgLatency,
      analysisFrameRate: avgFrameRate,
      beatDetectionAccuracy: accuracy.accuracy,
      cpuUsage: systemMetrics.cpuUsage,
      memoryUsage: systemMetrics.memoryUsage,
      audioContextLatency: systemMetrics.audioContextLatency,
      falsePositiveRate: accuracy.falsePositiveRate,
      missedBeatsRate: accuracy.missedBeatsRate,
      bpmStability: bpmStability,
      frameDrops: this.calculateFrameDrops(),
      processingTime: this.calculateAvgProcessingTime(),
      bufferUnderruns: 0 // Would need AudioContext monitoring
    };
    
    // Store metrics
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 300) { // Keep 5 minutes of history
      this.metricsHistory.shift();
    }
    
    // Emit metrics
    this._metrics$.next(metrics);
    
    // Check for performance issues
    this.checkPerformanceAlerts(metrics);
    
    // Generate optimization suggestions
    this.generateOptimizationSuggestions(metrics);
  }
  
  /**
   * Calculate beat detection accuracy
   */
  private calculateBeatAccuracy(): { accuracy: number; falsePositiveRate: number; missedBeatsRate: number } {
    if (this.actualBeats.length === 0 || this.predictedBeats.length === 0) {
      return { accuracy: 0, falsePositiveRate: 0, missedBeatsRate: 0 };
    }
    
    const tolerance = 100; // 100ms tolerance
    let truePositives = 0;
    let falsePositives = 0;
    let missedBeats = 0;
    
    // Check predicted beats against actual beats
    for (const predicted of this.predictedBeats) {
      const hasMatch = this.actualBeats.some(actual => 
        Math.abs(actual - predicted) <= tolerance
      );
      
      if (hasMatch) {
        truePositives++;
      } else {
        falsePositives++;
      }
    }
    
    // Check for missed beats
    for (const actual of this.actualBeats) {
      const hasMatch = this.predictedBeats.some(predicted => 
        Math.abs(actual - predicted) <= tolerance
      );
      
      if (!hasMatch) {
        missedBeats++;
      }
    }
    
    const totalPredicted = this.predictedBeats.length;
    const totalActual = this.actualBeats.length;
    
    return {
      accuracy: totalPredicted > 0 ? truePositives / totalPredicted : 0,
      falsePositiveRate: totalPredicted > 0 ? falsePositives / totalPredicted : 0,
      missedBeatsRate: totalActual > 0 ? missedBeats / totalActual : 0
    };
  }
  
  /**
   * Get system performance metrics
   */
  private async getSystemMetrics(): Promise<{
    cpuUsage: number;
    memoryUsage: number;
    audioContextLatency: number;
  }> {
    // Memory usage
    const memInfo = (performance as any).memory;
    const memoryUsage = memInfo ? memInfo.usedJSHeapSize / (1024 * 1024) : 0;
    
    // CPU usage estimation (based on frame timing)
    const cpuUsage = this.estimateCPUUsage();
    
    // Audio context latency (would need actual AudioContext reference)
    const audioContextLatency = 0;
    
    return {
      cpuUsage,
      memoryUsage,
      audioContextLatency
    };
  }
  
  /**
   * Estimate CPU usage based on frame timing
   */
  private estimateCPUUsage(): number {
    if (this.frameRateBuffer.length < 10) return 0;
    
    const targetFrameRate = 60;
    const actualFrameRate = this.frameRateBuffer.slice(-10).reduce((sum, rate) => sum + rate, 0) / 10;
    
    // Simple estimation: lower frame rate indicates higher CPU usage
    return Math.max(0, Math.min(1, 1 - (actualFrameRate / targetFrameRate)));
  }
  
  /**
   * Calculate BPM stability
   */
  private calculateBPMStability(): number {
    if (this.actualBeats.length < 4) return 0;
    
    // Calculate intervals between beats
    const intervals = [];
    for (let i = 1; i < this.actualBeats.length; i++) {
      intervals.push(this.actualBeats[i] - this.actualBeats[i - 1]);
    }
    
    // Calculate coefficient of variation
    const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
    
    // Convert to stability score (1 = very stable, 0 = very unstable)
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
  }
  
  /**
   * Calculate frame drops
   */
  private calculateFrameDrops(): number {
    if (this.frameRateBuffer.length < 10) return 0;
    
    const targetFrameTime = 1000 / 60; // 60 FPS
    const tolerance = 5; // 5ms tolerance
    
    return this.frameRateBuffer.filter(rate => 
      (1000 / rate) > (targetFrameTime + tolerance)
    ).length;
  }
  
  /**
   * Calculate average processing time
   */
  private calculateAvgProcessingTime(): number {
    // This would be calculated from timer data
    return 0; // Placeholder
  }
  
  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];
    
    // High latency alert
    if (metrics.audioLatency > 50) {
      alerts.push({
        timestamp: metrics.timestamp,
        type: 'latency',
        severity: metrics.audioLatency > 100 ? 'critical' : 'warning',
        message: `High audio latency detected: ${metrics.audioLatency.toFixed(1)}ms`,
        currentValue: metrics.audioLatency,
        threshold: 50,
        suggestions: [
          {
            type: 'performance',
            severity: 'high',
            description: 'Reduce FFT size or increase buffer size',
            action: 'Optimize audio processing parameters',
            estimatedImprovement: 0.7
          }
        ]
      });
    }
    
    // Low frame rate alert
    if (metrics.analysisFrameRate < 50) {
      alerts.push({
        timestamp: metrics.timestamp,
        type: 'cpu',
        severity: metrics.analysisFrameRate < 30 ? 'error' : 'warning',
        message: `Low analysis frame rate: ${metrics.analysisFrameRate.toFixed(1)} FPS`,
        currentValue: metrics.analysisFrameRate,
        threshold: 50,
        suggestions: [
          {
            type: 'performance',
            severity: 'medium',
            description: 'Reduce analysis frequency or optimize algorithms',
            action: 'Throttle analysis updates',
            estimatedImprovement: 0.5
          }
        ]
      });
    }
    
    // Poor beat detection accuracy
    if (metrics.beatDetectionAccuracy < 0.7) {
      alerts.push({
        timestamp: metrics.timestamp,
        type: 'accuracy',
        severity: metrics.beatDetectionAccuracy < 0.5 ? 'error' : 'warning',
        message: `Low beat detection accuracy: ${(metrics.beatDetectionAccuracy * 100).toFixed(1)}%`,
        currentValue: metrics.beatDetectionAccuracy,
        threshold: 0.7,
        suggestions: [
          {
            type: 'accuracy',
            severity: 'high',
            description: 'Adjust beat detection threshold or algorithm parameters',
            action: 'Tune beat detection sensitivity',
            estimatedImprovement: 0.8
          }
        ]
      });
    }
    
    // Emit alerts
    alerts.forEach(alert => this._alerts$.next(alert));
  }
  
  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(metrics: PerformanceMetrics): void {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Performance optimizations
    if (metrics.cpuUsage > 0.8) {
      suggestions.push({
        type: 'performance',
        severity: 'high',
        description: 'High CPU usage detected. Consider reducing analysis complexity.',
        action: 'Increase update interval or reduce FFT size',
        estimatedImprovement: 0.6
      });
    }
    
    // Memory optimizations
    if (metrics.memoryUsage > 100) {
      suggestions.push({
        type: 'performance',
        severity: 'medium',
        description: 'High memory usage. Consider optimizing buffer management.',
        action: 'Implement buffer pooling or reduce history size',
        estimatedImprovement: 0.4
      });
    }
    
    // Accuracy improvements
    if (metrics.falsePositiveRate > 0.2) {
      suggestions.push({
        type: 'accuracy',
        severity: 'medium',
        description: 'High false positive rate in beat detection.',
        action: 'Increase beat detection threshold or improve filtering',
        estimatedImprovement: 0.7
      });
    }
    
    // Quality improvements
    if (metrics.bpmStability < 0.6) {
      suggestions.push({
        type: 'quality',
        severity: 'medium',
        description: 'Unstable BPM detection. Consider smoothing algorithms.',
        action: 'Implement BPM smoothing or increase detection window',
        estimatedImprovement: 0.5
      });
    }
    
    if (suggestions.length > 0) {
      this._suggestions$.next(suggestions);
    }
  }
  
  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    avgLatency: number;
    avgFrameRate: number;
    avgAccuracy: number;
    avgCPUUsage: number;
    recentIssues: number;
  } {
    if (this.metricsHistory.length === 0) {
      return {
        avgLatency: 0,
        avgFrameRate: 0,
        avgAccuracy: 0,
        avgCPUUsage: 0,
        recentIssues: 0
      };
    }
    
    const recent = this.metricsHistory.slice(-60); // Last minute
    
    return {
      avgLatency: recent.reduce((sum, m) => sum + m.audioLatency, 0) / recent.length,
      avgFrameRate: recent.reduce((sum, m) => sum + m.analysisFrameRate, 0) / recent.length,
      avgAccuracy: recent.reduce((sum, m) => sum + m.beatDetectionAccuracy, 0) / recent.length,
      avgCPUUsage: recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length,
      recentIssues: recent.filter(m => 
        m.audioLatency > 50 || 
        m.analysisFrameRate < 50 || 
        m.beatDetectionAccuracy < 0.7
      ).length
    };
  }
  
  /**
   * Export metrics data
   */
  public exportMetrics(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }
  
  /**
   * Clear metrics history
   */
  public clearHistory(): void {
    this.metricsHistory = [];
    this.frameRateBuffer = [];
    this.latencyBuffer = [];
    this.beatTimestamps = [];
    this.predictedBeats = [];
    this.actualBeats = [];
    console.log('📊 Performance metrics history cleared');
  }
}

export default AudioPerformanceMonitor;
