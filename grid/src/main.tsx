import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index'; // Import the Grid OS initialization

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('GRID OS React app initialized');
