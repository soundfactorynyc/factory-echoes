/**
 * ClaudeAura Component
 * 
 * This component creates a visual aura effect that responds to Claude's
 * emotional state and system events.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gridOS } from '../integration/gridOSBackend';

interface ClaudeAuraProps {
  scene: THREE.Scene;
}

export const ClaudeAura: React.FC<ClaudeAuraProps> = ({ scene }) => {
  const auraRef = useRef<THREE.Points | null>(null);
  const particlesRef = useRef<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const moodRef = useRef<string>('zen');
  
  // Initialize aura
  useEffect(() => {
    if (!scene) return;
    
    // Create particles
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Default color (cyan for zen)
    const color = new THREE.Color(0x00ffff);
    
    // Create particles in a sphere
    for (let i = 0; i < particleCount; i++) {
      // Position
      const radius = 2 + Math.random() * 3; // 2-5 units from center
      const theta = Math.random() * Math.PI * 2; // 0-2π
      const phi = Math.acos(2 * Math.random() - 1); // 0-π
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particlesRef.current = particles;
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    materialRef.current = material;
    
    // Create points
    const points = new THREE.Points(particles, material);
    scene.add(points);
    auraRef.current = points;
    
    // Animate particles
    const animate = () => {
      if (!particlesRef.current || !auraRef.current) return;
      
      const positions = particlesRef.current.attributes.position.array as Float32Array;
      const sizes = particlesRef.current.attributes.size.array as Float32Array;
      
      // Update positions based on mood
      for (let i = 0; i < positions.length / 3; i++) {
        // Get current position
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        
        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        // Normalize direction
        const nx = x / distance;
        const ny = y / distance;
        const nz = z / distance;
        
        // Movement factor based on mood
        let movementFactor = 0.005; // Default for zen
        let radiusVariation = 0.1;  // Default for zen
        
        switch (moodRef.current) {
          case 'euphoric':
            movementFactor = 0.01;
            radiusVariation = 0.2;
            break;
          case 'chaotic':
            movementFactor = 0.02;
            radiusVariation = 0.3;
            break;
          case 'sad':
            movementFactor = 0.003;
            radiusVariation = 0.05;
            break;
          case 'aggressive':
            movementFactor = 0.015;
            radiusVariation = 0.25;
            break;
        }
        
        // Apply perlin noise-like movement (simplified)
        const time = performance.now() * 0.001;
        const noiseX = Math.sin(time * 0.5 + i * 0.1) * radiusVariation;
        const noiseY = Math.cos(time * 0.4 + i * 0.2) * radiusVariation;
        const noiseZ = Math.sin(time * 0.3 + i * 0.3) * radiusVariation;
        
        // Move particles
        positions[i * 3] += (nx * movementFactor) + noiseX;
        positions[i * 3 + 1] += (ny * movementFactor) + noiseY;
        positions[i * 3 + 2] += (nz * movementFactor) + noiseZ;
        
        // Keep particles within bounds
        const newDistance = Math.sqrt(
          positions[i * 3] * positions[i * 3] + 
          positions[i * 3 + 1] * positions[i * 3 + 1] + 
          positions[i * 3 + 2] * positions[i * 3 + 2]
        );
        
        // If too far or too close, reset to a proper distance
        if (newDistance > 8 || newDistance < 1) {
          const targetRadius = 2 + Math.random() * 3;
          positions[i * 3] = nx * targetRadius;
          positions[i * 3 + 1] = ny * targetRadius;
          positions[i * 3 + 2] = nz * targetRadius;
        }
        
        // Pulse size based on time
        sizes[i] = (Math.sin(time * 2 + i) * 0.05 + 0.1) * (moodRef.current === 'euphoric' ? 1.5 : 1.0);
      }
      
      // Update attributes
      particlesRef.current.attributes.position.needsUpdate = true;
      particlesRef.current.attributes.size.needsUpdate = true;
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (auraRef.current) {
        scene.remove(auraRef.current);
      }
      
      if (particlesRef.current) {
        particlesRef.current.dispose();
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, [scene]);
  
  // Subscribe to system state changes for mood
  useEffect(() => {
    const subscription = gridOS.eventBus.state$.subscribe(state => {
      if (!auraRef.current || !particlesRef.current || !materialRef.current) return;
      
      // Update mood reference
      moodRef.current = state.mood;
      
      // Update particle colors based on mood
      const colors = particlesRef.current.attributes.color.array as Float32Array;
      let color: THREE.Color;
      
      switch (state.mood) {
        case 'euphoric':
          color = new THREE.Color(0xffcc00); // Gold
          break;
        case 'chaotic':
          color = new THREE.Color(0xff00ff); // Magenta
          break;
        case 'sad':
          color = new THREE.Color(0x0066ff); // Blue
          break;
        case 'aggressive':
          color = new THREE.Color(0xff3300); // Red-orange
          break;
        default: // zen
          color = new THREE.Color(0x00ffff); // Cyan
      }
      
      // Apply color to all particles with slight variations
      for (let i = 0; i < colors.length / 3; i++) {
        // Add slight color variation
        const variation = Math.random() * 0.2 - 0.1; // -0.1 to 0.1
        
        colors[i * 3] = Math.max(0, Math.min(1, color.r + variation));
        colors[i * 3 + 1] = Math.max(0, Math.min(1, color.g + variation));
        colors[i * 3 + 2] = Math.max(0, Math.min(1, color.b + variation));
      }
      
      particlesRef.current.attributes.color.needsUpdate = true;
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Subscribe to beat events for pulsing effect
  useEffect(() => {
    const subscription = gridOS.eventBus.beats$.subscribe(beat => {
      if (!auraRef.current || !beat.onBeat) return;
      
      // Scale animation based on beat intensity
      const scale = 1.0 + beat.intensity * 0.3;
      auraRef.current.scale.set(scale, scale, scale);
      
      // Reset scale after beat
      setTimeout(() => {
        if (auraRef.current) {
          auraRef.current.scale.set(1, 1, 1);
        }
      }, 60000 / beat.bpm / 2); // Half beat duration
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Subscribe to money shots for special effects
  useEffect(() => {
    const subscription = gridOS.eventBus.moneyShots$.subscribe(shot => {
      if (!auraRef.current || !particlesRef.current) return;
      
      // Create explosion effect
      const positions = particlesRef.current.attributes.position.array as Float32Array;
      const sizes = particlesRef.current.attributes.size.array as Float32Array;
      
      // Scale factor based on amount
      const scaleFactor = Math.min(3, 1 + shot.amount / 100);
      
      // Expand particles temporarily
      for (let i = 0; i < positions.length / 3; i++) {
        // Get current position
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        
        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        // Normalize direction
        const nx = x / distance;
        const ny = y / distance;
        const nz = z / distance;
        
        // Push particles outward
        positions[i * 3] = nx * distance * scaleFactor;
        positions[i * 3 + 1] = ny * distance * scaleFactor;
        positions[i * 3 + 2] = nz * distance * scaleFactor;
        
        // Increase size temporarily
        sizes[i] *= 2;
      }
      
      particlesRef.current.attributes.position.needsUpdate = true;
      particlesRef.current.attributes.size.needsUpdate = true;
      
      // Return to normal after a delay
      setTimeout(() => {
        if (!particlesRef.current) return;
        
        // Reset sizes
        for (let i = 0; i < sizes.length; i++) {
          sizes[i] /= 2;
        }
        
        particlesRef.current.attributes.size.needsUpdate = true;
      }, 1000);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return null; // This is a controller component, no rendering needed
};
