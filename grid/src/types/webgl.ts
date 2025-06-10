/**
 * Interface defining WebGL performance settings and capabilities
 */
export interface WebGLPerformance {
  /** Target frames per second for rendering */
  targetFPS: 30 | 60 | 120 | 144;
  
  /** Quality preset for graphics settings */
  qualityPreset: 'potato' | 'balanced' | 'ultra' | 'raytraced';
  
  /** Maximum number of particles that can be rendered */
  maxParticles: number;
  
  /** Maximum number of shaders that can be loaded */
  maxShaders: number;
  
  /** GPU tier classification */
  gpuTier: 'integrated' | 'mobile' | 'desktop' | 'workstation';
  
  /** Whether to enable dynamic Level of Detail based on performance */
  dynamicLOD: boolean;
}

/**
 * Default performance settings per GPU tier
 */
export const defaultSettings: Record<WebGLPerformance['gpuTier'], Omit<WebGLPerformance, 'gpuTier'>> = {
  integrated: {
    targetFPS: 30,
    qualityPreset: 'potato',
    maxParticles: 1000,
    maxShaders: 50,
    dynamicLOD: true
  },
  mobile: {
    targetFPS: 60,
    qualityPreset: 'balanced',
    maxParticles: 5000,
    maxShaders: 100,
    dynamicLOD: true
  },
  desktop: {
    targetFPS: 120,
    qualityPreset: 'ultra',
    maxParticles: 50000,
    maxShaders: 500,
    dynamicLOD: false
  },
  workstation: {
    targetFPS: 144,
    qualityPreset: 'raytraced',
    maxParticles: 100000,
    maxShaders: 1000,
    dynamicLOD: false
  }
};

/**
 * Detect GPU tier based on available WebGL capabilities
 * @returns The detected GPU tier
 */
export function detectGPUTier(): WebGLPerformance['gpuTier'] {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      return 'integrated'; // Fallback to lowest tier if WebGL is not available
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return 'mobile'; // Fallback to mobile if we can't get detailed info
    }

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

    // Check for common GPU identifiers
    if (renderer.includes('nvidia') || renderer.includes('radeon pro') || renderer.includes('quadro')) {
      return 'workstation';
    } else if (renderer.includes('geforce') || renderer.includes('radeon') || renderer.includes('arc')) {
      return 'desktop';
    } else if (renderer.includes('intel') || renderer.includes('mali') || renderer.includes('adreno')) {
      return renderer.includes('hd') || renderer.includes('iris') ? 'mobile' : 'integrated';
    }

    return 'mobile'; // Default to mobile as a safe middle ground
  } catch {
    return 'integrated'; // Fallback to lowest tier if detection fails
  }
}

/**
 * Create performance settings based on detected GPU tier
 * @returns Complete WebGLPerformance settings
 */
export function createPerformanceSettings(): WebGLPerformance {
  const gpuTier = detectGPUTier();
  return {
    ...defaultSettings[gpuTier],
    gpuTier
  };
}

/**
 * Adjust performance settings based on current FPS
 * @param settings Current performance settings
 * @param currentFPS Current frames per second
 * @returns Updated performance settings
 */
export function adjustPerformance(
  settings: WebGLPerformance,
  currentFPS: number
): WebGLPerformance {
  if (!settings.dynamicLOD) {
    return settings;
  }

  const targetFPS = settings.targetFPS;
  const fpsRatio = currentFPS / targetFPS;

  if (fpsRatio < 0.8) {
    // Performance is too low, reduce quality
    return {
      ...settings,
      maxParticles: Math.floor(settings.maxParticles * 0.8),
      qualityPreset: getReducedQualityPreset(settings.qualityPreset)
    };
  } else if (fpsRatio > 1.2 && settings.qualityPreset !== 'raytraced') {
    // Performance is good, we can increase quality
    return {
      ...settings,
      maxParticles: Math.min(Math.floor(settings.maxParticles * 1.2), defaultSettings[settings.gpuTier].maxParticles),
      qualityPreset: getIncreasedQualityPreset(settings.qualityPreset)
    };
  }

  return settings;
}

/**
 * Get the next lower quality preset
 */
function getReducedQualityPreset(current: WebGLPerformance['qualityPreset']): WebGLPerformance['qualityPreset'] {
  const presets: WebGLPerformance['qualityPreset'][] = ['potato', 'balanced', 'ultra', 'raytraced'];
  const currentIndex = presets.indexOf(current);
  return currentIndex > 0 ? presets[currentIndex - 1] : current;
}

/**
 * Get the next higher quality preset
 */
function getIncreasedQualityPreset(current: WebGLPerformance['qualityPreset']): WebGLPerformance['qualityPreset'] {
  const presets: WebGLPerformance['qualityPreset'][] = ['potato', 'balanced', 'ultra', 'raytraced'];
  const currentIndex = presets.indexOf(current);
  return currentIndex < presets.length - 1 ? presets[currentIndex + 1] : current;
}

/**
 * Interface for WebGL shader
 */
export interface WebGLShader {
  /** Unique identifier for the shader */
  id: string;
  
  /** Name of the shader */
  name: string;
  
  /** Vertex shader source code */
  vertexSource: string;
  
  /** Fragment shader source code */
  fragmentSource: string;
  
  /** Shader uniforms */
  uniforms: Record<string, any>;
  
  /** Shader attributes */
  attributes: Record<string, any>;
  
  /** WebGL program */
  program: any;
}

/**
 * Configuration for material properties in the shader system
 */
export interface MaterialConfig {
  /** Name of the material */
  name: string;
  
  /** Type of material */
  type: 'pbr' | 'emissive' | 'toon' | 'wireframe';
  
  /** Material properties */
  properties: {
    /** Base color of the material */
    baseColor: [number, number, number, number];
    
    /** How reflective the material is (0-1) */
    metallic: number;
    
    /** Surface roughness affecting light scatter (0-1) */
    roughness: number;
    
    /** Normal map intensity (0-1) */
    normalScale: number;
    
    /** Emissive color for self-illumination */
    emissive: [number, number, number];
    
    /** Emissive intensity (0+) */
    emissiveIntensity?: number;
    
    /** Specular reflection intensity (0-1) */
    specular: number;
    
    /** Material textures */
    textures: Record<string, string>;
  };
}

/**
 * Interface defining the WebGL shader system
 */
export interface ShaderSystem {
  /** Currently active shaders mapped by their identifiers */
  activeShaders: Map<string, WebGLShader>;
  
  /** Predefined material configurations */
  materialPresets: {
    carbonFiber: MaterialConfig;
    goldAccent: MaterialConfig;
    cyanGlow: MaterialConfig;
    studioMetal: MaterialConfig;
  };
  
  /** Post-processing effect toggles */
  postProcessing: {
    bloom: boolean;
    motionBlur: boolean;
    chromaticAberration: boolean;
    filmGrain: boolean;
  };
}

/**
 * Configuration for audio visualizers
 */
export interface VisualizerConfig {
  /** Unique identifier for the visualizer */
  id: string;
  
  /** Type of visualization to render */
  type: 'spectrum' | 'waveform' | 'particles' | 'circular' | 'custom';
  
  /** Color scheme for the visualizer */
  colors: Array<[number, number, number]>;
  
  /** Intensity of the visualization (0-1) */
  intensity: number;
  
  /** Smoothing factor for transitions (0-1) */
  smoothing: number;
  
  /** Whether the visualizer responds to beat detection */
  reactToBeat: boolean;
  
  /** Custom shader program for the visualizer, if applicable */
  customShader?: WebGLProgram;
  
  /** Additional visualizer-specific parameters */
  params?: Record<string, number | boolean | string>;
}

/**
 * Interface for synchronizing audio analysis with visual effects
 */
export interface AudioVisualSync {
  /** Web Audio API context for audio processing */
  audioContext: AudioContext;
  
  /** Frequency domain data from audio analysis */
  frequencyData: Float32Array;
  
  /** Configuration for beat detection algorithm */
  beatDetection: {
    threshold: number;
    smoothing: number;
    lastBeat: number;
  };
  
  /** Array of visualizer configurations */
  visualizers: Array<VisualizerConfig>;
  
  /** Optional texture containing waveform data */
  waveformTexture?: WebGLTexture;
}

/**
 * Configuration for camera transitions
 */
export interface CameraTransition {
  /** Unique identifier for the transition */
  id: string;
  
  /** Starting camera position */
  from: {
    position: [number, number, number];
    rotation: [number, number, number];
    fov: number;
  };
  
  /** Target camera position */
  to: {
    position: [number, number, number];
    rotation: [number, number, number];
    fov: number;
  };
  
  /** Duration of the transition in milliseconds */
  duration: number;
  
  /** Easing function to use for the transition */
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
  
  /** Whether the transition is currently active */
  active: boolean;
  
  /** Progress of the transition (0-1) */
  progress: number;
  
  /** Optional callback to execute when transition completes */
  onComplete?: () => void;
}

/**
 * Configuration for multiple viewports
 */
export interface ViewportConfig {
  /** Unique identifier for the viewport */
  id: string;
  
  /** Position and size of the viewport in normalized coordinates (0-1) */
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  
  /** Camera settings for this viewport */
  camera: {
    position: [number, number, number];
    rotation: [number, number, number];
    fov: number;
    zoom: number;
  };
  
  /** Optional render layers to include/exclude */
  layers?: {
    include?: string[];
    exclude?: string[];
  };
  
  /** Whether this viewport has a border */
  border?: {
    color: [number, number, number];
    width: number;
  };
  
  /** Z-index for viewport ordering */
  zIndex?: number;
}

/**
 * Interface for ARKit configuration
 */
export interface ARKitConfig {
  /** Whether ARKit is enabled */
  enabled: boolean;
  
  /** Whether plane detection is enabled */
  planeDetection: boolean;
  
  /** Whether light estimation is enabled */
  lightEstimation: boolean;
  
  /** Whether people occlusion is enabled */
  peopleOcclusion: boolean;
  
  /** Whether face tracking is enabled */
  faceTracking?: boolean;
  
  /** Whether body tracking is enabled */
  bodyTracking?: boolean;
  
  /** Whether image tracking is enabled */
  imageTracking?: boolean;
  
  /** Whether object tracking is enabled */
  objectTracking?: boolean;
  
  /** Whether environment texturing is enabled */
  environmentTexturing?: 'none' | 'manual' | 'automatic';
  
  /** Whether to use the front or back camera */
  cameraPosition?: 'front' | 'back';
  
  /** Current tracking state */
  trackingState?: 'notAvailable' | 'limited' | 'normal';
  
  /** Reason for limited tracking, if applicable */
  trackingStateReason?: 'none' | 'initializing' | 'excessiveMotion' | 'insufficientFeatures';
}

/**
 * Interface for AR mode configuration
 */
export interface ARModeConfig {
  /** Whether to enable plane detection */
  planeDetection?: boolean;
  
  /** Whether to enable light estimation */
  lightEstimation?: boolean;
  
  /** Whether to enable people occlusion */
  peopleOcclusion?: boolean;
  
  /** Whether to enable face tracking */
  faceTracking?: boolean;
  
  /** Whether to enable body tracking */
  bodyTracking?: boolean;
  
  /** Whether to enable image tracking */
  imageTracking?: boolean;
  
  /** Whether to enable object tracking */
  objectTracking?: boolean;
  
  /** Whether to enable environment texturing */
  environmentTexturing?: boolean;
  
  /** Whether to anchor virtual objects to real-world surfaces */
  anchorObjects?: boolean;
  
  /** Whether to show debug visualizations for detected planes */
  debugVisualization?: boolean;
}

/**
 * Interface for the camera management system
 */
export interface CameraSystem {
  /** Main camera configuration */
  mainCamera: {
    position: [number, number, number];
    rotation: [number, number, number];
    fov: number;
    zoom: number;
  };
  
  /** Current cinematic mode for camera behavior */
  cinematicModes: 'static' | 'orbit' | 'follow' | 'shake' | 'cinematic';
  
  /** Array of active or queued camera transitions */
  transitions: CameraTransition[];
  
  /** Optional multi-viewport configuration */
  multiViewport?: ViewportConfig[];
  
  /** ARKit configuration for iOS devices */
  arKit?: ARKitConfig;
}

/**
 * Type of asset in the asset pipeline
 */
export type AssetType = 'texture' | 'model' | 'shader' | 'audio' | 'font' | 'data';

/**
 * Loading state of an asset
 */
export type AssetState = 'pending' | 'loading' | 'loaded' | 'error' | 'unloaded';

/**
 * Priority level for asset loading
 */
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'background';

/**
 * Interface for an asset in the asset pipeline
 */
export interface Asset {
  /** Unique identifier for the asset */
  id: string;
  
  /** Type of the asset */
  type: AssetType;
  
  /** URL or path to the asset */
  url: string;
  
  /** Current loading state */
  state: AssetState;
  
  /** Loading priority */
  priority: PriorityLevel;
  
  /** Size of the asset in bytes */
  size: number;
  
  /** When the asset was last accessed */
  lastAccessed: number;
  
  /** Optional metadata for the asset */
  metadata?: Record<string, any>;
}

/**
 * Generic priority queue implementation
 */
export interface PriorityQueue<T> {
  /** Add an item to the queue with a priority */
  enqueue: (item: T, priority: number) => void;
  
  /** Remove and return the highest priority item */
  dequeue: () => T | undefined;
  
  /** Peek at the highest priority item without removing it */
  peek: () => T | undefined;
  
  /** Current number of items in the queue */
  length: number;
  
  /** Whether the queue is empty */
  isEmpty: boolean;
  
  /** Clear all items from the queue */
  clear: () => void;
  
  /** Update the priority of an existing item */
  updatePriority: (item: T, newPriority: number) => boolean;
}

/**
 * Interface for geometry buffer data
 */
export interface GeometryBuffer {
  /** Vertex buffer object */
  vbo: WebGLBuffer;
  
  /** Index buffer object */
  ibo?: WebGLBuffer;
  
  /** Number of vertices */
  vertexCount: number;
  
  /** Number of indices */
  indexCount?: number;
  
  /** Vertex attribute layout */
  attributes: {
    position: number;
    normal?: number;
    uv?: number;
    tangent?: number;
    color?: number;
    boneIndices?: number;
    boneWeights?: number;
  };
  
  /** Bounding information */
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
    center: [number, number, number];
    radius: number;
  };
  
  /** Whether the geometry has been uploaded to the GPU */
  uploaded: boolean;
  
  /** Optional LOD levels for this geometry */
  lodLevels?: {
    level: number;
    distance: number;
    buffer: GeometryBuffer;
  }[];
}

/**
 * Interface for the asset management pipeline
 */
export interface AssetPipeline {
  /** Map of texture names to WebGL textures */
  textureAtlas: Map<string, WebGLTexture>;
  
  /** Map of model names to geometry buffers */
  modelCache: Map<string, GeometryBuffer>;
  
  /** Priority queue for asset loading */
  loadingQueue: PriorityQueue<Asset>;
  
  /** Memory budget in bytes */
  memoryBudget: number;
  
  /** Whether to stream LOD levels based on distance */
  streamingLOD: boolean;
}

/**
 * Interface representing the state of the grid system
 */
export interface GridState {
  /** Current timestamp of this state */
  timestamp: number;
  
  /** Unique identifier for this state update */
  stateId: string;
  
  /** Map of entity IDs to their current state */
  entities: Map<string, {
    position: [number, number, number];
    rotation: [number, number, number];
    velocity: [number, number, number];
    active: boolean;
    properties: Record<string, any>;
  }>;
  
  /** Global environment state */
  environment: {
    time: number;
    lighting: {
      ambient: [number, number, number];
      directional: [number, number, number];
    };
    physics: {
      gravity: [number, number, number];
      windDirection: [number, number, number];
      windStrength: number;
    };
  };
  
  /** User inputs that led to this state */
  inputs?: {
    userId: string;
    actions: Array<{
      type: string;
      data: any;
      timestamp: number;
    }>;
  }[];
  
  /** Whether this state has been validated */
  validated: boolean;
}

/**
 * Interface for network synchronization
 */
export interface NetworkSync {
  /** WebSocket connection to the server */
  websocketConnection: WebSocket;
  
  /** Map of peer IDs to WebRTC peer connections */
  peerConnections: Map<string, RTCPeerConnection>;
  
  /** State synchronization configuration */
  stateSync: {
    /** Local client state */
    localState: GridState;
    
    /** Authoritative server state */
    serverState: GridState;
    
    /** Reconciliation strategy when states diverge */
    reconciliation: 'client' | 'server' | 'hybrid';
  };
  
  /** Milliseconds of latency compensation to apply */
  latencyCompensation: number;
}

/**
 * Interface for chat context used by the AI suggestion engine
 */
export interface ChatContext {
  /** Recent messages in the conversation */
  messages: Array<{
    /** User ID of the message sender */
    userId: string;
    
    /** Content of the message */
    content: string;
    
    /** Timestamp when the message was sent */
    timestamp: number;
    
    /** Optional sentiment analysis of the message */
    sentiment?: {
      /** Overall sentiment score (-1 to 1) */
      score: number;
      
      /** Detected emotions in the message */
      emotions: Record<string, number>;
    };
  }>;
  
  /** Active users in the conversation */
  participants: Array<{
    /** User ID */
    id: string;
    
    /** User's display name */
    name: string;
    
    /** User's interaction history */
    history: {
      /** Number of messages sent */
      messageCount: number;
      
      /** Average sentiment of messages */
      averageSentiment: number;
      
      /** Common topics discussed */
      topics: string[];
    };
  }>;
  
  /** Current conversation topic */
  topic?: string;
  
  /** Environment context (time, location, etc.) */
  environment?: Record<string, any>;
  
  /** Previous AI suggestions that were accepted */
  previousSuggestions?: string[];
}

/**
 * Interface for AI-generated suggestions
 */
export interface Suggestion {
  /** Unique identifier for the suggestion */
  id: string;
  
  /** Type of suggestion */
  type: 'text' | 'emoji' | 'reaction' | 'effect' | 'action';
  
  /** Content of the suggestion */
  content: string;
  
  /** Confidence score for this suggestion (0-1) */
  confidence: number;
  
  /** Context that triggered this suggestion */
  trigger: {
    /** Type of trigger */
    type: 'keyword' | 'sentiment' | 'pattern' | 'time' | 'user';
    
    /** Value that triggered the suggestion */
    value: string;
  };
  
  /** Optional metadata for the suggestion */
  metadata?: Record<string, any>;
  
  /** Whether this suggestion has been presented to the user */
  presented: boolean;
  
  /** Whether this suggestion was accepted by the user */
  accepted?: boolean;
}

/**
 * Interface for AI integration features
 */
export interface AIIntegration {
  /** AI-powered suggestion engine */
  suggestionEngine: {
    /** Current chat context */
    context: ChatContext;
    
    /** Generated suggestions */
    predictions: Suggestion[];
    
    /** Overall confidence in the suggestions */
    confidence: number;
  };
  
  /** System to protect the vibe of conversations */
  vibeProtection: {
    /** Current sentiment score of the conversation */
    sentimentScore: number;
    
    /** Threshold at which the system will intervene */
    interventionThreshold: number;
    
    /** Current warning level */
    warningLevel: 'none' | 'mild' | 'severe';
  };
  
  /** AI-powered content generation features */
  contentGeneration: {
    /** Whether to enable auto-completion of messages */
    autoComplete: boolean;
    
    /** Whether to enable smart visual effects */
    smartEffects: boolean;
    
    /** Whether to enable contextual reactions */
    contextualReactions: boolean;
  };
}

/**
 * Types of haptic feedback that can be triggered
 */
export type HapticFeedbackType = 'selection' | 'impact' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Interface for device controls that can trigger haptic feedback
 */
export interface DeviceControls {
  /** Trigger haptic feedback on the device */
  triggerHaptic: (type: HapticFeedbackType, intensity?: number) => void;
  
  /** Vibrate the device with a custom pattern */
  vibrate?: (pattern: number[] | number) => void;
  
  /** Check if haptic feedback is supported on this device */
  hasHapticFeedback: () => boolean;
  
  /** Enable or disable haptic feedback */
  setHapticFeedbackEnabled: (enabled: boolean) => void;
}

/**
 * Interface for iPhone-specific device controls
 */
export interface iPhoneControlSystem {
  /** Device controls including haptic feedback */
  controls: DeviceControls;
  
  /** Check if the device is an iPhone */
  isIPhone: () => boolean;
  
  /** Get the iPhone model */
  getModel: () => string;
  
  /** Check if the device supports specific features */
  supports: (feature: string) => boolean;
}

/**
 * Interface for the haptic feedback manager
 */
export interface HapticManager {
  /** Trigger haptic feedback when typing */
  onType: () => void;
  
  /** Trigger haptic feedback with intensity based on amount */
  onMoneyShot: (amount: number) => void;
  
  /** Trigger haptic feedback on beat detection */
  onBeat: () => void;
  
  /** Trigger haptic feedback when unlocking a mystery box */
  onUnlockMysteryBox: () => void;
  
  /** Trigger custom haptic feedback */
  onCustom?: (type: HapticFeedbackType, intensity?: number) => void;
  
  /** Whether haptic feedback is enabled */
  enabled?: boolean;
}

/**
 * Implementation of the haptic manager
 * 
 * Example usage:
 * ```typescript
 * // Trigger haptics on every interaction
 * const hapticManager: HapticManager = {
 *   onType: () => iPhoneControl.controls.triggerHaptic('selection'),
 *   onMoneyShot: (amount: number) => {
 *     const intensity = Math.min(amount / 100, 1);
 *     iPhoneControl.controls.triggerHaptic('impact', intensity);
 *   },
 *   onBeat: () => iPhoneControl.controls.triggerHaptic('light'),
 *   onUnlockMysteryBox: () => iPhoneControl.controls.triggerHaptic('success')
 * };
 * ```
 */

/**
 * Default implementation of the haptic manager for iPhone devices
 */
export const hapticManager: HapticManager = {
  onType: () => iPhoneControl.controls.triggerHaptic('selection'),
  onMoneyShot: (amount: number) => {
    const intensity = Math.min(amount / 100, 1);
    iPhoneControl.controls.triggerHaptic('impact', intensity);
  },
  onBeat: () => iPhoneControl.controls.triggerHaptic('light'),
  onUnlockMysteryBox: () => iPhoneControl.controls.triggerHaptic('success')
};

/**
 * Default iPhone control system instance
 */
export const iPhoneControl: iPhoneControlSystem = {
  controls: {
    triggerHaptic: (type: HapticFeedbackType, intensity: number = 1.0) => {
      // Implementation would interact with native iOS APIs
      console.log(`Triggering haptic feedback: ${type} with intensity ${intensity}`);
    },
    hasHapticFeedback: () => {
      // Check if device supports haptic feedback
      return true;
    },
    setHapticFeedbackEnabled: (enabled: boolean) => {
      // Enable or disable haptic feedback
      console.log(`Haptic feedback ${enabled ? 'enabled' : 'disabled'}`);
    }
  },
  isIPhone: () => {
    // Check if the current device is an iPhone
    return /iPhone/.test(navigator.userAgent);
  },
  getModel: () => {
    // Get the iPhone model
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone')) {
      // Extract model information from user agent
      return 'iPhone';
    }
    return 'Unknown';
  },
  supports: (feature: string) => {
    // Check if the device supports a specific feature
    const supportedFeatures = ['haptics', 'motionSensors', 'faceId'];
    return supportedFeatures.includes(feature);
  }
};

/**
 * Interface for device capabilities
 */
export interface DeviceCapabilities {
  /** Device platform (iOS, Android, Web, etc.) */
  platform: 'iOS' | 'Android' | 'Web' | 'Unknown';
  
  /** Device model information */
  model: string;
  
  /** Device screen information */
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
    refreshRate: number;
  };
  
  /** Device supported features */
  supports: {
    /** Whether the device supports high refresh rate displays (ProMotion) */
    proMotion: boolean;
    
    /** Whether the device supports WebGL 2 */
    webgl2: boolean;
    
    /** Whether the device supports WebGPU */
    webgpu: boolean;
    
    /** Whether the device supports haptic feedback */
    haptics: boolean;
    
    /** Whether the device supports motion sensors */
    motionSensors: boolean;
    
    /** Whether the device supports face ID or similar biometric authentication */
    biometricAuth: boolean;
  };
  
  /** Whether the device has a Dynamic Island (iPhone 14 Pro and newer) */
  hasDynamicIsland: boolean;
  
  /** Check if the device is a mobile device */
  isMobile: () => boolean;
  
  /** Check if the device is a tablet */
  isTablet: () => boolean;
  
  /** Check if the device is a desktop */
  isDesktop: () => boolean;
  
  /** Get the device's battery level */
  getBatteryLevel: () => Promise<number>;
  
  /** Check if the device is in low power mode */
  isLowPowerMode: () => Promise<boolean>;
}

/**
 * Interface for animation loop
 */
export interface AnimationLoop {
  /** Start the animation loop */
  start: () => void;
  
  /** Stop the animation loop */
  stop: () => void;
  
  /** Pause the animation loop */
  pause: () => void;
  
  /** Resume the animation loop */
  resume: () => void;
  
  /** Set the target refresh rate */
  setRefreshRate: (fps: number) => void;
  
  /** Get the current refresh rate */
  getRefreshRate: () => number;
  
  /** Get the actual FPS (frames per second) */
  getActualFPS: () => number;
  
  /** Add a callback to be executed on each frame */
  addFrameCallback: (callback: (deltaTime: number) => void) => string;
  
  /** Remove a callback by ID */
  removeFrameCallback: (id: string) => boolean;
  
  /** Current state of the animation loop */
  state: 'running' | 'paused' | 'stopped';
}
