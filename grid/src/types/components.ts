/**
 * Configuration for component window positioning and styling
 */
export interface WindowConfig {
  position: {
    x: number;
    y: number;
    z?: number;
  };
  size: {
    width: number;
    height: number;
  };
  style?: {
    opacity?: number;
    blur?: number;
    border?: string;
    background?: string;
  };
  behavior?: {
    draggable?: boolean;
    resizable?: boolean;
    minimizable?: boolean;
    dockable?: boolean;
  };
}

/**
 * Animation configuration for components
 */
export interface AnimationConfig {
  id: string;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  keyframes: Array<Record<string, any>>;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
}

/**
 * Queue system for managing component animations
 */
export class AnimationQueue {
  private queue: AnimationConfig[] = [];
  private running: Set<string> = new Set();

  /**
   * Add an animation to the queue
   */
  public enqueue(animation: AnimationConfig): void {
    this.queue.push(animation);
  }

  /**
   * Remove an animation from the queue
   */
  public dequeue(): AnimationConfig | undefined {
    return this.queue.shift();
  }

  /**
   * Get all pending animations
   */
  public getPending(): AnimationConfig[] {
    return [...this.queue];
  }

  /**
   * Get currently running animations
   */
  public getRunning(): string[] {
    return Array.from(this.running);
  }

  /**
   * Mark an animation as running
   */
  public markAsRunning(id: string): void {
    this.running.add(id);
  }

  /**
   * Mark an animation as completed
   */
  public markAsCompleted(id: string): void {
    this.running.delete(id);
  }

  /**
   * Clear all animations
   */
  public clear(): void {
    this.queue = [];
    this.running.clear();
  }
}

/**
 * Available component types
 */
export type ComponentType = 
  | 'container'
  | 'button'
  | 'panel'
  | 'card'
  | 'modal'
  | 'overlay'
  | 'widget'
  | 'custom';

/**
 * Main component manifest interface
 */
export interface ComponentManifest {
  /** Map of hidden windows and their configurations */
  hiddenWindows: Map<string, WindowConfig>;
  
  /** Set of currently active component IDs */
  activeComponents: Set<string>;
  
  /** Queue of pending and running animations */
  queuedAnimations: AnimationQueue;
  
  /** Array of mystery box components and their states */
  mysteryBoxStates: Array<{
    /** Unique identifier for the mystery box */
    id: string;
    /** Whether the mystery box has been unlocked */
    unlocked: boolean;
    /** The trigger condition for unlocking */
    trigger: string;
    /** The type of component contained within */
    content: ComponentType;
  }>;
}

/**
 * Create a new component manifest with default values
 * @returns Initialized ComponentManifest
 */
export function createComponentManifest(): ComponentManifest {
  return {
    hiddenWindows: new Map(),
    activeComponents: new Set(),
    queuedAnimations: new AnimationQueue(),
    mysteryBoxStates: []
  };
}

/**
 * Manager class for handling component manifests
 */
export class ComponentManager {
  private manifest: ComponentManifest;

  constructor(initialManifest?: Partial<ComponentManifest>) {
    this.manifest = {
      ...createComponentManifest(),
      ...initialManifest
    };
  }

  /**
   * Add a hidden window configuration
   */
  public addHiddenWindow(id: string, config: WindowConfig): void {
    this.manifest.hiddenWindows.set(id, config);
  }

  /**
   * Show a hidden window
   */
  public showWindow(id: string): WindowConfig | undefined {
    const config = this.manifest.hiddenWindows.get(id);
    if (config) {
      this.manifest.hiddenWindows.delete(id);
      this.manifest.activeComponents.add(id);
    }
    return config;
  }

  /**
   * Hide a window
   */
  public hideWindow(id: string, config: WindowConfig): void {
    this.manifest.hiddenWindows.set(id, config);
    this.manifest.activeComponents.delete(id);
  }

  /**
   * Add a mystery box
   */
  public addMysteryBox(
    id: string,
    trigger: string,
    content: ComponentType
  ): void {
    this.manifest.mysteryBoxStates.push({
      id,
      unlocked: false,
      trigger,
      content
    });
  }

  /**
   * Check and unlock mystery boxes based on a trigger
   * @returns Array of unlocked mystery box IDs
   */
  public checkTriggers(trigger: string): string[] {
    const unlocked: string[] = [];
    
    this.manifest.mysteryBoxStates.forEach(box => {
      if (!box.unlocked && box.trigger === trigger) {
        box.unlocked = true;
        unlocked.push(box.id);
      }
    });

    return unlocked;
  }

  /**
   * Queue an animation
   */
  public queueAnimation(animation: AnimationConfig): void {
    this.manifest.queuedAnimations.enqueue(animation);
  }

  /**
   * Get the current manifest state
   */
  public getManifest(): ComponentManifest {
    return this.manifest;
  }
}
