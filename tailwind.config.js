/**
 * Tailwind CSS Configuration
 * 
 * This file configures Tailwind CSS for the PDF to Text Converter application.
 * Tailwind CSS is a utility-first CSS framework that provides low-level utility classes
 * to build custom designs without writing custom CSS.
 * 
 * Configuration includes:
 * - Content paths for purging unused styles
 * - Theme customizations and extensions
 * - Plugin integrations
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Content configuration - tells Tailwind which files to scan for class names
  content: [
    './index.html',              // Include the main HTML file
    './src/**/*.{js,ts,jsx,tsx}' // Include all JavaScript/TypeScript files in src directory
                                 // This ensures Tailwind only includes CSS for classes actually used
  ],
  
  // Theme configuration - customize Tailwind's default design system
  theme: {
    // Extend the default theme rather than replacing it
    extend: {
      // Custom theme extensions can be added here
      // Examples:
      // 
      // colors: {
      //   'brand-blue': '#1e40af',     // Custom brand colors
      //   'brand-gray': '#6b7280',
      // },
      // 
      // fontFamily: {
      //   'sans': ['Inter', 'system-ui', 'sans-serif'],  // Custom font stacks
      // },
      // 
      // spacing: {
      //   '18': '4.5rem',              // Custom spacing values
      //   '88': '22rem',
      // },
      // 
      // animation: {
      //   'fade-in': 'fadeIn 0.5s ease-in-out',  // Custom animations
      // },
      // 
      // keyframes: {
      //   fadeIn: {
      //     '0%': { opacity: '0' },
      //     '100%': { opacity: '1' },
      //   }
      // }
    },
  },
  
  // Plugins array - extend Tailwind with additional functionality
  plugins: [
    // Official and third-party plugins can be added here
    // Examples:
    // 
    // require('@tailwindcss/forms'),        // Better form styling
    // require('@tailwindcss/typography'),   // Prose styling for rich content
    // require('@tailwindcss/aspect-ratio'), // Aspect ratio utilities
  ],
};