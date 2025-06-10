/**
 * GRID OS: Sound Factory NYC Configuration
 * 
 * Configuration for integrating with Sound Factory NYC's Owncast server
 */

/**
 * Sound Factory NYC Owncast Configuration
 */
export const SOUND_FACTORY_CONFIG = {
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
 * RTMP Stream Configuration for Sound Factory NYC
 */
export const SOUND_FACTORY_RTMP_CONFIG = {
  SERVER_URL: SOUND_FACTORY_CONFIG.rtmpUrl,
  STREAM_KEY: SOUND_FACTORY_CONFIG.streamKey,
  RECOMMENDED_SETTINGS: {
    bitrate: 2500, // kbps
    fps: 30,
    resolution: '1920x1080',
    encoder: 'x264',
    profile: 'main',
    keyframe_interval: 2
  },
  // OBS Studio settings for Sound Factory NYC
  OBS_SETTINGS: {
    server: SOUND_FACTORY_CONFIG.rtmpUrl,
    streamKey: SOUND_FACTORY_CONFIG.streamKey,
    encoder: 'Software (x264)',
    rateControl: 'CBR',
    bitrate: 2500,
    keyframeInterval: 2,
    preset: 'veryfast',
    profile: 'main',
    tune: 'none'
  }
};

/**
 * API Endpoints for Sound Factory NYC
 */
export const SOUND_FACTORY_API = {
  status: `${SOUND_FACTORY_CONFIG.owncastUrl}/api/status`,
  config: `${SOUND_FACTORY_CONFIG.owncastUrl}/api/config`,
  chat: `${SOUND_FACTORY_CONFIG.owncastUrl}/api/chat`,
  viewers: `${SOUND_FACTORY_CONFIG.owncastUrl}/api/viewers`,
  embed: `${SOUND_FACTORY_CONFIG.owncastUrl}/embed/video`,
  player: `${SOUND_FACTORY_CONFIG.owncastUrl}/embed/chat`
};

/**
 * Grid OS Integration Settings for Sound Factory NYC
 */
export const SOUND_FACTORY_GRID_SETTINGS = {
  // Chat message intensity multipliers
  chatIntensity: {
    base: 0.3,
    caps: 0.2,
    emoji: 0.4,
    donation: 0.6
  },
  
  // Viewer count thresholds for grid effects
  viewerThresholds: {
    low: 10,
    medium: 50,
    high: 100,
    massive: 500
  },
  
  // Color schemes based on Sound Factory NYC branding
  colorSchemes: {
    primary: '#ff0080', // Sound Factory pink
    secondary: '#00ffff', // Cyan
    accent: '#ffff00', // Yellow
    background: '#000000' // Black
  },
  
  // Effect timings (in milliseconds)
  effects: {
    chatFade: 3000,
    donationPulse: 5000,
    viewerCountUpdate: 1000,
    beatSync: 100 // For music sync if available
  }
};

console.log('🎵 Sound Factory NYC configuration loaded');
console.log(`📡 Server: ${SOUND_FACTORY_CONFIG.owncastUrl}`);
console.log(`🎬 RTMP: ${SOUND_FACTORY_RTMP_CONFIG.SERVER_URL}`);
