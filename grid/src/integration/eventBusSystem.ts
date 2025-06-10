/**
 * GRID OS: Event Bus System
 * 
 * This module provides a reactive event bus system for the GRID OS Integration Core,
 * enabling communication between different components through observable streams.
 */

import { Observable, Subject, BehaviorSubject, combineLatest, merge, interval, animationFrameScheduler } from 'rxjs';
import { filter, map, throttleTime, distinctUntilChanged, scan, shareReplay, withLatestFrom, switchMap, tap, delay, bufferTime } from 'rxjs/operators';

// ===== EVENT TYPES =====

/**
 * Chat message event
 */
export interface ChatMessage {
  /**
   * User ID of the sender
   */
  userId: string;
  
  /**
   * Message content
   */
  content: string;
  
  /**
   * Message timestamp
   */
  timestamp: number;
  
  /**
   * Message type
   */
  type: 'text' | 'emoji' | 'gif' | 'sticker' | 'system';
  
  /**
   * Optional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Beat event
 */
export interface BeatEvent {
  /**
   * Event timestamp
   */
  timestamp: number;
  
  /**
   * Beats per minute
   */
  bpm: number;
  
  /**
   * Beat intensity
   */
  intensity: number;
  
  /**
   * Whether this event is on a beat
   */
  onBeat: boolean;
  
  /**
   * Beat subdivision
   */
  subdivision: number;
  
  /**
   * Beat phase
   */
  phase: number;
}

/**
 * Money shot event
 */
export interface MoneyShot {
  /**
   * User ID of the sender
   */
  userId: string;
  
  /**
   * Amount of money
   */
  amount: number;
  
  /**
   * User tier
   */
  tier: string;
  
  /**
   * Event timestamp
   */
  timestamp: number;
  
  /**
   * Associated emotion
   */
  emotion: string;
}

/**
 * User action event
 */
export interface UserAction {
  /**
   * User ID
   */
  userId: string;
  
  /**
   * Action type
   */
  type: string;
  
  /**
   * Action data
   */
  data: any;
  
  /**
   * Action timestamp
   */
  timestamp: number;
}

/**
 * AI suggestion event
 */
export interface AISuggestion {
  /**
   * Suggestion type
   */
  type: string;
  
  /**
   * Suggestion content
   */
  content: any;
  
  /**
   * Confidence score
   */
  confidence: number;
  
  /**
   * Suggestion timestamp
   */
  timestamp: number;
}

/**
 * Grid command
 */
export interface GridCommand {
  /**
   * Command type
   */
  type: 'activate' | 'deactivate' | 'pulse' | 'morph' | 'cascade';
  
  /**
   * Optional tile IDs
   */
  tileIds?: string[];
  
  /**
   * Optional intensity
   */
  intensity?: number;
  
  /**
   * Optional duration
   */
  duration?: number;
  
  /**
   * Optional pattern
   */
  pattern?: string;
}

/**
 * Shader command
 */
export interface ShaderCommand {
  /**
   * Optional uniform updates
   */
  uniformUpdates?: Record<string, number>;
  
  /**
   * Optional blend mode
   */
  blendMode?: string;
  
  /**
   * Optional intensity
   */
  intensity?: number;
  
  /**
   * Optional warp factor
   */
  warpFactor?: number;
}

/**
 * Claude command
 */
export interface ClaudeCommand {
  /**
   * Command type
   */
  type: 'analyze' | 'generate' | 'respond' | 'moderate';
  
  /**
   * Command context
   */
  context: {
    /**
     * Current mood
     */
    mood: string;
    
    /**
     * Chaos level
     */
    chaos: number;
    
    /**
     * Recent events
     */
    recentEvents: any[];
    
    /**
     * User tier
     */
    userTier: string;
  };
  
  /**
   * Command priority
   */
  priority: number;
}

/**
 * Audio command
 */
export interface AudioCommand {
  /**
   * Command type
   */
  type: 'play' | 'stop' | 'pause' | 'resume' | 'setVolume' | 'setPitch' | 'setFilter';
  
  /**
   * Audio source
   */
  source?: string;
  
  /**
   * Command parameters
   */
  params?: Record<string, any>;
  
  /**
   * Command priority
   */
  priority?: 'low' | 'medium' | 'high';
}

/**
 * System mutation
 */
export interface SystemMutation {
  /**
   * Mutation type
   */
  type: string;
  
  /**
   * Mutation path
   */
  path: string;
  
  /**
   * Mutation value
   */
  value: any;
  
  /**
   * Mutation timestamp
   */
  timestamp: number;
}

/**
 * Manual override
 */
export interface ManualOverride {
  /**
   * Override type
   */
  type: string;
  
  /**
   * Override target
   */
  target: string;
  
  /**
   * Override value
   */
  value: any;
  
  /**
   * Override duration
   */
  duration?: number;
  
  /**
   * Override timestamp
   */
  timestamp: number;
}

/**
 * Touch gesture
 */
export interface TouchGesture {
  /**
   * Gesture type
   */
  type: 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pinch' | 'rotate';
  
  /**
   * Gesture position
   */
  position: {
    x: number;
    y: number;
  };
  
  /**
   * Gesture data
   */
  data: any;
  
  /**
   * Gesture timestamp
   */
  timestamp: number;
}

/**
 * Voice command
 */
export interface VoiceCommand {
  /**
   * Command text
   */
  text: string;
  
  /**
   * Command confidence
   */
  confidence: number;
  
  /**
   * Command timestamp
   */
  timestamp: number;
}

/**
 * System state
 */
export interface SystemState {
  /**
   * Current mood
   */
  mood: 'euphoric' | 'chaotic' | 'sad' | 'aggressive' | 'zen';
  
  /**
   * Chaos sensitivity
   */
  chaosSensitivity: number;
  
  /**
   * Time warp factor
   */
  timeWarpFactor: number;
  
  /**
   * Latency tolerance
   */
  latencyTolerance: number;
  
  /**
   * User tier
   */
  tier: 'free' | 'premium' | 'vip' | 'whale';
  
  /**
   * Whether Claude agent is active
   */
  claudeAgentActive: boolean;
  
  /**
   * Beat phase
   */
  beatPhase: number;
  
  /**
   * Global intensity
   */
  globalIntensity: number;
}

/**
 * System event bus
 */
export interface SystemEventBus {
  /**
   * Chat message stream
   */
  chat$: Observable<ChatMessage>;
  
  /**
   * Beat event stream
   */
  beats$: Observable<BeatEvent>;
  
  /**
   * Money shot stream
   */
  moneyShots$: Observable<MoneyShot>;
  
  /**
   * User action stream
   */
  userActions$: Observable<UserAction>;
  
  /**
   * AI suggestion stream
   */
  aiSuggestions$: Subject<AISuggestion>;
  
  /**
   * Grid command stream
   */
  gridCommands$: Subject<GridCommand>;
  
  /**
   * Shader command stream
   */
  shaderCommands$: Subject<ShaderCommand>;
  
  /**
   * Claude command stream
   */
  claudeCommands$: Subject<ClaudeCommand>;
  
  /**
   * Audio command stream
   */
  audioCommands$: Subject<AudioCommand>;
  
  /**
   * System mutation stream
   */
  mutation$: Subject<SystemMutation>;
  
  /**
   * Manual override stream
   */
  manualOverrides$: Subject<ManualOverride>;
  
  /**
   * Device motion stream
   */
  deviceMotion$: Observable<DeviceMotionEvent>;
  
  /**
   * Device orientation stream
   */
  deviceOrientation$: Observable<DeviceOrientationEvent>;
  
  /**
   * Touch gesture stream
   */
  touchGestures$: Observable<TouchGesture>;
  
  /**
   * Voice input stream
   */
  voiceInput$: Observable<VoiceCommand>;
}

/**
 * Event bus system for the GRID OS Integration Core
 */
export class EventBusSystem implements SystemEventBus {
  /**
   * Chat message stream
   */
  public readonly chat$: Subject<ChatMessage> = new Subject<ChatMessage>();
  
  /**
   * Beat event stream
   */
  public readonly beats$: Subject<BeatEvent> = new Subject<BeatEvent>();
  
  /**
   * Money shot stream
   */
  public readonly moneyShots$: Subject<MoneyShot> = new Subject<MoneyShot>();
  
  /**
   * User action stream
   */
  public readonly userActions$: Subject<UserAction> = new Subject<UserAction>();
  
  /**
   * AI suggestion stream
   */
  public readonly aiSuggestions$: Subject<AISuggestion> = new Subject<AISuggestion>();
  
  /**
   * Grid command stream
   */
  public readonly gridCommands$: Subject<GridCommand> = new Subject<GridCommand>();
  
  /**
   * Shader command stream
   */
  public readonly shaderCommands$: Subject<ShaderCommand> = new Subject<ShaderCommand>();
  
  /**
   * Claude command stream
   */
  public readonly claudeCommands$: Subject<ClaudeCommand> = new Subject<ClaudeCommand>();
  
  /**
   * Audio command stream
   */
  public readonly audioCommands$: Subject<AudioCommand> = new Subject<AudioCommand>();
  
  /**
   * System mutation stream
   */
  public readonly mutation$: Subject<SystemMutation> = new Subject<SystemMutation>();
  
  /**
   * Manual override stream
   */
  public readonly manualOverrides$: Subject<ManualOverride> = new Subject<ManualOverride>();
  
  /**
   * Device motion stream
   */
  public readonly deviceMotion$: Subject<DeviceMotionEvent> = new Subject<DeviceMotionEvent>();
  
  /**
   * Device orientation stream
   */
  public readonly deviceOrientation$: Subject<DeviceOrientationEvent> = new Subject<DeviceOrientationEvent>();
  
  /**
   * Touch gesture stream
   */
  public readonly touchGestures$: Subject<TouchGesture> = new Subject<TouchGesture>();
  
  /**
   * Voice input stream
   */
  public readonly voiceInput$: Subject<VoiceCommand> = new Subject<VoiceCommand>();
  
  /**
   * System state
   */
  public readonly state$: BehaviorSubject<SystemState>;
  
  /**
   * Create a new event bus system
   */
  constructor() {
    // Initialize system state
    this.state$ = new BehaviorSubject<SystemState>({
      mood: 'zen',
      chaosSensitivity: 0.5,
      timeWarpFactor: 1.0,
      latencyTolerance: 100,
      tier: 'free',
      claudeAgentActive: false,
      beatPhase: 0,
      globalIntensity: 0.5
    });
    
    // Set up derived streams
    this.setupDerivedStreams();
  }
  
  /**
   * Set up derived streams
   */
  private setupDerivedStreams(): void {
    // Beat-driven intensity
    const beatIntensity$ = this.beats$.pipe(
      map(beat => beat.intensity),
      distinctUntilChanged(),
      shareReplay(1)
    );
    
    // Money-driven intensity
    const moneyIntensity$ = this.moneyShots$.pipe(
      map(shot => Math.min(shot.amount / 1000, 1)),
      scan((acc, value) => (acc * 0.8) + (value * 0.2), 0),
      distinctUntilChanged(this.isApproximatelyEqual),
      shareReplay(1)
    );
    
    // Combined intensity
    combineLatest([beatIntensity$, moneyIntensity$]).pipe(
      map(([beat, money]) => Math.max(beat, money)),
      withLatestFrom(this.state$),
      map(([intensity, state]) => ({
        ...state,
        globalIntensity: intensity
      }))
    ).subscribe(this.state$);
    
    // Beat phase tracking
    this.beats$.pipe(
      filter(beat => beat.onBeat),
      map(beat => beat.phase),
      distinctUntilChanged(),
      withLatestFrom(this.state$),
      map(([phase, state]) => ({
        ...state,
        beatPhase: phase
      }))
    ).subscribe(this.state$);
    
    // Mood detection from chat and money
    merge(
      this.chat$.pipe(
        bufferTime(5000),
        filter(messages => messages.length > 0),
        map(messages => this.detectMoodFromChat(messages))
      ),
      this.moneyShots$.pipe(
        map(shot => shot.emotion)
      )
    ).pipe(
      throttleTime(2000),
      withLatestFrom(this.state$),
      map(([mood, state]) => ({
        ...state,
        mood: this.determineMood(mood, state.mood)
      }))
    ).subscribe(this.state$);
    
    // Apply manual overrides
    this.manualOverrides$.pipe(
      withLatestFrom(this.state$),
      map(([override, state]) => {
        if (override.target in state) {
          return {
            ...state,
            [override.target]: override.value
          };
        }
        return state;
      })
    ).subscribe(this.state$);
  }
  
  /**
   * Detect mood from chat messages
   * @param messages Chat messages
   * @returns Detected mood
   */
  private detectMoodFromChat(messages: ChatMessage[]): 'euphoric' | 'chaotic' | 'sad' | 'aggressive' | 'zen' {
    // Simple mood detection based on message content
    // In a real implementation, this would use NLP or sentiment analysis
    const text = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (text.includes('happy') || text.includes('amazing') || text.includes('awesome')) {
      return 'euphoric';
    } else if (text.includes('sad') || text.includes('unhappy') || text.includes('disappointed')) {
      return 'sad';
    } else if (text.includes('angry') || text.includes('mad') || text.includes('hate')) {
      return 'aggressive';
    } else if (text.includes('crazy') || text.includes('wild') || text.includes('insane')) {
      return 'chaotic';
    } else {
      return 'zen';
    }
  }
  
  /**
   * Determine mood based on new mood and current mood
   * @param newMood New mood
   * @param currentMood Current mood
   * @returns Determined mood
   */
  private determineMood(
    newMood: string,
    currentMood: 'euphoric' | 'chaotic' | 'sad' | 'aggressive' | 'zen'
  ): 'euphoric' | 'chaotic' | 'sad' | 'aggressive' | 'zen' {
    // Convert string to valid mood
    const validMood = this.validateMood(newMood);
    
    // 70% chance to change to new mood, 30% chance to keep current mood
    return Math.random() < 0.7 ? validMood : currentMood;
  }
  
  /**
   * Validate mood string
   * @param mood Mood string
   * @returns Valid mood
   */
  private validateMood(mood: string): 'euphoric' | 'chaotic' | 'sad' | 'aggressive' | 'zen' {
    const validMoods: ('euphoric' | 'chaotic' | 'sad' | 'aggressive' | 'zen')[] = [
      'euphoric', 'chaotic', 'sad', 'aggressive', 'zen'
    ];
    
    return validMoods.includes(mood as any) 
      ? (mood as 'euphoric' | 'chaotic' | 'sad' | 'aggressive' | 'zen')
      : 'zen';
  }
  
  /**
   * Check if two numbers are approximately equal
   * @param a First number
   * @param b Second number
   * @returns Whether the numbers are approximately equal
   */
  private isApproximatelyEqual(a: number, b: number): boolean {
    return Math.abs(a - b) < 0.05;
  }
  
  /**
   * Send a chat message
   * @param userId User ID
   * @param content Message content
   * @param type Message type
   * @param metadata Optional metadata
   */
  public sendChatMessage(
    userId: string,
    content: string,
    type: 'text' | 'emoji' | 'gif' | 'sticker' | 'system' = 'text',
    metadata?: Record<string, any>
  ): void {
    this.chat$.next({
      userId,
      content,
      timestamp: Date.now(),
      type,
      metadata
    });
  }
  
  /**
   * Send a beat event
   * @param bpm Beats per minute
   * @param intensity Beat intensity
   * @param onBeat Whether this event is on a beat
   * @param subdivision Beat subdivision
   * @param phase Beat phase
   */
  public sendBeatEvent(
    bpm: number,
    intensity: number,
    onBeat: boolean = true,
    subdivision: number = 4,
    phase: number = 0
  ): void {
    this.beats$.next({
      timestamp: Date.now(),
      bpm,
      intensity,
      onBeat,
      subdivision,
      phase
    });
  }
  
  /**
   * Send a money shot event
   * @param userId User ID
   * @param amount Amount of money
   * @param tier User tier
   * @param emotion Associated emotion
   */
  public sendMoneyShot(
    userId: string,
    amount: number,
    tier: string = 'free',
    emotion: string = 'euphoric'
  ): void {
    this.moneyShots$.next({
      userId,
      amount,
      tier,
      timestamp: Date.now(),
      emotion
    });
  }
  
  /**
   * Send a user action
   * @param userId User ID
   * @param type Action type
   * @param data Action data
   */
  public sendUserAction(
    userId: string,
    type: string,
    data: any
  ): void {
    this.userActions$.next({
      userId,
      type,
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Send a grid command
   * @param type Command type
   * @param tileIds Optional tile IDs
   * @param intensity Optional intensity
   * @param duration Optional duration
   * @param pattern Optional pattern
   */
  public sendGridCommand(
    type: 'activate' | 'deactivate' | 'pulse' | 'morph' | 'cascade',
    tileIds?: string[],
    intensity?: number,
    duration?: number,
    pattern?: string
  ): void {
    this.gridCommands$.next({
      type,
      tileIds,
      intensity,
      duration,
      pattern
    });
  }
  
  /**
   * Send a shader command
   * @param uniformUpdates Optional uniform updates
   * @param blendMode Optional blend mode
   * @param intensity Optional intensity
   * @param warpFactor Optional warp factor
   */
  public sendShaderCommand(
    uniformUpdates?: Record<string, number>,
    blendMode?: string,
    intensity?: number,
    warpFactor?: number
  ): void {
    this.shaderCommands$.next({
      uniformUpdates,
      blendMode,
      intensity,
      warpFactor
    });
  }
  
  /**
   * Send a Claude command
   * @param type Command type
   * @param mood Current mood
   * @param chaos Chaos level
   * @param recentEvents Recent events
   * @param userTier User tier
   * @param priority Command priority
   */
  public sendClaudeCommand(
    type: 'analyze' | 'generate' | 'respond' | 'moderate',
    mood: string,
    chaos: number,
    recentEvents: any[],
    userTier: string,
    priority: number = 1
  ): void {
    this.claudeCommands$.next({
      type,
      context: {
        mood,
        chaos,
        recentEvents,
        userTier
      },
      priority
    });
  }
  
  /**
   * Send an audio command
   * @param type Command type
   * @param source Audio source
   * @param params Command parameters
   * @param priority Command priority
   */
  public sendAudioCommand(
    type: 'play' | 'stop' | 'pause' | 'resume' | 'setVolume' | 'setPitch' | 'setFilter',
    source?: string,
    params?: Record<string, any>,
    priority?: 'low' | 'medium' | 'high'
  ): void {
    this.audioCommands$.next({
      type,
      source,
      params,
      priority
    });
  }
  
  /**
   * Send a system mutation
   * @param type Mutation type
   * @param path Mutation path
   * @param value Mutation value
   */
  public sendSystemMutation(
    type: string,
    path: string,
    value: any
  ): void {
    this.mutation$.next({
      type,
      path,
      value,
      timestamp: Date.now()
    });
  }
  
  /**
   * Send a manual override
   * @param type Override type
   * @param target Override target
   * @param value Override value
   * @param duration Override duration
   */
  public sendManualOverride(
    type: string,
    target: string,
    value: any,
    duration?: number
  ): void {
    this.manualOverrides$.next({
      type,
      target,
      value,
      duration,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get the current system state
   * @returns Current system state
   */
  public getState(): SystemState {
    return this.state$.getValue();
  }
  
  /**
   * Update the system state
   * @param updater State updater function
   */
  public updateState(updater: (state: SystemState) => SystemState): void {
    this.state$.next(updater(this.state$.getValue()));
  }
}

/**
 * Create a new event bus system
 */
export function createEventBusSystem(): EventBusSystem {
  return new EventBusSystem();
}
