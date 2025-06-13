// src/scripts/stores/eventBus.ts
type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  once(event: string, callback: EventCallback) {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  clear(event?: string) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export const eventBus = new EventBus();

// Grid-specific events
export const GRID_EVENTS = {
  ITEM_ADDED: 'grid:item:added',
  ITEM_DELETED: 'grid:item:deleted',
  ITEM_EDITED: 'grid:item:edited',
  ITEM_MOVED: 'grid:item:moved',
  EDIT_MODE_TOGGLED: 'grid:editMode:toggled',
  ITEMS_REORDERED: 'grid:items:reordered',
} as const;
