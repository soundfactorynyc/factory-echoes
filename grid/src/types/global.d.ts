// Global type definitions for Sound Factory

declare global {
  interface Window {
    showFloatingPlayer?: () => void;
    hideFloatingPlayer?: () => void;
    showGridOverlay?: () => void;
    hideGridOverlay?: () => void;
  }

  interface HTMLElement {
    closest(selector: string): HTMLElement | null;
  }

  interface EventTarget {
    closest?: (selector: string) => HTMLElement | null;
    classList?: DOMTokenList;
  }
}

export {};
