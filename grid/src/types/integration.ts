/**
 * GRID OS: Integration Types
 * 
 * This module provides type definitions for the GRID OS Integration Core.
 */

/**
 * System event
 */
export interface SystemEvent {
  /**
   * Event type
   */
  type: string;
  
  /**
   * Event source
   */
  source: string;
  
  /**
   * Event data
   */
  data: any;
  
  /**
   * Event timestamp
   */
  timestamp: number;
}

/**
 * Chat event
 */
export interface ChatEvent {
  /**
   * Message content
   */
  message: string;
  
  /**
   * User ID
   */
  userId: string;
  
  /**
   * Message timestamp
   */
  timestamp: number;
  
  /**
   * Message metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Beat event
 */
export interface BeatEvent {
  /**
   * Beats per minute
   */
  bpm: number;
  
  /**
   * Beat phase
   */
  phase: number;
  
  /**
   * Beat timestamp
   */
  timestamp: number;
  
  /**
   * Beat intensity
   */
  intensity: number;
}

/**
 * Money event
 */
export interface MoneyEvent {
  /**
   * Transaction type
   */
  type: 'tip' | 'subscription' | 'purchase' | 'donation';
  
  /**
   * Transaction amount
   */
  amount: number;
  
  /**
   * Transaction currency
   */
  currency: string;
  
  /**
   * Transaction sender
   */
  sender: string;
  
  /**
   * Transaction recipient
   */
  recipient: string;
  
  /**
   * Transaction timestamp
   */
  timestamp: number;
}

/**
 * Ripple effect
 */
export interface RippleEffect {
  /**
   * Effect type
   */
  type: string;
  
  /**
   * Effect intensity
   */
  intensity: number;
  
  /**
   * Effect duration
   */
  duration: number;
  
  /**
   * Effect target
   */
  target: string;
}

/**
 * User action
 */
export interface UserAction {
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
  
  /**
   * User ID
   */
  userId: string;
}

/**
 * Grid state
 */
export interface GridState {
  /**
   * State ID
   */
  id: string;
  
  /**
   * State version
   */
  version: number;
  
  /**
   * State data
   */
  data: Record<string, any>;
  
  /**
   * State timestamp
   */
  timestamp: number;
}

/**
 * Predicted state
 */
export interface PredictedState {
  /**
   * State data
   */
  data: Record<string, any>;
  
  /**
   * Prediction confidence
   */
  confidence: number;
  
  /**
   * Prediction timestamp
   */
  timestamp: number;
}

/**
 * Chat message
 */
export interface ChatMessage {
  /**
   * Message content
   */
  content: string;
  
  /**
   * Message sender
   */
  sender: string;
  
  /**
   * Message timestamp
   */
  timestamp: number;
  
  /**
   * Message metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Presence update
 */
export interface PresenceUpdate {
  /**
   * User ID
   */
  userId: string;
  
  /**
   * User status
   */
  status: 'online' | 'offline' | 'away' | 'busy';
  
  /**
   * User activity
   */
  activity?: string;
  
  /**
   * Update timestamp
   */
  timestamp: number;
}

/**
 * Grid patch
 */
export interface GridPatch {
  /**
   * Patch ID
   */
  id: string;
  
  /**
   * Patch operations
   */
  operations: {
    /**
     * Operation type
     */
    op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
    
    /**
     * Operation path
     */
    path: string;
    
    /**
     * Operation value
     */
    value?: any;
    
    /**
     * Operation from path
     */
    from?: string;
  }[];
  
  /**
   * Patch base version
   */
  baseVersion: number;
  
  /**
   * Patch timestamp
   */
  timestamp: number;
}

/**
 * Transaction
 */
export interface Transaction {
  /**
   * Transaction ID
   */
  id: string;
  
  /**
   * Transaction type
   */
  type: 'tip' | 'subscription' | 'purchase' | 'donation';
  
  /**
   * Transaction amount
   */
  amount: number;
  
  /**
   * Transaction currency
   */
  currency: string;
  
  /**
   * Transaction sender
   */
  sender: string;
  
  /**
   * Transaction recipient
   */
  recipient: string;
  
  /**
   * Transaction timestamp
   */
  timestamp: number;
  
  /**
   * Transaction metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Operational transform
 */
export interface OperationalTransform {
  /**
   * Transform ID
   */
  id: string;
  
  /**
   * Transform operations
   */
  operations: {
    /**
     * Operation type
     */
    type: 'insert' | 'delete' | 'retain';
    
    /**
     * Operation position
     */
    position: number;
    
    /**
     * Operation value
     */
    value?: string;
    
    /**
     * Operation length
     */
    length?: number;
  }[];
  
  /**
   * Transform base version
   */
  baseVersion: number;
  
  /**
   * Transform author
   */
  author: string;
  
  /**
   * Transform timestamp
   */
  timestamp: number;
}

/**
 * Edge computing
 */
export interface EdgeComputing {
  /**
   * Edge nodes
   */
  nodes: Map<string, {
    /**
     * Node capabilities
     */
    capabilities: string[];
    
    /**
     * Node load
     */
    load: number;
    
    /**
     * Node latency
     */
    latency: number;
  }>;
  
  /**
   * Schedule a task
   */
  schedule: (task: {
    /**
     * Task ID
     */
    id: string;
    
    /**
     * Task type
     */
    type: string;
    
    /**
     * Task data
     */
    data: any;
    
    /**
     * Task priority
     */
    priority: 'low' | 'medium' | 'high';
  }) => Promise<any>;
  
  /**
   * Get node status
   */
  getNodeStatus: (nodeId: string) => {
    /**
     * Node capabilities
     */
    capabilities: string[];
    
    /**
     * Node load
     */
    load: number;
    
    /**
     * Node latency
     */
    latency: number;
  } | null;
  
  /**
   * Optimize task distribution
   */
  optimizeDistribution: () => void;
}

/**
 * WebSocket message
 */
export interface WSMessage {
  /**
   * Message type
   */
  type: string;
  
  /**
   * Message payload
   */
  payload: any;
  
  /**
   * Message ID
   */
  id: string;
  
  /**
   * Message timestamp
   */
  timestamp: number;
}

/**
 * Device motion event
 */
export interface DeviceMotionEvent {
  /**
   * Acceleration including gravity
   */
  accelerationIncludingGravity: {
    x: number;
    y: number;
    z: number;
  };
  
  /**
   * Acceleration
   */
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  
  /**
   * Rotation rate
   */
  rotationRate: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  
  /**
   * Interval
   */
  interval: number;
}

/**
 * Gesture event
 */
export interface GestureEvent {
  /**
   * Gesture type
   */
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'pan' | 'press';
  
  /**
   * Gesture position
   */
  position: {
    x: number;
    y: number;
  };
  
  /**
   * Gesture velocity
   */
  velocity?: {
    x: number;
    y: number;
  };
  
  /**
   * Gesture scale
   */
  scale?: number;
  
  /**
   * Gesture rotation
   */
  rotation?: number;
  
  /**
   * Gesture pressure
   */
  pressure?: number;
  
  /**
   * Gesture timestamp
   */
  timestamp: number;
}

/**
 * Audio data
 */
export interface AudioData {
  /**
   * Audio samples
   */
  samples: Float32Array;
  
  /**
   * Sample rate
   */
  sampleRate: number;
  
  /**
   * Channel count
   */
  channelCount: number;
  
  /**
   * Frequency data
   */
  frequencyData: Uint8Array;
  
  /**
   * Time domain data
   */
  timeDomainData: Uint8Array;
  
  /**
   * Audio timestamp
   */
  timestamp: number;
}

/**
 * Video frame
 */
export interface VideoFrame {
  /**
   * Frame data
   */
  data: Uint8ClampedArray;
  
  /**
   * Frame width
   */
  width: number;
  
  /**
   * Frame height
   */
  height: number;
  
  /**
   * Frame timestamp
   */
  timestamp: number;
}

/**
 * AI response
 */
export interface AIResponse {
  /**
   * Response type
   */
  type: string;
  
  /**
   * Response data
   */
  data: any;
  
  /**
   * Response confidence
   */
  confidence: number;
  
  /**
   * Response timestamp
   */
  timestamp: number;
}

/**
 * Transaction event
 */
export interface TransactionEvent {
  /**
   * Transaction type
   */
  type: 'tip' | 'subscription' | 'purchase' | 'donation';
  
  /**
   * Transaction amount
   */
  amount: number;
  
  /**
   * Transaction currency
   */
  currency: string;
  
  /**
   * Transaction sender
   */
  sender: string;
  
  /**
   * Transaction recipient
   */
  recipient: string;
  
  /**
   * Transaction timestamp
   */
  timestamp: number;
  
  /**
   * Transaction metadata
   */
  metadata: {
    /**
     * Transaction message
     */
    message?: string;
    
    /**
     * Transaction tags
     */
    tags?: string[];
    
    /**
     * Transaction visibility
     */
    visibility?: 'public' | 'private' | 'anonymous';
    
    /**
     * Transaction source
     */
    source?: string;
  };
}

/**
 * Social update
 */
export interface SocialUpdate {
  /**
   * Update type
   */
  type: 'join' | 'leave' | 'message' | 'reaction' | 'follow' | 'share';
  
  /**
   * Update user
   */
  user: {
    /**
     * User ID
     */
    id: string;
    
    /**
     * User name
     */
    name: string;
    
    /**
     * User avatar
     */
    avatar?: string;
    
    /**
     * User role
     */
    role?: string;
    
    /**
     * User badges
     */
    badges?: string[];
  };
  
  /**
   * Update data
   */
  data: any;
  
  /**
   * Update timestamp
   */
  timestamp: number;
}

/**
 * Enhanced chat event
 */
export interface EnhancedChatEvent {
  /**
   * Original chat event
   */
  original: {
    /**
     * Chat message
     */
    message: string;
    
    /**
     * Chat user
     */
    user: string;
    
    /**
     * Chat timestamp
     */
    timestamp: number;
  };
  
  /**
   * Sentiment analysis
   */
  sentiment: {
    /**
     * Sentiment score
     */
    score: number;
    
    /**
     * Sentiment magnitude
     */
    magnitude: number;
    
    /**
     * Sentiment categories
     */
    categories: {
      /**
       * Category name
       */
      name: string;
      
      /**
       * Category confidence
       */
      confidence: number;
    }[];
  };
  
  /**
   * Intent analysis
   */
  intent: {
    /**
     * Intent type
     */
    type: string;
    
    /**
     * Intent confidence
     */
    confidence: number;
    
    /**
     * Intent parameters
     */
    parameters: Record<string, any>;
  };
  
  /**
   * Entity analysis
   */
  entities: {
    /**
     * Entity name
     */
    name: string;
    
    /**
     * Entity type
     */
    type: string;
    
    /**
     * Entity confidence
     */
    confidence: number;
  }[];
  
  /**
   * Suggested responses
   */
  suggestedResponses: string[];
}

/**
 * Beat prediction event
 */
export interface BeatPredictionEvent {
  /**
   * Beats per minute
   */
  bpm: number;
  
  /**
   * Beat phase
   */
  phase: number;
  
  /**
   * Beat confidence
   */
  confidence: number;
  
  /**
   * Time until next beat
   */
  timeUntilNextBeat: number;
  
  /**
   * Beat intensity
   */
  intensity: number;
  
  /**
   * Beat pattern
   */
  pattern: string;
  
  /**
   * Future beat predictions
   */
  futurePredictions: {
    /**
     * Time until beat
     */
    time: number;
    
    /**
     * Beat intensity
     */
    intensity: number;
    
    /**
     * Beat confidence
     */
    confidence: number;
  }[];
}

/**
 * Enhanced money event
 */
export interface EnhancedMoneyEvent {
  /**
   * Original transaction event
   */
  original: TransactionEvent;
  
  /**
   * Transaction significance
   */
  significance: 'low' | 'medium' | 'high' | 'exceptional';
  
  /**
   * Suggested visual effects
   */
  suggestedEffects: string[];
  
  /**
   * Suggested audio effects
   */
  suggestedAudio: string[];
  
  /**
   * Suggested haptic effects
   */
  suggestedHaptics: string[];
  
  /**
   * User transaction history
   */
  userHistory: {
    /**
     * Total amount spent
     */
    totalSpent: number;
    
    /**
     * Transaction count
     */
    transactionCount: number;
    
    /**
     * First transaction timestamp
     */
    firstTransaction: number;
    
    /**
     * User tier
     */
    tier: 'new' | 'regular' | 'supporter' | 'patron' | 'whale';
  };
}

/**
 * Enhanced user action
 */
export interface EnhancedUserAction {
  /**
   * Action type
   */
  type: string;
  
  /**
   * Action data
   */
  data: any;
  
  /**
   * Action context
   */
  context: {
    /**
     * Previous actions
     */
    previousActions: string[];
    
    /**
     * Current state
     */
    currentState: string;
    
    /**
     * User preferences
     */
    userPreferences: Record<string, any>;
  };
  
  /**
   * Predicted intent
   */
  predictedIntent: {
    /**
     * Intent type
     */
    type: string;
    
    /**
     * Intent confidence
     */
    confidence: number;
  };
  
  /**
   * Suggested responses
   */
  suggestedResponses: {
    /**
     * Response type
     */
    type: string;
    
    /**
     * Response data
     */
    data: any;
    
    /**
     * Response priority
     */
    priority: 'low' | 'medium' | 'high';
  }[];
}

/**
 * Enhanced grid state
 */
export interface EnhancedGridState {
  /**
   * Grid state
   */
  state: {
    /**
     * Active users
     */
    activeUsers: number;
    
    /**
     * Active sessions
     */
    activeSessions: number;
    
    /**
     * Current scene
     */
    currentScene: string;
    
    /**
     * Active effects
     */
    activeEffects: string[];
    
    /**
     * System load
     */
    systemLoad: number;
  };
  
  /**
   * Grid analytics
   */
  analytics: {
    /**
     * User engagement
     */
    userEngagement: number;
    
    /**
     * Session duration
     */
    sessionDuration: number;
    
    /**
     * Interaction rate
     */
    interactionRate: number;
    
    /**
     * Conversion rate
     */
    conversionRate: number;
  };
  
  /**
   * Grid predictions
   */
  predictions: {
    /**
     * User growth
     */
    userGrowth: number;
    
    /**
     * Revenue growth
     */
    revenueGrowth: number;
    
    /**
     * Engagement growth
     */
    engagementGrowth: number;
    
    /**
     * Retention rate
     */
    retentionRate: number;
  };
}

/**
 * Grid command
 */
export interface GridCommand {
  /**
   * Command type
   */
  type: string;
  
  /**
   * Command data
   */
  data: any;
  
  /**
   * Command priority
   */
  priority: 'low' | 'medium' | 'high';
  
  /**
   * Command timestamp
   */
  timestamp: number;
}

/**
 * Haptic command
 */
export interface HapticCommand {
  /**
   * Command type
   */
  type: 'impact' | 'selection' | 'success' | 'warning' | 'error' | 'custom';
  
  /**
   * Command intensity
   */
  intensity: number;
  
  /**
   * Command duration
   */
  duration: number;
  
  /**
   * Command pattern
   */
  pattern?: number[];
}

/**
 * Shader command
 */
export interface ShaderCommand {
  /**
   * Command type
   */
  type: 'load' | 'unload' | 'apply' | 'update';
  
  /**
   * Shader name
   */
  shader: string;
  
  /**
   * Command data
   */
  data?: any;
  
  /**
   * Command priority
   */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Audio command
 */
export interface AudioCommand {
  /**
   * Command type
   */
  type: 'play' | 'stop' | 'pause' | 'resume' | 'volume' | 'pitch' | 'pan';
  
  /**
   * Audio source
   */
  source: string;
  
  /**
   * Command data
   */
  data?: any;
  
  /**
   * Command priority
   */
  priority: 'low' | 'medium' | 'high';
}

/**
 * AI command
 */
export interface AICommand {
  /**
   * Command type
   */
  type: string;
  
  /**
   * Command data
   */
  data: any;
  
  /**
   * Command priority
   */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Network command
 */
export interface NetworkCommand {
  /**
   * Command type
   */
  type: 'connect' | 'disconnect' | 'send' | 'broadcast' | 'join' | 'leave';
  
  /**
   * Command data
   */
  data: any;
  
  /**
   * Command priority
   */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Exponential backoff
 */
export interface ExponentialBackoff {
  /**
   * Initial delay
   */
  initialDelay: number;
  
  /**
   * Maximum delay
   */
  maxDelay: number;
  
  /**
   * Multiplier
   */
  multiplier: number;
  
  /**
   * Jitter
   */
  jitter: number;
}

/**
 * Duplex stream
 */
export interface DuplexStream<T> {
  /**
   * Incoming stream
   */
  incoming$: any;
  
  /**
   * Outgoing stream
   */
  outgoing$: any;
  
  /**
   * Send a message
   */
  send: (message: T) => void;
  
  /**
   * Subscribe to the stream
   */
  subscribe: (observer: any) => any;
  
  /**
   * Close the stream
   */
  close: () => void;
}

/**
 * Conflict-free replicated data type
 */
export interface CRDT<T> {
  /**
   * CRDT value
   */
  value: T;
  
  /**
   * CRDT version
   */
  version: number;
  
  /**
   * CRDT timestamp
   */
  timestamp: number;
  
  /**
   * CRDT author
   */
  author: string;
}

/**
 * Conflict resolver
 */
export interface ConflictResolver {
  /**
   * Resolve a conflict
   */
  resolve: <T>(local: CRDT<T>, remote: CRDT<T>) => CRDT<T>;
  
  /**
   * Merge two CRDTs
   */
  merge: <T>(local: CRDT<T>, remote: CRDT<T>) => CRDT<T>;
}

/**
 * Packet scheduler
 */
export interface PacketScheduler {
  /**
   * Schedule a packet
   */
  schedule: (packet: any, priority: 'low' | 'medium' | 'high') => void;
  
  /**
   * Get the next packet
   */
  next: () => any;
  
  /**
   * Get the queue length
   */
  length: () => number;
}

/**
 * Jitter buffer
 */
export interface JitterBuffer {
  /**
   * Add a packet
   */
  add: (packet: any) => void;
  
  /**
   * Get the next packet
   */
  next: () => any;
  
  /**
   * Get the buffer length
   */
  length: () => number;
  
  /**
   * Get the buffer capacity
   */
  capacity: () => number;
  
  /**
   * Get the buffer jitter
   */
  jitter: () => number;
}

/**
 * Claude agent
 */
export interface ClaudeAgent<T> {
  /**
   * Agent name
   */
  name: string;
  
  /**
   * Agent version
   */
  version: string;
  
  /**
   * Agent capabilities
   */
  capabilities: string[];
  
  /**
   * Agent state
   */
  state: 'idle' | 'processing' | 'error';
  
  /**
   * Process input
   */
  process: (input: any) => Promise<T>;
  
  /**
   * Train the agent
   */
  train: (data: any) => Promise<void>;
  
  /**
   * Reset the agent
   */
  reset: () => void;
}

/**
 * Mood analysis
 */
export interface MoodAnalysis {
  /**
   * Mood type
   */
  type: string;
  
  /**
   * Mood intensity
   */
  intensity: number;
  
  /**
   * Mood confidence
   */
  confidence: number;
  
  /**
   * Mood factors
   */
  factors: {
    /**
     * Factor name
     */
    name: string;
    
    /**
     * Factor weight
     */
    weight: number;
  }[];
}

/**
 * Beat prediction
 */
export interface BeatPrediction {
  /**
   * Beats per minute
   */
  bpm: number;
  
  /**
   * Beat phase
   */
  phase: number;
  
  /**
   * Beat confidence
   */
  confidence: number;
  
  /**
   * Beat pattern
   */
  pattern: string;
  
  /**
   * Beat predictions
   */
  predictions: {
    /**
     * Time until beat
     */
    time: number;
    
    /**
     * Beat intensity
     */
    intensity: number;
    
    /**
     * Beat confidence
     */
    confidence: number;
  }[];
}

/**
 * Chat enhancement
 */
export interface ChatEnhancement {
  /**
   * Original message
   */
  original: string;
  
  /**
   * Enhanced message
   */
  enhanced: string;
  
  /**
   * Message sentiment
   */
  sentiment: {
    /**
     * Sentiment type
     */
    type: string;
    
    /**
     * Sentiment score
     */
    score: number;
  };
  
  /**
   * Message intent
   */
  intent: {
    /**
     * Intent type
     */
    type: string;
    
    /**
     * Intent confidence
     */
    confidence: number;
  };
  
  /**
   * Suggested responses
   */
  suggestedResponses: string[];
}

/**
 * Visual direction
 */
export interface VisualDirection {
  /**
   * Direction type
   */
  type: string;
  
  /**
   * Direction intensity
   */
  intensity: number;
  
  /**
   * Direction duration
   */
  duration: number;
  
  /**
   * Direction targets
   */
  targets: string[];
  
  /**
   * Direction parameters
   */
  parameters: Record<string, any>;
}

/**
 * Safety intervention
 */
export interface SafetyIntervention {
  /**
   * Intervention type
   */
  type: string;
  
  /**
   * Intervention severity
   */
  severity: 'low' | 'medium' | 'high';
  
  /**
   * Intervention reason
   */
  reason: string;
  
  /**
   * Intervention action
   */
  action: string;
  
  /**
   * Intervention message
   */
  message: string;
}

/**
 * Generative idea
 */
export interface GenerativeIdea {
  /**
   * Idea type
   */
  type: string;
  
  /**
   * Idea description
   */
  description: string;
  
  /**
   * Idea parameters
   */
  parameters: Record<string, any>;
  
  /**
   * Idea variations
   */
  variations: {
    /**
     * Variation name
     */
    name: string;
    
    /**
     * Variation description
     */
    description: string;
    
    /**
     * Variation parameters
     */
    parameters: Record<string, any>;
  }[];
}

/**
 * User personality
 */
export interface UserPersonality {
  /**
   * Personality traits
   */
  traits: {
    /**
     * Trait name
     */
    name: string;
    
    /**
     * Trait value
     */
    value: number;
  }[];
  
  /**
   * Personality preferences
   */
  preferences: {
    /**
     * Preference name
     */
    name: string;
    
    /**
     * Preference value
     */
    value: any;
  }[];
  
  /**
   * Personality history
   */
  history: {
    /**
     * History event
     */
    event: string;
    
    /**
     * History timestamp
     */
    timestamp: number;
  }[];
}

/**
 * Collective thought
 */
export interface CollectiveThought {
  /**
   * Thought type
   */
  type: string;
  
  /**
   * Thought content
   */
  content: string;
  
  /**
   * Thought confidence
   */
  confidence: number;
  
  /**
   * Thought sources
   */
  sources: string[];
}

/**
 * Decision tree
 */
export interface DecisionTree<T> {
  /**
   * Root node
   */
  root: {
    /**
     * Node condition
     */
    condition: (context: any) => boolean;
    
    /**
     * Node action
     */
    action: T;
    
    /**
     * Node children
     */
    children: any[];
  };
  
  /**
   * Evaluate the decision tree
   */
  evaluate: (context: any) => T;
}

/**
 * System action
 */
export interface SystemAction {
  /**
   * Action type
   */
  type: string;
  
  /**
   * Action parameters
   */
  parameters: Record<string, any>;
  
  /**
   * Action priority
   */
  priority: 'low' | 'medium' | 'high';
}

/**
 * Emergent behavior
 */
export interface EmergentBehavior {
  /**
   * Behavior name
   */
  name: string;
  
  /**
   * Behavior description
   */
  description: string;
  
  /**
   * Behavior triggers
   */
  triggers: {
    /**
     * Trigger condition
     */
    condition: (context: any) => boolean;
    
    /**
     * Trigger weight
     */
    weight: number;
  }[];
  
  /**
   * Behavior actions
   */
  actions: {
    /**
     * Action type
     */
    type: string;
    
    /**
     * Action parameters
     */
    parameters: Record<string, any>;
  }[];
}

/**
 * Context window
 */
export interface ContextWindow<T extends number> {
  /**
   * Window capacity
   */
  capacity: T;
  
  /**
   * Window items
   */
  items: any[];
  
  /**
   * Add an item
   */
  add: (item: any) => void;
  
  /**
   * Get an item
   */
  get: (index: number) => any;
  
  /**
   * Clear the window
   */
  clear: () => void;
}

/**
 * Vector database
 */
export interface VectorDatabase {
  /**
   * Add a vector
   */
  add: (key: string, vector: number[], metadata?: any) => void;
  
  /**
   * Get a vector
   */
  get: (key: string) => { vector: number[]; metadata: any } | null;
  
  /**
   * Search for vectors
   */
  search: (vector: number[], limit?: number) => { key: string; score: number; metadata: any }[];
  
  /**
   * Delete a vector
   */
  delete: (key: string) => boolean;
}

/**
 * Emotional memory
 */
export interface EmotionalMemory {
  /**
   * Add a memory
   */
  add: (memory: {
    /**
     * Memory type
     */
    type: string;
    
    /**
     * Memory content
     */
    content: string;
    
    /**
     * Memory emotion
     */
    emotion: {
      /**
       * Emotion type
       */
      type: string;
      
      /**
       * Emotion intensity
       */
      intensity: number;
    };
    
    /**
     * Memory timestamp
     */
    timestamp: number;
  }) => void;
  
  /**
   * Get memories by emotion
   */
  getByEmotion: (emotion: string, limit?: number) => any[];
  
  /**
   * Get memories by time range
   */
  getByTimeRange: (start: number, end: number) => any[];
  
  /**
   * Get emotional state
   */
  getEmotionalState: () => {
    /**
     * Dominant emotion
     */
    dominant: string;
    
    /**
     * Emotional spectrum
     */
    spectrum: Record<string, number>;
  };
}

/**
 * Pattern recognition
 */
export interface PatternRecognition {
  /**
   * Add a pattern
   */
  add: (pattern: {
    /**
     * Pattern name
     */
    name: string;
    
    /**
     * Pattern features
     */
    features: any[];
  }) => void;
  
  /**
   * Recognize a pattern
   */
  recognize: (features: any[]) => {
    /**
     * Pattern name
     */
    name: string;
    
    /**
     * Pattern confidence
     */
    confidence: number;
  }[];
  
  /**
   * Train the recognizer
   */
  train: (data: any[]) => void;
}

/**
 * Personality vector
 */
export interface PersonalityVector {
  /**
   * Extraversion
   */
  extraversion: number;
  
  /**
   * Agreeableness
   */
  agreeableness: number;
  
  /**
   * Conscientiousness
   */
  conscientiousness: number;
  
  /**
   * Neuroticism
   */
  neuroticism: number;
  
  /**
   * Openness
   */
  openness: number;
  
  /**
   * Custom traits
   */
  custom: Record<string, number>;
}

/**
 * Adaptive personality
 */
export interface AdaptivePersonality {
  /**
   * Base personality
   */
  base: PersonalityVector;
  
  /**
   * Current personality
   */
  current: PersonalityVector;
  
  /**
   * Adapt to user
   */
  adapt: (userPersonality: PersonalityVector, strength: number) => void;
  
  /**
   * Reset to base
   */
  reset: () => void;
}

/**
 * Emotional spread
 */
export interface EmotionalSpread {
  /**
   * Current emotions
   */
  emotions: Record<string, number>;
  
  /**
   * Update emotions
   */
  update: (emotion: string, intensity: number) => void;
  
  /**
   * Get dominant emotion
   */
  getDominant: () => { emotion: string; intensity: number };
  
  /**
   * Reset emotions
   */
  reset: () => void;
}
