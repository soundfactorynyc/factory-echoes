/**
 * PerformanceMonitor
 * 
 * This class monitors various performance metrics for the GRID OS system,
 * including FPS, event latency, Claude response time, and grid update time.
 */

import { gridOS } from './gridOSBackend';

export interface PerformanceMetrics {
  /**
   * Frames per second
   */
  fps: number;
  
  /**
   * Event processing latency in milliseconds
   */
  eventLatency: number;
  
  /**
   * Claude API response time in milliseconds
   */
  claudeResponseTime: number;
  
  /**
   * Grid update time in milliseconds
   */
  gridUpdateTime: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  private metrics: PerformanceMetrics = {
    fps: 60,
    eventLatency: 0,
    claudeResponseTime: 0,
    gridUpdateTime: 0
  };
  
  private fpsUpdateCallbacks: ((fps: number) => void)[] = [];
  private metricsUpdateCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  private isMonitoring = false;
  private frameCount = 0;
  private lastFpsUpdateTime = 0;
  
  /**
   * Get the singleton instance of the PerformanceMonitor
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    
    return PerformanceMonitor.instance;
  }
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Start monitoring performance metrics
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    
    // FPS counter
    let lastTime = performance.now();
    const measureFPS = () => {
      const now = performance.now();
      const elapsed = now - lastTime;
      
      // Update frame count
      this.frameCount++;
      
      // Update FPS every second
      if (now - this.lastFpsUpdateTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdateTime));
        this.lastFpsUpdateTime = now;
        this.frameCount = 0;
        
        // Notify FPS update callbacks
        this.fpsUpdateCallbacks.forEach(callback => callback(this.metrics.fps));
        
        // Notify metrics update callbacks
        this.notifyMetricsUpdateCallbacks();
      }
      
      lastTime = now;
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };
    
    // Start FPS measurement
    this.lastFpsUpdateTime = performance.now();
    measureFPS();
    
    // Event latency - use gridCommands$ as a proxy for event latency
    const eventSubscription = gridOS.eventBus.gridCommands$.subscribe((command: any) => {
      if (command && typeof command === 'object') {
        const now = Date.now();
        const timestamp = command.timestamp || now;
        const latency = now - timestamp;
        this.metrics.eventLatency = latency;
        
        // Notify metrics update callbacks
        this.notifyMetricsUpdateCallbacks();
      }
    });
    
    // Claude response time is not directly available, so we'll use a placeholder
    // We could implement this in the future by extending the ClaudeNetwork interface
    this.metrics.claudeResponseTime = 0;
    
    // Grid update time
    let lastGridUpdateTime = 0;
    const gridUpdateSubscription = gridOS.eventBus.gridCommands$.subscribe(command => {
      if (command.type === 'activate') {
        const now = performance.now();
        if (lastGridUpdateTime > 0) {
          this.metrics.gridUpdateTime = now - lastGridUpdateTime;
          
          // Notify metrics update callbacks
          this.notifyMetricsUpdateCallbacks();
        }
        lastGridUpdateTime = now;
      }
    });
  }
  
  /**
   * Stop monitoring performance metrics
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
  }
  
  /**
   * Get the current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Register a callback for FPS updates
   */
  public onFpsUpdate(callback: (fps: number) => void): void {
    this.fpsUpdateCallbacks.push(callback);
  }
  
  /**
   * Register a callback for metrics updates
   */
  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): void {
    this.metricsUpdateCallbacks.push(callback);
  }
  
  /**
   * Unregister a callback for FPS updates
   */
  public offFpsUpdate(callback: (fps: number) => void): void {
    this.fpsUpdateCallbacks = this.fpsUpdateCallbacks.filter(cb => cb !== callback);
  }
  
  /**
   * Unregister a callback for metrics updates
   */
  public offMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): void {
    this.metricsUpdateCallbacks = this.metricsUpdateCallbacks.filter(cb => cb !== callback);
  }
  
  /**
   * Notify all metrics update callbacks
   */
  private notifyMetricsUpdateCallbacks(): void {
    this.metricsUpdateCallbacks.forEach(callback => callback(this.getMetrics()));
  }
}

// Export a singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
