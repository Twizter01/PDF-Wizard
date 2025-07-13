/**
 * PDF Processing Utilities
 * 
 * This module provides comprehensive PDF text extraction functionality using PDF.js.
 * It includes utilities for:
 * - Loading and parsing PDF documents
 * - Extracting text with formatting preservation
 * - Progress tracking for large files
 * - File validation and error handling
 * - Metadata extraction
 * 
 * The module uses PDF.js library with WebAssembly for high-performance PDF processing
 * in the browser environment.
 */

// Import PDF.js library for PDF processing
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using CDN URL to avoid bundling issues
// The worker handles the heavy PDF parsing in a separate thread
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Configuration interface for text extraction options
 * Allows customization of the extraction process
 */
interface TextExtractionOptions {
  preserveFormatting: boolean;    // Whether to maintain original text layout
  includeMetadata: boolean;       // Whether to extract document metadata
  combineTextItems: boolean;      // Whether to intelligently combine text elements
}

/**
 * Interface for detailed extracted text data
 * Provides comprehensive information about the extracted content
 */
export interface ExtractedTextData {
  text: string;                   // Complete extracted text
  metadata?: {                    // Optional document metadata
    pageCount: number;            // Total number of pages
    title?: string;               // Document title
    author?: string;              // Document author
    subject?: string;             // Document subject
    creator?: string;             // Application that created the PDF
    producer?: string;            // Application that produced the PDF
    creationDate?: string;        // When the document was created
    modificationDate?: string;    // When the document was last modified
  };
  pages: Array<{                  // Per-page information
    pageNumber: number;           // Page number (1-based)
    text: string;                 // Text content for this page
    characterCount: number;       // Number of characters on this page
  }>;
}

/**
 * Simple text extraction function
 * Extracts text from a PDF file with default options
 * 
 * @param file - PDF file to process
 * @param options - Optional extraction configuration
 * @returns Promise resolving to extracted text string
 */
export const extractTextFromPDF = async (
  file: File, 
  options: TextExtractionOptions = {
    preserveFormatting: true,     // Default: preserve original formatting
    includeMetadata: true,        // Default: include document metadata
    combineTextItems: true        // Default: combine text intelligently
  }
): Promise<string> => {
  try {
    // Use the detailed extraction function and return just the text
    const extractedData = await extractDetailedTextFromPDF(file, options);
    return extractedData.text;
  } catch (error) {
    // Log the error for debugging
    console.error('PDF text extraction failed:', error);
    
    // Throw a user-friendly error message
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
  }
};

/**
 * Detailed text extraction function
 * Extracts text along with metadata and per-page information
 * 
 * @param file - PDF file to process
 * @param options - Extraction configuration options
 * @returns Promise resolving to detailed extraction data
 */
export const extractDetailedTextFromPDF = async (
  file: File,
  options: TextExtractionOptions = {
    preserveFormatting: true,
    includeMetadata: true,
    combineTextItems: true
  }
): Promise<ExtractedTextData> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert the File object to ArrayBuffer for PDF.js
      const arrayBuffer = await fileToArrayBuffer(file);
      
      // Create PDF.js loading task with configuration
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,                                                              // PDF data
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`, // Character maps for fonts
        cMapPacked: true,                                                               // Use packed character maps
      });
      
      // Wait for PDF document to load
      const pdfDocument = await loadingTask.promise;
      
      // Extract metadata if requested
      let metadata;
      if (options.includeMetadata) {
        try {
          // Get PDF metadata from the document
          const pdfMetadata = await pdfDocument.getMetadata();
          
          // Structure metadata in a consistent format
          metadata = {
            pageCount: pdfDocument.numPages,                              // Always include page count
            title: pdfMetadata.info?.Title || undefined,                  // Document title
            author: pdfMetadata.info?.Author || undefined,                // Document author
            subject: pdfMetadata.info?.Subject || undefined,              // Document subject
            creator: pdfMetadata.info?.Creator || undefined,              // Creating application
            producer: pdfMetadata.info?.Producer || undefined,            // Producing application
            creationDate: pdfMetadata.info?.CreationDate || undefined,    // Creation timestamp
            modificationDate: pdfMetadata.info?.ModDate || undefined,     // Modification timestamp
          };
        } catch (metaError) {
          // If metadata extraction fails, continue with basic info
          console.warn('Could not extract PDF metadata:', metaError);
          metadata = { pageCount: pdfDocument.numPages };
        }
      }
      
      // Initialize arrays for storing results
      const pages: Array<{ pageNumber: number; text: string; characterCount: number }> = [];
      let fullText = '';
      
      // Process each page sequentially
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        try {
          // Get the page object
          const page = await pdfDocument.getPage(pageNum);
          
          // Extract text content from the page
          const textContent = await page.getTextContent();
          
          // Process the raw text content with our custom algorithm
          const pageText = processTextContent(textContent, options);
          
          // Store page-specific information
          pages.push({
            pageNumber: pageNum,
            text: pageText,
            characterCount: pageText.length
          });
          
          // Add page separator for multi-page documents (except first page)
          if (pageNum > 1 && pageText.trim()) {
            fullText += '\n\n--- Page ' + pageNum + ' ---\n\n';
          }
          
          // Append page text to full document text
          fullText += pageText;
          
        } catch (pageError) {
          // Handle individual page processing errors
          console.warn(`Error processing page ${pageNum}:`, pageError);
          
          // Add error placeholder for failed pages
          pages.push({
            pageNumber: pageNum,
            text: `[Error extracting text from page ${pageNum}]`,
            characterCount: 0
          });
        }
      }
      
      // Return the complete extraction results
      resolve({
        text: fullText.trim(),    // Remove leading/trailing whitespace
        metadata,                 // Document metadata (if requested)
        pages                     // Per-page information
      });
      
    } catch (error) {
      // Handle any errors during the extraction process
      reject(new Error(`PDF processing failed: ${error.message}`));
    }
  });
};

/**
 * Convert File object to ArrayBuffer
 * Required for PDF.js which expects binary data
 * 
 * @param file - File object to convert
 * @returns Promise resolving to ArrayBuffer
 */
const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    // Create FileReader instance
    const reader = new FileReader();
    
    // Handle successful read
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    
    // Handle read errors
    reader.onerror = () => reject(new Error('File reading failed'));
    
    // Start reading the file as ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Process raw text content from PDF.js
 * Applies intelligent text reconstruction and formatting
 * 
 * @param textContent - Raw text content from PDF.js
 * @param options - Processing options
 * @returns Processed text string
 */
const processTextContent = (textContent: any, options: TextExtractionOptions): string => {
  // Validate input
  if (!textContent || !textContent.items) {
    return '';
  }
  
  let text = '';           // Accumulated text result
  let lastY = null;        // Y coordinate of previous text item
  let lastX = null;        // X coordinate of previous text item
  
  // Process text items in their original order to avoid stack overflow
  for (let i = 0; i < textContent.items.length; i++) {
    const item = textContent.items[i];    // Current text item
    const itemText = item.str;            // Text string from this item
    
    // Skip empty text items
    if (!itemText.trim()) continue;
    
    // Get position information for layout analysis
    const currentY = item.transform[5];   // Y coordinate (vertical position)
    const currentX = item.transform[4];   // X coordinate (horizontal position)
    
    // Process text character by character for maximum precision
    let processedText = '';
    for (let charIndex = 0; charIndex < itemText.length; charIndex++) {
      const char = itemText[charIndex];
      
      // Handle different character types appropriately
      if (char.charCodeAt(0) > 127) {
        // Unicode characters (non-ASCII) - preserve as-is
        processedText += char;
      } else if (char === ' ') {
        // Regular spaces - preserve
        processedText += ' ';
      } else if (char.match(/[a-zA-Z0-9\.,;:!?\-'"()[\]{}]/)) {
        // Standard printable characters - preserve
        processedText += char;
      } else {
        // Other characters (special symbols, etc.) - preserve
        processedText += char;
      }
    }
    
    // Apply formatting preservation if enabled
    if (options.preserveFormatting) {
      // Detect line breaks based on vertical position changes
      if (lastY !== null && Math.abs(currentY - lastY) > 5) {
        // Significant vertical movement indicates new line
        text += '\n';
      } else if (lastX !== null && currentX - lastX > 20) {
        // Significant horizontal gap might indicate tab or column separation
        text += ' ';
      }
    }
    
    // Apply intelligent text combination if enabled
    if (options.combineTextItems && i > 0) {
      // Add space between text items on the same line if needed
      if (lastY !== null && Math.abs(currentY - lastY) <= 5 && !text.endsWith(' ') && !processedText.startsWith(' ')) {
        text += ' ';
      }
    }
    
    // Append the processed text
    text += processedText;
    
    // Update position tracking for next iteration
    lastY = currentY;
    lastX = currentX + (item.width || 0);  // Add item width to X position
  }
  
  // Clean up the final text
  return cleanExtractedText(text);
};

/**
 * Clean and normalize extracted text
 * Removes excessive whitespace and normalizes formatting
 * 
 * @param text - Raw extracted text
 * @returns Cleaned text string
 */
const cleanExtractedText = (text: string): string => {
  return text
    // Normalize multiple spaces/tabs to single spaces
    .replace(/[ \t]+/g, ' ')
    // Reduce excessive line breaks (more than 2) to double line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove leading and trailing whitespace from entire text
    .trim();
};

/**
 * Validate PDF file before processing
 * Checks file type, size, and basic validity
 * 
 * @param file - File to validate
 * @returns Validation result with success flag and error message
 */
export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  // Verify file type
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'File must be a PDF document' };
  }
  
  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 50MB' };
  }
  
  // Check for empty files
  if (file.size === 0) {
    return { isValid: false, error: 'File appears to be empty' };
  }
  
  // File passed all validation checks
  return { isValid: true };
};

/**
 * Extract text with progress tracking
 * Provides real-time progress updates for large file processing
 * 
 * @param file - PDF file to process
 * @param onProgress - Callback function for progress updates
 * @param options - Optional extraction configuration
 * @returns Promise resolving to extracted text
 */
export const extractTextWithProgress = async (
  file: File,
  onProgress?: (progress: number, status: string) => void,  // Optional progress callback
  options?: TextExtractionOptions
): Promise<string> => {
  try {
    // Step 1: Validate the file (10% progress)
    onProgress?.(10, 'Validating PDF file...');
    
    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    // Step 2: Convert to ArrayBuffer (20% progress)
    onProgress?.(20, 'Loading PDF document...');
    
    const arrayBuffer = await fileToArrayBuffer(file);
    
    // Step 3: Parse PDF structure (30% progress)
    onProgress?.(30, 'Parsing PDF structure...');
    
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    
    // Step 4: Begin page processing (40% progress)
    onProgress?.(40, `Processing ${pdfDocument.numPages} pages...`);
    
    let fullText = '';
    const totalPages = pdfDocument.numPages;
    
    // Process each page with progress updates
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      // Get page object
      const page = await pdfDocument.getPage(pageNum);
      
      // Extract text content
      const textContent = await page.getTextContent();
      
      // Process the text content
      const pageText = processTextContent(textContent, options || {
        preserveFormatting: true,
        includeMetadata: true,
        combineTextItems: true
      });
      
      // Add page separator for multi-page documents
      if (pageNum > 1 && pageText.trim()) {
        fullText += '\n\n--- Page ' + pageNum + ' ---\n\n';
      }
      
      // Append page text
      fullText += pageText;
      
      // Calculate and report progress (40% + 50% of page processing)
      const progress = 40 + (pageNum / totalPages) * 50;
      onProgress?.(progress, `Processed page ${pageNum} of ${totalPages}`);
    }
    
    // Step 5: Finalize extraction (95% progress)
    onProgress?.(95, 'Finalizing text extraction...');
    
    const finalText = fullText.trim();
    
    // Step 6: Complete (100% progress)
    onProgress?.(100, 'Text extraction completed');
    
    return finalText;
    
  } catch (error) {
    // Propagate errors with descriptive message
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
};