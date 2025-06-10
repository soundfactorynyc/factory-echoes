/**
 * GRID OS: Owncast Integration
 * 
 * This module provides integration between Owncast streaming platform and GRID OS,
 * allowing for real-time interaction between stream events and the grid visualization.
 */

import React, { useEffect, useRef } from 'react';
import { gridOS } from './gridOSBackend';
import { SOUND_FACTORY_CONFIG, SOUND_FACTORY_RTMP_CONFIG, SOUND_FACTORY_API } from './soundFactoryConfig';
import { RTMPIntegration } from './rtmpIntegration';

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
 * Initialize Owncast integration with GRID OS
 */
export function initializeOwncast(): void {
  console.log('Initializing Owncast → Grid OS bridge');
  
  // Set up WebSocket connection to Owncast server
  setupOwncastWebSocket();
  
  // Set up event listeners for Owncast iframe messages
  setupOwncastIframeListeners();
}

/**
 * Owncast server configuration
 */
const OWNCAST_SERVER_URL = 'http://209.97.158.117:8080';
const OWNCAST_WS_URL = 'ws://209.97.158.117:8080/ws';

/**
 * Set up WebSocket connection to Owncast server
 */
function setupOwncastWebSocket(): void {
  console.log('Setting up Owncast WebSocket connection to:', OWNCAST_WS_URL);
  
  // First check if server is online
  checkServerStatus().then((isOnline: boolean) => {
    if (!isOnline) {
      console.log('📺 Stream is offline - starting simulation mode');
      simulateOwncastEvents();
      return;
    }
    
    try {
      const ws = new WebSocket(OWNCAST_WS_URL);
      
      ws.onopen = () => {
        console.log('✅ Connected to Owncast WebSocket');
        console.log('🔥 GRID OS: Live stream integration ACTIVE');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleOwncastWebSocketMessage(data);
        } catch (error) {
          console.warn('Failed to parse Owncast WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 Disconnected from Owncast WebSocket');
        // Check server status before reconnecting
        setTimeout(() => {
          console.log('🔄 Checking server status for reconnection...');
          setupOwncastWebSocket();
        }, 10000);
      };
      
      ws.onerror = (error) => {
        console.error('❌ Owncast WebSocket error:', error);
        // Fall back to simulation mode
        console.log('🎭 Falling back to simulation mode');
        simulateOwncastEvents();
      };
      
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      simulateOwncastEvents();
    }
  }).catch((error) => {
    console.error('❌ Failed to check server status:', error);
    console.log('🎭 Using simulation mode instead');
    simulateOwncastEvents();
  });
}

/**
 * Check Owncast server status
 */
async function checkServerStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OWNCAST_SERVER_URL}/api/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Timeout after 5 seconds
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.online === true;
    }
    
    return false;
  } catch (error) {
    console.warn('Failed to check Owncast server status:', error);
    return false;
  }
}

/**
 * Get recent chat context from event bus
 */
function getRecentChatContext(): string[] {
  // Get the last 5 messages from the system state
  // This is a simplified implementation - in a real system you'd pull from
  // the actual chat history stored in the event bus or state management
  return [
    'Recent conversation context...',
    'Previous user interactions...',
    'Ongoing conversation flow...'
  ];
}

/**
 * Get current grid mood from system state
 */
function getCurrentGridMood(): string {
  // Get current mood from the gridOS backend state
  const currentState = gridOS.state$.value;
  return currentState.mood || 'neutral';
}

/**
 * Apply mood-based effects to the grid system
 */
function applyMoodBasedEffects(sentiment: string, effects?: any): void {
  console.log(`🎭 Applying mood-based effects for sentiment: ${sentiment}`);
  
  // Map sentiment to visual effects
  const intensityMap: Record<string, number> = {
    'positive': 0.8,
    'negative': 0.4,
    'neutral': 0.5,
    'excited': 1.0,
    'calm': 0.3,
    'angry': 0.9,
    'sad': 0.2,
    'happy': 0.9
  };
  
  const intensity = intensityMap[sentiment] || 0.5;
  
  // Apply shader effects based on sentiment
  gridOS.eventBus.sendShaderCommand(
    { 
      u_mood: intensity,
      u_sentiment: sentiment === 'positive' ? 1.0 : sentiment === 'negative' ? -1.0 : 0.0
    },
    'screen',
    intensity
  );
  
  // Apply grid effects
  if (intensity > 0.7) {
    // High intensity - activate multiple tiles
    const tileCount = Math.floor(intensity * 16);
    const tileIds = Array.from({ length: tileCount }, (_, i) => String(i));
    gridOS.eventBus.sendGridCommand('pulse', tileIds, intensity, 2000);
  } else if (intensity > 0.4) {
    // Medium intensity - subtle effects
    const tileIds = ['0', '1', '8', '9'];
    gridOS.eventBus.sendGridCommand('activate', tileIds, intensity);
  }
  
  // Apply any custom effects if provided
  if (effects) {
    console.log('🎨 Applying custom effects:', effects);
  }
}

/**
 * Set up event listeners for Owncast iframe messages
 */
function setupOwncastIframeListeners(): void {
  window.addEventListener('message', (event) => {
    // Check if the message is from Owncast iframe
    if (event.data && event.data.type && event.data.type.startsWith('owncast-')) {
      handleOwncastMessage(event.data);
    }
  });
}

/**
 * Handle messages from Owncast
 * @param message Message from Owncast
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
    case 'owncast-stream-status':
      handleStreamStatus(message.data);
      break;
  }
}

/**
 * Handle WebSocket messages from Owncast server
 */
function handleOwncastWebSocketMessage(data: any): void {
  console.log('📨 Owncast WebSocket message:', data);
  
  switch (data.type) {
    case 'CHAT':
      if (data.body) {
        handleChatMessage({
          id: data.id || `chat-${Date.now()}`,
          author: {
            id: data.user?.id || 'unknown',
            displayName: data.user?.displayName || 'Anonymous',
            displayColor: data.user?.displayColor || '#ffffff'
          },
          body: data.body,
          timestamp: data.timestamp || Date.now()
        });
      }
      break;
      
    case 'USER_JOINED':
      console.log('👋 User joined:', data.user?.displayName);
      break;
      
    case 'STREAM_STATUS_UPDATE':
      handleStreamStatus({
        online: data.online || false,
        started: data.started,
        duration: data.duration
      });
      break;
      
    case 'VIEWER_COUNT':
      handleViewerCount({
        count: data.count || 0,
        timestamp: Date.now()
      });
      break;
      
    default:
      console.log('🔍 Unhandled Owncast message type:', data.type);
  }
}

/**
 * Handle chat message from Owncast
 * @param message Chat message
 */
async function handleChatMessage(message: OwncastChatMessage): Promise<void> {
  console.log(`Owncast chat message: ${message.body}`);
  
  // Forward to GRID OS event bus
  gridOS.eventBus.sendChatMessage(
    message.author.id,
    message.body,
    'text',
    {
      displayName: message.author.displayName,
      displayColor: message.author.displayColor,
      platform: 'owncast'
    }
  );

  // Process message with Claude for enhanced chat experience
  try {
    if (gridOS.claude?.agents?.conversationalist) {
      // Get recent context from event bus
      const recentMessages = getRecentChatContext();
      const currentMood = getCurrentGridMood();
      
      const enhancedResponse = await gridOS.claude.agents.conversationalist.process({
        message: message.body,
        context: recentMessages,
        currentMood: currentMood,
        author: message.author.displayName
      });

      // Log the enhanced response for debugging
      console.log('🤖 Claude enhanced response:', enhancedResponse);

      // Apply sentiment-based visual effects
      if (enhancedResponse.sentiment) {
        applyMoodBasedEffects(enhancedResponse.sentiment.type, enhancedResponse);
      }

      // Use suggested responses for system interactions
      if (enhancedResponse.suggestedResponses?.length > 0) {
        // Could be used for auto-responses or UI suggestions
        console.log('💡 Claude suggestions:', enhancedResponse.suggestedResponses);
      }
    }
  } catch (error) {
    console.warn('Claude processing failed for chat message:', error);
  }
  
  // Activate grid tiles based on message content
  // Simple algorithm: use the length of the message to determine how many tiles to activate
  const tileCount = Math.min(Math.floor(message.body.length / 5), 64);
  if (tileCount > 0) {
    const tileIds = Array.from({ length: tileCount }, (_, i) => String(i));
    gridOS.eventBus.sendGridCommand('activate', tileIds);
  }
}

/**
 * Handle donation from Owncast
 * @param donation Donation
 */
function handleDonation(donation: OwncastDonation): void {
  console.log(`Owncast donation: ${donation.amount} ${donation.currency}`);
  
  // Forward to GRID OS event bus as money shot
  gridOS.eventBus.sendMoneyShot(
    donation.userId,
    donation.amount,
    determineUserTier(donation.amount),
    'euphoric'
  );
  
  // Activate special shader effects based on donation amount
  if (donation.amount >= 100) {
    // Big donation - activate all tiles with cascade effect
    const allTileIds = Array.from({ length: 64 }, (_, i) => String(i));
    gridOS.eventBus.sendGridCommand('cascade', allTileIds, 1.0, 5000, 'spiral');
  } else if (donation.amount >= 50) {
    // Medium donation - activate half the tiles
    const halfTileIds = Array.from({ length: 32 }, (_, i) => String(i));
    gridOS.eventBus.sendGridCommand('pulse', halfTileIds, 0.8, 3000);
  } else if (donation.amount >= 10) {
    // Small donation - activate a few tiles
    const fewTileIds = Array.from({ length: 8 }, (_, i) => String(i));
    gridOS.eventBus.sendGridCommand('activate', fewTileIds, 0.6);
  } else {
    // Tiny donation - activate one tile
    gridOS.eventBus.sendGridCommand('activate', ['0'], 0.4);
  }
}

/**
 * Handle viewer count from Owncast
 * @param viewerCount Viewer count
 */
function handleViewerCount(viewerCount: OwncastViewerCount): void {
  console.log(`Owncast viewer count: ${viewerCount.count}`);
  
  // Update system state based on viewer count
  gridOS.eventBus.updateState(state => ({
    ...state,
    // Increase global intensity as viewer count increases
    globalIntensity: Math.min(0.5 + (viewerCount.count / 1000), 1.0)
  }));
}

/**
 * Handle stream status from Owncast
 * @param status Stream status
 */
function handleStreamStatus(status: OwncastStreamStatus): void {
  console.log(`Owncast stream status: ${status.online ? 'online' : 'offline'}`);
  
  if (status.online) {
    // Stream started - activate grid
    const startTileIds = ['0', '1', '8', '9']; // 2x2 square in the corner
    gridOS.eventBus.sendGridCommand('activate', startTileIds);
    
    // Set mood to zen at start
    gridOS.eventBus.updateState(state => ({
      ...state,
      mood: 'zen'
    }));
  } else {
    // Stream ended - deactivate all tiles
    const allTileIds = Array.from({ length: 64 }, (_, i) => String(i));
    gridOS.eventBus.sendGridCommand('deactivate', allTileIds);
  }
}

/**
 * Determine user tier based on donation amount
 * @param amount Donation amount
 * @returns User tier
 */
function determineUserTier(amount: number): string {
  if (amount >= 500) return 'whale';
  if (amount >= 100) return 'vip';
  if (amount >= 20) return 'premium';
  return 'free';
}

/**
 * Simulate Owncast events for testing
 */
function simulateOwncastEvents(): void {
  // Simulate stream start
  setTimeout(() => {
    handleStreamStatus({ online: true, started: Date.now() });
  }, 1000);
  
  // Simulate chat messages
  const chatMessages = [
    { displayName: 'Viewer1', message: 'Hello everyone!' },
    { displayName: 'Viewer2', message: 'The stream looks great today!' },
    { displayName: 'Viewer3', message: 'Can you explain how GRID OS works?' },
    { displayName: 'Viewer4', message: 'This is amazing technology!' },
    { displayName: 'Viewer5', message: 'I love the visual effects!' }
  ];
  
  chatMessages.forEach((chat, index) => {
    setTimeout(() => {
      handleChatMessage({
        id: `msg-${index}`,
        author: {
          id: `user-${index}`,
          displayName: chat.displayName,
          displayColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        },
        body: chat.message,
        timestamp: Date.now()
      });
    }, 2000 + (index * 5000));
  });
  
  // Simulate donations
  const donations = [
    { userId: 'user-2', amount: 5, currency: 'USD' },
    { userId: 'user-5', amount: 20, currency: 'USD' },
    { userId: 'user-3', amount: 50, currency: 'USD' },
    { userId: 'user-1', amount: 100, currency: 'USD' }
  ];
  
  donations.forEach((donation, index) => {
    setTimeout(() => {
      handleDonation({
        id: `donation-${index}`,
        userId: donation.userId,
        amount: donation.amount,
        currency: donation.currency,
        timestamp: Date.now()
      });
    }, 10000 + (index * 15000));
  });
  
  // Simulate viewer count changes
  let viewerCount = 10;
  setInterval(() => {
    // Random viewer count changes
    viewerCount += Math.floor(Math.random() * 5) - 2;
    viewerCount = Math.max(5, viewerCount);
    
    handleViewerCount({
      count: viewerCount,
      timestamp: Date.now()
    });
  }, 10000);
}

/**
 * Owncast Embed Component Props
 */
interface OwncastEmbedProps {
  serverUrl?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Owncast Embed Component
 */
export const OwncastEmbed: React.FC<OwncastEmbedProps> = ({ 
  serverUrl = OWNCAST_SERVER_URL, 
  width = 640, 
  height = 480, 
  className 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Set up communication with the Owncast iframe
    if (iframeRef.current) {
      console.log('🎬 Owncast iframe mounted for server:', serverUrl);
    }
    
    return () => {
      console.log('🎬 Owncast iframe unmounted');
    };
  }, [serverUrl]);
  
  return (
    <div className={`owncast-embed-container ${className || ''}`}>
      <iframe
        ref={iframeRef}
        src={`${serverUrl}/embed/video`}
        width={width}
        height={height}
        allow="autoplay; fullscreen"
        allowFullScreen
        title="Owncast Stream"
      />
    </div>
  );
};
