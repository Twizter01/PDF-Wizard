import React, { useState } from 'react';
import { Edit3, Eye, Copy, CheckCircle } from 'lucide-react';

interface TextEditorProps {
  text: string;
  filename: string;
  onTextChange: (text: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ text, filename, onTextChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedText, setHighlightedText] = useState('');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const characterCount = text.length;
  const lineCount = text.split('\n').length;
  const paragraphCount = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  React.useEffect(() => {
    if (searchTerm) {
      setHighlightedText(highlightSearchTerm(text, searchTerm));
    } else {
      setHighlightedText(text);
    }
  }, [text, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">{filename}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{wordCount} words</span>
              <span>{characterCount} characters</span>
              <span>{lineCount} lines</span>
              <span>{paragraphCount} paragraphs</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Search functionality */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
              />
            </div>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                isEditing
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isEditing ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
            placeholder="Extracted text will appear here..."
          />
        ) : (
          <div className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
            {text ? (
              <div 
                className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800"
                dangerouslySetInnerHTML={{ __html: highlightedText }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No text extracted yet</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Text Analysis Panel */}
      {text && (
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">{wordCount.toLocaleString()}</div>
              <div className="text-gray-500">Words</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">{characterCount.toLocaleString()}</div>
              <div className="text-gray-500">Characters</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">{lineCount.toLocaleString()}</div>
              <div className="text-gray-500">Lines</div>
            </div>
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

export default TextEditor;