/**
 * GRID OS: Shader System
 * 
 * This module provides a shader system for the GRID OS Integration Core,
 * allowing for the management of WebGL shaders and materials.
 */

import type { WebGLShader, MaterialConfig } from '../types/webgl';

/**
 * Shader system for the GRID OS Integration Core
 */
export class ShaderSystem {
  /**
   * Three.js renderer instance
   */
  private renderer: any = null;
  
  /**
   * System ready state
   */
  private ready: boolean = false;
  
  /**
   * Canvas dimensions
   */
  private width: number = 0;
  private height: number = 0;
  
  /**
   * Active shaders
   */
  public readonly activeShaders: Map<string, WebGLShader> = new Map();
  
  /**
   * Material presets
   */
  public readonly materialPresets: {
    /**
     * Carbon fiber material
     */
    carbonFiber: MaterialConfig;
    
    /**
     * Gold accent material
     */
    goldAccent: MaterialConfig;
    
    /**
     * Cyan glow material
     */
    cyanGlow: MaterialConfig;
    
    /**
     * Studio metal material
     */
    studioMetal: MaterialConfig;
  };
  
  /**
   * Post-processing effects
   */
  public readonly postProcessing: {
    /**
     * Bloom effect
     */
    bloom: boolean;
    
    /**
     * Motion blur effect
     */
    motionBlur: boolean;
    
    /**
     * Chromatic aberration effect
     */
    chromaticAberration: boolean;
    
    /**
     * Film grain effect
     */
    filmGrain: boolean;
  };
  
  /**
   * Create a new shader system
   */
  constructor() {
    // Initialize material presets
    this.materialPresets = {
      carbonFiber: {
        name: 'Carbon Fiber',
        type: 'pbr',
        properties: {
          baseColor: [0.05, 0.05, 0.05, 1.0],
          metallic: 0.0,
          roughness: 0.3,
          normalScale: 1.0,
          emissive: [0.0, 0.0, 0.0],
          specular: 0.5,
          textures: {
            albedo: 'textures/carbon_fiber_albedo.png',
            normal: 'textures/carbon_fiber_normal.png',
            roughness: 'textures/carbon_fiber_roughness.png',
            ao: 'textures/carbon_fiber_ao.png'
          }
        }
      },
      goldAccent: {
        name: 'Gold Accent',
        type: 'pbr',
        properties: {
          baseColor: [1.0, 0.8, 0.0, 1.0],
          metallic: 1.0,
          roughness: 0.1,
          normalScale: 0.5,
          emissive: [0.2, 0.1, 0.0],
          specular: 1.0,
          textures: {
            albedo: 'textures/gold_albedo.png',
            normal: 'textures/gold_normal.png',
            metallic: 'textures/gold_metallic.png',
            roughness: 'textures/gold_roughness.png'
          }
        }
      },
      cyanGlow: {
        name: 'Cyan Glow',
        type: 'emissive',
        properties: {
          baseColor: [0.0, 0.8, 1.0, 1.0],
          metallic: 0.0,
          roughness: 0.2,
          normalScale: 0.0,
          emissive: [0.0, 0.8, 1.0],
          emissiveIntensity: 2.0,
          specular: 0.5,
          textures: {
            emissive: 'textures/cyan_glow_emissive.png',
            noise: 'textures/noise.png'
          }
        }
      },
      studioMetal: {
        name: 'Studio Metal',
        type: 'pbr',
        properties: {
          baseColor: [0.8, 0.8, 0.8, 1.0],
          metallic: 0.8,
          roughness: 0.2,
          normalScale: 0.7,
          emissive: [0.0, 0.0, 0.0],
          specular: 0.8,
          textures: {
            albedo: 'textures/studio_metal_albedo.png',
            normal: 'textures/studio_metal_normal.png',
            metallic: 'textures/studio_metal_metallic.png',
            roughness: 'textures/studio_metal_roughness.png',
            ao: 'textures/studio_metal_ao.png'
          }
        }
      }
    };
    
    // Initialize post-processing effects
    this.postProcessing = {
      bloom: true,
      motionBlur: false,
      chromaticAberration: true,
      filmGrain: false
    };
  }
  
  /**
   * Load a shader
   * @param name Shader name
   * @param vertexSource Vertex shader source
   * @param fragmentSource Fragment shader source
   * @returns WebGL shader
   */
  public loadShader(name: string, vertexSource: string, fragmentSource: string): WebGLShader {
    console.log(`Loading shader: ${name}`);
    
    // Simulate shader compilation
    const shader: WebGLShader = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      vertexSource,
      fragmentSource,
      uniforms: {},
      attributes: {},
      program: null
    };
    
    // Add to active shaders
    this.activeShaders.set(name, shader);
    
    return shader;
  }
  
  /**
   * Unload a shader
   * @param name Shader name
   * @returns Whether the shader was unloaded
   */
  public unloadShader(name: string): boolean {
    console.log(`Unloading shader: ${name}`);
    
    return this.activeShaders.delete(name);
  }
  
  /**
   * Get a shader
   * @param name Shader name
   * @returns WebGL shader
   */
  public getShader(name: string): WebGLShader | undefined {
    return this.activeShaders.get(name);
  }
  
  /**
   * Apply a material to a shader
   * @param shaderName Shader name
   * @param material Material configuration or preset name
   */
  public applyMaterial(shaderName: string, material: MaterialConfig | keyof ShaderSystem['materialPresets']): void {
    // If material is a string, treat it as a preset name
    if (typeof material === 'string') {
      return this.applyMaterialPreset(shaderName, material);
    }
    
    console.log(`Applying material ${material.name} to shader ${shaderName}`);
    
    const shader = this.activeShaders.get(shaderName);
    
    if (!shader) {
      console.error(`Shader ${shaderName} not found`);
      return;
    }
    
    // Simulate applying material to shader
    shader.uniforms = {
      ...shader.uniforms,
      u_baseColor: material.properties.baseColor,
      u_metallic: material.properties.metallic,
      u_roughness: material.properties.roughness,
      u_normalScale: material.properties.normalScale,
      u_emissive: material.properties.emissive,
      u_specular: material.properties.specular
    };
    
    // Add texture uniforms
    if (material.properties.textures) {
      for (const [name, path] of Object.entries(material.properties.textures)) {
        shader.uniforms[`u_${name}Map`] = path;
      }
    }
  }
  
  /**
   * Apply a material preset to a shader
   * @param shaderName Shader name
   * @param presetName Material preset name
   */
  public applyMaterialPreset(shaderName: string, presetName: keyof ShaderSystem['materialPresets']): void {
    console.log(`Applying material preset ${presetName} to shader ${shaderName}`);
    
    const preset = this.materialPresets[presetName];
    
    if (!preset) {
      console.error(`Material preset ${presetName} not found`);
      return;
    }
    
    // Apply the material configuration directly
    const shader = this.activeShaders.get(shaderName);
    
    if (!shader) {
      console.error(`Shader ${shaderName} not found`);
      return;
    }
    
    // Simulate applying material to shader
    shader.uniforms = {
      ...shader.uniforms,
      u_baseColor: preset.properties.baseColor,
      u_metallic: preset.properties.metallic,
      u_roughness: preset.properties.roughness,
      u_normalScale: preset.properties.normalScale,
      u_emissive: preset.properties.emissive,
      u_specular: preset.properties.specular
    };
    
    // Add texture uniforms
    if (preset.properties.textures) {
      for (const [name, path] of Object.entries(preset.properties.textures)) {
        shader.uniforms[`u_${name}Map`] = path;
      }
    }
  }
  
  /**
   * Create a custom material
   * @param name Material name
   * @param type Material type
   * @param properties Material properties
   * @returns Material configuration
   */
  public createCustomMaterial(
    name: string,
    type: 'pbr' | 'emissive' | 'toon' | 'wireframe',
    properties: Partial<MaterialConfig['properties']>
  ): MaterialConfig {
    console.log(`Creating custom material: ${name}`);
    
    // Create material with default properties
    const material: MaterialConfig = {
      name,
      type,
      properties: {
        baseColor: properties.baseColor || [1.0, 1.0, 1.0, 1.0],
        metallic: properties.metallic !== undefined ? properties.metallic : 0.0,
        roughness: properties.roughness !== undefined ? properties.roughness : 0.5,
        normalScale: properties.normalScale !== undefined ? properties.normalScale : 1.0,
        emissive: properties.emissive || [0.0, 0.0, 0.0],
        specular: properties.specular !== undefined ? properties.specular : 0.5,
        textures: properties.textures || {}
      }
    };
    
    return material;
  }
  
  /**
   * Enable a post-processing effect
   * @param effect Effect name
   */
  public enablePostProcessing(effect: keyof ShaderSystem['postProcessing']): void {
    console.log(`Enabling post-processing effect: ${effect}`);
    
    this.postProcessing[effect] = true;
  }
  
  /**
   * Disable a post-processing effect
   * @param effect Effect name
   */
  public disablePostProcessing(effect: keyof ShaderSystem['postProcessing']): void {
    console.log(`Disabling post-processing effect: ${effect}`);
    
    this.postProcessing[effect] = false;
  }
  
  /**
   * Toggle a post-processing effect
   * @param effect Effect name
   * @returns New effect state
   */
  public togglePostProcessing(effect: keyof ShaderSystem['postProcessing']): boolean {
    console.log(`Toggling post-processing effect: ${effect}`);
    
    this.postProcessing[effect] = !this.postProcessing[effect];
    
    return this.postProcessing[effect];
  }
  
  /**
   * Set a post-processing effect state
   * @param effect Effect name
   * @param enabled Whether the effect is enabled
   */
  public setPostProcessing(effect: keyof ShaderSystem['postProcessing'], enabled: boolean): void {
    console.log(`Setting post-processing effect ${effect} to ${enabled ? 'enabled' : 'disabled'}`);
    
    this.postProcessing[effect] = enabled;
  }
  
  /**
   * Get active post-processing effects
   * @returns Active effects
   */
  public getActivePostProcessingEffects(): string[] {
    return Object.entries(this.postProcessing)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);
  }
  
  /**
   * Initialize the shader system with a renderer
   * @param renderer Three.js WebGL renderer
   * @returns Whether initialization was successful
   */
  public init(renderer: any): boolean {
    console.log('🔧 ShaderSystem.init() called');
    console.log('📊 Renderer state:', {
      renderer: !!renderer,
      rendererType: renderer?.constructor?.name,
      domElement: !!renderer?.domElement,
      domElementType: renderer?.domElement?.constructor?.name,
      domElementParent: !!renderer?.domElement?.parentElement,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight
    });
    
    // Check if renderer exists and has a DOM element
    if (!renderer) {
      console.error('❌ Shader system: Renderer is null/undefined');
      return false;
    }
    
    if (!renderer.domElement) {
      console.error('❌ Shader system: Renderer.domElement is null/undefined');
      console.log('🔍 Renderer properties:', Object.keys(renderer));
      return false;
    }

    console.log('✅ Renderer validation passed');

    // Store renderer reference
    this.renderer = renderer;
    
    // Check if renderer has getSize method
    if (typeof renderer.getSize !== 'function') {
      console.error('❌ Shader system: renderer.getSize is not a function');
      console.log('🔍 Available methods:', Object.getOwnPropertyNames(renderer.__proto__));
      return false;
    }
    
    // Check renderer size using Three.js API
    console.log('📏 Checking renderer size...');
    const size = { x: 0, y: 0 };
    
    try {
      renderer.getSize(size);
      console.log('📏 Initial renderer size:', size);
    } catch (error) {
      console.error('❌ Error getting renderer size:', error);
      return false;
    }
    
    // If renderer has no size, set default dimensions
    if (size.x === 0 || size.y === 0) {
      console.log('⚠️ Renderer has no size, setting defaults...');
      const defaultWidth = window.innerWidth || 1920;
      const defaultHeight = window.innerHeight || 1080;
      console.log(`📏 Setting size to: ${defaultWidth}x${defaultHeight}`);
      
      try {
        renderer.setSize(defaultWidth, defaultHeight);
        renderer.getSize(size); // Get the updated size
        console.log('📏 Updated renderer size:', size);
      } catch (error) {
        console.error('❌ Error setting renderer size:', error);
        return false;
      }
    }

    // Validate final size
    if (size.x <= 0 || size.y <= 0) {
      console.error('❌ Invalid final renderer size:', size);
      return false;
    }

    // Store final dimensions
    this.width = size.x;
    this.height = size.y;
    this.ready = true;
    
    console.log(`✅ Shader system initialized successfully: ${this.width}x${this.height}`);
    
    // Initialize default shaders
    try {
      this.initializeDefaultShaders();
      console.log('✅ Default shaders initialized');
    } catch (error) {
      console.error('❌ Error initializing default shaders:', error);
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if the shader system is ready
   * @returns Whether the system is ready
   */
  public isReady(): boolean {
    return this.ready && this.renderer !== null;
  }
  
  /**
   * Get canvas dimensions
   * @returns Canvas width and height
   */
  public getDimensions(): { width: number; height: number } {
    if (!this.isReady()) {
      console.warn('Shader system not ready, using fallback dimensions');
      return this.getCanvasSize();
    }
    
    // Use stored dimensions, but verify with actual canvas if available
    const currentSize = this.getCanvasSize();
    
    // Update stored dimensions if they differ
    if (currentSize.width !== this.width || currentSize.height !== this.height) {
      console.log(`Canvas size changed: ${this.width}x${this.height} -> ${currentSize.width}x${currentSize.height}`);
      this.width = currentSize.width;
      this.height = currentSize.height;
    }
    
    return { width: this.width, height: this.height };
  }
  
  /**
   * Get canvas size with fallback
   * @returns Canvas width and height with fallback values
   */
  public getCanvasSize(): { width: number; height: number } {
    if (this.renderer) {
      // Use Three.js renderer.getSize() API
      const size = { x: 0, y: 0 };
      this.renderer.getSize(size);
      
      if (size.x > 0 && size.y > 0) {
        return { width: size.x, height: size.y };
      }
      
      // Fallback to DOM element dimensions
      if (this.renderer.domElement) {
        const width = this.renderer.domElement.clientWidth || this.renderer.domElement.width;
        const height = this.renderer.domElement.clientHeight || this.renderer.domElement.height;
        
        if (width > 0 && height > 0) {
          return { width, height };
        }
      }
    }
    
    // Final fallback dimensions
    return { 
      width: window.innerWidth || 1920, 
      height: window.innerHeight || 1080 
    };
  }

  /**
   * Initialize default shaders
   */
  private initializeDefaultShaders(): void {
    console.log('Initializing default shaders...');
    
    // Create a basic grid shader
    this.loadShader('grid', 
      // Vertex shader
      `
        attribute vec4 position;
        attribute vec2 texcoord;
        varying vec2 v_texcoord;
        
        void main() {
          gl_Position = position;
          v_texcoord = texcoord;
        }
      `,
      // Fragment shader
      `
        precision mediump float;
        varying vec2 v_texcoord;
        uniform float u_time;
        uniform float u_intensity;
        
        void main() {
          vec2 uv = v_texcoord;
          vec3 color = vec3(uv.x, uv.y, sin(u_time * 0.1) * 0.5 + 0.5);
          color *= u_intensity;
          gl_FragColor = vec4(color, 1.0);
        }
      `
    );
  }

  /**
   * Handle canvas resize
   * @param width New width
   * @param height New height
   */
  public handleResize(width?: number, height?: number): void {
    if (!this.isReady()) {
      console.warn('Shader system not ready, cannot handle resize');
      return;
    }
    
    const newSize = width && height ? 
      { width, height } : 
      this.getCanvasSize();
    
    if (newSize.width !== this.width || newSize.height !== this.height) {
      console.log(`Handling canvas resize: ${this.width}x${this.height} -> ${newSize.width}x${newSize.height}`);
      
      this.width = newSize.width;
      this.height = newSize.height;
      
      // Update renderer size using Three.js API
      if (this.renderer) {
        this.renderer.setSize(this.width, this.height);
        
        // Verify the size was set correctly
        const size = { x: 0, y: 0 };
        this.renderer.getSize(size);
        console.log(`Renderer size after resize: ${size.x}x${size.y}`);
      }
    }
  }
}

/**
 * Create a new shader system
 */
export function createShaderSystem(): ShaderSystem {
  return new ShaderSystem();
}
