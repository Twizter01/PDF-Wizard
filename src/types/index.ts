/**
 * TypeScript Type Definitions
 * 
 * This file contains all the TypeScript interfaces and type definitions
 * used throughout the PDF to Text Converter application.
 * 
 * These types provide:
 * - Type safety for component props and state
 * - Clear contracts between different parts of the application
 * - Better IDE support with autocomplete and error checking
 * - Documentation of data structures used in the app
 */

/**
 * ProcessedFile Interface
 * 
 * Represents a PDF file that has been successfully processed and had its text extracted.
 * This interface defines the structure of data that flows between components
 * after a PDF file has been uploaded and processed.
 * 
 * Used by:
 * - FileUpload component (creates these objects)
 * - App component (stores array of these in state)
 * - TextEditor component (receives text and filename)
 * - ExportPanel component (receives text and filename)
 */
export interface ProcessedFile {
  name: string;              // Original filename of the uploaded PDF (e.g., "document.pdf")
  extractedText: string;     // Complete text content extracted from the PDF
  originalFile: File;        // Reference to the original File object for potential re-processing
  processingTime: number;    // Time in milliseconds it took to process this file
}

/**
 * ExportFormat Interface
 * 
 * Defines the configuration for each supported export format.
 * This interface standardizes how different export formats are defined
 * and provides all necessary information for generating downloads.
 * 
 * Used by:
 * - ExportPanel component (defines available export options)
 * - Export processing functions (determines how to format content)
 */
export interface ExportFormat {
  id: string;           // Unique identifier for this format (e.g., "txt", "html", "docx")
  name: string;         // Human-readable name displayed to users (e.g., "Plain Text")
  extension: string;    // File extension for downloaded files (e.g., "txt", "html")
  mimeType: string;     // MIME type for the browser download (e.g., "text/plain")
  icon: string;         // Icon identifier for UI display (maps to Lucide icon names)
}

/**
 * Additional type definitions that could be added in the future:
 * 
 * - PDFMetadata: For storing detailed PDF document metadata
 * - ProcessingOptions: For configuring text extraction behavior
 * - ExportOptions: For customizing export behavior per format
 * - ValidationResult: For standardizing file validation responses
 * - ProgressCallback: For typing progress update functions
 */