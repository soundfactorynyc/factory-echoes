import { Observable, Subject } from 'rxjs';
import type { OperatorFunction } from 'rxjs';
import type {
  WSMessage,
  DeviceMotionEvent,
  GestureEvent,
  AudioData,
  VideoFrame,
  AIResponse,
  TransactionEvent,
  SocialUpdate,
  ChatEvent,
  BeatEvent,
  MoneyEvent,
  RippleEffect,
  UserAction,
  GridState,
  PredictedState,
  GridCommand,
  HapticCommand,
  ShaderCommand,
  AudioCommand,
  AICommand,
  NetworkCommand,
  ExponentialBackoff,
  DuplexStream,
  CRDT,
  ConflictResolver,
  PacketScheduler,
  JitterBuffer,
  ChatMessage,
  PresenceUpdate,
  GridPatch,
  Transaction,
  OperationalTransform,
  EdgeComputing,
  SystemEvent,
  ClaudeAgent,
  MoodAnalysis,
  BeatPrediction,
  ChatEnhancement,
  VisualDirection,
  SafetyIntervention,
  GenerativeIdea,
  UserPersonality,
  CollectiveThought,
  DecisionTree,
  SystemAction,
  EmergentBehavior,
  ContextWindow,
  VectorDatabase,
  EmotionalMemory,
  PatternRecognition,
  PersonalityVector,
  AdaptivePersonality,
  EmotionalSpread
} from './integration';

import type { ClaudeNetwork } from './claude-network';
import type {
  Vector3,
  Rotation3,
  Compass,
  Quaternion,
  RecognizedGesture,
  AudioBuffer,
  BeatData,
  PitchData,
  TimbreAnalysis,
  AudioSource3D,
  ConvolutionReverb,
  Touch,
  GestureType,
  GesturePrediction,
  PressureMap,
  ProximityData,
  FaceDetection,
  HandTracking,
  SceneUnderstanding,
  DepthMap
} from './sensor-fusion';

/**
 * GRID OS: Integration Core Interface
 * 
 * This interface defines the public API for the GRID OS Integration Core,
 * which serves as the central nervous system for the application.
 */
export interface IntegrationCore {
  /**
   * Event bus for the integration core
   */
  readonly eventBus: {
    /**
     * Master event aggregator
     */
    aggregator: Subject<SystemEvent>;
    
    /**
     * Input streams
     */
    inputs: {
      /**
       * WebSocket messages
       */
      websocket$: Observable<WSMessage>;
      
      /**
       * Device motion events
       */
      deviceMotion$: Observable<DeviceMotionEvent>;
      
      /**
       * Touch gesture events
       */
      touchGestures$: Observable<GestureEvent>;
      
      /**
       * Audio analyzer events
       */
      audioAnalyzer$: Observable<AudioData>;
      
      /**
       * Camera feed events
       */
      cameraFeed$: Observable<VideoFrame>;
      
      /**
       * Claude AI agent events
       */
      claudeAgents$: Observable<AIResponse>;
      
      /**
       * Blockchain events
       */
      blockchainEvents$: Observable<TransactionEvent>;
      
      /**
       * Social feed events
       */
      socialFeeds$: Observable<SocialUpdate>;
    };
    
    /**
     * Processed streams
     */
    processed: {
      /**
       * Enhanced chat events
       */
      enhancedChat$: Observable<ChatEvent & { sentiment: number; energy: number }>;
      
      /**
       * Beat prediction events
       */
      beatPrediction$: Observable<BeatEvent & { nextBeat: number; confidence: number }>;
      
      /**
       * Money flow events
       */
      moneyFlow$: Observable<MoneyEvent & { impact: number; ripples: RippleEffect[] }>;
      
      /**
       * User intent events
       */
      userIntent$: Observable<UserAction & { prediction: string[]; probability: number[] }>;
      
      /**
       * Grid state events
       */
      gridState$: Observable<GridState & { futureStates: PredictedState[] }>;
    };
    
    /**
     * Output commands
     */
    outputs: {
      /**
       * Grid commands
       */
      gridCommands$: Subject<GridCommand>;
      
      /**
       * Haptic commands
       */
      hapticCommands$: Subject<HapticCommand>;
      
      /**
       * Shader commands
       */
      shaderCommands$: Subject<ShaderCommand>;
      
      /**
       * Audio commands
       */
      audioCommands$: Subject<AudioCommand>;
      
      /**
       * Claude AI commands
       */
      claudeCommands$: Subject<AICommand>;
      
      /**
       * Network commands
       */
      networkCommands$: Subject<NetworkCommand>;
    };
  };
  
  /**
   * Network functionality for the integration core
   */
  network: {
    /**
     * Primary network connection
     */
    primary: {
      /**
       * WebSocket endpoint
       */
      endpoint: string;
      
      /**
       * WebSocket protocols
       */
      protocols: ['grid-sync', 'claude-stream', 'p2p-mesh'];
      
      /**
       * Heartbeat interval in milliseconds
       */
      heartbeat: number;
      
      /**
       * Reconnect strategy
       */
      reconnectStrategy: ExponentialBackoff;
    };
    
    /**
     * Peer-to-peer mesh network
     */
    mesh: {
      /**
       * Connected peers
       */
      peers: Map<string, RTCPeerConnection>;
      
      /**
       * Super nodes in the mesh
       */
      superNodes: Set<string>;
      
      /**
       * Consensus algorithm
       */
      consensus: 'raft' | 'gossip' | 'byzantine';
    };
    
    /**
     * Network streams
     */
    streams: {
      /**
       * Chat stream
       */
      chat: DuplexStream<ChatMessage>;
      
      /**
       * Presence stream
       */
      presence: DuplexStream<PresenceUpdate>;
      
      /**
       * Grid synchronization stream
       */
      gridSync: DuplexStream<GridPatch>;
      
      /**
       * Monetization stream
       */
      monetization: DuplexStream<Transaction>;
      
      /**
       * Collaborative editing
       */
      collaborative: {
        /**
         * Shared state
         */
        sharedState: CRDT<GridState>;
        
        /**
         * Conflict resolution
         */
        conflictResolution: ConflictResolver;
        
        /**
         * Edit history
         */
        history: OperationalTransform[];
      };
    };
    
    /**
     * Network quality
     */
    quality: {
      /**
       * Whether to use adaptive bitrate
       */
      adaptiveBitrate: boolean;
      
      /**
       * Packet priority scheduler
       */
      packetPriority: PacketScheduler;
      
      /**
       * Jitter buffer
       */
      jitterBuffer: JitterBuffer;
      
      /**
       * Latency optimizer
       */
      latencyOptimizer: EdgeComputing;
    };
  };
  
  /**
   * Claude AI network for the integration core
   */
  claudeNetwork: ClaudeNetwork;
  
  /**
   * Sensor fusion for the integration core
   */
  sensorFusion: {
    /**
     * Motion sensors
     */
    motion: {
      /**
       * Accelerometer data
       */
      accelerometer$: Observable<Vector3>;
      
      /**
       * Gyroscope data
       */
      gyroscope$: Observable<Rotation3>;
      
      /**
       * Magnetometer data
       */
      magnetometer$: Observable<Compass>;
      
      /**
       * Fused motion data
       */
      fusion$: Observable<{
        /**
         * Orientation
         */
        orientation: Quaternion;
        
        /**
         * Velocity
         */
        velocity: Vector3;
        
        /**
         * Gesture
         */
        gesture: RecognizedGesture;
      }>;
    };
    
    /**
     * Audio sensors
     */
    audio: {
      /**
       * Microphone input
       */
      microphone$: Observable<AudioBuffer>;
      
      /**
       * System audio
       */
      systemAudio$: Observable<AudioBuffer>;
      
      /**
       * Processed audio
       */
      processed$: Observable<{
        /**
         * FFT data
         */
        fft: Float32Array;
        
        /**
         * Beat data
         */
        beats: BeatData;
        
        /**
         * Pitch data
         */
        pitch: PitchData;
        
        /**
         * Timbre analysis
         */
        timbre: TimbreAnalysis;
      }>;
      
      /**
       * Spatial audio
       */
      spatial: {
        /**
         * Listener position
         */
        listenerPosition: Vector3;
        
        /**
         * Audio sources
         */
        sources: Map<string, AudioSource3D>;
        
        /**
         * Room acoustics
         */
        roomAcoustics: ConvolutionReverb;
      };
    };
    
    /**
     * Touch sensors
     */
    touch: {
      /**
       * Raw touch data
       */
      raw$: Observable<Touch[]>;
      
      /**
       * Gesture data
       */
      gestures$: Observable<{
        /**
         * Gesture type
         */
        type: GestureType;
        
        /**
         * Gesture velocity
         */
        velocity: number;
        
        /**
         * Gesture acceleration
         */
        acceleration: number;
        
        /**
         * Gesture prediction
         */
        prediction: GesturePrediction;
      }>;
      
      /**
       * Pressure data
       */
      pressure$: Observable<PressureMap>;
      
      /**
       * Hover data
       */
      hover$: Observable<ProximityData>;
    };
    
    /**
     * Camera sensors
     */
    camera: {
      /**
       * Camera frames
       */
      frames$: Observable<VideoFrame>;
      
      /**
       * Face detection
       */
      faces$: Observable<FaceDetection[]>;
      
      /**
       * Hand detection
       */
      hands$: Observable<HandTracking[]>;
      
      /**
       * Environment detection
       */
      environment$: Observable<SceneUnderstanding>;
      
      /**
       * Depth data
       */
      depth$: Observable<DepthMap>;
    };
  };
  
  /**
   * Reactive triggers for the integration core
   */
  triggers: {
    /**
     * Emotional triggers
     */
    emotional: {
      /**
       * Joy threshold trigger
       */
      joyThreshold: (threshold?: number) => Observable<any>;
      
      /**
       * Sadness detected trigger
       */
      sadnessDetected: (threshold?: number) => Observable<any>;
      
      /**
       * Excitement peak trigger
       */
      excitementPeak: (threshold?: number) => Observable<any>;
      
      /**
       * Calm desired trigger
       */
      calmDesired: (threshold?: number) => Observable<any>;
    };
    
    /**
     * Financial triggers
     */
    financial: {
      /**
       * Tip received trigger
       */
      tipReceived: (amount?: number) => Observable<any>;
      
      /**
       * Whale detected trigger
       */
      whaleDetected: (threshold?: number) => Observable<any>;
      
      /**
       * Crowd funding trigger
       */
      crowdFunding: (goal?: number) => Observable<any>;
      
      /**
       * Subscription trigger
       */
      subscription: (tier?: string) => Observable<any>;
    };
    
    /**
     * Rhythmic triggers
     */
    rhythmic: {
      /**
       * Drop detected trigger
       */
      dropDetected: (confidence?: number) => Observable<any>;
      
      /**
       * BPM change trigger
       */
      bpmChange: (threshold?: number) => Observable<any>;
      
      /**
       * Silence detected trigger
       */
      silenceDetected: (duration?: number) => Observable<any>;
      
      /**
       * Polyrhythm trigger
       */
      polyrhythm: (complexity?: number) => Observable<any>;
    };
    
    /**
     * Social triggers
     */
    social: {
      /**
       * Viral moment trigger
       */
      viralMoment: (threshold?: number) => Observable<any>;
      
      /**
       * Collaboration trigger
       */
      collaboration: (users?: string[]) => Observable<any>;
      
      /**
       * Influencer joined trigger
       */
      influencerJoined: (threshold?: number) => Observable<any>;
      
      /**
       * Community goal trigger
       */
      communityGoal: (goal?: any) => Observable<any>;
    };
    
    /**
     * Hidden triggers
     */
    hidden: {
      /**
       * Secret gesture trigger
       */
      secretGesture: (gesture?: string) => Observable<any>;
      
      /**
       * Time-based trigger
       */
      timeBased: (interval?: number) => Observable<any>;
      
      /**
       * Achievement unlocked trigger
       */
      achievementUnlocked: (achievement?: string) => Observable<any>;
      
      /**
       * Easter egg trigger
       */
      easterEgg: (code?: string) => Observable<any>;
    };
  };
  
  /**
   * Synchronization engine for the integration core
   */
  sync: {
    /**
     * Clock synchronization
     */
    clock: {
      /**
       * Server time
       */
      server: any;
      
      /**
       * Local time
       */
      local: any;
      
      /**
       * Clock drift
       */
      drift: number;
      
      /**
       * Synchronization algorithm
       */
      sync: any;
    };
    
    /**
     * State synchronization
     */
    state: {
      /**
       * Local state
       */
      local: any;
      
      /**
       * Remote state
       */
      remote: any;
      
      /**
       * State reconciliation
       */
      reconciliation: any;
      
      /**
       * Rollback mechanism
       */
      rollback: any;
    };
    
    /**
     * Cross-device synchronization
     */
    crossDevice: {
      /**
       * Primary device role
       */
      primary: 'host' | 'client' | 'peer';
      
      /**
       * Secondary devices
       */
      secondaries: Map<string, any>;
      
      /**
       * Handoff mechanism
       */
      handoff: any;
      
      /**
       * Screen mirroring
       */
      mirror: any;
    };
  };
  
  /**
   * Performance optimization for the integration core
   */
  optimization: {
    /**
     * Quality settings
     */
    quality: {
      /**
       * Auto quality adjustment
       */
      auto: () => Observable<any>;
      
      /**
       * Thermal throttling
       */
      thermal: () => Observable<any>;
      
      /**
       * Battery optimization
       */
      battery: () => Observable<any>;
      
      /**
       * Network optimization
       */
      network: () => Observable<any>;
    };
    
    /**
     * Resource management
     */
    resources: {
      /**
       * Texture pool
       */
      texturePool: any;
      
      /**
       * Shader cache
       */
      shaderCache: any;
      
      /**
       * Geometry instancing
       */
      geometryInstancing: any;
      
      /**
       * Culling system
       */
      culling: any;
    };
    
    /**
     * Prediction systems
     */
    prediction: {
      /**
       * User behavior prediction
       */
      userBehavior: any;
      
      /**
       * Asset preloading
       */
      assetPreload: any;
      
      /**
       * Render-ahead
       */
      renderAhead: any;
    };
  };
  
  /**
   * Integration flows for the integration core
   */
  flows: {
    /**
     * Chat to grid flow
     */
    chatToGrid: OperatorFunction<any, any>;
    
    /**
     * Motion to camera flow
     */
    motionToCamera: OperatorFunction<any, any>;
    
    /**
     * Beat to system flow
     */
    beatToSystem: OperatorFunction<any, any>;
    
    /**
     * Money to spectacle flow
     */
    moneyToSpectacle: OperatorFunction<any, any>;
    
    /**
     * AI director flow
     */
    aiDirector: OperatorFunction<any, any>;
  };
  
  /**
   * Lifecycle management for the integration core
   */
  readonly lifecycle: {
    /**
     * Initialize the integration core
     */
    initialize: () => Promise<void>;
    
    /**
     * Shutdown the integration core
     */
    shutdown: () => Promise<void>;
    
    /**
     * Error recovery strategies
     */
    errorRecovery: {
      /**
       * Recover from a network failure
       */
      networkFailure: () => Promise<void>;
      
      /**
       * Recover from a Claude timeout
       */
      claudeTimeout: () => Promise<void>;
      
      /**
       * Recover from memory pressure
       */
      memoryPressure: () => Promise<void>;
      
      /**
       * Recover from thermal throttling
       */
      thermalThrottle: () => Promise<void>;
    };
  };
}
