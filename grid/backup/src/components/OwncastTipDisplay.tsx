/**
 * GRID OS: Owncast Tip Display Component
 * 
 * This component displays tip data from Owncast streams,
 * including the last tip, total tips, goal progress, and top tipper.
 */

import React from 'react';
import { useOwncastTipHandler } from '../integration/owncastTipHandler';
import type { TipData } from '../integration/owncastTipHandler';
import './OwncastTipDisplay.css';

interface OwncastTipDisplayProps {
  /**
   * Initial tip data (optional)
   */
  initialData?: Partial<TipData>;
  
  /**
   * Custom goal amount (optional)
   */
  goalAmount?: number;
  
  /**
   * Custom CSS class name (optional)
   */
  className?: string;
}

/**
 * Owncast Tip Display Component
 */
export const OwncastTipDisplay: React.FC<OwncastTipDisplayProps> = ({
  initialData = {},
  goalAmount,
  className = ''
}) => {
  // Initialize with custom goal if provided
  const initialTipData = goalAmount 
    ? { ...initialData, goal: goalAmount } 
    : initialData;
  
  // Use the tip handler hook
  const { tipData, setTipData } = useOwncastTipHandler(initialTipData);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Reset tip data
  const handleReset = () => {
    setTipData(prev => ({
      ...prev,
      lastTip: 0,
      totalTips: 0,
      goalProgress: 0,
      topTipper: ''
    }));
  };
  
  // Simulate a tip (for testing)
  const handleSimulateTip = () => {
    if (window.simulateTip) {
      const amount = Math.floor(Math.random() * 100) + 5;
      const names = ['TipMaster', 'GenerousFan', 'StreamSupporter', 'GridLover', 'OwncastFan'];
      const name = names[Math.floor(Math.random() * names.length)];
      window.simulateTip(amount, name, `Here's ${amount} for the amazing stream!`);
    }
  };
  
  return (
    <div className={`owncast-tip-display ${className}`}>
      <div className="tip-header">
        <h3>🎁 Tip Dashboard</h3>
        <div className="tip-controls">
          <button onClick={handleSimulateTip} className="tip-button simulate">
            🎲 Simulate Tip
          </button>
          <button onClick={handleReset} className="tip-button reset">
            🔄 Reset
          </button>
        </div>
      </div>
      
      <div className="tip-stats">
        <div className="tip-stat">
          <div className="stat-label">Last Tip</div>
          <div className="stat-value">{formatCurrency(tipData.lastTip)}</div>
        </div>
        
        <div className="tip-stat">
          <div className="stat-label">Total Tips</div>
          <div className="stat-value">{formatCurrency(tipData.totalTips)}</div>
        </div>
        
        <div className="tip-stat">
          <div className="stat-label">Top Tipper</div>
          <div className="stat-value">
            {tipData.topTipper || 'None yet'}
          </div>
        </div>
      </div>
      
      <div className="tip-goal">
        <div className="goal-header">
          <span>Goal: {formatCurrency(tipData.totalTips)} / {formatCurrency(tipData.goal)}</span>
          <span>{Math.round(tipData.goalProgress)}%</span>
        </div>
        <div className="goal-progress-bar">
          <div 
            className="goal-progress-fill" 
            style={{ width: `${tipData.goalProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
