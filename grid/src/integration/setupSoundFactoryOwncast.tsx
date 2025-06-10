/**
 * GRID OS: Sound Factory NYC Owncast Integration
 * 
 * This module provides integration between Sound Factory NYC's Owncast streaming platform 
 * and GRID OS, allowing for real-time interaction between stream events and the grid visualization.
 */

import React, { useEffect, useRef } from 'react';
import { gridOS } from './gridOSBackend';
import { SOUND_FACTORY_CONFIG, SOUND_FACTORY_RTMP_CONFIG, SOUND_FACTORY_API, SOUND_FACTORY_GRID_SETTINGS } from './soundFactoryConfig';

/**
 * Owncast event types
 */
interface OwncastChatMessage {
  id: string;
  author: {
    id: string;
    displayName: string;
    displayColor: string;
  };
  body: string;
  timestamp: number;
}

interface OwncastDonation {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  message?: string;
  timestamp: number;
}

interface OwncastViewerCount {
  count: number;
  timestamp: number;
}

interface OwncastStreamStatus {
  online: boolean;
  started?: number;
  duration?: number;
}

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Initialize Sound Factory NYC Owncast integration with GRID OS
 */
export function initializeSoundFactoryOwncast(): void {
  console.log('🎵 Initializing Sound Factory NYC → Grid OS bridge');
  console.log(`📡 Server: ${SOUND_FACTORY_CONFIG.owncastUrl}`);
  console.log(`🎬 RTMP: ${SOUND_FACTORY_RTMP_CONFIG.SERVER_URL}`);
  
  // Check server status first
  checkServerStatus().then((isOnline) => {
    if (isOnline) {
      console.log('✅ Sound Factory NYC server is online, connecting WebSocket...');
      setupOwncastWebSocket();
    } else {
      console.log('⚠️ Sound Factory NYC server appears offline, using simulation mode');
      simulateOwncastEvents();
    }
  });
  
  // Set up event listeners for Owncast iframe messages
  setupOwncastIframeListeners();
}

/**
 * Check if Sound Factory NYC Owncast server is online
 */
async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetch(SOUND_FACTORY_API.status, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    console.log('📊 Sound Factory NYC Server Status:', data);
    return response.ok;
  } catch (error) {
    console.warn('Sound Factory NYC server status check failed:', error);
    return false;
  }
}

/**
 * Set up WebSocket connection to Sound Factory NYC Owncast server
 */
function setupOwncastWebSocket(): void {
  console.log('🔌 Connecting to Sound Factory NYC WebSocket:', SOUND_FACTORY_CONFIG.wsUrl);
  
  try {
    const ws = new WebSocket(SOUND_FACTORY_CONFIG.wsUrl);
    
    ws.onopen = () => {
      console.log('✅ Connected to Sound Factory NYC WebSocket');
      reconnectAttempts = 0;
      
      // Emit connection event to GRID
      if (gridOS?.eventBus) {
        (gridOS.eventBus as any).emit('sound_factory_connected', {
          server: SOUND_FACTORY_CONFIG.owncastUrl,
          timestamp: Date.now()
        });
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleOwncastWebSocketMessage(data);
      } catch (error) {
        console.warn('Failed to parse Sound Factory NYC WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('🔌 Sound Factory NYC WebSocket disconnected');
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        console.log(`🔄 Attempting to reconnect to Sound Factory NYC (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`);
        setTimeout(setupOwncastWebSocket, delay);
      } else {
        console.log('🎭 Max reconnection attempts reached, switching to simulation mode');
        simulateOwncastEvents();
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Sound Factory NYC WebSocket error:', error);
    };
    
  } catch (error) {
    console.error('❌ Failed to create Sound Factory NYC WebSocket:', error);
    simulateOwncastEvents();
  }
}

/**
 * Handle WebSocket messages from Sound Factory NYC Owncast
 */
function handleOwncastWebSocketMessage(data: any): void {
  console.log('📨 Sound Factory NYC message:', data);
  
  switch (data.type) {
    case 'CHAT':
      handleChatMessage(data.data);
      break;
    case 'USER_JOINED':
    case 'USER_PARTED':
      handleUserEvent(data);
      break;
    case 'STREAM_STATUS_UPDATE':
      handleStreamStatusUpdate(data.data);
      break;
    case 'VIEWER_COUNT':
      handleViewerCount(data.data);
      break;
    default:
      console.log('🔍 Unknown Sound Factory NYC message type:', data.type);
  }
}

/**
 * Set up event listeners for Sound Factory NYC Owncast iframe messages
 */
function setupOwncastIframeListeners(): void {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type && event.data.type.startsWith('owncast-')) {
      handleOwncastMessage(event.data);
    }
  });
}

/**
 * Handle messages from Sound Factory NYC Owncast iframe
 */
function handleOwncastMessage(message: any): void {
  switch (message.type) {
    case 'owncast-chat-message':
      handleChatMessage(message.data);
      break;
    case 'owncast-donation':
      handleDonation(message.data);
      break;
    case 'owncast-viewer-count':
      handleViewerCount(message.data);
      break;
  }
}

/**
 * Handle chat messages from Sound Factory NYC
 */
function handleChatMessage(message: OwncastChatMessage): void {
  console.log('💬 Sound Factory NYC chat message:', message);
  
  if (gridOS?.eventBus) {
    (gridOS.eventBus as any).emit('chat_message', {
      text: message.body,
      author: message.author.displayName,
      color: message.author.displayColor || SOUND_FACTORY_GRID_SETTINGS.colorSchemes.primary,
      timestamp: message.timestamp,
      intensity: calculateMessageIntensity(message.body)
    });
  }
  
  // Trigger visual effects based on message content with Sound Factory NYC styling
  triggerChatVisualEffects(message);
}

/**
 * Handle user join/leave events
 */
function handleUserEvent(data: any): void {
  console.log('👤 Sound Factory NYC user event:', data);
  
  if (gridOS?.eventBus) {
    (gridOS.eventBus as any).emit('user_event', {
      type: data.type === 'USER_JOINED' ? 'join' : 'leave',
      user: data.data,
      timestamp: Date.now()
    });
  }
}

/**
 * Handle stream status updates
 */
function handleStreamStatusUpdate(status: OwncastStreamStatus): void {
  console.log('📡 Sound Factory NYC stream status:', status);
  
  if (gridOS?.eventBus) {
    (gridOS.eventBus as any).emit('stream_status', {
      online: status.online,
      duration: status.duration,
      timestamp: Date.now()
    });
  }
}

/**
 * Handle viewer count updates
 */
function handleViewerCount(data: OwncastViewerCount): void {
  console.log('👥 Sound Factory NYC viewer count:', data.count);
  
  if (gridOS?.eventBus) {
    (gridOS.eventBus as any).emit('viewer_count', {
      count: data.count,
      timestamp: data.timestamp || Date.now()
    });
  }
  
  // Adjust grid intensity based on viewer count using Sound Factory thresholds
  adjustGridIntensity(data.count);
}

/**
 * Handle donation events
 */
function handleDonation(donation: OwncastDonation): void {
  console.log('💰 Sound Factory NYC donation received:', donation);
  
  if (gridOS?.eventBus) {
    (gridOS.eventBus as any).emit('donation', {
      amount: donation.amount,
      currency: donation.currency,
      message: donation.message,
      timestamp: donation.timestamp,
      intensity: calculateDonationIntensity(donation.amount)
    });
  }
  
  // Trigger special donation effects with Sound Factory NYC branding
  triggerDonationEffects(donation);
}

/**
 * Calculate message intensity for visual effects using Sound Factory settings
 */
function calculateMessageIntensity(text: string): number {
  let intensity = SOUND_FACTORY_GRID_SETTINGS.chatIntensity.base;
  
  // Increase intensity for caps, exclamation marks, etc.
  if (text.includes('!')) intensity += SOUND_FACTORY_GRID_SETTINGS.chatIntensity.caps;
  if (text === text.toUpperCase() && text.length > 3) intensity += SOUND_FACTORY_GRID_SETTINGS.chatIntensity.caps;
  if (text.includes('❤️') || text.includes('💖') || text.includes('🎵') || text.includes('🎶')) {
    intensity += SOUND_FACTORY_GRID_SETTINGS.chatIntensity.emoji;
  }
  
  return Math.min(intensity, 1.0);
}

/**
 * Calculate donation intensity for visual effects
 */
function calculateDonationIntensity(amount: number): number {
  // Scale from 0.6 to 1.0 based on donation amount
  return Math.min(SOUND_FACTORY_GRID_SETTINGS.chatIntensity.donation + (amount / 50), 1.0);
}

/**
 * Trigger visual effects for chat messages with Sound Factory NYC styling
 */
function triggerChatVisualEffects(message: OwncastChatMessage): void {
  console.log(`🎨 Triggering Sound Factory NYC visual effects for: "${message.body}"`);
  // Could trigger grid ripples with Sound Factory colors
}

/**
 * Trigger visual effects for donations with Sound Factory NYC branding
 */
function triggerDonationEffects(donation: OwncastDonation): void {
  console.log(`🎆 Triggering Sound Factory NYC donation effects for $${donation.amount}`);
  // Could trigger spectacular grid effects with Sound Factory colors
}

/**
 * Adjust grid intensity based on viewer count using Sound Factory thresholds
 */
function adjustGridIntensity(viewerCount: number): void {
  const thresholds = SOUND_FACTORY_GRID_SETTINGS.viewerThresholds;
  let intensity = 0.1; // Base intensity
  
  if (viewerCount >= thresholds.massive) intensity = 1.0;
  else if (viewerCount >= thresholds.high) intensity = 0.8;
  else if (viewerCount >= thresholds.medium) intensity = 0.6;
  else if (viewerCount >= thresholds.low) intensity = 0.4;
  
  console.log(`📊 Adjusting Sound Factory NYC grid intensity to ${intensity} based on ${viewerCount} viewers`);
}

/**
 * Simulate Sound Factory NYC Owncast events for testing when server is offline
 */
function simulateOwncastEvents(): void {
  console.log('🎭 Starting Sound Factory NYC Owncast event simulation for GRID testing...');
  
  const simulationEvents = [
    () => handleChatMessage({
      id: 'sim_sf_1',
      author: { id: 'user1', displayName: 'SoundFactoryFan', displayColor: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.primary },
      body: 'Amazing beats tonight! 🎵🔥',
      timestamp: Date.now()
    }),
    () => handleViewerCount({ count: 35, timestamp: Date.now() }),
    () => handleDonation({
      id: 'donation_sf_1',
      userId: 'donor1',
      amount: 15,
      currency: 'USD',
      message: 'Keep the music pumping! 🎶💖',
      timestamp: Date.now()
    }),
    () => handleStreamStatusUpdate({ online: true, started: Date.now() - 300000 }),
    () => handleChatMessage({
      id: 'sim_sf_2',
      author: { id: 'user2', displayName: 'GridRaver', displayColor: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.secondary },
      body: 'THE GRID IS ALIVE AND VIBING! ⚡🎵',
      timestamp: Date.now()
    })
  ];
  
  // Run simulation events every 3-7 seconds
  simulationEvents.forEach((event, index) => {
    setTimeout(event, (index + 1) * (3000 + Math.random() * 4000));
  });
  
  // Continue simulation
  setTimeout(() => {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      simulateOwncastEvents();
    }
  }, 30000);
}

/**
 * React component for embedded Sound Factory NYC Owncast player
 */
export const SoundFactoryOwncastPlayer: React.FC<{ className?: string }> = ({ className }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Initialize Sound Factory NYC Owncast integration when component mounts
    initializeSoundFactoryOwncast();
    
    return () => {
      // Cleanup on unmount
      console.log('🧹 Cleaning up Sound Factory NYC Owncast integration');
    };
  }, []);
  
  return (
    <div className={`sound-factory-owncast-player ${className || ''}`} style={{
      background: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.background,
      color: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.primary
    }}>
      <iframe
        ref={iframeRef}
        src={SOUND_FACTORY_API.embed}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        title="Sound Factory NYC Live Stream"
      />
      <div className="sound-factory-rtmp-info" style={{
        background: 'rgba(0,0,0,0.8)',
        color: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.primary,
        padding: '10px',
        fontSize: '12px'
      }}>
        <h4 style={{ color: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.accent }}>🎵 Sound Factory NYC - RTMP Info</h4>
        <div>Server: <code style={{ color: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.secondary }}>{SOUND_FACTORY_RTMP_CONFIG.SERVER_URL}</code></div>
        <div>Bitrate: <code style={{ color: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.secondary }}>{SOUND_FACTORY_RTMP_CONFIG.RECOMMENDED_SETTINGS.bitrate} kbps</code></div>
        <div>Resolution: <code style={{ color: SOUND_FACTORY_GRID_SETTINGS.colorSchemes.secondary }}>{SOUND_FACTORY_RTMP_CONFIG.RECOMMENDED_SETTINGS.resolution}</code></div>
      </div>
    </div>
  );
};

// Make functions available globally for testing
(window as any).soundFactoryOwncast = {
  initialize: initializeSoundFactoryOwncast,
  simulate: simulateOwncastEvents,
  config: SOUND_FACTORY_CONFIG,
  rtmpConfig: SOUND_FACTORY_RTMP_CONFIG,
  api: SOUND_FACTORY_API
};

console.log('🎵 Sound Factory NYC Owncast Integration module loaded');
console.log('💡 RTMP Stream to:', SOUND_FACTORY_RTMP_CONFIG.SERVER_URL);
console.log('💡 Initialize with: window.soundFactoryOwncast.initialize()');

// Export for use in other modules
export { SOUND_FACTORY_CONFIG, SOUND_FACTORY_RTMP_CONFIG, SOUND_FACTORY_API };
