/**
 * GRID OS: Owncast Integration with RTMP Support
 * 
 * This module provides integration between Owncast streaming platform and GRID OS,
 * including RTMP stream monitoring and real-time event handling.
 */

import React, { useEffect, useRef } from 'react';
import { gridOS } from './gridOSBackend';

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

/**
 * Sound Factory NYC Owncast Configuration
 */
const SOUND_FACTORY_CONFIG = {
  serverName: 'Sound Factory NYC',
  owncastUrl: 'https://stream.soundfactorynyc.com:8080',
  wsUrl: 'wss://stream.soundfactorynyc.com:8080/ws',
  rtmpUrl: 'rtmp://stream.soundfactorynyc.com:1935/live',
  streamKey: 'live', // Default stream key
  hlsUrl: 'https://stream.soundfactorynyc.com:8080/hls/stream.m3u8',
  features: {
    chat: true,
    donations: true,
    viewerCount: true,
    rtmpReconnect: true,
    adaptiveBitrate: true
  }
};

/**
 * RTMP Stream Configuration
 */
export const RTMP_CONFIG = {
  SERVER_URL: SOUND_FACTORY_CONFIG.rtmpUrl,
  STREAM_KEY: SOUND_FACTORY_CONFIG.streamKey,
  RECOMMENDED_SETTINGS: {
    bitrate: 2500, // kbps
    fps: 30,
    resolution: '1920x1080',
    encoder: 'x264',
    profile: 'main',
    keyframe_interval: 2
  }
};

/**
 * Owncast server configuration
 */
const OWNCAST_SERVER_URL = SOUND_FACTORY_CONFIG.owncastUrl;
const OWNCAST_WS_URL = SOUND_FACTORY_CONFIG.wsUrl;

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Initialize Owncast integration with GRID OS
 */
export function initializeOwncast(): void {
  console.log('🎥 Initializing Owncast + RTMP → Grid OS bridge');
  console.log(`📡 Server: ${OWNCAST_SERVER_URL}`);
  console.log(`🎬 RTMP: ${RTMP_CONFIG.SERVER_URL}`);
  
  // Check server status first
  checkServerStatus().then((isOnline) => {
    if (isOnline) {
      console.log('✅ Server is online, connecting WebSocket...');
      setupOwncastWebSocket();
    } else {
      console.log('⚠️ Server appears offline, using simulation mode');
      simulateOwncastEvents();
    }
  });
  
  // Set up event listeners for Owncast iframe messages
  setupOwncastIframeListeners();
  
  // Initialize RTMP monitoring
  initializeRTMPMonitoring();
}

/**
 * Check if Owncast server is online
 */
async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OWNCAST_SERVER_URL}/api/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    console.log('📊 Server Status:', data);
    return response.ok;
  } catch (error) {
    console.warn('Server status check failed:', error);
    return false;
  }
}

/**
 * Set up WebSocket connection to Owncast server
 */
function setupOwncastWebSocket(): void {
  console.log('🔌 Connecting to Owncast WebSocket:', OWNCAST_WS_URL);
  
  try {
    const ws = new WebSocket(OWNCAST_WS_URL);
    
    ws.onopen = () => {
      console.log('✅ Connected to Owncast WebSocket');
      reconnectAttempts = 0;
      
      // Emit connection event to GRID
      if (gridOS?.eventBus) {
        gridOS.eventBus.emit('owncast_connected', {
          server: OWNCAST_SERVER_URL,
          timestamp: Date.now()
        });
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleOwncastWebSocketMessage(data);
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`);
        setTimeout(setupOwncastWebSocket, delay);
      } else {
        console.log('🎭 Max reconnection attempts reached, switching to simulation mode');
        simulateOwncastEvents();
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
  } catch (error) {
    console.error('❌ Failed to create WebSocket:', error);
    simulateOwncastEvents();
  }
}

/**
 * Handle WebSocket messages from Owncast
 */
function handleOwncastWebSocketMessage(data: any): void {
  console.log('📨 Owncast message:', data);
  
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
      console.log('🔍 Unknown message type:', data.type);
  }
}

/**
 * Set up event listeners for Owncast iframe messages
 */
function setupOwncastIframeListeners(): void {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type && event.data.type.startsWith('owncast-')) {
      handleOwncastMessage(event.data);
    }
  });
}

/**
 * Handle messages from Owncast iframe
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
 * Initialize RTMP monitoring
 */
function initializeRTMPMonitoring(): void {
  console.log('🎬 Initializing RTMP monitoring...');
  
  // Check if RTMP integration is available
  const rtmpIntegration = (window as any).rtmpIntegration;
  if (rtmpIntegration) {
    // Connect RTMP events to GRID OS
    rtmpIntegration.onEvent((event: any) => {
      if (gridOS?.eventBus) {
        gridOS.eventBus.emit(`rtmp_${event.type}`, event);
        
        // Create visual effects based on RTMP events
        createRTMPVisualEffects(event);
      }
    });
    
    console.log('✅ RTMP monitoring connected to GRID OS');
  } else {
    console.warn('⚠️ RTMP integration not available');
  }
}

/**
 * Create visual effects for RTMP events
 */
function createRTMPVisualEffects(event: any): void {
  switch (event.type) {
    case 'stream_start':
      console.log('🎬 Stream started - triggering GRID activation sequence');
      // Could trigger special grid animations
      break;
    case 'quality_change':
      console.log('📊 Stream quality changed - adjusting GRID responsiveness');
      // Could adjust grid sensitivity based on stream quality
      break;
    case 'viewer_spike':
      console.log('👥 Viewer spike detected - amplifying GRID reactions');
      // Could increase grid effect intensity
      break;
  }
}

/**
 * Handle chat messages from Owncast
 */
function handleChatMessage(message: OwncastChatMessage): void {
  console.log('💬 Chat message:', message);
  
  if (gridOS?.eventBus) {
    gridOS.eventBus.emit('chat_message', {
      text: message.body,
      author: message.author.displayName,
      color: message.author.displayColor,
      timestamp: message.timestamp,
      intensity: calculateMessageIntensity(message.body)
    });
  }
  
  // Trigger visual effects based on message content
  triggerChatVisualEffects(message);
}

/**
 * Handle user join/leave events
 */
function handleUserEvent(data: any): void {
  console.log('👤 User event:', data);
  
  if (gridOS?.eventBus) {
    gridOS.eventBus.emit('user_event', {
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
  console.log('📡 Stream status:', status);
  
  if (gridOS?.eventBus) {
    gridOS.eventBus.emit('stream_status', {
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
  console.log('👥 Viewer count:', data.count);
  
  if (gridOS?.eventBus) {
    gridOS.eventBus.emit('viewer_count', {
      count: data.count,
      timestamp: data.timestamp || Date.now()
    });
  }
  
  // Adjust grid intensity based on viewer count
  adjustGridIntensity(data.count);
}

/**
 * Handle donation events
 */
function handleDonation(donation: OwncastDonation): void {
  console.log('💰 Donation received:', donation);
  
  if (gridOS?.eventBus) {
    gridOS.eventBus.emit('donation', {
      amount: donation.amount,
      currency: donation.currency,
      message: donation.message,
      timestamp: donation.timestamp,
      intensity: calculateDonationIntensity(donation.amount)
    });
  }
  
  // Trigger special donation effects
  triggerDonationEffects(donation);
}

/**
 * Calculate message intensity for visual effects
 */
function calculateMessageIntensity(text: string): number {
  let intensity = 0.3; // Base intensity
  
  // Increase intensity for caps, exclamation marks, etc.
  if (text.includes('!')) intensity += 0.2;
  if (text === text.toUpperCase() && text.length > 3) intensity += 0.3;
  if (text.includes('❤️') || text.includes('💖')) intensity += 0.4;
  
  return Math.min(intensity, 1.0);
}

/**
 * Calculate donation intensity for visual effects
 */
function calculateDonationIntensity(amount: number): number {
  // Scale from 0.5 to 1.0 based on donation amount
  return Math.min(0.5 + (amount / 50), 1.0);
}

/**
 * Trigger visual effects for chat messages
 */
function triggerChatVisualEffects(message: OwncastChatMessage): void {
  // Could trigger grid ripples, color changes, etc.
  console.log(`🎨 Triggering visual effects for: "${message.body}"`);
}

/**
 * Trigger visual effects for donations
 */
function triggerDonationEffects(donation: OwncastDonation): void {
  // Could trigger spectacular grid effects for donations
  console.log(`🎆 Triggering donation effects for $${donation.amount}`);
}

/**
 * Adjust grid intensity based on viewer count
 */
function adjustGridIntensity(viewerCount: number): void {
  const intensity = Math.min(viewerCount / 100, 1.0); // Scale to 0-1
  console.log(`📊 Adjusting grid intensity to ${intensity} based on ${viewerCount} viewers`);
}

/**
 * Simulate Owncast events for testing when server is offline
 */
function simulateOwncastEvents(): void {
  console.log('🎭 Starting Owncast event simulation for GRID testing...');
  
  const simulationEvents = [
    () => handleChatMessage({
      id: 'sim_1',
      author: { id: 'user1', displayName: 'GridMaster', displayColor: '#00ff00' },
      body: 'Amazing RTMP integration! 🎥',
      timestamp: Date.now()
    }),
    () => handleViewerCount({ count: 25, timestamp: Date.now() }),
    () => handleDonation({
      id: 'donation_1',
      userId: 'donor1',
      amount: 10,
      currency: 'USD',
      message: 'Love the stream quality!',
      timestamp: Date.now()
    }),
    () => handleStreamStatusUpdate({ online: true, started: Date.now() - 300000 }),
    () => handleChatMessage({
      id: 'sim_2',
      author: { id: 'user2', displayName: 'RTMPFan', displayColor: '#ff0080' },
      body: 'The grid reacts so smoothly to the stream! ⚡',
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
 * React component for embedded Owncast player
 */
export const OwncastPlayer: React.FC<{ className?: string }> = ({ className }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Initialize Owncast integration when component mounts
    initializeOwncast();
    
    return () => {
      // Cleanup on unmount
      console.log('🧹 Cleaning up Owncast integration');
    };
  }, []);
  
  return (
    <div className={`owncast-player ${className || ''}`}>
      <iframe
        ref={iframeRef}
        src={`${OWNCAST_SERVER_URL}/embed/video`}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        title="Owncast Stream"
      />
      <div className="rtmp-info">
        <h4>🎬 RTMP Streaming Info</h4>
        <div>Server: <code>{RTMP_CONFIG.SERVER_URL}</code></div>
        <div>Recommended Bitrate: <code>{RTMP_CONFIG.RECOMMENDED_SETTINGS.bitrate} kbps</code></div>
        <div>Resolution: <code>{RTMP_CONFIG.RECOMMENDED_SETTINGS.resolution}</code></div>
      </div>
    </div>
  );
};

// Make functions available globally for testing
(window as any).owncastIntegration = {
  initialize: initializeOwncast,
  simulate: simulateOwncastEvents,
  rtmpConfig: RTMP_CONFIG,
  serverUrl: OWNCAST_SERVER_URL
};

console.log('🎥 Owncast + RTMP Integration module loaded');
console.log('💡 RTMP Stream to:', RTMP_CONFIG.SERVER_URL);
console.log('💡 Initialize with: window.owncastIntegration.initialize()');
