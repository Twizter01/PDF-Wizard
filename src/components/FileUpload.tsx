/**
 * FileUpload Component
 * 
 * This component handles PDF file upload functionality including:
 * - Drag and drop interface
 * - File selection dialog
 * - File validation (type, size, format)
 * - PDF processing with progress tracking
 * - Error handling and user feedback
 * 
 * The component uses PDF.js to extract text from uploaded PDF files
 * and provides real-time progress updates during processing.
 */

// Import React hooks for state management and DOM references
import React, { useState, useRef } from 'react';

// Import Lucide React icons for UI elements
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

// Import TypeScript interfaces for type safety
import { ProcessedFile } from '../types';

// Import utility functions for PDF processing
import { extractTextWithProgress, validatePDFFile } from '../utils/pdfProcessor';

/**
 * Props interface for the FileUpload component
 * Defines the callback function that parent components must provide
 */
interface FileUploadProps {
  onFilesProcessed: (files: ProcessedFile[]) => void;  // Callback when files are successfully processed
}

/**
 * FileUpload functional component
 * Implements drag-and-drop file upload with PDF processing capabilities
 * 
 * @param onFilesProcessed - Callback function to handle processed files
 */
const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed }) => {
  // State to track if user is currently dragging files over the drop zone
  const [isDragging, setIsDragging] = useState(false);
  
  // State to track if files are currently being processed
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State to track processing progress (0-100)
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // State to display current processing status message
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  // State to track the name of the file currently being processed
  const [currentFileName, setCurrentFileName] = useState<string>('');
  
  // State to store and display error messages
  const [error, setError] = useState<string | null>(null);
  
  // Reference to the hidden file input element for programmatic access
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle drag over event
   * Prevents default browser behavior and sets dragging state
   * 
   * @param e - React drag event object
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();        // Prevent default browser drag behavior
    setIsDragging(true);       // Update UI to show drag state
  };

  /**
   * Handle drag leave event
   * Resets dragging state when user drags away from drop zone
   * 
   * @param e - React drag event object
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();        // Prevent default browser behavior
    setIsDragging(false);      // Reset drag state
  };

  /**
   * Handle file drop event
   * Processes files when user drops them on the drop zone
   * 
   * @param e - React drag event object containing dropped files
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();                              // Prevent default browser behavior
    setIsDragging(false);                           // Reset drag state
    const files = Array.from(e.dataTransfer.files); // Convert FileList to Array
    processFiles(files);                            // Process the dropped files
  };

  /**
   * Handle file selection from input dialog
   * Processes files when user selects them via file dialog
   * 
   * @param e - React change event from file input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); // Convert FileList to Array (handle null case)
    processFiles(files);                            // Process the selected files
  };

  /**
   * Main file processing function
   * Validates, processes, and extracts text from PDF files
   * 
   * @param files - Array of File objects to process
   */
  const processFiles = async (files: File[]) => {
    // Filter to only include PDF files
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    // Validate that at least one PDF file was provided
    if (pdfFiles.length === 0) {
      setError('Please select valid PDF files only.');
      return;
    }

    // Limit the number of files to prevent performance issues
    if (pdfFiles.length > 10) {
      setError('Maximum 10 files allowed at once.');
      return;
    }

    // Validate each file before processing
    for (const file of pdfFiles) {
      const validation = validatePDFFile(file);  // Check file validity
      if (!validation.isValid) {
        setError(`${file.name}: ${validation.error}`);  // Show specific error
        return;
      }
    }

    // Clear any previous errors
    setError(null);
    
    // Initialize processing state
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Starting PDF processing...');

    try {
      // Array to store successfully processed files
      const processedFiles: ProcessedFile[] = [];
      
      // Process each PDF file sequentially
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];                    // Current file being processed
        setCurrentFileName(file.name);              // Update UI with current file name
        const startTime = Date.now();               // Record start time for performance tracking
        
        try {
          // Extract text from PDF with progress tracking
          const extractedText = await extractTextWithProgress(
            file,
            (progress, status) => {
              // Calculate overall progress across all files
              const fileProgress = (i / pdfFiles.length) * 100 + (progress / pdfFiles.length);
              setProcessingProgress(fileProgress);                    // Update progress bar
              setProcessingStatus(`${file.name}: ${status}`);        // Update status message
            }
          );
          
          // Calculate how long processing took
          const processingTime = Date.now() - startTime;
          
          // Create processed file object and add to results
          processedFiles.push({
            name: file.name,              // Original file name
            extractedText,                // Extracted text content
            originalFile: file,           // Reference to original file
            processingTime                // Time taken to process
          });
        } catch (err) {
          // Handle individual file processing errors
          console.error(`Error processing ${file.name}:`, err);
          setError(`Failed to process ${file.name}: ${err.message}`);
          setIsProcessing(false);
          return;
        }
      }

      // Update status to indicate completion
      setProcessingStatus('All files processed successfully!');
      
      // Pass processed files to parent component
      onFilesProcessed(processedFiles);
    } catch (err) {
      // Handle unexpected errors
      setError('An unexpected error occurred. Please try again.');
      console.error('Processing error:', err);
    } finally {
      // Reset processing state regardless of success or failure
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStatus('');
      setCurrentFileName('');
    }
  };

  // Render the component UI
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Component header with icon and title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Upload className="mr-2 h-5 w-5" />  {/* Upload icon */}
        Upload PDF Files
      </h2>

      {/* Error message display - only shown when error exists */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />  {/* Warning icon */}
          <span className="text-sm">{error}</span>                {/* Error message text */}
        </div>
      )}

      {/* Main drop zone area */}
      <div
        onDragOver={handleDragOver}      // Handle drag over events
        onDragLeave={handleDragLeave}    // Handle drag leave events
        onDrop={handleDrop}              // Handle file drop events
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-50'                    // Styling when dragging
            : 'border-gray-300 hover:border-gray-400'         // Default styling
        } ${isProcessing ? 'pointer-events-none opacity-75' : ''}`}  // Disable interaction during processing
      >
        {/* Hidden file input for programmatic file selection */}
        <input
          ref={fileInputRef}              // Reference for programmatic access
          type="file"                     // File input type
          multiple                        // Allow multiple file selection
          accept=".pdf"                   // Only accept PDF files
          onChange={handleFileSelect}     // Handle file selection
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"  // Hidden but clickable
          disabled={isProcessing}         // Disable during processing
        />

        {/* Conditional content based on processing state */}
        {isProcessing ? (
          // Processing state UI
          <div className="space-y-4">
            {/* Spinning loading indicator */}
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            
            <div>
              {/* Main processing message */}
              <p className="text-gray-600 font-medium">Processing PDF files...</p>
              
              {/* Current file name display */}
              {currentFileName && (
                <p className="text-sm text-gray-500 mt-1">Current: {currentFileName}</p>
              )}
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}  // Dynamic width based on progress
                ></div>
              </div>
              
              {/* Progress percentage */}
              <p className="text-sm text-gray-500 mt-1">{Math.round(processingProgress)}% complete</p>
              
              {/* Detailed status message */}
              {processingStatus && (
                <p className="text-xs text-blue-600 mt-1">{processingStatus}</p>
              )}
            </div>
          </div>
        ) : (
          // Default state UI (when not processing)
          <div className="space-y-4">
            {/* File icon */}
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            
            <div>
              {/* Main instruction text */}
              <p className="text-lg font-medium text-gray-700">
                Drop PDF files here or click to upload
              </p>
              
              {/* Additional information */}
              <p className="text-sm text-gray-500 mt-1">
                Supports multiple files (max 10), up to 10MB each
              </p>
            </div>
            
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}  // Trigger file dialog
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />  {/* Upload icon */}
              Select Files
            </button>
          </div>
        )}
      </div>

      {/* Information section with usage guidelines */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• Supported format: PDF</p>
        <p>• Maximum file size: 50MB per file</p>
        <p>• Text extraction preserves basic formatting</p>
        <p>• Supports encrypted PDFs (password-protected files may require manual input)</p>
      </div>
    </div>
  );
};

// Export the component as default export
export default FileUpload;