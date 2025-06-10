/**
 * GridScene Component
 * 
 * This component renders the 3D grid scene with tiles and visual effects.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gridOS } from '../integration/gridOSBackend';

interface GridTile {
  id: number;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
  intensity: number;
  active: boolean;
}

interface GridSceneProps {
  scene: THREE.Scene;
  activeTiles: number[];
}

export const GridScene: React.FC<GridSceneProps> = ({ scene, activeTiles }) => {
  const tilesRef = useRef<GridTile[]>([]);
  const groupRef = useRef<THREE.Group | null>(null);
  
  // Initialize grid tiles
  useEffect(() => {
    if (!scene) return;
    
    // Create a group to hold all tiles
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;
    
    // Create grid tiles (8x8 grid)
    const tiles: GridTile[] = [];
    const size = 0.4;
    const gap = 0.1;
    const totalWidth = 8 * (size + gap) - gap;
    const startX = -totalWidth / 2 + size / 2;
    const startY = -totalWidth / 2 + size / 2;
    
    // Create material with glow effect
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    
    // Create inactive material
    const inactiveMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      emissive: 0x000000,
      metalness: 0.5,
      roughness: 0.8,
    });
    
    // Create geometry
    const geometry = new THREE.BoxGeometry(size, size, size * 0.1);
    
    // Create tiles
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const id = row * 8 + col;
        const x = startX + col * (size + gap);
        const y = startY + row * (size + gap);
        
        // Create mesh with inactive material initially
        const mesh = new THREE.Mesh(geometry, inactiveMaterial.clone());
        mesh.position.set(x, y, 0);
        mesh.userData.id = id;
        
        // Add to group
        group.add(mesh);
        
        // Store tile data
        tiles.push({
          id,
          position: new THREE.Vector3(x, y, 0),
          mesh,
          intensity: 0,
          active: false
        });
      }
    }
    
    tilesRef.current = tiles;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Cleanup
    return () => {
      scene.remove(group);
      geometry.dispose();
      material.dispose();
      inactiveMaterial.dispose();
      tiles.forEach(tile => {
        if (tile.mesh.material instanceof THREE.Material) {
          tile.mesh.material.dispose();
        }
      });
    };
  }, [scene]);
  
  // Update active tiles
  useEffect(() => {
    if (!tilesRef.current.length) return;
    
    // Get the glowing material from the shader system
    const cyanGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 1.0,
      metalness: 0.8,
      roughness: 0.2,
    });
    
    // Get the inactive material
    const inactiveMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      emissive: 0x000000,
      metalness: 0.5,
      roughness: 0.8,
    });
    
    // Update all tiles
    tilesRef.current.forEach(tile => {
      const isActive = activeTiles.includes(tile.id);
      
      // Update material if active state changed
      if (isActive !== tile.active) {
        tile.mesh.material = isActive ? cyanGlowMaterial.clone() : inactiveMaterial.clone();
        tile.active = isActive;
        
        // Animate activation
        if (isActive) {
          // Pop-up animation
          const initialZ = tile.mesh.position.z;
          const targetZ = initialZ + 0.2;
          
          // Animation timeline
          const startTime = performance.now();
          const duration = 500; // ms
          
          const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            // Update position
            tile.mesh.position.z = initialZ + (targetZ - initialZ) * eased;
            
            // Continue animation if not complete
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Return to original position slowly
              setTimeout(() => {
                const returnStartTime = performance.now();
                const returnDuration = 1000; // ms
                
                const returnAnimate = () => {
                  const returnElapsed = performance.now() - returnStartTime;
                  const returnProgress = Math.min(returnElapsed / returnDuration, 1);
                  const returnEased = 1 - Math.pow(1 - returnProgress, 2); // Ease out quad
                  
                  // Update position
                  tile.mesh.position.z = targetZ - (targetZ - initialZ) * returnEased;
                  
                  // Continue animation if not complete
                  if (returnProgress < 1) {
                    requestAnimationFrame(returnAnimate);
                  }
                };
                
                requestAnimationFrame(returnAnimate);
              }, 500);
            }
          };
          
          requestAnimationFrame(animate);
        }
      }
    });
  }, [activeTiles]);
  
  // Subscribe to beat events for pulsing effect
  useEffect(() => {
    const subscription = gridOS.eventBus.beats$.subscribe(beat => {
      if (!tilesRef.current.length || !beat.onBeat) return;
      
      // Pulse active tiles on beat
      tilesRef.current.forEach(tile => {
        if (!tile.active) return;
        
        // Scale animation
        const initialScale = 1.0;
        const targetScale = 1.0 + beat.intensity * 0.3;
        
        // Animation timeline
        const startTime = performance.now();
        const duration = 60000 / beat.bpm; // Duration based on BPM
        
        const animate = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = Math.sin(progress * Math.PI); // Sine curve for smooth pulse
          
          // Update scale
          const scale = initialScale + (targetScale - initialScale) * eased;
          tile.mesh.scale.set(scale, scale, scale);
          
          // Continue animation if not complete
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Reset scale
            tile.mesh.scale.set(initialScale, initialScale, initialScale);
          }
        };
        
        requestAnimationFrame(animate);
      });
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return null; // This is a controller component, no rendering needed
};
