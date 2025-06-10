import { Observable, Subject, ReplaySubject, merge } from 'rxjs';
import { share, multicast, refCount } from 'rxjs/operators';
import type { SystemEvent } from '../types/integration';

/**
 * Event bus for the GRID OS Integration Core
 * 
 * This module provides a central event bus for the GRID OS Integration Core,
 * allowing components to publish and subscribe to events without direct coupling.
 */
export class EventBus {
  /**
   * Event subjects for different event types
   */
  private readonly _subjects: Map<string, Subject<any>> = new Map();
  
  /**
   * Master event aggregator
   */
  public readonly aggregatorStream: Subject<SystemEvent>;
  
  /**
   * Input streams
   */
  public readonly inputs = {
    /**
     * WebSocket messages
     */
    websocket$: new Subject<any>(),
    
    /**
     * Device motion events
     */
    deviceMotion$: new Subject<any>(),
    
    /**
     * Touch gesture events
     */
    touchGestures$: new Subject<any>(),
    
    /**
     * Audio analyzer events
     */
    audioAnalyzer$: new Subject<any>(),
    
    /**
     * Camera feed events
     */
    cameraFeed$: new Subject<any>(),
    
    /**
     * Claude AI agent events
     */
    claudeAgents$: new Subject<any>(),
    
    /**
     * Blockchain events
     */
    blockchainEvents$: new Subject<any>(),
    
    /**
     * Social feed events
     */
    socialFeeds$: new Subject<any>()
  };
  
  /**
   * Processed streams
   */
  public readonly processed = {
    /**
     * Enhanced chat events
     */
    enhancedChat$: new Subject<any>(),
    
    /**
     * Beat prediction events
     */
    beatPrediction$: new Subject<any>(),
    
    /**
     * Money flow events
     */
    moneyFlow$: new Subject<any>(),
    
    /**
     * User intent events
     */
    userIntent$: new Subject<any>(),
    
    /**
     * Grid state events
     */
    gridState$: new Subject<any>()
  };
  
  /**
   * Output commands
   */
  public readonly outputs = {
    /**
     * Grid commands
     */
    gridCommands$: new Subject<any>(),
    
    /**
     * Haptic commands
     */
    hapticCommands$: new Subject<any>(),
    
    /**
     * Shader commands
     */
    shaderCommands$: new Subject<any>(),
    
    /**
     * Audio commands
     */
    audioCommands$: new Subject<any>(),
    
    /**
     * Claude AI commands
     */
    claudeCommands$: new Subject<any>(),
    
    /**
     * Network commands
     */
    networkCommands$: new Subject<any>()
  };
  
  /**
   * Create a new event bus
   */
  constructor() {
    // Create the master event aggregator
    this.aggregatorStream = new Subject<SystemEvent>();
    
    // Subscribe to all streams and forward events to the aggregator
    const inputStreams = Object.values(this.inputs);
    const processedStreams = Object.values(this.processed);
    const outputStreams = Object.values(this.outputs);
    
    merge(
      ...inputStreams,
      ...processedStreams,
      ...outputStreams
    ).subscribe(event => {
      this.aggregatorStream.next({
        type: 'event',
        source: 'eventBus',
        data: event,
        timestamp: Date.now()
      });
    });
  }
  
  /**
   * Get or create a subject for an event type
   * @param eventType Event type
   * @returns Subject for the event type
   */
  private getOrCreateSubject(eventType: string): Subject<any> {
    if (!this._subjects.has(eventType)) {
      this._subjects.set(eventType, new ReplaySubject(1));
    }
    
    return this._subjects.get(eventType)!;
  }
  
  /**
   * Publish an event
   * @param eventType Event type
   * @param data Event data
   */
  public publish(eventType: string, data: any): void {
    const subject = this.getOrCreateSubject(eventType);
    subject.next(data);
  }
  
  /**
   * Subscribe to an event
   * @param eventType Event type
   * @param callback Callback function
   * @returns Subscription
   */
  public subscribe(eventType: string, callback: (data: any) => void): { unsubscribe: () => void } {
    const subject = this.getOrCreateSubject(eventType);
    const subscription = subject.subscribe(callback);
    
    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
  
  /**
   * Create an observable for an event type
   * @param eventType Event type
   * @returns Observable for the event type
   */
  public observe(eventType: string): Observable<any> {
    const subject = this.getOrCreateSubject(eventType);
    return subject.asObservable();
  }
  
  /**
   * Clear all subscriptions for an event type
   * @param eventType Event type
   */
  public clear(eventType: string): void {
    if (this._subjects.has(eventType)) {
      const subject = this._subjects.get(eventType)!;
      subject.complete();
      this._subjects.delete(eventType);
    }
  }
  
  /**
   * Clear all subscriptions
   */
  public clearAll(): void {
    for (const subject of this._subjects.values()) {
      subject.complete();
    }
    
    this._subjects.clear();
  }
}

/**
 * Create a new event bus
 */
export function createEventBus(): EventBus {
  return new EventBus();
}
