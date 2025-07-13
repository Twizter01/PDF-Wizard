/**
 * Vite Configuration File
 * 
 * This file configures the Vite build tool for the PDF to Text Converter application.
 * Vite is a modern build tool that provides fast development server and optimized builds.
 * 
 * Configuration includes:
 * - React plugin for JSX transformation and Fast Refresh
 * - Optimization settings for PDF.js integration
 * - Development server settings
 */

// Import the defineConfig helper from Vite for type-safe configuration
import { defineConfig } from 'vite';

// Import the official React plugin for Vite
// This plugin provides JSX transformation and React Fast Refresh during development
import react from '@vitejs/plugin-react';

// Export the Vite configuration
// defineConfig provides TypeScript support and IntelliSense for configuration options
export default defineConfig({
  // Plugins array - add functionality to Vite
  plugins: [
    // React plugin configuration
    react(), // Enables JSX transformation and Fast Refresh for React development
  ],
  
  // Optimization settings for dependency pre-bundling
  optimizeDeps: {
    // Exclude specific dependencies from pre-bundling
    exclude: [
      'lucide-react', // Exclude Lucide React icons from pre-bundling
                      // This prevents bundling issues with the icon library
                      // and allows for better tree-shaking of unused icons
    ],
  },
  
  // Additional configuration options that could be added:
  // 
  // server: {
  //   port: 3000,           // Custom development server port
  //   open: true,           // Automatically open browser on server start
  // },
  // 
  // build: {
  //   outDir: 'dist',       // Output directory for production builds
  //   sourcemap: true,      // Generate source maps for debugging
  // },
  // 
  // define: {
  //   __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  // },
});