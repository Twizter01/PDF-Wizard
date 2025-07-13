/**
 * TextEditor Component
 * 
 * This component provides a dual-mode text editor for viewing and editing extracted PDF text.
 * Features include:
 * - Toggle between view and edit modes
 * - Text search with highlighting
 * - Copy to clipboard functionality
 * - Text statistics (word count, character count, etc.)
 * - Real-time text analysis
 * 
 * The component receives text content and filename as props and notifies parent
 * components when text is modified.
 */

// Import React hooks for state management and side effects
import React, { useState } from 'react';

// Import Lucide React icons for UI elements
import { Edit3, Eye, Copy, CheckCircle } from 'lucide-react';

/**
 * Props interface for the TextEditor component
 * Defines the required props that parent components must provide
 */
interface TextEditorProps {
  text: string;                                    // The text content to display/edit
  filename: string;                               // Name of the file for display purposes
  onTextChange: (text: string) => void;          // Callback when text is modified
}

/**
 * TextEditor functional component
 * Provides text viewing, editing, and analysis capabilities
 * 
 * @param text - Current text content
 * @param filename - Name of the source file
 * @param onTextChange - Callback function for text changes
 */
const TextEditor: React.FC<TextEditorProps> = ({ text, filename, onTextChange }) => {
  // State to track whether the editor is in edit mode or view mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State to track if text was recently copied to clipboard
  const [copied, setCopied] = useState(false);
  
  // State to store the current search term for text highlighting
  const [searchTerm, setSearchTerm] = useState('');
  
  // State to store text with search terms highlighted
  const [highlightedText, setHighlightedText] = useState('');

  /**
   * Copy text content to clipboard
   * Uses the modern Clipboard API with fallback error handling
   */
  const handleCopy = async () => {
    try {
      // Use the Clipboard API to copy text
      await navigator.clipboard.writeText(text);
      
      // Update UI to show success state
      setCopied(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Log error if clipboard operation fails
      console.error('Failed to copy text:', err);
    }
  };

  // Calculate text statistics for display
  // Split text by whitespace and filter out empty strings to get accurate word count
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  
  // Total character count including spaces and special characters
  const characterCount = text.length;
  
  // Line count based on newline characters
  const lineCount = text.split('\n').length;
  
  // Paragraph count - split by double newlines and filter non-empty paragraphs
  const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  /**
   * Highlight search terms in text
   * Creates HTML with <mark> tags around matching terms
   * 
   * @param text - The text to search within
   * @param searchTerm - The term to highlight
   * @returns HTML string with highlighted terms
   */
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    // Return original text if no search term
    if (!searchTerm.trim()) return text;
    
    // Create regex pattern with escaped special characters for safe searching
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    // Replace matches with HTML mark tags
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  // Effect to update highlighted text when text or search term changes
  React.useEffect(() => {
    if (searchTerm) {
      // Apply highlighting if search term exists
      setHighlightedText(highlightSearchTerm(text, searchTerm));
    } else {
      // Use original text if no search term
      setHighlightedText(text);
    }
  }, [text, searchTerm]);  // Dependencies: re-run when text or searchTerm changes

  // Render the component UI
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      
      {/* Header section with file info and controls */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          
          {/* Left side - File information */}
          <div>
            {/* File name display */}
            <h3 className="font-semibold text-gray-800">{filename}</h3>
            
            {/* Text statistics row */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{wordCount} words</span>           {/* Word count */}
              <span>{characterCount} characters</span>  {/* Character count */}
              <span>{lineCount} lines</span>           {/* Line count */}
              <span>{paragraphCount} paragraphs</span> {/* Paragraph count */}
            </div>
          </div>
          
          {/* Right side - Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Search input field */}
            <div className="relative">
              <input
                type="text"                                    // Text input type
                placeholder="Search text..."                   // Placeholder text
                value={searchTerm}                            // Controlled input value
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term on change
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              />
            </div>
            
            {/* Copy button with dynamic styling based on copied state */}
            <button
              onClick={handleCopy}                            // Trigger copy function
              className={`inline-flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                copied
                  ? 'bg-green-100 text-green-700'            // Success styling
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'  // Default styling
              }`}
            >
              {copied ? (
                // Success state - show checkmark and "Copied!" text
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                // Default state - show copy icon and "Copy" text
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </button>
            
            {/* Edit/Preview toggle button */}
            <button
              onClick={() => setIsEditing(!isEditing)}       // Toggle edit mode
              className={`inline-flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isEditing
                  ? 'bg-blue-100 text-blue-700'              // Edit mode styling
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'  // View mode styling
              }`}
            >
              {isEditing ? (
                // Edit mode - show eye icon and "Preview" text
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              ) : (
                // View mode - show edit icon and "Edit" text
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="p-6">
        {isEditing ? (
          // Edit mode - show textarea for text editing
          <textarea
            value={text}                                      // Controlled textarea value
            onChange={(e) => onTextChange(e.target.value)}    // Notify parent of changes
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
            placeholder="Extracted text will appear here..."  // Placeholder for empty state
          />
        ) : (
          // View mode - show formatted text with search highlighting
          <div className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {text ? (
              // Display text with highlighting if content exists
              <div 
                className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: highlightedText }}  // Render HTML for highlighting
              />
            ) : (
              // Empty state message
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No text extracted yet</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Text analysis panel - only shown when text exists */}
      {text && (
        <div className="border-t bg-gray-50 px-6 py-4">
          {/* Statistics grid with responsive columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            
            {/* Word count statistic */}
            <div className="text-center">
              <div className="font-semibold text-blue-600">{wordCount.toLocaleString()}</div>
              <div className="text-gray-500">Words</div>
            </div>
            
            {/* Character count statistic */}
            <div className="text-center">
              <div className="font-semibold text-green-600">{characterCount.toLocaleString()}</div>
              <div className="text-gray-500">Characters</div>
            </div>
            
            {/* Line count statistic */}
            <div className="text-center">
              <div className="font-semibold text-purple-600">{lineCount.toLocaleString()}</div>
              <div className="text-gray-500">Lines</div>
            </div>
            
            {/* Paragraph count statistic */}
            <div className="text-center">
              <div className="font-semibold text-orange-600">{paragraphCount.toLocaleString()}</div>
              <div className="text-gray-500">Paragraphs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the component as default export
export default TextEditor;