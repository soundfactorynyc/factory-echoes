/**
 * LegendaryGrid Component
 * 
 * This is the main grid component that integrates with the GRID OS backend.
 * It handles the rendering of the grid, shader pipeline, and effects.
 */

import React, { useEffect, useRef, useState } from 'react';
import { gridOS } from '../integration/gridOSBackend';
import { GridScene } from './GridScene';
import { ClaudeAura } from './ClaudeAura';
import GridVisualTest from './GridVisualTest';
import * as THREE from 'three';
import './LegendaryGrid.css';

// Performance monitoring levels
enum PerformanceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

interface LegendaryGridProps {
  width: number;
  height: number;
  className?: string;
}

export const LegendaryGrid: React.FC<LegendaryGridProps> = ({ width = 800, height = 800, className }) => {
  // Make component responsive for mobile devices
  const [containerSize, setContainerSize] = useState({ width, height });
  
  // Update size based on window dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parentWidth = containerRef.current.parentElement.clientWidth;
        const parentHeight = containerRef.current.parentElement.clientHeight;
        
        // Use parent dimensions or fallback to props
        const newWidth = Math.min(parentWidth || width, width);
        const newHeight = Math.min(parentHeight || height, height);
        
        setContainerSize({ 
          width: newWidth, 
          height: newHeight 
        });
      }
    };
    
    // Initial size update
    updateSize();
    
    // Add resize listener
    window.addEventListener('resize', updateSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  
  const [fps, setFps] = useState(60);
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>(PerformanceLevel.HIGH);
  const [showDebugVisual, setShowDebugVisual] = useState(false);
  const [activeTiles, setActiveTiles] = useState<number[]>([0]); // Start with one active tile

  // Initialize Three.js scene
  useEffect(() => {
    console.log('🚀 LegendaryGrid useEffect starting...');
    console.log('📦 Container state:', {
      containerRef: !!containerRef.current,
      containerRefType: containerRef.current?.constructor?.name,
      containerParent: !!containerRef.current?.parentElement,
      width,
      height
    });

    if (!containerRef.current) {
      console.warn('⚠️ Container ref is not available, aborting initialization');
      return;
    }
    
    console.log('✅ Container ref validated, creating renderer...');
    
    // Create renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      console.log('✅ WebGL renderer created:', {
        rendererType: renderer.constructor.name,
        domElement: !!renderer.domElement,
        domElementType: renderer.domElement?.constructor?.name
      });
    } catch (error) {
      console.error('❌ Failed to create WebGL renderer:', error);
      return;
    }
    
    // Set renderer size using container dimensions
    try {
      const container = containerRef.current;
      const containerWidth = container.clientWidth || width;
      const containerHeight = container.clientHeight || height;
      
      console.log(`📏 Setting renderer size to container dimensions: ${containerWidth}x${containerHeight}`);
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      console.log('✅ Renderer size and pixel ratio set');
    } catch (error) {
      console.error('❌ Failed to set renderer size:', error);
      return;
    }
    
    // Add renderer to DOM
    try {
      console.log('🔗 Adding renderer DOM element to container...');
      containerRef.current.appendChild(renderer.domElement);
      console.log('✅ Renderer DOM element added to container');
      
      // Verify DOM element is properly attached
      const isAttached = document.contains(renderer.domElement);
      console.log('🔍 DOM element attached to document:', isAttached);
    } catch (error) {
      console.error('❌ Failed to add renderer to DOM:', error);
      return;
    }
    
    rendererRef.current = renderer;
    
    // NOW initialize shader system with the ready renderer
    if (window.gridOS && typeof window.gridOS.initializeShaderSystem === 'function') {
      console.log('🎨 Initializing shader system with ready renderer...');
      const shaderReady = window.gridOS.initializeShaderSystem(renderer);
      console.log('✅ Shader system initialized:', shaderReady);
      
      if (shaderReady) {
        console.log('🔧 Shader system is now ready for use');
      } else {
        console.warn('⚠️ Shader system initialization returned false');
      }
    } else {
      console.warn('⚠️ Grid OS or initializeShaderSystem method not available');
    }
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Add some basic geometry for testing
    const geometry = new THREE.PlaneGeometry(4, 4, 32, 32);
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          pos.z += sin(pos.x * 4.0 + time) * 0.1;
          pos.z += sin(pos.y * 4.0 + time * 1.5) * 0.1;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vec2 grid = abs(fract(vUv * 20.0) - 0.5) / fwidth(vUv * 20.0);
          float line = min(grid.x, grid.y);
          
          vec3 color = vec3(0.1, 0.4, 1.0) * (1.0 - min(line, 1.0));
          color += vec3(0.0, 0.8, 1.0) * 0.3 * sin(time + vPosition.x * 10.0) * sin(time + vPosition.y * 10.0);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        time: { value: 0 }
      },
      transparent: true
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      animationIdRef.current = animationId;
      
      // Update FPS counter
      frameCountRef.current++;
      const now = Date.now();
      const elapsed = now - lastFpsUpdateRef.current;
      
      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        
        // Adjust performance level based on FPS
        if (currentFps < 30) {
          setPerformanceLevel(PerformanceLevel.LOW);
        } else if (currentFps < 45) {
          setPerformanceLevel(PerformanceLevel.MEDIUM);
        } else {
          setPerformanceLevel(PerformanceLevel.HIGH);
        }
        
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
      
      // Update shader uniforms
      material.uniforms.time.value = performance.now() * 0.001;
      
      // Rotate the mesh slightly
      mesh.rotation.z += 0.005;
      
      // Render scene
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [width, height]);
  
  // Subscribe to grid commands
  useEffect(() => {
    // Check if gridOS and eventBus are defined before subscribing
    if (window.gridOS && window.gridOS.eventBus && window.gridOS.eventBus.gridCommands$) {
      const subscription = gridOS.eventBus.gridCommands$.subscribe(command => {
        if (command.type === 'activate' && command.tileIds) {
          setActiveTiles(command.tileIds.map(id => parseInt(id)));
        }
      });
      
      return () => subscription.unsubscribe();
    }
    
    // Return a no-op cleanup function if we couldn't subscribe
    return () => {};
  }, []);
  
  // Toggle debug visual when needed
  useEffect(() => {
    const healthCheck = setInterval(() => {
      // Check if gridOS is defined before calling getSystemHealth
      if (window.gridOS && window.gridOS.getSystemHealth) {
        try {
          const health = gridOS.getSystemHealth();
          if (health && health.status === 'critical' || 
              (health && health.subsystems && health.subsystems.shaderSystem && 
               health.subsystems.shaderSystem.status === 'critical')) {
            setShowDebugVisual(true);
          }
        } catch (error) {
          console.warn('Error checking system health:', error);
        }
      }
    }, 5000);
    
    return () => clearInterval(healthCheck);
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className={`legendary-grid-container ${className || ''}`}
    >
      {showDebugVisual && (
        <div className="grid-debug-overlay">
          <GridVisualTest />
        </div>
      )}
      <div className="performance-indicator">
        FPS: {fps} | Mode: {performanceLevel}
      </div>
    </div>
  );
};
