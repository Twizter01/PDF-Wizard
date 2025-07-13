import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker using CDN URL to avoid bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface TextExtractionOptions {
  preserveFormatting: boolean;
  includeMetadata: boolean;
  combineTextItems: boolean;
}

export interface ExtractedTextData {
  text: string;
  metadata?: {
    pageCount: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
  pages: Array<{
    pageNumber: number;
    text: string;
    characterCount: number;
  }>;
}

export const extractTextFromPDF = async (
  file: File, 
  options: TextExtractionOptions = {
    preserveFormatting: true,
    includeMetadata: true,
    combineTextItems: true
  }
): Promise<string> => {
  try {
    const extractedData = await extractDetailedTextFromPDF(file, options);
    return extractedData.text;
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.');
  }
};

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
      // Convert file to ArrayBuffer
      const arrayBuffer = await fileToArrayBuffer(file);
      
      // Load PDF Document
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      });
      
      const pdfDocument = await loadingTask.promise;
      
      // Extract metadata if requested
      let metadata;
      if (options.includeMetadata) {
        try {
          const pdfMetadata = await pdfDocument.getMetadata();
          metadata = {
            pageCount: pdfDocument.numPages,
            title: pdfMetadata.info?.Title || undefined,
            author: pdfMetadata.info?.Author || undefined,
            subject: pdfMetadata.info?.Subject || undefined,
            creator: pdfMetadata.info?.Creator || undefined,
            producer: pdfMetadata.info?.Producer || undefined,
            creationDate: pdfMetadata.info?.CreationDate || undefined,
            modificationDate: pdfMetadata.info?.ModDate || undefined,
          };
        } catch (metaError) {
          console.warn('Could not extract PDF metadata:', metaError);
          metadata = { pageCount: pdfDocument.numPages };
        }
      }
      
      // Extract text from each page
      const pages: Array<{ pageNumber: number; text: string; characterCount: number }> = [];
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Process text items with character-level precision
          const pageText = processTextContent(textContent, options);
          
          pages.push({
            pageNumber: pageNum,
            text: pageText,
            characterCount: pageText.length
          });
          
          // Add page separator for multi-page documents
          if (pageNum > 1 && pageText.trim()) {
            fullText += '\n\n--- Page ' + pageNum + ' ---\n\n';
          }
          
          fullText += pageText;
          
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          pages.push({
            pageNumber: pageNum,
            text: `[Error extracting text from page ${pageNum}]`,
            characterCount: 0
          });
        }
      }
      
      resolve({
        text: fullText.trim(),
        metadata,
        pages
      });
      
    } catch (error) {
      reject(new Error(`PDF processing failed: ${error.message}`));
    }
  });
};

const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file);
  });
};

const processTextContent = (textContent: any, options: TextExtractionOptions): string => {
  if (!textContent || !textContent.items) {
    return '';
  }
  
  let text = '';
  let lastY = null;
  let lastX = null;
  
  // Process text items in their original order to avoid stack overflow
  for (let i = 0; i < textContent.items.length; i++) {
    const item = textContent.items[i];
    const itemText = item.str;
    
    if (!itemText.trim()) continue;
    
    const currentY = item.transform[5];
    const currentX = item.transform[4];
    
    // Character-by-character processing for precision
    let processedText = '';
    for (let charIndex = 0; charIndex < itemText.length; charIndex++) {
      const char = itemText[charIndex];
      
      // Handle special characters and encoding
      if (char.charCodeAt(0) > 127) {
        // Handle Unicode characters
        processedText += char;
      } else if (char === ' ') {
        // Preserve spaces
        processedText += ' ';
      } else if (char.match(/[a-zA-Z0-9\.,;:!?\-'"()[\]{}]/)) {
        // Standard printable characters
        processedText += char;
      } else {
        // Handle other characters
        processedText += char;
      }
    }
    
    if (options.preserveFormatting) {
      // Add line breaks based on position changes
      if (lastY !== null && Math.abs(currentY - lastY) > 5) {
        // New line detected
        text += '\n';
      } else if (lastX !== null && currentX - lastX > 20) {
        // Significant horizontal gap - might be a tab or column
        text += ' ';
      }
    }
    
    if (options.combineTextItems && i > 0) {
      // Add space between text items if they're on the same line
      if (lastY !== null && Math.abs(currentY - lastY) <= 5 && !text.endsWith(' ') && !processedText.startsWith(' ')) {
        text += ' ';
      }
    }
    
    text += processedText;
    lastY = currentY;
    lastX = currentX + (item.width || 0);
  }
  
  // Clean up the text
  return cleanExtractedText(text);
};

const cleanExtractedText = (text: string): string => {
  return text
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove leading/trailing whitespace
    .trim();
};

// Utility function to validate PDF files
export const validatePDFFile = (file: File): { isValid: boolean; error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  if (file.type !== 'application/pdf') {
    return { isValid: false, error: 'File must be a PDF document' };
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    return { isValid: false, error: 'File size must be less than 50MB' };
  }
  
  if (file.size === 0) {
    return { isValid: false, error: 'File appears to be empty' };
  }
  
  return { isValid: true };
};

// Progress tracking for large files
export const extractTextWithProgress = async (
  file: File,
  onProgress?: (progress: number, status: string) => void,
  options?: TextExtractionOptions
): Promise<string> => {
  try {
    onProgress?.(10, 'Validating PDF file...');
    
    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    onProgress?.(20, 'Loading PDF document...');
    
    const arrayBuffer = await fileToArrayBuffer(file);
    
    onProgress?.(30, 'Parsing PDF structure...');
    
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    
    onProgress?.(40, `Processing ${pdfDocument.numPages} pages...`);
    
    let fullText = '';
    const totalPages = pdfDocument.numPages;
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = processTextContent(textContent, options || {
        preserveFormatting: true,
        includeMetadata: true,
        combineTextItems: true
      });
      
      if (pageNum > 1 && pageText.trim()) {
        fullText += '\n\n--- Page ' + pageNum + ' ---\n\n';
      }
      
      fullText += pageText;
      
      const progress = 40 + (pageNum / totalPages) * 50;
      onProgress?.(progress, `Processed page ${pageNum} of ${totalPages}`);
    }
    
    onProgress?.(95, 'Finalizing text extraction...');
    
    const finalText = fullText.trim();
    
    onProgress?.(100, 'Text extraction completed');
    
    return finalText;
    
  } catch (error) {
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
};