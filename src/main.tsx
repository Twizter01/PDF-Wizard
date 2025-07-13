/**
 * Application Entry Point
 * 
 * This file serves as the main entry point for the React application.
 * It's responsible for:
 * - Setting up the React root element
 * - Enabling React's StrictMode for development
 * - Mounting the main App component
 * - Importing global CSS styles
 * 
 * This file is referenced in index.html and loaded by Vite during development
 * and build processes.
 */

// Import StrictMode from React for enhanced development experience
// StrictMode helps identify potential problems in the application during development
import { StrictMode } from 'react';

// Import createRoot from React DOM for React 18+ rendering
// createRoot is the new API for rendering React applications
import { createRoot } from 'react-dom/client';

// Import the main App component that contains our entire application
import App from './App.tsx';

// Import global CSS styles including Tailwind CSS utilities
import './index.css';

// Get the root DOM element where our React app will be mounted
// This element is defined in index.html with id="root"
const rootElement = document.getElementById('root')!;

// Create a React root using the new createRoot API
// The exclamation mark (!) tells TypeScript that we're certain the element exists
const root = createRoot(rootElement);

// Render the application
root.render(
  // StrictMode wrapper provides additional development-time checks
  // It helps detect side effects, deprecated APIs, and other potential issues
  // Note: StrictMode only runs in development mode, not in production
  <StrictMode>
    {/* Main App component that contains our entire application */}
    <App />
  </StrictMode>
);