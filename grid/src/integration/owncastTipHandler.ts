/**
 * GRID OS: Owncast Tip Handler
 * 
 * This module provides functionality for handling tip events from Owncast
 * and updating the tip data state.
 */

import { useState, useEffect } from 'react';
import { gridOS } from './gridOSBackend';

/**
 * Tip data interface
 */
export interface TipData {
  /**
   * Last tip amount
   */
  lastTip: number;
  
  /**
   * Total tips received
   */
  totalTips: number;
  
  /**
   * Goal amount
   */
  goal: number;
  
  /**
   * Progress towards goal (percentage)
   */
  goalProgress: number;
  
  /**
   * Top tipper username
   */
  topTipper: string;
}

/**
 * Tip event interface
 */
export interface TipEvent {
  /**
   * Tip amount
   */
  amount: number;
  
  /**
   * User name of the tipper
   */
  userName: string;
  
  /**
   * Tip message (optional)
   */
  message?: string;
  
  /**
   * Tip timestamp
   */
  timestamp: number;
}

/**
 * Default tip data
 */
const DEFAULT_TIP_DATA: TipData = {
  lastTip: 0,
  totalTips: 0,
  goal: 1000,
  goalProgress: 0,
  topTipper: ''
};

/**
 * Create an Owncast tip handler
 * @param initialData Initial tip data
 * @returns Tip data and setter
 */
export function useOwncastTipHandler(initialData: Partial<TipData> = {}) {
  // Initialize tip data with defaults and any provided initial data
  const [tipData, setTipData] = useState<TipData>({
    ...DEFAULT_TIP_DATA,
    ...initialData
  });
  
  // Set up Owncast bridge
  useEffect(() => {
    // Create Owncast bridge if it doesn't exist
    if (!window.owncast) {
      window.owncast = {
        on: (eventType: string, callback: Function) => {
          console.log(`Registered handler for Owncast ${eventType} events`);
          window.addEventListener(`owncast-${eventType}`, (event: any) => {
            callback(event.detail);
          });
        },
        emit: (eventType: string, data: any) => {
          const event = new CustomEvent(`owncast-${eventType}`, { detail: data });
          window.dispatchEvent(event);
        }
      };
    }
    
    // Set up tip event handler
    window.owncast.on('tip', (tip: TipEvent) => {
      setTipData(prev => ({
        ...prev,
        lastTip: tip.amount,
        totalTips: prev.totalTips + tip.amount,
        goalProgress: Math.min((prev.totalTips + tip.amount) / prev.goal * 100, 100),
        topTipper: tip.amount > prev.lastTip ? tip.userName : prev.topTipper
      }));
      
      // Also emit to GRID OS event bus for visualization
      if (gridOS?.eventBus) {
        gridOS.eventBus.sendMoneyShot(
          tip.userName,
          tip.amount,
          determineTierFromAmount(tip.amount),
          'euphoric'
        );
      }
    });
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return { tipData, setTipData };
}

/**
 * Determine user tier based on tip amount
 * @param amount Tip amount
 * @returns User tier
 */
function determineTierFromAmount(amount: number): string {
  if (amount >= 500) return 'whale';
  if (amount >= 100) return 'vip';
  if (amount >= 20) return 'premium';
  return 'free';
}

/**
 * Simulate a tip event (for testing)
 * @param amount Tip amount
 * @param userName User name
 * @param message Optional message
 */
export function simulateTip(amount: number, userName: string, message?: string) {
  if (window.owncast) {
    window.owncast.emit('tip', {
      amount,
      userName,
      message,
      timestamp: Date.now()
    });
    console.log(`Simulated tip: $${amount} from ${userName}`);
  } else {
    console.warn('Owncast bridge not initialized');
  }
}

// Add to window for global access
declare global {
  interface Window {
    owncast?: {
      on: (eventType: string, callback: Function) => void;
      emit: (eventType: string, data: any) => void;
    };
    simulateTip?: (amount: number, userName: string, message?: string) => void;
  }
}

// Export for global access
window.simulateTip = simulateTip;
