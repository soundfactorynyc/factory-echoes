/**
 * useGridState Hook
 * 
 * This hook provides access to the grid state from the GRID OS backend.
 * It transforms active tile IDs into a structured array of tile objects
 * with properties like active and intensity.
 */

import { useState, useEffect } from 'react';
import { gridOS } from '../integration/gridOSBackend';

/**
 * Tile interface
 */
export interface Tile {
  /**
   * Tile ID
   */
  id: number;
  
  /**
   * Whether the tile is active
   */
  active: boolean;
  
  /**
   * Tile intensity (0-1)
   */
  intensity: number;
}

/**
 * Grid state interface
 */
export interface GridState {
  /**
   * Array of tiles
   */
  tiles: Tile[];
}

/**
 * Hook to access grid state
 * @returns Grid state
 */
export const useGridState = (): GridState => {
  // Initialize with a default 8x8 grid of inactive tiles
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const initialTiles: Tile[] = [];
    for (let i = 0; i < 64; i++) {
      initialTiles.push({
        id: i,
        active: false,
        intensity: 0
      });
    }
    return initialTiles;
  });

  // Subscribe to grid commands from the event bus
  useEffect(() => {
    // Check if gridOS and eventBus are properly initialized
    if (!gridOS || !gridOS.eventBus) {
      console.warn('Grid OS or event bus not available for grid state subscription');
      return () => {}; // Return empty cleanup function
    }
    
    // Check if observables exist
    if (!gridOS.eventBus.gridCommands$ || !gridOS.eventBus.beats$) {
      console.warn('Grid commands or beats observables not available');
      
      // Set up a simple animation for tiles when observables aren't available
      const animationInterval = setInterval(() => {
        setTiles(prevTiles => {
          return prevTiles.map(tile => {
            // Random animation pattern
            const shouldActivate = Math.random() < 0.1;
            const newIntensity = shouldActivate ? 
              Math.min(1, tile.intensity + 0.3) : 
              Math.max(0, tile.intensity - 0.05);
              
            return {
              ...tile,
              active: shouldActivate || tile.active,
              intensity: newIntensity
            };
          });
        });
      }, 500);
      
      return () => clearInterval(animationInterval);
    }
    
    // If we get here, the observables exist, so subscribe to them
    let subscription;
    try {
      subscription = gridOS.eventBus.gridCommands$.subscribe(command => {
        if (command.type === 'activate' && command.tileIds) {
          // Convert string IDs to numbers
          const activeTileIds = command.tileIds.map(id => parseInt(id));
          
          // Update tiles based on active IDs
          setTiles(prevTiles => {
            return prevTiles.map(tile => {
              const isActive = activeTileIds.includes(tile.id);
              
              // If tile is newly activated, set high intensity
              // If tile was already active, maintain its intensity
              // If tile is inactive, gradually reduce intensity
              let newIntensity = tile.intensity;
              
              if (isActive && !tile.active) {
                // Newly activated tile
                newIntensity = 1.0;
              } else if (!isActive && tile.active) {
                // Deactivated tile - start fade out
                newIntensity = 0.5;
              } else if (!isActive) {
                // Continue fading out inactive tiles
                newIntensity = Math.max(0, newIntensity - 0.1);
              }
              
              return {
                ...tile,
                active: isActive,
                intensity: newIntensity
              };
            });
          });
        } else if (command.type === 'pulse' && command.intensity !== undefined) {
          // Pulse all active tiles with the given intensity
          setTiles(prevTiles => {
            return prevTiles.map(tile => {
              if (tile.active) {
                return {
                  ...tile,
                  intensity: Math.min(1, tile.intensity + command.intensity!)
                };
              }
              return tile;
            });
          });
        }
      });
    } catch (error) {
      console.warn('Error subscribing to grid commands:', error);
      subscription = { unsubscribe: () => {} }; // Dummy subscription
    }
    
    // Also subscribe to beat events to pulse active tiles on beat
    let beatSubscription;
    try {
      beatSubscription = gridOS.eventBus.beats$.subscribe(beat => {
        if (beat.onBeat) {
          setTiles(prevTiles => {
            return prevTiles.map(tile => {
              if (tile.active) {
                return {
                  ...tile,
                  intensity: Math.min(1, tile.intensity + beat.intensity * 0.3)
                };
              }
              return tile;
            });
          });
        }
      });
    } catch (error) {
      console.warn('Error subscribing to beats:', error);
      beatSubscription = { unsubscribe: () => {} }; // Dummy subscription
    }
    
    // Clean up subscriptions
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
      if (beatSubscription && typeof beatSubscription.unsubscribe === 'function') {
        beatSubscription.unsubscribe();
      }
    };
  }, []);

  // Return grid state
  return { tiles };
};
