/**
 * ExportPanel Component
 * 
 * This component provides export functionality for extracted text content.
 * It supports multiple export formats including:
 * - Plain text (.txt)
 * - HTML document (.html)
 * - Word document (.docx)
 * 
 * The component handles format-specific content generation and uses
 * the file-saver library for client-side file downloads.
 */

// Import React hooks for state management
import React, { useState } from 'react';

// Import Lucide React icons for UI elements
import { Download, FileText, FileCode, File } from 'lucide-react';

// Import file-saver library for downloading files
import { saveAs } from 'file-saver';

// Import TypeScript interfaces for type safety
import { ExportFormat } from '../types';

/**
 * Props interface for the ExportPanel component
 * Defines the required props that parent components must provide
 */
interface ExportPanelProps {
  text: string;      // The text content to export
  filename: string;  // Base filename (without extension) for exported files
}

/**
 * ExportPanel functional component
 * Provides multiple export format options with format-specific processing
 * 
 * @param text - The text content to export
 * @param filename - Base filename for exported files
 */
const ExportPanel: React.FC<ExportPanelProps> = ({ text, filename }) => {
  // State to track which export format is currently being processed
  // null when no export is in progress, string ID when exporting
  const [isExporting, setIsExporting] = useState<string | null>(null);

  /**
   * Configuration array for supported export formats
   * Each format defines its properties and metadata
   */
  const exportFormats: ExportFormat[] = [
    {
      id: 'txt',                    // Unique identifier for this format
      name: 'Plain Text',           // Display name for users
      extension: 'txt',             // File extension
      mimeType: 'text/plain',       // MIME type for browser
      icon: 'FileText'              // Icon identifier
    },
    {
      id: 'html',
      name: 'HTML Document',
      extension: 'html',
      mimeType: 'text/html',
      icon: 'FileCode'
    },
    {
      id: 'docx',
      name: 'Word Document',
      extension: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      icon: 'File'
    }
  ];

  /**
   * Generate and download file in specified format
   * Handles format-specific content generation and blob creation
   * 
   * @param format - ExportFormat object defining the target format
   */
  const exportAsText = (format: ExportFormat) => {
    let content = text;  // Start with original text content
    let blob: Blob;      // Will hold the final file content

    // Generate format-specific content
    switch (format.id) {
      case 'txt':
        // Plain text - use content as-is
        blob = new Blob([content], { type: format.mimeType });
        break;
        
      case 'html':
        // HTML format - wrap text in complete HTML document structure
        content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body {
            font-family: Arial, sans-serif;    /* Readable font */
            line-height: 1.6;                  /* Improved readability */
            max-width: 800px;                  /* Limit line length */
            margin: 0 auto;                    /* Center content */
            padding: 20px;                     /* Add padding */
            color: #333;                       /* Dark gray text */
        }
        pre {
            white-space: pre-wrap;             /* Preserve formatting */
            word-wrap: break-word;             /* Handle long words */
        }
    </style>
</head>
<body>
    <h1>${filename}</h1>
    <pre>${text.replace(/</g, '<').replace(/>/g, '>')}</pre>  {/* Escape HTML characters */}
</body>
</html>`;
        blob = new Blob([content], { type: format.mimeType });
        break;
        
      case 'docx':
        // DOCX format - create simple HTML that Word can import
        // Note: This creates a basic Word-compatible file, not a true DOCX
        const htmlContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>${filename}</title>
            </head>
            <body>
              <h1>${filename}</h1>
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${text}</pre>
            </body>
          </html>
        `;
        // Add BOM (Byte Order Mark) for better Word compatibility
        blob = new Blob(['\ufeff', htmlContent], { type: format.mimeType });
        break;
        
      default:
        // Fallback to plain text for unknown formats
        blob = new Blob([content], { type: 'text/plain' });
    }

    // Trigger file download using file-saver library
    saveAs(blob, `${filename}.${format.extension}`);
  };

  /**
   * Handle export button click
   * Manages export state and calls the appropriate export function
   * 
   * @param format - ExportFormat object for the selected format
   */
  const handleExport = async (format: ExportFormat) => {
    // Set loading state for this specific format
    setIsExporting(format.id);
    
    try {
      // Simulate processing time for better UX (shows loading state)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Perform the actual export
      exportAsText(format);
    } catch (error) {
      // Log any errors that occur during export
      console.error('Export failed:', error);
    } finally {
      // Always reset loading state
      setIsExporting(null);
    }
  };

  /**
   * Get the appropriate icon component for a given icon name
   * Maps string identifiers to actual Lucide React icon components
   * 
   * @param iconName - String identifier for the icon
   * @returns React component for the icon
   */
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return FileText;
      case 'FileCode':
        return FileCode;
      case 'File':
        return File;
      default:
        return FileText;  // Default fallback icon
    }
  };

  // Render the component UI
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      
      {/* Component header */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Download className="mr-2 h-5 w-5" />  {/* Download icon */}
        Export Options
      </h3>

      {/* Export format buttons grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Map through each export format to create buttons */}
        {exportFormats.map((format) => {
          const IconComponent = getIcon(format.icon);        // Get icon component
          const isLoading = isExporting === format.id;       // Check if this format is loading

          return (
            <button
              key={format.id}                               // Unique key for React list rendering
              onClick={() => handleExport(format)}          // Handle export on click
              disabled={isLoading || !text.trim()}          // Disable if loading or no text
              className={`group relative p-4 border-2 border-gray-200 rounded-lg transition-all duration-200 ${
                !text.trim()
                  ? 'opacity-50 cursor-not-allowed'                                    // Disabled styling
                  : 'hover:border-blue-300 hover:shadow-md cursor-pointer'            // Enabled styling
              }`}
            >
              {/* Loading overlay - shown when this format is being exported */}
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                  {/* Spinning loading indicator */}
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {/* Button content */}
              <div className="flex flex-col items-center text-center">
                
                {/* Icon container with dynamic styling */}
                <div className={`p-3 rounded-full mb-3 transition-colors duration-200 ${
                  !text.trim() 
                    ? 'bg-gray-100'                                           // Disabled icon background
                    : 'bg-gray-100 group-hover:bg-blue-100'                  // Enabled icon background
                }`}>
                  {/* Icon with dynamic coloring */}
                  <IconComponent className={`h-6 w-6 ${
                    !text.trim() 
                      ? 'text-gray-400'                                       // Disabled icon color
                      : 'text-gray-600 group-hover:text-blue-600'            // Enabled icon color
                  }`} />
                </div>
                
                {/* Format name */}
                <h4 className="font-medium text-gray-800 mb-1">{format.name}</h4>
                
                {/* File extension */}
                <p className="text-sm text-gray-500">.{format.extension}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Message shown when no text is available for export */}
      {!text.trim() && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Upload and process a PDF file to enable export options
        </p>
      )}

      {/* Information panel about export formats */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Export Information</h4>
        
        {/* List of format descriptions */}
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Plain Text: Basic text format, preserves line breaks</li>
          <li>• HTML: Web-friendly format with basic styling</li>
          <li>• Word Document: Compatible with Microsoft Word and similar applications</li>
        </ul>
      </div>
    </div>
  );
};

// Export the component as default export
export default ExportPanel;