/**
 * GRID OS: Sensor Fusion Types
 * 
 * This module provides type definitions for the GRID OS Sensor Fusion system.
 */

/**
 * 3D vector
 */
export interface Vector3 {
  /**
   * X component
   */
  x: number;
  
  /**
   * Y component
   */
  y: number;
  
  /**
   * Z component
   */
  z: number;
}

/**
 * 3D rotation
 */
export interface Rotation3 {
  /**
   * Alpha component (rotation around Z axis)
   */
  alpha: number;
  
  /**
   * Beta component (rotation around X axis)
   */
  beta: number;
  
  /**
   * Gamma component (rotation around Y axis)
   */
  gamma: number;
}

/**
 * Compass data
 */
export interface Compass {
  /**
   * Heading in degrees (0-359)
   */
  heading: number;
  
  /**
   * Accuracy in degrees
   */
  accuracy: number;
}

/**
 * Quaternion
 */
export interface Quaternion {
  /**
   * W component
   */
  w: number;
  
  /**
   * X component
   */
  x: number;
  
  /**
   * Y component
   */
  y: number;
  
  /**
   * Z component
   */
  z: number;
}

/**
 * Recognized gesture
 */
export interface RecognizedGesture {
  /**
   * Gesture type
   */
  type: string;
  
  /**
   * Gesture confidence
   */
  confidence: number;
  
  /**
   * Gesture duration
   */
  duration: number;
}

/**
 * Audio buffer
 */
export interface AudioBuffer {
  /**
   * Sample rate
   */
  sampleRate: number;
  
  /**
   * Number of channels
   */
  numberOfChannels: number;
  
  /**
   * Length in samples
   */
  length: number;
  
  /**
   * Duration in seconds
   */
  duration: number;
  
  /**
   * Audio data
   */
  data: Float32Array[];
}

/**
 * Beat data
 */
export interface BeatData {
  /**
   * Beats per minute
   */
  bpm: number;
  
  /**
   * Beat confidence
   */
  confidence: number;
  
  /**
   * Beat phase
   */
  phase: number;
  
  /**
   * Beat energy
   */
  energy: number;
  
  /**
   * Time until next beat
   */
  timeUntilNextBeat: number;
}

/**
 * Pitch data
 */
export interface PitchData {
  /**
   * Fundamental frequency
   */
  fundamental: number;
  
  /**
   * Pitch confidence
   */
  confidence: number;
  
  /**
   * Detected note
   */
  note: string;
  
  /**
   * Cents deviation from perfect pitch
   */
  cents: number;
}

/**
 * Timbre analysis
 */
export interface TimbreAnalysis {
  /**
   * Brightness
   */
  brightness: number;
  
  /**
   * Roughness
   */
  roughness: number;
  
  /**
   * Warmth
   */
  warmth: number;
  
  /**
   * Instrument classification
   */
  classification: {
    /**
     * Instrument type
     */
    type: string;
    
    /**
     * Classification confidence
     */
    confidence: number;
  }[];
}

/**
 * 3D audio source
 */
export interface AudioSource3D {
  /**
   * Source position
   */
  position: Vector3;
  
  /**
   * Source velocity
   */
  velocity: Vector3;
  
  /**
   * Source direction
   */
  direction: Vector3;
  
  /**
   * Source cone parameters
   */
  cone: {
    /**
     * Inner angle
     */
    innerAngle: number;
    
    /**
     * Outer angle
     */
    outerAngle: number;
    
    /**
     * Outer gain
     */
    outerGain: number;
  };
  
  /**
   * Distance model
   */
  distanceModel: 'linear' | 'inverse' | 'exponential';
  
  /**
   * Reference distance
   */
  refDistance: number;
  
  /**
   * Maximum distance
   */
  maxDistance: number;
  
  /**
   * Rolloff factor
   */
  rolloffFactor: number;
}

/**
 * Convolution reverb
 */
export interface ConvolutionReverb {
  /**
   * Impulse response
   */
  impulseResponse: AudioBuffer;
  
  /**
   * Wet/dry mix
   */
  mix: number;
  
  /**
   * Pre-delay
   */
  preDelay: number;
  
  /**
   * Decay time
   */
  decay: number;
}

/**
 * Touch data
 */
export interface Touch {
  /**
   * Touch identifier
   */
  identifier: number;
  
  /**
   * Touch position
   */
  position: {
    /**
     * X coordinate
     */
    x: number;
    
    /**
     * Y coordinate
     */
    y: number;
  };
  
  /**
   * Touch radius
   */
  radius: {
    /**
     * X radius
     */
    x: number;
    
    /**
     * Y radius
     */
    y: number;
  };
  
  /**
   * Touch rotation angle
   */
  rotationAngle: number;
  
  /**
   * Touch force
   */
  force: number;
}

/**
 * Gesture type
 */
export enum GestureType {
  /**
   * Tap gesture
   */
  TAP = 'tap',
  
  /**
   * Double tap gesture
   */
  DOUBLE_TAP = 'doubleTap',
  
  /**
   * Long press gesture
   */
  LONG_PRESS = 'longPress',
  
  /**
   * Swipe gesture
   */
  SWIPE = 'swipe',
  
  /**
   * Pinch gesture
   */
  PINCH = 'pinch',
  
  /**
   * Rotate gesture
   */
  ROTATE = 'rotate',
  
  /**
   * Pan gesture
   */
  PAN = 'pan'
}

/**
 * Gesture prediction
 */
export interface GesturePrediction {
  /**
   * Predicted gesture type
   */
  type: GestureType;
  
  /**
   * Prediction confidence
   */
  confidence: number;
  
  /**
   * Predicted completion time
   */
  completionTime: number;
}

/**
 * Pressure map
 */
export interface PressureMap {
  /**
   * Width of the pressure map
   */
  width: number;
  
  /**
   * Height of the pressure map
   */
  height: number;
  
  /**
   * Pressure data
   */
  data: Float32Array;
  
  /**
   * Get pressure at a specific point
   */
  getPressureAt: (x: number, y: number) => number;
  
  /**
   * Get the center of pressure
   */
  getCenterOfPressure: () => { x: number; y: number };
  
  /**
   * Get the total pressure
   */
  getTotalPressure: () => number;
}

/**
 * Proximity data
 */
export interface ProximityData {
  /**
   * Hover position
   */
  position: {
    /**
     * X coordinate
     */
    x: number;
    
    /**
     * Y coordinate
     */
    y: number;
  };
  
  /**
   * Hover distance
   */
  distance: number;
  
  /**
   * Hover size
   */
  size: number;
}

/**
 * Face detection
 */
export interface FaceDetection {
  /**
   * Face ID
   */
  id: number;
  
  /**
   * Face bounding box
   */
  boundingBox: {
    /**
     * X coordinate
     */
    x: number;
    
    /**
     * Y coordinate
     */
    y: number;
    
    /**
     * Width
     */
    width: number;
    
    /**
     * Height
     */
    height: number;
  };
  
  /**
   * Face landmarks
   */
  landmarks: {
    /**
     * Left eye
     */
    leftEye: { x: number; y: number };
    
    /**
     * Right eye
     */
    rightEye: { x: number; y: number };
    
    /**
     * Nose
     */
    nose: { x: number; y: number };
    
    /**
     * Mouth
     */
    mouth: { x: number; y: number };
    
    /**
     * Left ear
     */
    leftEar: { x: number; y: number };
    
    /**
     * Right ear
     */
    rightEar: { x: number; y: number };
  };
  
  /**
   * Face rotation
   */
  rotation: {
    /**
     * Roll
     */
    roll: number;
    
    /**
     * Pitch
     */
    pitch: number;
    
    /**
     * Yaw
     */
    yaw: number;
  };
  
  /**
   * Face expressions
   */
  expressions: {
    /**
     * Smile
     */
    smile: number;
    
    /**
     * Surprise
     */
    surprise: number;
    
    /**
     * Anger
     */
    anger: number;
    
    /**
     * Sadness
     */
    sadness: number;
  };
}

/**
 * Hand tracking
 */
export interface HandTracking {
  /**
   * Hand ID
   */
  id: number;
  
  /**
   * Hand type
   */
  type: 'left' | 'right';
  
  /**
   * Hand bounding box
   */
  boundingBox: {
    /**
     * X coordinate
     */
    x: number;
    
    /**
     * Y coordinate
     */
    y: number;
    
    /**
     * Width
     */
    width: number;
    
    /**
     * Height
     */
    height: number;
  };
  
  /**
   * Hand landmarks
   */
  landmarks: {
    /**
     * Wrist
     */
    wrist: Vector3;
    
    /**
     * Thumb joints
     */
    thumb: Vector3[];
    
    /**
     * Index finger joints
     */
    indexFinger: Vector3[];
    
    /**
     * Middle finger joints
     */
    middleFinger: Vector3[];
    
    /**
     * Ring finger joints
     */
    ringFinger: Vector3[];
    
    /**
     * Pinky finger joints
     */
    pinky: Vector3[];
  };
  
  /**
   * Hand gestures
   */
  gestures: {
    /**
     * Gesture type
     */
    type: 'fist' | 'open' | 'pointing' | 'pinch' | 'victory' | 'thumbsUp' | 'thumbsDown';
    
    /**
     * Gesture confidence
     */
    confidence: number;
  }[];
}

/**
 * Scene understanding
 */
export interface SceneUnderstanding {
  /**
   * Scene planes
   */
  planes: {
    /**
     * Plane ID
     */
    id: number;
    
    /**
     * Plane type
     */
    type: 'floor' | 'ceiling' | 'wall' | 'table' | 'unknown';
    
    /**
     * Plane center
     */
    center: Vector3;
    
    /**
     * Plane normal
     */
    normal: Vector3;
    
    /**
     * Plane extent
     */
    extent: {
      /**
       * Width
       */
      width: number;
      
      /**
       * Height
       */
      height: number;
    };
    
    /**
     * Plane vertices
     */
    vertices: Vector3[];
  }[];
  
  /**
   * Scene objects
   */
  objects: {
    /**
     * Object ID
     */
    id: number;
    
    /**
     * Object type
     */
    type: string;
    
    /**
     * Object bounding box
     */
    boundingBox: {
      /**
       * Center
       */
      center: Vector3;
      
      /**
       * Size
       */
      size: Vector3;
      
      /**
       * Orientation
       */
      orientation: Quaternion;
    };
    
    /**
     * Object confidence
     */
    confidence: number;
  }[];
  
  /**
   * Scene lighting
   */
  lighting: {
    /**
     * Ambient intensity
     */
    ambientIntensity: number;
    
    /**
     * Main light direction
     */
    mainLightDirection: Vector3;
    
    /**
     * Main light intensity
     */
    mainLightIntensity: number;
    
    /**
     * Spherical harmonics
     */
    sphericalHarmonics: number[];
  };
}

/**
 * Depth map
 */
export interface DepthMap {
  /**
   * Width of the depth map
   */
  width: number;
  
  /**
   * Height of the depth map
   */
  height: number;
  
  /**
   * Depth data
   */
  data: Float32Array;
  
  /**
   * Get depth at a specific point
   */
  getDepthAt: (x: number, y: number) => number;
  
  /**
   * Convert a point from screen space to world space
   */
  unproject: (x: number, y: number, depth?: number) => Vector3;
  
  /**
   * Convert a point from world space to screen space
   */
  project: (point: Vector3) => { x: number; y: number; depth: number };
}
