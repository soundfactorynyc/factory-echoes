/**
 * GRID OS: Owncast Tip Handler
 * 
 * This module provides functionality for handling tip events from Owncast
 * and updating the tip data state.
 */

import { gridOS } from './gridOSBackend.js';

/**
 * Default tip data
 */
const DEFAULT_TIP_DATA = {
  lastTip: 0,
  totalTips: 0,
  goal: 1000,
  goalProgress: 0,
  topTipper: ''
};

/**
 * Create an Owncast tip handler
 * @param {Object} initialData Initial tip data
 * @returns {Object} Tip data and setter
 */
export function useOwncastTipHandler(initialData = {}) {
  // Initialize tip data with defaults and any provided initial data
  let tipData = {
    ...DEFAULT_TIP_DATA,
    ...initialData
  };
  
  // Create a setter function
  const setTipData = (updater) => {
    if (typeof updater === 'function') {
      tipData = updater(tipData);
    } else {
      tipData = { ...tipData, ...updater };
    }
    return tipData;
  };
  
  // Set up Owncast bridge
  if (typeof window !== 'undefined') {
    // Create Owncast bridge if it doesn't exist
    if (!window.owncast) {
      window.owncast = {
        on: (eventType, callback) => {
          console.log(`Registered handler for Owncast ${eventType} events`);
          window.addEventListener(`owncast-${eventType}`, (event) => {
            callback(event.detail);
          });
        },
        emit: (eventType, data) => {
          const event = new CustomEvent(`owncast-${eventType}`, { detail: data });
          window.dispatchEvent(event);
        }
      };
    }
    
    // Set up tip event handler
    window.owncast.on('tip', (tip) => {
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
  }
  
  return { tipData, setTipData };
}

/**
 * Determine user tier based on tip amount
 * @param {number} amount Tip amount
 * @returns {string} User tier
 */
function determineTierFromAmount(amount) {
  if (amount >= 500) return 'whale';
  if (amount >= 100) return 'vip';
  if (amount >= 20) return 'premium';
  return 'free';
}

/**
 * Simulate a tip event (for testing)
 * @param {number} amount Tip amount
 * @param {string} userName User name
 * @param {string} message Optional message
 */
export function simulateTip(amount, userName, message) {
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
if (typeof window !== 'undefined') {
  window.simulateTip = simulateTip;
}
