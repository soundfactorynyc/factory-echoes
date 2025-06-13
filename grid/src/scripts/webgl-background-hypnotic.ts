// src/scripts/webgl-background-hypnotic.ts

class HypnoticWebGLBackground {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private time = 0;
  private beatPhase = 0;
  private beatIntensity = 0;
  private animationId: number | null = null;
  private theme = 'dark';
  
  // Uniforms
  private uniforms: {
    time?: WebGLUniformLocation | null;
    resolution?: WebGLUniformLocation | null;
    theme?: WebGLUniformLocation | null;
    beatPhase?: WebGLUniformLocation | null;
    beatIntensity?: WebGLUniformLocation | null;
    globalHue?: WebGLUniformLocation | null;
  } = {};

  constructor() {
    this.canvas = document.getElementById('webgl-bg') as HTMLCanvasElement;
    if (!this.canvas) {
      console.warn('WebGL canvas not found');
      return;
    }
    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupWebGL();
    if (this.gl) {
      this.createShaders();
      this.setupBeatSync();
      this.render();
    }
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('theme-change', (e: any) => {
      this.theme = e.detail.theme;
    });
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupWebGL() {
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
    }) as WebGLRenderingContext || this.canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (!this.gl) {
      console.warn('WebGL not supported');
      this.canvas.style.display = 'none';
      return;
    }
    
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  createShaders() {
    if (!this.gl) return;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      uniform float theme;
      uniform float beatPhase;
      uniform float beatIntensity;
      uniform float globalHue;
      
      // Convert HSL to RGB
      vec3 hsl2rgb(vec3 hsl) {
        vec3 rgb;
        float h = hsl.x;
        float s = hsl.y;
        float l = hsl.z;
        
        float c = (1.0 - abs(2.0 * l - 1.0)) * s;
        float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
        float m = l - c * 0.5;
        
        if (h < 1.0/6.0) rgb = vec3(c, x, 0.0);
        else if (h < 2.0/6.0) rgb = vec3(x, c, 0.0);
        else if (h < 3.0/6.0) rgb = vec3(0.0, c, x);
        else if (h < 4.0/6.0) rgb = vec3(0.0, x, c);
        else if (h < 5.0/6.0) rgb = vec3(x, 0.0, c);
        else rgb = vec3(c, 0.0, x);
        
        return rgb + m;
      }
      
      // Smooth noise
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      // Fractal noise
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 2.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return value;
      }
      
      // Hypnotic spiral
      float spiral(vec2 uv, float time) {
        float r = length(uv);
        float theta = atan(uv.y, uv.x);
        float spiral = sin(theta * 5.0 - r * 10.0 + time * 2.0 + beatPhase * 6.28);
        return smoothstep(0.0, 1.0, spiral * 0.5 + 0.5);
      }
      
      // Morphing shapes
      float morphingShape(vec2 uv, float time) {
        float shape1 = length(uv) - 0.5 - beatIntensity * 0.2;
        float shape2 = abs(uv.x) + abs(uv.y) - 0.5 - beatIntensity * 0.2;
        float morph = sin(time * 0.5 + beatPhase * 3.14) * 0.5 + 0.5;
        return mix(shape1, shape2, morph);
      }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        vec3 col = vec3(0.0);
        
        // Time with beat sync
        float t = time * 0.1 + beatPhase * 0.5;
        
        // Base color from global hue
        float hue = globalHue / 360.0;
        
        if (theme < 0.5) {
          // Dark theme - Hypnotic space
          
          // Morphing background
          float morph = morphingShape(uv * 2.0, t);
          float spiral1 = spiral(uv * 1.5, t);
          float spiral2 = spiral(uv * 2.5, -t * 0.7);
          
          // Fractal clouds
          vec2 cloudUV = uv + vec2(sin(t * 0.3), cos(t * 0.2)) * 0.2;
          float clouds = fbm(cloudUV * 3.0 + t * 0.1);
          
          // Color layers
          vec3 color1 = hsl2rgb(vec3(hue, 0.8, 0.5));
          vec3 color2 = hsl2rgb(vec3(hue + 0.1, 0.7, 0.4));
          vec3 color3 = hsl2rgb(vec3(hue + 0.2, 0.6, 0.3));
          
          // Combine layers
          col = mix(col, color1, spiral1 * 0.3);
          col = mix(col, color2, spiral2 * 0.2);
          col = mix(col, color3, clouds * 0.3);
          
          // Beat pulse
          col += color1 * beatIntensity * 0.2 * (1.0 - length(uv));
          
          // Hypnotic rings
          float rings = sin(length(uv) * 20.0 - t * 3.0 + beatPhase * 10.0);
          col += color2 * smoothstep(0.8, 1.0, rings) * 0.1;
          
        } else if (theme < 1.5) {
          // Pink theme - Dreamy flows
          
          vec3 pink = hsl2rgb(vec3(0.92, 0.8, 0.6));
          vec3 purple = hsl2rgb(vec3(0.8, 0.7, 0.5));
          
          // Flowing gradients
          float flow = sin(uv.x * 3.0 + t) * sin(uv.y * 3.0 - t);
          float flow2 = cos(uv.x * 2.0 - t * 0.7) * cos(uv.y * 2.0 + t * 0.7);
          
          col = mix(pink, purple, flow * 0.5 + 0.5);
          col = mix(col, vec3(1.0, 0.9, 0.95), flow2 * 0.3);
          
          // Soft clouds
          float softClouds = fbm(uv * 2.0 + t * 0.05);
          col = mix(col, vec3(1.0), softClouds * 0.2);
          
          // Beat glow
          col += pink * beatIntensity * 0.3;
          
        } else {
          // Jet black theme - Minimal hypnotic
          
          // Minimal geometric patterns
          float grid = step(0.98, abs(sin(uv.x * 10.0 + t))) + 
                      step(0.98, abs(sin(uv.y * 10.0 - t)));
          
          // Subtle morphing
          float minimal = smoothstep(0.4, 0.5, morphingShape(uv * 3.0, t * 0.3));
          
          col = vec3(0.05) * grid;
          col += vec3(0.1) * minimal * beatIntensity;
        }
        
        // Vignette with beat
        float vignette = 1.0 - length(uv) * (0.5 - beatIntensity * 0.1);
        col *= smoothstep(0.0, 1.0, vignette);
        
        // Subtle noise texture
        col += vec3(noise(gl_FragCoord.xy * 0.1 + time)) * 0.02;
        
        // Output with transparency
        gl_FragColor = vec4(col, 0.8);
      }
    `;

    // Create and compile shaders
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    this.program = this.gl.createProgram();
    if (!this.program) return;

    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Program linking failed');
      return;
    }

    // Set up geometry
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(this.program, 'position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Get uniform locations
    this.uniforms.time = this.gl.getUniformLocation(this.program, 'time');
    this.uniforms.resolution = this.gl.getUniformLocation(this.program, 'resolution');
    this.uniforms.theme = this.gl.getUniformLocation(this.program, 'theme');
    this.uniforms.beatPhase = this.gl.getUniformLocation(this.program, 'beatPhase');
    this.uniforms.beatIntensity = this.gl.getUniformLocation(this.program, 'beatIntensity');
    this.uniforms.globalHue = this.gl.getUniformLocation(this.program, 'globalHue');
  }

  createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  setupBeatSync() {
    // Listen to beat events
    window.addEventListener('beat', (e: any) => {
      const { strength } = e.detail;
      this.beatIntensity = strength;
    });

    // Smooth beat phase updates
    setInterval(() => {
      this.beatPhase = (this.beatPhase + 0.01) % 1;
      this.beatIntensity *= 0.95; // Decay
    }, 16);
  }

  render() {
    if (!this.gl || !this.program) return;

    this.time += 0.01;

    // Get global hue
    const globalHue = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--global-hue') || '0'
    );

    this.gl.useProgram(this.program);
    
    // Set uniforms
    if (this.uniforms.time) {
      this.gl.uniform1f(this.uniforms.time, this.time);
    }
    
    if (this.uniforms.resolution) {
      this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    }
    
    if (this.uniforms.theme) {
      let themeValue = 0;
      if (this.theme === 'pink') themeValue = 1;
      else if (this.theme === 'jet-black') themeValue = 2;
      this.gl.uniform1f(this.uniforms.theme, themeValue);
    }
    
    if (this.uniforms.beatPhase) {
      this.gl.uniform1f(this.uniforms.beatPhase, this.beatPhase);
    }
    
    if (this.uniforms.beatIntensity) {
      this.gl.uniform1f(this.uniforms.beatIntensity, this.beatIntensity);
    }
    
    if (this.uniforms.globalHue) {
      this.gl.uniform1f(this.uniforms.globalHue, globalHue);
    }

    // Enable blending for transparency
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.animationId = requestAnimationFrame(() => this.render());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HypnoticWebGLBackground();
  });
} else {
  new HypnoticWebGLBackground();
}
