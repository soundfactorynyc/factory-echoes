/**
 * GRID OS: RTMP Stream Integration
 * 
 * Handles RTMP streaming integration with Owncast and provides
 * real-time stream analytics for the GRID visualization system.
 */

export interface RTMPStreamInfo {
  url: string;
  key: string;
  bitrate: number;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
  codec: string;
  isLive: boolean;
  startTime?: Date;
  duration?: number;
  viewerCount: number;
}

export interface RTMPQualityMetrics {
  bitrate: number;
  fps: number;
  droppedFrames: number;
  networkJitter: number;
  bufferHealth: number;
  streamStability: number; // 0-100%
}

export interface RTMPGridEvent {
  type: 'stream_start' | 'stream_end' | 'quality_change' | 'viewer_spike' | 'connection_issue';
  data: any;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

export class RTMPIntegration {
  private streamInfo: RTMPStreamInfo | null = null;
  private qualityMetrics: RTMPQualityMetrics = {
    bitrate: 0,
    fps: 0,
    droppedFrames: 0,
    networkJitter: 0,
    bufferHealth: 100,
    streamStability: 100
  };
  private eventCallbacks: ((event: RTMPGridEvent) => void)[] = [];
  private monitoringInterval: number | null = null;

  constructor(private serverUrl: string = 'http://209.97.158.117:8080') {
    this.initializeRTMPMonitoring();
  }

  /**
   * Initialize RTMP stream monitoring
   */
  private async initializeRTMPMonitoring(): Promise<void> {
    console.log('🎥 Initializing RTMP Integration for GRID OS');
    
    // Start monitoring stream status
    this.startStreamMonitoring();
    
    // Listen for stream events
    this.setupStreamEventListeners();
    
    console.log('✅ RTMP Integration initialized');
  }

  /**
   * Start monitoring the RTMP stream
   */
  private startStreamMonitoring(): void {
    this.monitoringInterval = window.setInterval(async () => {
      await this.updateStreamInfo();
      await this.updateQualityMetrics();
      this.analyzeStreamHealth();
    }, 2000); // Check every 2 seconds
  }

  /**
   * Update stream information from Owncast API
   */
  private async updateStreamInfo(): Promise<void> {
    try {
      const response = await fetch(`${this.serverUrl}/api/status`);
      const status = await response.json();
      
      if (status.online && !this.streamInfo?.isLive) {
        // Stream just started
        this.streamInfo = {
          url: `rtmp://209.97.158.117:1935/live`,
          key: 'stream_key',
          bitrate: 2500,
          fps: 30,
          resolution: { width: 1920, height: 1080 },
          codec: 'H.264',
          isLive: true,
          startTime: new Date(status.lastConnectTime),
          viewerCount: 0
        };
        
        this.emitGridEvent({
          type: 'stream_start',
          data: this.streamInfo,
          timestamp: Date.now(),
          severity: 'high'
        });
      } else if (!status.online && this.streamInfo?.isLive) {
        // Stream just ended
        if (this.streamInfo) {
          this.streamInfo.isLive = false;
          this.streamInfo.duration = Date.now() - (this.streamInfo.startTime?.getTime() || 0);
        }
        
        this.emitGridEvent({
          type: 'stream_end',
          data: this.streamInfo,
          timestamp: Date.now(),
          severity: 'medium'
        });
      }
    } catch (error) {
      console.warn('Failed to update stream info:', error);
    }
  }

  /**
   * Update quality metrics (simulated for demo)
   */
  private async updateQualityMetrics(): Promise<void> {
    if (!this.streamInfo?.isLive) return;
    
    // Simulate realistic streaming metrics
    const baseQuality = 85 + Math.random() * 15; // 85-100% base quality
    const networkVariation = (Math.random() - 0.5) * 10; // ±5% variation
    
    this.qualityMetrics = {
      bitrate: 2500 + Math.floor(Math.random() * 500 - 250), // 2250-2750 kbps
      fps: 30 + Math.floor(Math.random() * 2 - 1), // 29-31 fps
      droppedFrames: Math.floor(Math.random() * 5), // 0-4 dropped frames
      networkJitter: Math.random() * 20, // 0-20ms jitter
      bufferHealth: Math.max(50, Math.min(100, baseQuality + networkVariation)),
      streamStability: Math.max(70, Math.min(100, baseQuality + networkVariation))
    };
    
    // Emit quality change events for significant changes
    if (this.qualityMetrics.streamStability < 80) {
      this.emitGridEvent({
        type: 'quality_change',
        data: this.qualityMetrics,
        timestamp: Date.now(),
        severity: this.qualityMetrics.streamStability < 60 ? 'high' : 'medium'
      });
    }
  }

  /**
   * Analyze stream health and emit relevant events
   */
  private analyzeStreamHealth(): void {
    if (!this.streamInfo?.isLive) return;
    
    const { bufferHealth, streamStability, droppedFrames } = this.qualityMetrics;
    
    // Connection issues
    if (bufferHealth < 60 || droppedFrames > 10) {
      this.emitGridEvent({
        type: 'connection_issue',
        data: {
          bufferHealth,
          droppedFrames,
          recommendation: 'Consider reducing bitrate or checking network connection'
        },
        timestamp: Date.now(),
        severity: 'high'
      });
    }
    
    // Viewer spike simulation (for demo)
    if (Math.random() < 0.1) { // 10% chance per check
      const newViewerCount = Math.floor(Math.random() * 50) + 10;
      if (this.streamInfo) {
        this.streamInfo.viewerCount = newViewerCount;
      }
      
      this.emitGridEvent({
        type: 'viewer_spike',
        data: { viewerCount: newViewerCount },
        timestamp: Date.now(),
        severity: 'low'
      });
    }
  }

  /**
   * Set up stream event listeners
   */
  private setupStreamEventListeners(): void {
    // Listen for window focus/blur to adjust monitoring frequency
    window.addEventListener('focus', () => {
      if (!this.monitoringInterval) {
        this.startStreamMonitoring();
      }
    });
    
    window.addEventListener('blur', () => {
      // Keep monitoring but could reduce frequency
    });
  }

  /**
   * Emit a GRID event
   */
  private emitGridEvent(event: RTMPGridEvent): void {
    console.log(`🎬 RTMP → GRID Event: ${event.type}`, event.data);
    
    // Notify all registered callbacks
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in RTMP event callback:', error);
      }
    });
    
    // Emit to GRID OS event bus if available
    const gridOS = (window as any).gridOS;
    if (gridOS?.eventBus) {
      gridOS.eventBus.emit(`rtmp_${event.type}`, event);
    }
  }

  /**
   * Register event callback
   */
  public onEvent(callback: (event: RTMPGridEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Get current stream information
   */
  public getStreamInfo(): RTMPStreamInfo | null {
    return this.streamInfo;
  }

  /**
   * Get current quality metrics
   */
  public getQualityMetrics(): RTMPQualityMetrics {
    return { ...this.qualityMetrics };
  }

  /**
   * Get RTMP configuration for streaming
   */
  public getRTMPConfig(): { url: string; key: string } {
    return {
      url: 'rtmp://209.97.158.117:1935/live',
      key: 'your_stream_key_here'
    };
  }

  /**
   * Simulate stream events for testing
   */
  public simulateStreamEvents(): void {
    console.log('🎭 Simulating RTMP stream events...');
    
    // Simulate stream start
    setTimeout(() => {
      this.emitGridEvent({
        type: 'stream_start',
        data: { resolution: '1920x1080', bitrate: 2500 },
        timestamp: Date.now(),
        severity: 'high'
      });
    }, 1000);
    
    // Simulate quality changes
    setTimeout(() => {
      this.emitGridEvent({
        type: 'quality_change',
        data: { stability: 75, reason: 'Network fluctuation' },
        timestamp: Date.now(),
        severity: 'medium'
      });
    }, 3000);
    
    // Simulate viewer spike
    setTimeout(() => {
      this.emitGridEvent({
        type: 'viewer_spike',
        data: { viewerCount: 25, growth: '+15 viewers' },
        timestamp: Date.now(),
        severity: 'low'
      });
    }, 5000);
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.eventCallbacks = [];
  }
}

// Export for global access
(window as any).RTMPIntegration = RTMPIntegration;

// Auto-create instance
(window as any).rtmpIntegration = new RTMPIntegration();

console.log('🎥 RTMP Integration module loaded');
console.log('💡 RTMP Server: rtmp://209.97.158.117:1935/live');
console.log('💡 Access via: window.rtmpIntegration');
