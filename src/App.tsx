/**
 * Main Application Component
 * 
 * This is the root component of the PDF to Text Converter application.
 * It manages the overall state and coordinates between child components.
 * 
 * Key Responsibilities:
 * - Managing processed files state
 * - Handling file navigation between multiple PDFs
 * - Coordinating data flow between upload, editor, and export components
 */

// Import React library and useState hook for state management
import React, { useState } from 'react';

// Import custom components for different sections of the app
import FileUpload from './components/FileUpload';     // Handles PDF file upload and processing
import TextEditor from './components/TextEditor';     // Displays and allows editing of extracted text
import ExportPanel from './components/ExportPanel';   // Provides export functionality

// Import TypeScript interface for type safety
import { ProcessedFile } from './types';              // Defines the structure of processed file data

/**
 * Main App functional component
 * Uses React hooks for state management
 */
function App() {
  // State to store array of processed PDF files
  // ProcessedFile[] - array of objects containing file data and extracted text
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  
  // State to track which file is currently being viewed/edited
  // number - index of the active file in the processedFiles array
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  /**
   * Callback function triggered when files are successfully processed
   * Updates the main state with new processed files and resets active file to first one
   * 
   * @param files - Array of ProcessedFile objects containing extracted text and metadata
   */
  const handleFilesProcessed = (files: ProcessedFile[]) => {
    setProcessedFiles(files);    // Update the processed files state
    setActiveFileIndex(0);       // Reset to first file when new files are processed
  };

  /**
   * Callback function triggered when user edits text in the editor
   * Updates the extracted text for the currently active file
   * 
   * @param newText - The updated text content from the editor
   */
  const handleTextChange = (newText: string) => {
    // Only proceed if there are processed files available
    if (processedFiles.length > 0) {
      // Create a copy of the current files array to avoid direct state mutation
      const updatedFiles = [...processedFiles];
      
      // Update the specific file at the active index with new text
      updatedFiles[activeFileIndex] = {
        ...updatedFiles[activeFileIndex],  // Spread existing properties
        extractedText: newText             // Override with new text
      };
      
      // Update state with the modified array
      setProcessedFiles(updatedFiles);
    }
  };

  // Get reference to the currently active file for easy access
  // Will be undefined if no files are processed yet
  const activeFile = processedFiles[activeFileIndex];

  // Render the main application UI
  return (
    // Main container with full screen height and gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Container for content with responsive padding and centering */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Header section with title and description */}
        <header className="text-center mb-12">
          {/* Main title with gradient text effect */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            PDF to Text Converter
          </h1>
          
          {/* Subtitle with application description */}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload your PDF documents and convert them to editable text with export options for Word, HTML, and plain text formats.
          </p>
        </header>

        {/* Main content grid - responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left column - Upload and file navigation */}
          <div className="lg:col-span-1">
            {/* File upload component with callback for processed files */}
            <FileUpload onFilesProcessed={handleFilesProcessed} />
            
            {/* File navigation - only show if multiple files are processed */}
            {processedFiles.length > 1 && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                {/* Section title */}
                <h3 className="font-semibold text-gray-800 mb-3">Processed Files</h3>
                
                {/* List of processed files */}
                <div className="space-y-2">
                  {/* Map through each processed file to create navigation buttons */}
                  {processedFiles.map((file, index) => (
                    <button
                      key={index}                                    // Unique key for React list rendering
                      onClick={() => setActiveFileIndex(index)}     // Set this file as active when clicked
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        index === activeFileIndex
                          ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'    // Active file styling
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'  // Inactive file styling
                      }`}
                    >
                      {/* File name display */}
                      <div className="font-medium truncate">{file.name}</div>
                      
                      {/* Character count display */}
                      <div className="text-sm text-gray-500">
                        {file.extractedText.length} characters
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Text editor and export panel */}
          <div className="lg:col-span-2">
            {/* Conditional rendering based on whether a file is selected */}
            {activeFile ? (
              <>
                {/* Text editor component for viewing/editing extracted text */}
                <TextEditor
                  text={activeFile.extractedText}           // Current text content
                  filename={activeFile.name}                // File name for display
                  onTextChange={handleTextChange}           // Callback for text changes
                />
                
                {/* Export panel for downloading in different formats */}
                <div className="mt-6">
                  <ExportPanel
                    text={activeFile.extractedText}                    // Text to export
                    filename={activeFile.name.replace('.pdf', '')}    // Filename without .pdf extension
                  />
                </div>
              </>
            ) : (
              // Placeholder when no file is selected
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                {/* Large document emoji */}
                <div className="text-6xl mb-4">📄</div>
                
                {/* Placeholder title */}
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No PDF Selected
                </h3>
                
                {/* Instruction text */}
                <p className="text-gray-500">
                  Upload a PDF file to start extracting and editing text
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the App component as the default export
// This allows other files to import this component
export default App;