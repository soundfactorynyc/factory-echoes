// src/scripts/webgl-background.ts
import { logger } from './logger';

class WebGLBackground {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private time = 0;
  private animationId: number | null = null;
  private theme = 'dark';
  private timeLocation: WebGLUniformLocation | null = null;
  private resolutionLocation: WebGLUniformLocation | null = null;
  private themeLocation: WebGLUniformLocation | null = null;

  constructor() {
    this.canvas = document.getElementById('webgl-bg') as HTMLCanvasElement;
    if (!this.canvas) {
      logger.warn('WebGL canvas not found');
      return;
    }
    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupWebGL();
    if (this.gl) {
      this.createShaders();
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
    this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext || 
              this.canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (!this.gl) {
      logger.warn('WebGL not supported');
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
      
      // Noise function
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      // Star field
      float stars(vec2 uv, float t) {
        uv *= 5.0;
        vec2 id = floor(uv);
        vec2 gv = fract(uv) - 0.5;
        
        float n = noise(id);
        float size = fract(n * 345.32) * 0.5 + 0.5;
        float brightness = fract(n * 213.4) * 0.5 + 0.5;
        
        float star = smoothstep(0.1 * size, 0.02 * size, length(gv));
        star *= brightness * sin(t * 3.0 + n * 6.28) * 0.5 + 0.5;
        
        return star;
      }
      
      // Nebula effect
      float nebula(vec2 uv, float t) {
        uv *= 2.0;
        float n1 = noise(uv + t * 0.1);
        float n2 = noise(uv * 2.0 - t * 0.05);
        float n3 = noise(uv * 4.0 + t * 0.02);
        
        return n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
      }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        
        vec3 col = vec3(0.0);
        
        // Theme-based background
        if (theme < 0.5) {
          // Dark theme - space
          col = vec3(0.02, 0.02, 0.05);
          
          // Add stars
          col += vec3(stars(uv, time));
          
          // Add nebula
          float n = nebula(uv, time);
          col += vec3(0.1, 0.05, 0.2) * n * 0.5;
          
        } else if (theme < 1.5) {
          // Pink theme - dreamy clouds
          col = vec3(1.0, 0.9, 0.95);
          
          float n = nebula(uv * 0.5, time * 0.5);
          col -= vec3(0.0, 0.1, 0.05) * n * 0.3;
          col = mix(col, vec3(1.0, 0.08, 0.58), n * 0.2);
          
        } else {
          // Jet black theme - minimal
          col = vec3(0.0);
          
          // Subtle grid
          float grid = max(
            smoothstep(0.98, 0.99, abs(sin(uv.x * 20.0))),
            smoothstep(0.98, 0.99, abs(sin(uv.y * 20.0)))
          );
          col += vec3(0.05) * grid;
        }
        
        // Vignette
        float vignette = 1.0 - length(uv) * 0.5;
        col *= vignette;
        
        gl_FragColor = vec4(col, 1.0);
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
      logger.error('Program linking failed');
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
    this.timeLocation = this.gl.getUniformLocation(this.program, 'time');
    this.resolutionLocation = this.gl.getUniformLocation(this.program, 'resolution');
    this.themeLocation = this.gl.getUniformLocation(this.program, 'theme');
  }

  createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      logger.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  render() {
    if (!this.gl || !this.program) return;

    this.time += 0.01;

    this.gl.useProgram(this.program);
    
    if (this.timeLocation) {
      this.gl.uniform1f(this.timeLocation, this.time);
    }
    
    if (this.resolutionLocation) {
      this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
    }
    
    if (this.themeLocation) {
      // Set theme uniform
      let themeValue = 0;
      if (this.theme === 'pink') themeValue = 1;
      else if (this.theme === 'jet-black') themeValue = 2;
      this.gl.uniform1f(this.themeLocation, themeValue);
    }

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

// Initialize WebGL background when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WebGLBackground();
  });
} else {
  new WebGLBackground();
}

// Export for module system
export default WebGLBackground;
