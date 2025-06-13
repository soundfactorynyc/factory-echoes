// src/scripts/stores/notificationStore.ts

interface Notification {
  message: string;
  duration: number;
}

class NotificationManager {
  private queue: Notification[] = [];
  private isShowing = false;

  show(message: string, duration: number = 3000) {
    this.queue.push({ message, duration });
    this.processQueue();
  }

  private processQueue() {
    if (this.isShowing || this.queue.length === 0) return;
    
    const { message, duration } = this.queue.shift()!;
    this.isShowing = true;
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Force reflow for animation
    notification.offsetHeight;
    
    setTimeout(() => {
      notification.remove();
      this.isShowing = false;
      this.processQueue();
    }, duration);
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export convenient function
export const notify = (message: string, duration?: number) => {
  notificationManager.show(message, duration);
};
