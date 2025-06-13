// src/scripts/stores/appStore.ts - Fixed dynamic imports
import { map } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

export interface AppState {
  theme: string;
  streamMuted: boolean;
  viewerCount: number;
  floatingPlayerVisible: boolean;
  gridOverlayVisible: boolean;
}

// Main app state store
export const appStore = map<AppState>({
  theme: 'dark',
  streamMuted: false,
  viewerCount: 1247,
  floatingPlayerVisible: false,
  gridOverlayVisible: false,
});

// Persistent settings
export const persistentSettings = persistentMap<{
  theme: string;
  volume: string;
}>('sound-factory:', {
  theme: 'dark',
  volume: '100',
});

// Helper functions
export const updateViewerCount = (count: number) => {
  appStore.setKey('viewerCount', count);
};

export const toggleFloatingPlayer = () => {
  appStore.setKey('floatingPlayerVisible', !appStore.get().floatingPlayerVisible);
};

export const toggleGridOverlay = () => {
  appStore.setKey('gridOverlayVisible', !appStore.get().gridOverlayVisible);
};

export const setTheme = (theme: string) => {
  appStore.setKey('theme', theme);
  persistentSettings.setKey('theme', theme);
};

export const toggleStreamMute = () => {
  appStore.setKey('streamMuted', !appStore.get().streamMuted);
};

// Initialize from persistent storage
if (typeof window !== 'undefined') {
  persistentSettings.subscribe((settings) => {
    if (settings.theme) {
      appStore.setKey('theme', settings.theme);
    }
  });
}
