import { Observable } from 'rxjs';

/**
 * Represents a chat message or interaction event
 */
export interface ChatEvent {
  type: 'message' | 'reaction' | 'join' | 'leave';
  userId: string;
  timestamp: number;
  content?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Represents a monetization event (tips, subscriptions, etc.)
 */
export interface MoneyEvent {
  type: 'tip' | 'subscription' | 'gift' | 'donation';
  amount: number;
  currency: string;
  userId: string;
  timestamp: number;
  message?: string;
}

/**
 * Represents a musical beat or timing event
 */
export interface BeatEvent {
  timestamp: number;
  beat: number;
  bar: number;
  bpm: number;
  intensity: number;
  phase: 'build' | 'drop' | 'breakdown' | 'normal';
}

/**
 * Represents a user interaction with the application
 */
export interface UserAction {
  type: 'click' | 'drag' | 'hover' | 'key' | 'gesture';
  target: string;
  timestamp: number;
  position?: [number, number];
  data?: Record<string, unknown>;
}

/**
 * Represents a component-specific trigger event
 */
export interface ComponentTrigger {
  componentId: string;
  type: string;
  timestamp: number;
  parameters?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high';
}

/**
 * Represents a global effect that impacts the entire scene
 */
export interface GlobalEffect {
  type: 'flash' | 'shake' | 'color' | 'zoom' | 'custom';
  intensity: number;
  duration: number;
  timestamp: number;
  parameters?: Record<string, unknown>;
}

/**
 * Main event stream interface that aggregates all event types
 */
export interface EventStream {
  /** Stream of chat-related events */
  chatEvents: Observable<ChatEvent>;
  
  /** Stream of monetization events */
  moneyShots: Observable<MoneyEvent>;
  
  /** Stream of musical beat events */
  beatEvents: Observable<BeatEvent>;
  
  /** Stream of user interaction events */
  userActions: Observable<UserAction>;
  
  /** Stream of component-specific triggers */
  componentTriggers: Observable<ComponentTrigger>;
  
  /** Stream of global effect events */
  globalEffects: Observable<GlobalEffect>;
}

/**
 * Creates a new event stream manager
 * @returns An initialized EventStream instance
 */
export function createEventStream(): EventStream {
  return {
    chatEvents: new Observable<ChatEvent>(),
    moneyShots: new Observable<MoneyEvent>(),
    beatEvents: new Observable<BeatEvent>(),
    userActions: new Observable<UserAction>(),
    componentTriggers: new Observable<ComponentTrigger>(),
    globalEffects: new Observable<GlobalEffect>()
  };
}

/**
 * Utility class for managing and combining event streams
 */
export class EventStreamManager {
  private readonly streams: EventStream;

  constructor(streams?: Partial<EventStream>) {
    this.streams = {
      ...createEventStream(),
      ...streams
    };
  }

  /**
   * Combines multiple event types into a single stream
   * @param types Array of event types to combine
   * @returns Combined Observable of specified events
   */
  public combineStreams<T extends keyof EventStream>(...types: T[]): Observable<EventStream[T] extends Observable<infer U> ? U : never> {
    const streams = types.map(type => this.streams[type]);
    return new Observable(subscriber => {
      const subscriptions = streams.map(stream => 
        stream.subscribe({
          next: value => subscriber.next(value),
          error: err => subscriber.error(err)
        })
      );

      return () => subscriptions.forEach(sub => sub.unsubscribe());
    });
  }

  /**
   * Filters events based on a time window
   * @param stream Source event stream
   * @param windowMs Time window in milliseconds
   * @returns Filtered Observable
   */
  public timeWindow<T extends { timestamp: number }>(
    stream: Observable<T>,
    windowMs: number
  ): Observable<T> {
    return new Observable<T>(subscriber => {
      const now = Date.now();
      return stream.subscribe({
        next: event => {
          if (event.timestamp >= now - windowMs) {
            subscriber.next(event);
          }
        },
        error: err => subscriber.error(err)
      });
    });
  }

  /**
   * Gets the stream instance
   * @returns The EventStream instance
   */
  public getStreams(): EventStream {
    return this.streams;
  }
}
