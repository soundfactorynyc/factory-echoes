/**
 * Sound Factory Platform Owncast Demo
 * 
 * This script demonstrates the integration between the Sound Factory Platform
 * and the Owncast tip handler system.
 */

import { soundFactoryPlatform } from './soundFactoryPlatform.js';

// Initialize the platform when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing Sound Factory Platform Owncast Demo...');
  
  try {
    // Initialize the Sound Factory Platform
    await soundFactoryPlatform.initialize();
    console.log('✅ Sound Factory Platform initialized successfully');
    
    // Set up UI elements if they exist
    setupUI();
    
    // Set up demo sequence
    setupDemoSequence();
    
  } catch (error) {
    console.error('❌ Error initializing Sound Factory Platform:', error);
  }
});

/**
 * Set up UI elements for the demo
 */
function setupUI() {
  // Get UI elements
  const tipButton = document.getElementById('send-tip-button');
  const randomTipButton = document.getElementById('random-tip-button');
  const resetButton = document.getElementById('reset-tips-button');
  const tipAmountInput = document.getElementById('tip-amount');
  const tipUsernameInput = document.getElementById('tip-username');
  const tipMessageInput = document.getElementById('tip-message');
  const tipStatsElement = document.getElementById('tip-stats');
  const consoleOutput = document.getElementById('console-output');
  
  // Add event listeners if elements exist
  if (tipButton) {
    tipButton.addEventListener('click', () => {
      const amount = parseFloat(tipAmountInput?.value || '25');
      const username = tipUsernameInput?.value || 'DemoUser';
      const message = tipMessageInput?.value || 'Great stream!';
      
      // Send tip
      soundFactoryPlatform.simulateTip(amount, username, message);
      
      // Log to console
      logToConsole(`💰 Tip sent: $${amount} from ${username}`);
      
      // Update UI
      updateTipStats();
    });
  }
  
  if (randomTipButton) {
    randomTipButton.addEventListener('click', () => {
      // Generate random values
      const amounts = [5, 10, 20, 50, 100, 200, 500];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      
      const usernames = [
        'RandomTipper', 'GenerousFan', 'MusicLover', 'StreamSupporter',
        'SoundFactoryVIP', 'BeatMaster', 'RhythmKing', 'MelodyMaker'
      ];
      const username = usernames[Math.floor(Math.random() * usernames.length)];
      
      const messages = [
        'Love the stream!', 'Keep up the great work!', 'Amazing music!',
        'You\'re the best!', 'This made my day!', 'Legendary stream!',
        'Can\'t stop dancing!', 'The vibes are immaculate!'
      ];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      // Send tip
      soundFactoryPlatform.simulateTip(amount, username, message);
      
      // Log to console
      logToConsole(`💰 Random tip sent: $${amount} from ${username}`);
      
      // Update UI
      updateTipStats();
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      // Reset tip stats
      soundFactoryPlatform.resetTipStats();
      
      // Log to console
      logToConsole('💰 Tip stats reset');
      
      // Update UI
      updateTipStats();
    });
  }
  
  // Initial update
  updateTipStats();
}

/**
 * Update tip stats in the UI
 */
function updateTipStats() {
  const tipStatsElement = document.getElementById('tip-stats');
  if (!tipStatsElement) return;
  
  const tipStats = soundFactoryPlatform.getTipStats();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Update the UI
  tipStatsElement.innerHTML = `
    <div class="tip-stat">
      <div class="stat-label">Last Tip</div>
      <div class="stat-value">${formatCurrency(tipStats.lastTip)}</div>
    </div>
    
    <div class="tip-stat">
      <div class="stat-label">Total Tips</div>
      <div class="stat-value">${formatCurrency(tipStats.totalTips)}</div>
    </div>
    
    <div class="tip-stat">
      <div class="stat-label">Top Tipper</div>
      <div class="stat-value">${tipStats.topTipper || 'None yet'}</div>
    </div>
    
    <div class="tip-goal">
      <div class="goal-header">
        <span>Goal: ${formatCurrency(tipStats.totalTips)} / ${formatCurrency(tipStats.goal)}</span>
        <span>${Math.round(tipStats.goalProgress)}%</span>
      </div>
      <div class="goal-progress-bar">
        <div 
          class="goal-progress-fill" 
          style="width: ${tipStats.goalProgress}%"
        ></div>
      </div>
    </div>
  `;
}

/**
 * Log message to console output element
 * @param {string} message Message to log
 */
function logToConsole(message) {
  const consoleOutput = document.getElementById('console-output');
  if (!consoleOutput) {
    console.log(message);
    return;
  }
  
  const timestamp = new Date().toLocaleTimeString();
  const logItem = document.createElement('div');
  logItem.className = 'log-item';
  logItem.textContent = `[${timestamp}] ${message}`;
  
  consoleOutput.appendChild(logItem);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

/**
 * Set up demo sequence to showcase features
 */
function setupDemoSequence() {
  // Only run the demo sequence if in demo mode
  if (!window.location.search.includes('demo=true')) return;
  
  logToConsole('🎬 Starting demo sequence...');
  
  // Demo sequence with delays
  setTimeout(() => {
    logToConsole('🎬 Simulating first tip...');
    soundFactoryPlatform.simulateTip(25, 'DemoUser1', 'First tip of the stream!');
    updateTipStats();
  }, 2000);
  
  setTimeout(() => {
    logToConsole('🎬 Creating a standard drink...');
    const drink = soundFactoryPlatform.systems.drinks.createDrink('standard');
    soundFactoryPlatform.systems.drinks.serveDrink(drink.id);
  }, 4000);
  
  setTimeout(() => {
    logToConsole('🎬 Simulating medium tip...');
    soundFactoryPlatform.simulateTip(50, 'DemoUser2', 'Love the music!');
    updateTipStats();
  }, 6000);
  
  setTimeout(() => {
    logToConsole('🎬 Triggering water reaction...');
    soundFactoryPlatform.gridOS.triggerReaction('water', { 
      intensity: 0.7, 
      duration: 3000 
    });
  }, 8000);
  
  setTimeout(() => {
    logToConsole('🎬 Simulating large tip...');
    soundFactoryPlatform.simulateTip(100, 'VIPUser', 'Keep up the amazing work!');
    updateTipStats();
  }, 10000);
  
  setTimeout(() => {
    logToConsole('🎬 Creating a legendary drink...');
    const drink = soundFactoryPlatform.systems.drinks.createDrink('legendary', { tipper: 'VIPUser' });
    soundFactoryPlatform.systems.drinks.serveDrink(drink.id);
  }, 12000);
  
  setTimeout(() => {
    logToConsole('🎬 Changing mood to party...');
    soundFactoryPlatform.gridOS.eventBus.emit('moodChange', { mood: 'party' });
  }, 14000);
  
  setTimeout(() => {
    logToConsole('🎬 Demo sequence completed!');
  }, 16000);
}

// Export for global access
window.soundFactoryOwncastDemo = {
  sendTip: (amount, username, message) => {
    soundFactoryPlatform.simulateTip(amount, username, message);
    updateTipStats();
    logToConsole(`💰 Tip sent: $${amount} from ${username}`);
  },
  resetTips: () => {
    soundFactoryPlatform.resetTipStats();
    updateTipStats();
    logToConsole('💰 Tip stats reset');
  },
  triggerReaction: (type, intensity = 0.8, duration = 3000) => {
    soundFactoryPlatform.gridOS.triggerReaction(type, { intensity, duration });
    logToConsole(`🎭 Triggered ${type} reaction with intensity ${intensity}`);
  },
  changeMood: (mood) => {
    soundFactoryPlatform.gridOS.eventBus.emit('moodChange', { mood });
    logToConsole(`🎭 Changed mood to ${mood}`);
  },
  createDrink: (type) => {
    const drink = soundFactoryPlatform.systems.drinks.createDrink(type);
    soundFactoryPlatform.systems.drinks.serveDrink(drink.id);
    logToConsole(`🍹 Created and served a ${type} drink`);
  }
};
